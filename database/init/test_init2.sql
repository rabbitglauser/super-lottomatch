-- =========================================================
-- Lottomatch PostgreSQL Database Initialization
-- =========================================================
-- Creates the schema for the Lottomatch raffle system.
--
-- Raffle model used in this schema:
--   Option A: one raffle chance per guest per event day.
--   A check-in is the raffle entry.
--   A draw links one prize to one winning check-in.
--
-- Recommended order:
--   psql -U <user> -d <database> -f init.sql
--   psql -U <user> -d <database> -f seed.sql
-- =========================================================

-- =========================
-- CLEAN START
-- =========================
-- Drop objects in dependency order so this file can be rerun during development.

drop table if exists campaign_recipients;
drop table if exists mail_campaigns;
drop table if exists draws;
drop table if exists prizes;
drop table if exists checkins;
drop table if exists event_days;
drop table if exists lotto_events;
drop table if exists guests;
drop table if exists addresses;
drop table if exists users;

drop function if exists set_updated_at();
drop function if exists validate_draw_same_event_day();

drop type if exists recipient_status;
drop type if exists campaign_channel;
drop type if exists checkin_method;
drop type if exists user_role;

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
  created_at timestamptz not null default now(),

  constraint chk_users_email_not_empty check (length(trim(email)) > 0)
);

create index idx_users_role on users(role);
create index idx_users_is_active on users(is_active);

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
  ),
  constraint chk_addresses_postal_code_not_empty check (length(trim(postal_code)) > 0)
);

create index idx_addresses_city on addresses(city);
create index idx_addresses_postal_code on addresses(postal_code);

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
  updated_at timestamptz not null default now(),

  constraint chk_guests_guest_code_not_empty check (length(trim(guest_code)) > 0),
  constraint chk_guests_names_not_empty check (
    length(trim(first_name)) > 0
    and length(trim(last_name)) > 0
  )
);

create index idx_guests_last_name on guests(last_name);
create index idx_guests_first_last_name on guests(first_name, last_name);
create index idx_guests_address_id on guests(address_id);
create index idx_guests_deleted_at on guests(deleted_at);

-- Automatically update guests.updated_at when a guest record changes.
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
  created_at timestamptz not null default now(),

  constraint unique_lotto_event_year unique (event_year),
  constraint chk_lotto_events_year_reasonable check (event_year between 2000 and 2100),
  constraint chk_lotto_events_date_range check (start_date <= end_date)
);

create index idx_lotto_events_start_date on lotto_events(start_date);

-- =========================
-- EVENT DAYS
-- =========================

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

create index idx_event_days_event_id on event_days(event_id);
create index idx_event_days_event_date on event_days(event_date);

-- =========================
-- CHECKINS
-- =========================
-- One check-in represents one participation for one guest on one event day.
-- Because the Lottomatch has two days, the same guest may have two check-ins:
-- one for day 1 and one for day 2. This implements one raffle chance per day.

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

create index idx_checkins_event_day_id on checkins(event_day_id);
create index idx_checkins_guest_id on checkins(guest_id);
create index idx_checkins_created_by_user_id on checkins(created_by_user_id);
create index idx_checkins_checked_in_at on checkins(checked_in_at);

-- =========================
-- PRIZES
-- =========================

create table prizes (
  id bigint generated always as identity primary key,
  event_day_id bigint not null references event_days(id),
  title varchar(150) not null,
  description text,
  created_at timestamptz not null default now(),

  constraint chk_prizes_title_not_empty check (length(trim(title)) > 0)
);

create index idx_prizes_event_day_id on prizes(event_day_id);

-- =========================
-- DRAWS
-- =========================
-- A draw links one prize to one winning check-in.
-- This guarantees that only checked-in guests can win.
-- The same guest can still have two raffle chances when they checked in on both days.

create table draws (
  id bigint generated always as identity primary key,
  prize_id bigint not null unique references prizes(id),
  checkin_id bigint not null unique references checkins(id),
  drawn_at timestamptz not null default now(),
  drawn_by_user_id bigint not null references users(id),
  notes text
);

create index idx_draws_checkin_id on draws(checkin_id);
create index idx_draws_drawn_by_user_id on draws(drawn_by_user_id);
create index idx_draws_drawn_at on draws(drawn_at);

-- Ensure the prize and the winning check-in belong to the same event day.
-- Without this trigger, a Day 1 prize could accidentally be assigned to a Day 2 check-in.
create function validate_draw_same_event_day()
returns trigger as $$
declare
  prize_day_id bigint;
  checkin_day_id bigint;
begin
  select p.event_day_id
    into prize_day_id
  from prizes p
  where p.id = new.prize_id;

  select c.event_day_id
    into checkin_day_id
  from checkins c
  where c.id = new.checkin_id;

  if prize_day_id is null then
    raise exception 'Invalid prize_id % for draw.', new.prize_id;
  end if;

  if checkin_day_id is null then
    raise exception 'Invalid checkin_id % for draw.', new.checkin_id;
  end if;

  if prize_day_id <> checkin_day_id then
    raise exception
      'Prize and winning check-in must belong to the same event day. prize_id=%, checkin_id=%',
      new.prize_id,
      new.checkin_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_validate_draw_same_event_day
before insert or update of prize_id, checkin_id on draws
for each row
execute function validate_draw_same_event_day();

-- =========================
-- MAIL CAMPAIGNS
-- =========================

create table mail_campaigns (
  id bigint generated always as identity primary key,
  event_id bigint not null references lotto_events(id),
  name varchar(150) not null,
  channel campaign_channel not null default 'post',
  created_by_user_id bigint not null references users(id),
  created_at timestamptz not null default now(),

  constraint unique_campaign_channel_per_event unique (event_id, channel),
  constraint chk_mail_campaigns_name_not_empty check (length(trim(name)) > 0)
);

create index idx_mail_campaigns_event_id on mail_campaigns(event_id);
create index idx_mail_campaigns_created_by_user_id on mail_campaigns(created_by_user_id);

-- =========================
-- CAMPAIGN RECIPIENTS
-- =========================

create table campaign_recipients (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references mail_campaigns(id),
  guest_id bigint not null references guests(id),
  recipient_status recipient_status not null default 'planned',
  include_prefilled_slip boolean not null default true,
  sent_at timestamptz,

  constraint unique_campaign_guest unique (campaign_id, guest_id)
);

create index idx_campaign_recipients_campaign_id on campaign_recipients(campaign_id);
create index idx_campaign_recipients_guest_id on campaign_recipients(guest_id);
create index idx_campaign_recipients_status on campaign_recipients(recipient_status);
