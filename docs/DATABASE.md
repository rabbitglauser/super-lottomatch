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

The schema is split into five functional areas:

| Area                      | Tables                                  |
| ------------------------- | --------------------------------------- |
| Identity & administration | `users`, `guests`, `addresses`          |
| Event management          | `lotto_events`, `event_days`            |
| Attendance / check-in     | `checkins`                              |
| Raffle execution          | `prizes`, `draws`                       |
| Marketing follow-up       | `mail_campaigns`, `campaign_recipients` |

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
- the prize and check-in must belong to the same Lottomatch event, but not necessarily the same event day

Because the chance is per day, a guest who attends both days has two different check-ins. Therefore, the schema allows the same guest to have two raffle entries. A day 1 check-in can also be used for a day 2 prize, because the draw validation checks the event, not the specific day.

### Same-event validation trigger

A prize belongs to one `event_day`, and a check-in also belongs to one `event_day`. However, the raffle pool is treated as event-wide. That means a day 1 check-in may win a day 2 prize, as long as both belong to the same Lottomatch event.

To avoid mistakes across different years or events, the schema includes a PostgreSQL trigger:

```sql
trg_validate_draw_same_event
```

This trigger ensures that the selected prize and the winning check-in belong to the same `lotto_event`. It does **not** require the same `event_day`.

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

| Table                 | Purpose                                                  | Key relationships / rules                                                        |
| --------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `users`               | Internal application users such as admins or STV members | Referenced by `checkins`, `draws`, `mail_campaigns`; `email` is unique           |
| `addresses`           | Normalized guest addresses                               | Referenced by `guests`; unique address combination                               |
| `guests`              | Master data of raffle guests                             | Linked to `addresses`, `checkins`, `campaign_recipients`; `guest_code` is unique |
| `lotto_events`        | Main Lottomatch event, usually one per year              | Parent of `event_days` and `mail_campaigns`; `event_year` is unique              |
| `event_days`          | Individual day of an event                               | Parent of `checkins` and `prizes`; unique day number and date per event          |
| `checkins`            | Attendance record and raffle entry                       | Links `guests`, `event_days`, `users`; one check-in per guest per event day      |
| `prizes`              | Prize definitions available on an event day              | Referenced by `draws`; one prize can be drawn at most once                       |
| `draws`               | Stores which check-in won which prize                    | Links `prizes`, `checkins`, `users`; validated by same-event trigger             |
| `mail_campaigns`      | Mailing campaigns for a specific event and channel       | Parent of `campaign_recipients`; one campaign per event/channel                  |
| `campaign_recipients` | Recipient list for a campaign                            | Links `mail_campaigns` and `guests`; prevents duplicate recipients               |

## Important table notes

### `guests`

Each guest has a unique `guest_code`, which is used for printed slips and QR codes. Guests are linked to normalized addresses through `address_id`.

Important fields include:

* `guest_code`
* `first_name`, `last_name`
* `address_id`
* optional `phone` and `email`
* marketing consent flags
* `deleted_at` for soft deletion
* `created_at` and `updated_at`

The trigger `trg_guests_set_updated_at` updates `updated_at` automatically when a guest record changes.

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

**Check-in methods**

- `guest_code` – manual entry of the printed identifier
- `qr_code` – scan of the same identifier in QR format
- `manual_form` – entered manually from a form or paper slip
- `self_registration` – entered by the guest through a self-service form
- `member_registration` – entered by an STV member

### `prizes`

Stores the prize catalog for an event day.

**Important fields**

- `id` – primary key
- `event_day_id` – foreign key to `event_days`
- `title`
- `description`
- `value_chf` – monetary prize value in Swiss francs
- `created_at`

### `draws`

Stores the actual raffle result by linking one prize to one winning check-in.

**Important fields**

- `id` – primary key
- `prize_id` – unique foreign key to `prizes`
- `checkin_id` – unique foreign key to `checkins`
- `drawn_at`
- `drawn_by_user_id` – user who executed or confirmed the draw
- `notes`

**Trigger**

- `trg_validate_draw_same_event` ensures that the prize and winning check-in belong to the same Lottomatch event. The event day itself does not need to match

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
  ed.day_number as checkin_day,
  ed.event_date as checkin_date,
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

The seed data also includes one draw where a day 2 prize is won using a day 1 check-in. This is intentional and demonstrates the selected business rule: **one raffle chance per guest per event day, with an event-wide raffle pool**.


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

The raffle requirement is covered through `checkins` and `draws`: every check-in is a raffle entry, and each draw links one prize to one winning check-in. Because the selected model is one raffle chance per event day, guests can attend both days and receive one raffle chance for each day. The draw validation is event-wide, so a check-in from either day can win a prize from either day within the same Lottomatch event.
