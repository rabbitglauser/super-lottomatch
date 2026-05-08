# Database Documentation

This document describes the database structure for the **Lottomatch raffle system**. It gives developers a quick but reliable overview of how data is stored, how entities relate to each other, and where important business rules are enforced.

## Purpose of the database

The database is the central source of truth for the application. It supports the full raffle workflow:

- storing guest master data and addresses
- managing Lottomatch events and event days
- recording guest check-ins
- using check-ins as raffle entries
- assigning prizes and storing draw results
- managing follow-up mail campaigns for future events

In short, the database connects guest registration, QR-code-based identification, attendance tracking, raffle draws, and marketing preparation in one consistent relational model.

## Database technology

**Relational database:** PostgreSQL  
**Modeling style:** normalized transactional schema with primary keys, foreign keys, enum types, unique constraints, indexes, and triggers for selected business rules.

PostgreSQL is used because the current implementation uses PostgreSQL/Supabase-style SQL. The logical schema would still work in another relational database, but enum syntax, identity columns, timestamp types, and triggers would need to be adapted.

## High-level structure

The schema can be understood in five functional areas:

1. **Identity & administration**  
   `users`, `guests`, `addresses`

2. **Event management**  
   `lotto_events`, `event_days`

3. **Attendance / check-in**  
   `checkins`

4. **Raffle execution**  
   `prizes`, `draws`

5. **Marketing follow-up**  
   `mail_campaigns`, `campaign_recipients`

## QR code-based guest identification

QR-code-based guest identification is modeled through the existing `guest_code` field in `guests`.

- `guest_code` is the **canonical unique guest identifier**.
- The value can be printed as plain text on a prefilled slip or encoded into a QR code.
- The system therefore does **not** need a separate `qr_code` column.
- In `checkins.method`, the enum value `qr_code` documents **how** the guest was checked in, while `guest_code` stores **which identifier** was used.

This keeps the schema simpler and avoids duplicated identification data.

## Raffle model

### Selected option: one raffle chance per guest per event day

The project requirement says that the Lottomatch takes place on two days and that some guests participate on both days. This schema therefore uses the following rule:

> A guest receives **one raffle chance per event day** they attend.

This means:

- if a guest attends only day 1, they have one check-in and one raffle chance
- if a guest attends only day 2, they have one check-in and one raffle chance
- if a guest attends both days, they have two check-ins and two raffle chances

The database implements this through the `checkins` table:

```sql
constraint unique_checkin_per_day unique (event_day_id, guest_id)
```

This prevents duplicate check-ins for the same guest on the same day, but still allows the same guest to check in again on another event day.

### Why `draws` references `checkins`

The draw result is linked to a `checkin`, not directly to a `guest`.

This is important because the raffle is based on **participation**, not only on guest master data. A guest can exist in the database from a previous year, but they should only be part of the current raffle if they actually checked in.

The simplified flow is:

```text
guest -> checkin -> draw -> prize
```

Or more specifically:

```text
guests.id      -> checkins.guest_id
event_days.id  -> checkins.event_day_id
checkins.id    -> draws.checkin_id
prizes.id      -> draws.prize_id
```

### Raffle constraints

The `draws` table contains these important rules:

```sql
prize_id bigint not null unique references prizes(id),
checkin_id bigint not null unique references checkins(id)
```

This means:

- one prize can only be drawn once
- one check-in can only win once
- only checked-in guests can win

Because the chance is per day, a guest who attends both days has two different check-ins. Therefore, the schema allows the same guest to win once on day 1 and once on day 2, because those are two separate raffle entries.

### Same-day validation trigger

A prize belongs to one `event_day`. A check-in also belongs to one `event_day`.

To avoid mistakes, the schema includes a PostgreSQL trigger:

```sql
trg_validate_draw_same_event_day
```

This trigger ensures that the selected prize and the winning check-in belong to the same event day. Without this, a day 1 prize could accidentally be assigned to a day 2 check-in.

## ERD diagram

### Current ERD

![ERD](./screenshots/ERD-without-Raffle.png)

### Source files

Recommended source files:

- `init.sql` – PostgreSQL schema creation
- `seed.sql` – realistic development/demo data
- `erd.dbml` – editable schema source
- `erd.mmd` – Mermaid version for markdown-friendly rendering
- `erd.svg` – exported readable diagram

## Entity overview

| Table | Purpose | Key relationships |
|---|---|---|
| `users` | Application users such as admins or STV members | Referenced by `checkins`, `draws`, `mail_campaigns` |
| `addresses` | Normalized guest addresses | Referenced by `guests` |
| `guests` | Master data of raffle guests | Linked to `addresses`, `checkins`, `campaign_recipients` |
| `lotto_events` | Main event container, usually one per year | Parent of `event_days` and `mail_campaigns` |
| `event_days` | Individual day of an event | Parent of `checkins` and `prizes` |
| `checkins` | Records attendance of a guest on a given event day | Links `guests`, `event_days`, `users` |
| `prizes` | Prize definitions available on an event day | Referenced by `draws` |
| `draws` | Stores which check-in won which prize | Links `prizes`, `checkins`, `users` |
| `mail_campaigns` | Mailing campaigns for a specific event and channel | Parent of `campaign_recipients` |
| `campaign_recipients` | Recipient list for a campaign | Links `mail_campaigns` and `guests` |

## Key tables and responsibilities

### `users`

Stores internal application accounts.

**Important fields**

- `id` – primary key
- `email` – unique login identifier
- `role` – access role (`admin`, `member`)
- `is_active` – soft enable/disable flag

**Used by**

- `checkins.created_by_user_id`
- `draws.drawn_by_user_id`
- `mail_campaigns.created_by_user_id`

---

### `addresses`

Stores addresses separately to avoid repeated address values across guests and to keep guest master data structured.

**Important fields**

- `id` – primary key
- `street`, `house_number`, `postal_code`, `city` – core address fields
- `address_line_2` – optional additional address information

**Constraints**

- unique composite constraint on `(street, house_number, postal_code, city)`

**Used by**

- `guests.address_id`

---

### `guests`

Central guest master table. Each guest has one unique identifier that can also be represented as a QR code.

**Important fields**

- `id` – primary key
- `guest_code` – unique guest identifier, used for printed slips and QR codes
- `first_name`, `last_name`
- `address_id` – foreign key to `addresses`
- `phone`, `email` – optional contact fields
- `allow_email_marketing`, `allow_post_marketing` – consent flags
- `deleted_at` – soft delete marker
- `created_at`, `updated_at` – audit timestamps

**Relationships**

- many guests belong to one address record
- one guest can have many check-ins
- one guest can appear in many campaign recipient entries

**Indexes**

- index on `last_name`
- composite index on `(first_name, last_name)`
- index on `address_id`
- index on `deleted_at`
- unique index through the `guest_code` constraint

**Trigger**

- `trg_guests_set_updated_at` updates `updated_at` automatically when a guest record changes

---

### `lotto_events`

Represents one Lottomatch event, typically for a specific year.

**Important fields**

- `id` – primary key
- `name`
- `event_year`
- `location`
- `start_date`, `end_date`

**Constraints**

- `event_year` is unique in the current schema, because the model assumes one main Lottomatch per year
- `start_date <= end_date`
- `event_year` must be within a reasonable range

**Relationships**

- one event has many `event_days`
- one event has many `mail_campaigns`

---

### `event_days`

Represents a concrete event day inside a multi-day event.

**Important fields**

- `id` – primary key
- `event_id` – foreign key to `lotto_events`
- `day_number` – business numbering such as day 1 or day 2
- `event_date`
- `checkin_open_at`, `checkin_close_at`

**Constraints**

- unique `(event_id, day_number)`
- unique `(event_id, event_date)`
- `day_number > 0`
- `checkin_open_at < checkin_close_at`, if both values are present

**Relationships**

- one event day has many check-ins
- one event day has many prizes

---

### `checkins`

Stores attendance of a guest on a specific event day. This is the operational link between guests and event days.

A check-in also represents one raffle entry.

**Important fields**

- `id` – primary key
- `event_day_id` – foreign key to `event_days`
- `guest_id` – foreign key to `guests`
- `method` – how the check-in was performed
- `is_new_guest` – indicates whether the guest was newly registered during check-in
- `checked_in_at`
- `created_by_user_id` – user who recorded the check-in

**Constraints**

- unique `(event_day_id, guest_id)` ensures one guest can only check in once per event day

**Relationships**

- many check-ins belong to one guest
- many check-ins belong to one event day
- many check-ins can be created by one user
- one check-in can be used in at most one draw

**Check-in methods**

- `guest_code` – manual entry of the printed identifier
- `qr_code` – scan of the same identifier in QR format
- `manual_form` – entered manually from a form or paper slip
- `self_registration` – entered by the guest through a self-service form
- `member_registration` – entered by an STV member

---

### `prizes`

Stores the prizes available on a specific event day.

**Important fields**

- `id` – primary key
- `event_day_id` – foreign key to `event_days`
- `title`
- `description`
- `created_at`

**Relationships**

- many prizes belong to one event day
- one prize can be assigned in exactly zero or one draw

---

### `draws`

Stores the actual raffle result by linking one prize to one winning check-in.

**Important fields**

- `id` – primary key
- `prize_id` – unique foreign key to `prizes`
- `checkin_id` – unique foreign key to `checkins`
- `drawn_at`
- `drawn_by_user_id` – user who executed or confirmed the draw
- `notes`

**Constraints**

- unique `prize_id` means one prize can only be drawn once
- unique `checkin_id` means one check-in can only win once

**Trigger**

- `trg_validate_draw_same_event_day` ensures that the prize and winning check-in belong to the same event day

**Relationships**

- one draw belongs to exactly one prize
- one draw belongs to exactly one winning check-in
- many draws can be performed by one user

---

### `mail_campaigns`

Represents a mailing campaign for a specific event and channel.

**Important fields**

- `id` – primary key
- `event_id` – foreign key to `lotto_events`
- `name`
- `channel` – `post` or `email`
- `created_by_user_id`
- `created_at`

**Constraints**

- unique `(event_id, channel)` allows only one campaign per channel per event in the current model

**Relationships**

- many campaigns belong to one event
- many campaigns can be created by one user
- one campaign has many recipient records

---

### `campaign_recipients`

Junction table between `mail_campaigns` and `guests`, extended with delivery-specific fields.

**Important fields**

- `id` – primary key
- `campaign_id` – foreign key to `mail_campaigns`
- `guest_id` – foreign key to `guests`
- `recipient_status` – workflow state for delivery
- `include_prefilled_slip` – whether a prefilled slip should be included
- `sent_at`

**Constraints**

- unique `(campaign_id, guest_id)` prevents duplicate recipient entries within the same campaign

**Relationships**

- many recipient rows belong to one campaign
- many recipient rows belong to one guest

## Relationship summary

### Core cardinalities

- `addresses` **1:n** `guests`
- `lotto_events` **1:n** `event_days`
- `event_days` **1:n** `checkins`
- `guests` **1:n** `checkins`
- `users` **1:n** `checkins`
- `event_days` **1:n** `prizes`
- `prizes` **1:1** `draws`
- `checkins` **1:1** `draws`
- `users` **1:n** `draws`
- `lotto_events` **1:n** `mail_campaigns`
- `mail_campaigns` **1:n** `campaign_recipients`
- `guests` **1:n** `campaign_recipients`

### Derived many-to-many relationships

Some business relationships are implemented through link tables with extra attributes:

- `guests` **n:m** `event_days` through `checkins`
- `guests` **n:m** `mail_campaigns` through `campaign_recipients`

## Constraints and design notes

### Foreign keys

The current schema defines the following foreign key structure:

- `guests.address_id -> addresses.id`
- `event_days.event_id -> lotto_events.id`
- `checkins.event_day_id -> event_days.id`
- `checkins.guest_id -> guests.id`
- `checkins.created_by_user_id -> users.id`
- `prizes.event_day_id -> event_days.id`
- `draws.prize_id -> prizes.id`
- `draws.checkin_id -> checkins.id`
- `draws.drawn_by_user_id -> users.id`
- `mail_campaigns.event_id -> lotto_events.id`
- `mail_campaigns.created_by_user_id -> users.id`
- `campaign_recipients.campaign_id -> mail_campaigns.id`
- `campaign_recipients.guest_id -> guests.id`

### Cascading rules

No explicit `ON DELETE CASCADE` rules are used in the current schema.

For now, the recommended default is:

- **critical operational data:** keep default PostgreSQL `NO ACTION` behavior
- **guest removal:** use `guests.deleted_at` for soft deletion instead of physically deleting guests
- **historical data:** preserve check-ins, draws, and campaign records unless an admin intentionally cleans development data

This is safer because raffle history, draw history, and campaign tracking should not disappear accidentally.

### Unique constraints and indexes

Important uniqueness and indexing decisions:

- `users.email` is unique
- `guests.guest_code` is unique
- `addresses(street, house_number, postal_code, city)` is unique
- `lotto_events.event_year` is unique
- `event_days(event_id, day_number)` is unique
- `event_days(event_id, event_date)` is unique
- `checkins(event_day_id, guest_id)` is unique
- `draws.prize_id` is unique
- `draws.checkin_id` is unique
- `mail_campaigns(event_id, channel)` is unique
- `campaign_recipients(campaign_id, guest_id)` is unique
- search-oriented indexes exist for guest names, addresses, check-ins, prizes, draws, campaigns, and campaign recipients

These constraints are important because they protect business rules directly at database level instead of relying only on backend code.

## Useful query examples

### Raffle entries for one event day

```sql
select
  c.id as checkin_id,
  g.guest_code,
  g.first_name,
  g.last_name,
  ed.day_number,
  ed.event_date,
  c.checked_in_at
from checkins c
join guests g on g.id = c.guest_id
join event_days ed on ed.id = c.event_day_id
where ed.id = 3
order by c.checked_in_at;
```

### Winners with prize and guest information

```sql
select
  d.id as draw_id,
  p.title as prize,
  g.guest_code,
  g.first_name,
  g.last_name,
  ed.day_number,
  ed.event_date,
  d.drawn_at
from draws d
join prizes p on p.id = d.prize_id
join checkins c on c.id = d.checkin_id
join guests g on g.id = c.guest_id
join event_days ed on ed.id = c.event_day_id
order by d.drawn_at;
```

### Guests who participated on both days of an event

```sql
select
  g.id,
  g.guest_code,
  g.first_name,
  g.last_name,
  count(distinct ed.id) as attended_days
from guests g
join checkins c on c.guest_id = g.id
join event_days ed on ed.id = c.event_day_id
where ed.event_id = 2
  and g.deleted_at is null
group by g.id, g.guest_code, g.first_name, g.last_name
having count(distinct ed.id) > 1
order by g.last_name, g.first_name;
```

## Seed data overview

The included `seed.sql` contains realistic demo data for development:

- 4 STV users
- 20 guests with Swiss-style addresses
- 2 Lottomatch events, 2025 and 2026
- 2 event days per event
- check-ins for known and new guests
- examples where guests attend both days in 2026
- prizes for both event days
- draw results using `checkin_id`
- post and email campaign examples

The seed also includes one example where the same guest wins once on day 1 and once on day 2. This is intentional and demonstrates the selected business rule: **one raffle chance per guest per event day**.

## Suggested placement in the repository

```text
docs/
└── database/
    ├── Database.md
    ├── erd.dbml
    ├── erd.mmd
    └── erd.svg

src/
└── database/
    ├── init.sql
    └── seed.sql
```

Alternative placement if the project has a Docker setup:

```text
docker/
└── database/
    ├── init.sql
    └── seed.sql
```

## Maintenance notes

To keep the documentation maintainable:

- update `init.sql` first when the schema changes
- update `erd.dbml` and regenerate the ERD afterwards
- keep `Database.md` focused on structure and business meaning
- document only important constraints and workflows that affect development decisions
- keep seed data realistic but small enough to understand quickly

## Conclusion

The current schema is well suited for the project because it separates guest master data, event operations, raffle logic, and campaign follow-up into clear domains.

The QR-code requirement is covered through `guest_code` plus the `checkins.method` enum, so no separate QR-code column is needed.

The raffle requirement is covered through `checkins` and `draws`: every check-in is a raffle entry, and each draw links one prize to one winning check-in. Because the selected model is one raffle chance per event day, guests can attend both days and receive one raffle chance for each day.
