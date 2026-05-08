-- =========================
-- ENUM TYPES
-- =========================

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

-- =========================
-- USERS
-- =========================

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

-- =========================
-- ADDRESSES
-- =========================

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

-- =========================
-- GUESTS
-- =========================

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

-- =========================
-- LOTTO EVENTS
-- =========================

create table lotto_events (
  id bigint generated always as identity primary key,
  name varchar(150) not null,
  event_year int not null,
  location varchar(150),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

-- =========================
-- EVENT DAYS
-- =========================

create table event_days (
  id bigint generated always as identity primary key,
  event_id bigint not null references lotto_events(id) on delete cascade,
  day_number int not null,
  event_date date not null,
  checkin_open_at timestamptz,
  checkin_close_at timestamptz,

  constraint unique_event_day_number unique (event_id, day_number),
  constraint unique_event_day_date unique (event_id, event_date)
);

-- =========================
-- CHECKINS
-- =========================

create table checkins (
  id bigint generated always as identity primary key,
  event_day_id bigint not null references event_days(id) on delete cascade,
  guest_id bigint not null references guests(id),
  method checkin_method not null,
  is_new_guest boolean not null default false,
  checked_in_at timestamptz not null default now(),
  created_by_user_id bigint not null references users(id),
  notes text,

  constraint unique_checkin_per_day unique (event_day_id, guest_id)
);

-- =========================
-- PRIZES
-- =========================

create table prizes (
  id bigint generated always as identity primary key,
  event_day_id bigint not null references event_days(id) on delete cascade,
  title varchar(150) not null,
  description text,
  created_at timestamptz not null default now()
);

-- =========================
-- DRAWS
-- =========================

create table draws (
  id bigint generated always as identity primary key,
  event_id bigint not null references lotto_events(id) on delete cascade,
  prize_id bigint not null unique references prizes(id),
  guest_id bigint not null references guests(id),
  drawn_at timestamptz not null default now(),
  drawn_by_user_id bigint not null references users(id),
  notes text
);

create index idx_draws_event_guest on draws(event_id, guest_id);

-- =========================
-- MAIL CAMPAIGNS
-- =========================

create table mail_campaigns (
  id bigint generated always as identity primary key,
  event_id bigint not null references lotto_events(id) on delete cascade,
  name varchar(150) not null,
  channel campaign_channel not null default 'post',
  created_by_user_id bigint not null references users(id),
  created_at timestamptz not null default now(),

  constraint unique_campaign_channel_per_event unique (event_id, channel)
);

-- =========================
-- CAMPAIGN RECIPIENTS
-- =========================

create table campaign_recipients (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references mail_campaigns(id) on delete cascade,
  guest_id bigint not null references guests(id),
  recipient_status recipient_status not null default 'planned',
  include_prefilled_slip boolean not null default true,
  sent_at timestamptz,

  constraint unique_campaign_guest unique (campaign_id, guest_id)
);