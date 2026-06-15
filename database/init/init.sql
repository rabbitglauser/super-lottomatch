drop table if exists
  campaign_recipients,
  mail_campaigns,
  draws,
  prizes,
  checkins,
  event_days,
  lotto_events,
  guests,
  addresses,
  users
cascade;

drop function if exists set_updated_at();
drop function if exists validate_draw_same_event();
drop function if exists authenticate_user(text, text);

drop type if exists recipient_status;
drop type if exists campaign_channel;
drop type if exists checkin_method;
drop type if exists user_role;

create type user_role as enum ('admin', 'member');

create type checkin_method as enum (
  'guest_code',
  'manual_form',
  'self_registration',
  'member_registration',
  'qr_code'
);

create type campaign_channel as enum ('post', 'email');

create type recipient_status as enum (
  'planned',
  'printed',
  'sent',
  'returned'
);

create table users (
  id bigint generated always as identity primary key,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  role user_role not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table addresses (
  id bigint generated always as identity primary key,
  street varchar(150) not null,
  house_number varchar(20) not null,
  address_line_2 varchar(150),
  postal_code varchar(20) not null,
  city varchar(100) not null,

  constraint unique_address unique (
    street,
    house_number,
    postal_code,
    city
  )
);

create table guests (
  id bigint generated always as identity primary key,
  guest_code varchar(30) not null unique,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  address_id bigint not null references addresses(id),
  phone varchar(30),
  email varchar(255),
  allow_email_marketing boolean not null default false,
  allow_post_marketing boolean not null default true,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_guests_last_name on guests(last_name);
create index idx_guests_first_last_name on guests(first_name, last_name);

create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_guests_set_updated_at
before update on guests
for each row
execute function set_updated_at();

create table lotto_events (
  id bigint generated always as identity primary key,
  name varchar(150) not null,
  event_year int not null unique,
  location varchar(150),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),

  constraint chk_lotto_events_date_range check (start_date <= end_date)
);

create table event_days (
  id bigint generated always as identity primary key,
  event_id bigint not null references lotto_events(id),
  day_number int not null,
  event_date date not null,
  checkin_open_at timestamptz,
  checkin_close_at timestamptz,

  constraint unique_event_day_number unique (event_id, day_number),
  constraint unique_event_day_date unique (event_id, event_date),
  constraint chk_event_days_day_number_positive check (day_number > 0),
  constraint chk_event_days_checkin_time_range check (
    checkin_open_at is null
    or checkin_close_at is null
    or checkin_open_at < checkin_close_at
  )
);

create table checkins (
  id bigint generated always as identity primary key,
  event_day_id bigint not null references event_days(id),
  guest_id bigint not null references guests(id),
  method checkin_method not null,
  is_new_guest boolean not null default false,
  checked_in_at timestamptz not null default now(),
  created_by_user_id bigint not null references users(id),
  notes text,

  constraint unique_checkin_per_day unique (event_day_id, guest_id)
);

create table prizes (
  id bigint generated always as identity primary key,
  event_day_id bigint not null references event_days(id),
  title varchar(150) not null,
  description text,
  value_chf numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table draws (
  id bigint generated always as identity primary key,
  prize_id bigint not null unique references prizes(id),
  checkin_id bigint not null unique references checkins(id),
  drawn_at timestamptz not null default now(),
  drawn_by_user_id bigint not null references users(id),
  notes text
);

create function validate_draw_same_event()
returns trigger as $$
declare
  prize_event_id bigint;
  checkin_event_id bigint;
begin
  select ed.event_id
  into prize_event_id
  from prizes p
  join event_days ed on ed.id = p.event_day_id
  where p.id = new.prize_id;

  select ed.event_id
  into checkin_event_id
  from checkins c
  join event_days ed on ed.id = c.event_day_id
  where c.id = new.checkin_id;

  if prize_event_id <> checkin_event_id then
    raise exception
      'Prize and check-in must belong to the same Lottomatch event.';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_validate_draw_same_event
before insert or update of prize_id, checkin_id on draws
for each row
execute function validate_draw_same_event();

create table mail_campaigns (
  id bigint generated always as identity primary key,
  event_id bigint not null references lotto_events(id),
  name varchar(150) not null,
  channel campaign_channel not null default 'post',
  created_by_user_id bigint not null references users(id),
  created_at timestamptz not null default now(),

  constraint unique_campaign_channel_per_event unique (event_id, channel)
);

create table campaign_recipients (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references mail_campaigns(id),
  guest_id bigint not null references guests(id),
  recipient_status recipient_status not null default 'planned',
  include_prefilled_slip boolean not null default true,
  sent_at timestamptz,

  constraint unique_campaign_guest unique (campaign_id, guest_id)
);

-- pgcrypto is required for bcrypt password verification inside the RPC.
-- Supabase installs extensions into the extensions schema, so the RPC calls
-- extensions.crypt explicitly instead of relying on search_path.
create extension if not exists pgcrypto;

-- authenticate_user is called by the frontend Supabase client.
-- It verifies the password server-side so the hash is never exposed to clients.
-- Returns one row on success, zero rows on failure.
create function authenticate_user(p_email text, p_password text)
returns table(id bigint, name text, email text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user record;
begin
  select u.id, u.first_name, u.last_name, u.email, u.password_hash
  into v_user
  from users u
  where lower(u.email) = lower(trim(p_email)) and u.is_active = true;

  if not found then
    return;
  end if;

  -- crypt() from pgcrypto verifies bcrypt hashes ($2a$ prefix required for pgcrypto).
  if extensions.crypt(p_password, v_user.password_hash::text) = v_user.password_hash then
    return query
      select
        v_user.id,
        (v_user.first_name || ' ' || v_user.last_name)::text,
        v_user.email;
  end if;
end;
$$;

-- Grant execute to the Supabase anon and authenticated roles so the
-- frontend Supabase client can call this RPC via the public API.
grant execute on function authenticate_user(text, text) to anon, authenticated;
