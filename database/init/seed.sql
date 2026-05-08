begin;

-- Clean existing data while keeping the schema.
truncate table
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
restart identity cascade;

-- =========================
-- USERS
-- =========================

insert into users (
  id,
  first_name,
  last_name,
  email,
  password_hash,
  role,
  is_active,
  created_at
) overriding system value values
  (1, 'Nina', 'Odermatt', 'nina.odermatt@stv-ennetbuergen.ch', '$2b$12$demoHashOnlyNotARealPassword01', 'admin', true, '2026-01-10 09:00:00+01'),
  (2, 'Marco', 'Bucher', 'marco.bucher@stv-ennetbuergen.ch', '$2b$12$demoHashOnlyNotARealPassword02', 'member', true, '2026-01-12 18:30:00+01'),
  (3, 'Sabrina', 'Hess', 'sabrina.hess@stv-ennetbuergen.ch', '$2b$12$demoHashOnlyNotARealPassword03', 'member', true, '2026-01-15 20:10:00+01'),
  (4, 'Lukas', 'Wyrsch', 'lukas.wyrsch@stv-ennetbuergen.ch', '$2b$12$demoHashOnlyNotARealPassword04', 'member', false, '2025-11-20 17:45:00+01');

-- =========================
-- ADDRESSES
-- =========================

insert into addresses (
  id,
  street,
  house_number,
  address_line_2,
  postal_code,
  city
) overriding system value values
  (1, 'Buochserstrasse', '12', null, '6373', 'Ennetbürgen'),
  (2, 'Dorfstrasse', '8', null, '6373', 'Ennetbürgen'),
  (3, 'Seestrasse', '44', null, '6374', 'Buochs'),
  (4, 'Stanserstrasse', '21', null, '6370', 'Stans'),
  (5, 'Pilatusweg', '3', null, '6373', 'Ennetbürgen'),
  (6, 'Bürgenstockstrasse', '17', null, '6363', 'Bürgenstock'),
  (7, 'Hofmatt', '5', null, '6373', 'Ennetbürgen'),
  (8, 'Achereggstrasse', '31', null, '6362', 'Stansstad'),
  (9, 'Rosenweg', '9', null, '6370', 'Stans'),
  (10, 'Schulhausstrasse', '2', null, '6373', 'Ennetbürgen'),
  (11, 'Luzernerstrasse', '66', null, '6010', 'Kriens'),
  (12, 'Allmendstrasse', '14', null, '6374', 'Buochs'),
  (13, 'Kirchweg', '7', null, '6373', 'Ennetbürgen'),
  (14, 'Mühlematt', '22', null, '6370', 'Stans'),
  (15, 'Riedstrasse', '18', null, '6372', 'Ennetmoos'),
  (16, 'Seeplatz', '1', 'c/o Familie Rohrer', '6374', 'Buochs'),
  (17, 'Oberdorf', '6', null, '6373', 'Ennetbürgen'),
  (18, 'Birkenweg', '11', null, '6370', 'Stans'),
  (19, 'Hostattstrasse', '27', null, '6373', 'Ennetbürgen'),
  (20, 'Sonnenbergstrasse', '4', null, '6374', 'Buochs');

-- =========================
-- GUESTS
-- =========================

insert into guests (
  id,
  guest_code,
  first_name,
  last_name,
  address_id,
  phone,
  email,
  allow_email_marketing,
  allow_post_marketing,
  notes,
  deleted_at,
  created_at,
  updated_at
) overriding system value values
  (1, 'G-000001', 'Hans', 'Müller', 1, '+41 79 456 12 01', 'hans.mueller@example.ch', true, true, 'Stammgast, bringt jeweils den vorgedruckten Zettel mit.', null, '2023-10-02 09:30:00+02', '2026-09-01 08:00:00+02'),
  (2, 'G-000002', 'Margrit', 'Zimmermann', 2, '+41 78 222 10 02', null, false, true, 'Bevorzugt Briefpost.', null, '2023-10-03 10:15:00+02', '2026-09-01 08:00:00+02'),
  (3, 'G-000003', 'Peter', 'Achermann', 3, '+41 76 511 40 03', 'peter.achermann@example.ch', true, true, null, null, '2023-10-05 11:00:00+02', '2026-09-01 08:00:00+02'),
  (4, 'G-000004', 'Ruth', 'Barmettler', 4, '+41 79 330 44 04', null, false, true, null, null, '2023-10-07 14:20:00+02', '2026-09-01 08:00:00+02'),
  (5, 'G-000005', 'Josef', 'Christen', 5, null, null, false, true, 'Kommt meistens mit Partnerin.', null, '2023-10-09 16:45:00+02', '2026-09-01 08:00:00+02'),
  (6, 'G-000006', 'Elisabeth', 'Felder', 6, '+41 79 720 30 06', 'elisabeth.felder@example.ch', true, true, null, null, '2023-10-11 13:10:00+02', '2026-09-01 08:00:00+02'),
  (7, 'G-000007', 'Kurt', 'Odermatt', 7, '+41 78 600 72 07', null, false, true, null, null, '2024-09-30 17:00:00+02', '2026-09-01 08:00:00+02'),
  (8, 'G-000008', 'Anita', 'Rohrer', 8, '+41 77 333 18 08', 'anita.rohrer@example.ch', true, true, null, null, '2024-10-01 09:40:00+02', '2026-09-01 08:00:00+02'),
  (9, 'G-000009', 'Beat', 'Lussi', 9, null, null, false, true, null, null, '2024-10-02 12:25:00+02', '2026-09-01 08:00:00+02'),
  (10, 'G-000010', 'Monika', 'Herger', 10, '+41 79 871 23 10', 'monika.herger@example.ch', true, true, null, null, '2024-10-04 15:35:00+02', '2026-09-01 08:00:00+02'),
  (11, 'G-000011', 'Thomas', 'Arnold', 11, '+41 76 444 50 11', 'thomas.arnold@example.ch', true, false, 'Nur E-Mail erlaubt, keine Briefwerbung.', null, '2025-09-12 18:00:00+02', '2026-09-01 08:00:00+02'),
  (12, 'G-000012', 'Vreni', 'Durrer', 12, null, null, false, true, null, null, '2025-09-15 18:30:00+02', '2026-09-01 08:00:00+02'),
  (13, 'G-000013', 'Ernst', 'Blättler', 13, '+41 79 602 25 13', null, false, true, null, null, '2025-09-18 19:15:00+02', '2026-09-01 08:00:00+02'),
  (14, 'G-000014', 'Claudia', 'Waser', 14, '+41 78 128 19 14', 'claudia.waser@example.ch', true, true, null, null, '2025-09-21 20:10:00+02', '2026-09-01 08:00:00+02'),
  (15, 'G-000015', 'Markus', 'Niederberger', 15, null, null, false, true, null, null, '2025-09-22 20:25:00+02', '2026-09-01 08:00:00+02'),
  (16, 'G-000016', 'Silvia', 'Rohrer', 16, '+41 77 450 88 16', 'silvia.rohrer@example.ch', true, true, 'Neu registriert am zweiten Eventtag 2026.', null, '2026-11-15 17:42:00+01', '2026-11-15 17:42:00+01'),
  (17, 'G-000017', 'Daniel', 'Hess', 17, '+41 79 413 00 17', null, false, true, 'Neu über leeren Zettel erfasst.', null, '2026-11-15 18:05:00+01', '2026-11-15 18:05:00+01'),
  (18, 'G-000018', 'Yvonne', 'Camenzind', 18, '+41 76 911 49 18', 'yvonne.camenzind@example.ch', true, true, null, null, '2026-08-20 13:30:00+02', '2026-09-01 08:00:00+02'),
  (19, 'G-000019', 'Walter', 'Zumbühl', 19, null, null, false, true, 'Keine Telefonnummer angegeben.', null, '2026-08-23 10:00:00+02', '2026-09-01 08:00:00+02'),
  (20, 'G-000020', 'Petra', 'Bucher', 20, '+41 78 220 71 20', 'petra.bucher@example.ch', true, true, null, null, '2026-08-25 16:45:00+02', '2026-09-01 08:00:00+02');

-- =========================
-- LOTTO EVENTS
-- =========================

insert into lotto_events (
  id,
  name,
  event_year,
  location,
  start_date,
  end_date,
  created_at
) overriding system value values
  (1, 'STV Ennetbürgen Lottomatch 2025', 2025, 'Mehrzweckhalle Ennetbürgen', '2025-11-15', '2025-11-16', '2025-03-01 10:00:00+01'),
  (2, 'STV Ennetbürgen Lottomatch 2026', 2026, 'Mehrzweckhalle Ennetbürgen', '2026-11-14', '2026-11-15', '2026-03-01 10:00:00+01');

-- =========================
-- EVENT DAYS
-- =========================

insert into event_days (
  id,
  event_id,
  day_number,
  event_date,
  checkin_open_at,
  checkin_close_at
) overriding system value values
  (1, 1, 1, '2025-11-15', '2025-11-15 17:00:00+01', '2025-11-15 21:30:00+01'),
  (2, 1, 2, '2025-11-16', '2025-11-16 13:00:00+01', '2025-11-16 17:30:00+01'),
  (3, 2, 1, '2026-11-14', '2026-11-14 17:00:00+01', '2026-11-14 21:30:00+01'),
  (4, 2, 2, '2026-11-15', '2026-11-15 13:00:00+01', '2026-11-15 17:30:00+01');

-- =========================
-- CHECKINS
-- =========================
-- Guests 1, 2, 3, 5, 8, 9, 12 and 15 attend both days in 2026.
-- This is allowed because the raffle chance is per day.

insert into checkins (
  id,
  event_day_id,
  guest_id,
  method,
  is_new_guest,
  checked_in_at,
  created_by_user_id,
  notes
) overriding system value values
  -- 2025 historical participation
  (1, 1, 1, 'guest_code', false, '2025-11-15 17:18:00+01', 2, 'Historical check-in from previous event.'),
  (2, 1, 2, 'guest_code', false, '2025-11-15 17:22:00+01', 2, null),
  (3, 1, 3, 'manual_form', false, '2025-11-15 17:41:00+01', 3, null),
  (4, 1, 5, 'guest_code', false, '2025-11-15 18:03:00+01', 3, null),
  (5, 2, 1, 'guest_code', false, '2025-11-16 13:12:00+01', 2, 'Same guest also attended day 1.'),
  (6, 2, 8, 'manual_form', true, '2025-11-16 13:33:00+01', 3, 'First registration in 2025.'),
  (7, 2, 12, 'guest_code', false, '2025-11-16 14:05:00+01', 2, null),
  (8, 2, 14, 'manual_form', true, '2025-11-16 14:40:00+01', 3, 'Added from handwritten slip.'),

  -- 2026, day 1
  (9, 3, 1, 'qr_code', false, '2026-11-14 17:06:00+01', 2, 'Scanned QR code from prefilled slip.'),
  (10, 3, 2, 'guest_code', false, '2026-11-14 17:09:00+01', 2, 'ID typed from printed slip.'),
  (11, 3, 3, 'qr_code', false, '2026-11-14 17:11:00+01', 3, null),
  (12, 3, 4, 'manual_form', false, '2026-11-14 17:16:00+01', 3, 'Known guest forgot prefilled slip.'),
  (13, 3, 5, 'member_registration', false, '2026-11-14 17:22:00+01', 2, 'Registered by STV member at entrance.'),
  (14, 3, 6, 'qr_code', false, '2026-11-14 17:27:00+01', 3, null),
  (15, 3, 7, 'guest_code', false, '2026-11-14 17:31:00+01', 2, null),
  (16, 3, 8, 'qr_code', false, '2026-11-14 17:42:00+01', 2, null),
  (17, 3, 9, 'guest_code', false, '2026-11-14 18:01:00+01', 3, null),
  (18, 3, 10, 'manual_form', false, '2026-11-14 18:08:00+01', 3, 'Address confirmed manually.'),
  (19, 3, 11, 'qr_code', false, '2026-11-14 18:20:00+01', 2, null),
  (20, 3, 12, 'guest_code', false, '2026-11-14 18:33:00+01', 3, null),
  (21, 3, 13, 'member_registration', false, '2026-11-14 18:45:00+01', 2, null),
  (22, 3, 14, 'qr_code', false, '2026-11-14 19:04:00+01', 3, null),
  (23, 3, 15, 'qr_code', false, '2026-11-14 19:21:00+01', 2, null),

  -- 2026, day 2
  (24, 4, 1, 'qr_code', false, '2026-11-15 13:05:00+01', 2, 'Second raffle entry because guest also attends day 2.'),
  (25, 4, 2, 'qr_code', false, '2026-11-15 13:08:00+01', 2, 'Second raffle entry because guest also attends day 2.'),
  (26, 4, 3, 'qr_code', false, '2026-11-15 13:11:00+01', 3, null),
  (27, 4, 5, 'guest_code', false, '2026-11-15 13:25:00+01', 3, null),
  (28, 4, 6, 'qr_code', false, '2026-11-15 13:34:00+01', 2, null),
  (29, 4, 8, 'qr_code', false, '2026-11-15 13:44:00+01', 2, null),
  (30, 4, 9, 'qr_code', false, '2026-11-15 14:02:00+01', 3, null),
  (31, 4, 12, 'guest_code', false, '2026-11-15 14:17:00+01', 2, null),
  (32, 4, 15, 'member_registration', false, '2026-11-15 14:29:00+01', 3, null),
  (33, 4, 16, 'self_registration', true, '2026-11-15 14:42:00+01', 2, 'New guest registered with smartphone form.'),
  (34, 4, 17, 'manual_form', true, '2026-11-15 15:05:00+01', 3, 'New guest entered from paper slip.'),
  (35, 4, 18, 'qr_code', false, '2026-11-15 15:21:00+01', 2, null),
  (36, 4, 19, 'guest_code', false, '2026-11-15 15:33:00+01', 3, null),
  (37, 4, 20, 'qr_code', false, '2026-11-15 16:02:00+01', 2, null);

-- =========================
-- PRIZES
-- =========================

insert into prizes (
  id,
  event_day_id,
  title,
  description,
  created_at
) overriding system value values
  -- 2025 historical prizes
  (1, 1, 'Restaurantgutschein Nidwalden', 'Gutschein im Wert von CHF 80.', '2025-11-01 10:00:00+01'),
  (2, 1, 'Früchtekorb', 'Regionaler Früchtekorb.', '2025-11-01 10:00:00+01'),
  (3, 2, 'Wellness-Eintritt', 'Eintritt für zwei Personen.', '2025-11-01 10:00:00+01'),
  (4, 2, 'Kaffeepaket', 'Kaffee und Gebäck.', '2025-11-01 10:00:00+01'),

  -- 2026 day 1 prizes
  (5, 3, 'Hauptpreis Day 1: Reisegutschein', 'Reisegutschein im Wert von CHF 300.', '2026-10-20 19:00:00+02'),
  (6, 3, 'Einkaufsgutschein Day 1', 'Gutschein im Wert von CHF 100.', '2026-10-20 19:00:00+02'),
  (7, 3, 'Geschenkkorb Day 1', 'Geschenkkorb mit regionalen Produkten.', '2026-10-20 19:00:00+02'),
  (8, 3, 'Kinoabend Day 1', 'Zwei Kinotickets inklusive Snacks.', '2026-10-20 19:00:00+02'),
  (9, 3, 'Brunch-Gutschein Day 1', 'Brunch für zwei Personen.', '2026-10-20 19:00:00+02'),
  (10, 3, 'Blumenstrauss Day 1', 'Blumenstrauss von lokalem Geschäft.', '2026-10-20 19:00:00+02'),

  -- 2026 day 2 prizes
  (11, 4, 'Hauptpreis Day 2: E-Bike Mietgutschein', 'Tagesmiete für zwei E-Bikes.', '2026-10-20 19:00:00+02'),
  (12, 4, 'Restaurantgutschein Day 2', 'Gutschein im Wert von CHF 120.', '2026-10-20 19:00:00+02'),
  (13, 4, 'Saisonales Geschenkset Day 2', 'Set mit regionalen Produkten.', '2026-10-20 19:00:00+02'),
  (14, 4, 'Bäckerei-Gutschein Day 2', 'Gutschein im Wert von CHF 50.', '2026-10-20 19:00:00+02'),
  (15, 4, 'Sportartikel-Gutschein Day 2', 'Gutschein im Wert von CHF 75.', '2026-10-20 19:00:00+02'),
  (16, 4, 'Bücher-Gutschein Day 2', 'Gutschein im Wert von CHF 40.', '2026-10-20 19:00:00+02');

-- =========================
-- DRAWS
-- =========================
-- Each draw references a check-in, not only a guest.
-- The trigger in init.sql checks that prize and check-in are from the same Lottomatch event.
-- The event day itself does not need to match.

insert into draws (
  id,
  prize_id,
  checkin_id,
  drawn_at,
  drawn_by_user_id,
  notes
) overriding system value values
  -- 2025 historical draws
  (1, 1, 1, '2025-11-15 21:00:00+01', 1, 'Historical draw.'),
  (2, 2, 4, '2025-11-15 21:05:00+01', 1, 'Historical draw.'),
  (3, 3, 6, '2025-11-16 17:00:00+01', 1, 'Historical draw.'),
  (4, 4, 8, '2025-11-16 17:05:00+01', 1, 'Historical draw.'),

  -- 2026 day 1 draws
  (5, 5, 9, '2026-11-14 21:00:00+01', 1, 'Drawn from day 1 check-ins.'),
  (6, 6, 13, '2026-11-14 21:05:00+01', 1, 'Drawn from day 1 check-ins.'),
  (7, 7, 18, '2026-11-14 21:10:00+01', 2, 'Drawn from day 1 check-ins.'),
  (8, 8, 22, '2026-11-14 21:15:00+01', 2, 'Drawn from day 1 check-ins.'),

  -- 2026 day 2 draws. Some winners can come from day 1 check-ins because the raffle pool is event-wide.
  (9, 11, 24, '2026-11-15 17:00:00+01', 1, 'Same guest as draw 5, but this is the separate day 2 check-in. This is allowed by option A.'),
  (10, 12, 10, '2026-11-15 17:05:00+01', 1, 'Day 2 prize won with a day 1 check-in. This is allowed because both belong to the same event.'),
  (11, 13, 33, '2026-11-15 17:10:00+01', 3, 'New guest won through day 2 check-in.'),
  (12, 14, 37, '2026-11-15 17:15:00+01', 3, 'Drawn from day 2 check-ins.');

-- =========================
-- MAIL CAMPAIGNS
-- =========================

insert into mail_campaigns (
  id,
  event_id,
  name,
  channel,
  created_by_user_id,
  created_at
) overriding system value values
  (1, 2, 'Einladung Lottomatch 2026 - Briefpost', 'post', 1, '2026-09-01 08:00:00+02'),
  (2, 2, 'Pilot: Einladung Lottomatch 2026 - E-Mail', 'email', 1, '2026-09-03 10:30:00+02');

-- =========================
-- CAMPAIGN RECIPIENTS
-- =========================

insert into campaign_recipients (
  id,
  campaign_id,
  guest_id,
  recipient_status,
  include_prefilled_slip,
  sent_at
) overriding system value values
  -- Post campaign: includes prefilled slips for known guests
  (1, 1, 1, 'sent', true, '2026-09-15 09:00:00+02'),
  (2, 1, 2, 'sent', true, '2026-09-15 09:00:00+02'),
  (3, 1, 3, 'sent', true, '2026-09-15 09:00:00+02'),
  (4, 1, 4, 'sent', true, '2026-09-15 09:00:00+02'),
  (5, 1, 5, 'sent', true, '2026-09-15 09:00:00+02'),
  (6, 1, 6, 'sent', true, '2026-09-15 09:00:00+02'),
  (7, 1, 7, 'sent', true, '2026-09-15 09:00:00+02'),
  (8, 1, 8, 'sent', true, '2026-09-15 09:00:00+02'),
  (9, 1, 9, 'sent', true, '2026-09-15 09:00:00+02'),
  (10, 1, 10, 'sent', true, '2026-09-15 09:00:00+02'),
  (11, 1, 11, 'planned', false, null),
  (12, 1, 12, 'sent', true, '2026-09-15 09:00:00+02'),
  (13, 1, 13, 'printed', true, null),
  (14, 1, 14, 'sent', true, '2026-09-15 09:00:00+02'),
  (15, 1, 15, 'returned', true, '2026-09-15 09:00:00+02'),
  (16, 1, 18, 'planned', true, null),
  (17, 1, 19, 'planned', true, null),
  (18, 1, 20, 'planned', true, null),

  -- Email pilot: only guests with email consent
  (19, 2, 1, 'sent', false, '2026-09-20 10:00:00+02'),
  (20, 2, 3, 'sent', false, '2026-09-20 10:00:00+02'),
  (21, 2, 6, 'sent', false, '2026-09-20 10:00:00+02'),
  (22, 2, 8, 'sent', false, '2026-09-20 10:00:00+02'),
  (23, 2, 10, 'sent', false, '2026-09-20 10:00:00+02'),
  (24, 2, 11, 'sent', false, '2026-09-20 10:00:00+02'),
  (25, 2, 14, 'sent', false, '2026-09-20 10:00:00+02'),
  (26, 2, 18, 'planned', false, null),
  (27, 2, 20, 'planned', false, null);

-- =========================
-- RESET IDENTITY SEQUENCES
-- =========================
-- Keep future generated IDs higher than the inserted demo IDs.

select setval(pg_get_serial_sequence('users', 'id'), coalesce((select max(id) from users), 1), true);
select setval(pg_get_serial_sequence('addresses', 'id'), coalesce((select max(id) from addresses), 1), true);
select setval(pg_get_serial_sequence('guests', 'id'), coalesce((select max(id) from guests), 1), true);
select setval(pg_get_serial_sequence('lotto_events', 'id'), coalesce((select max(id) from lotto_events), 1), true);
select setval(pg_get_serial_sequence('event_days', 'id'), coalesce((select max(id) from event_days), 1), true);
select setval(pg_get_serial_sequence('checkins', 'id'), coalesce((select max(id) from checkins), 1), true);
select setval(pg_get_serial_sequence('prizes', 'id'), coalesce((select max(id) from prizes), 1), true);
select setval(pg_get_serial_sequence('draws', 'id'), coalesce((select max(id) from draws), 1), true);
select setval(pg_get_serial_sequence('mail_campaigns', 'id'), coalesce((select max(id) from mail_campaigns), 1), true);
select setval(pg_get_serial_sequence('campaign_recipients', 'id'), coalesce((select max(id) from campaign_recipients), 1), true);

commit;
