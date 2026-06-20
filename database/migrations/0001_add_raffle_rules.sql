-- Story: raffle rule configuration (epic event-raffle)
-- Adds winner count and eligibility rules to prizes so an event manager can
-- define how each prize is drawn. Safe to run on an existing database.

alter table prizes
  add column if not exists winner_count int not null default 1,
  add column if not exists eligibility varchar(20) not null default 'checked_in';

alter table prizes
  drop constraint if exists chk_prizes_winner_count_positive;
alter table prizes
  add constraint chk_prizes_winner_count_positive check (winner_count > 0);

alter table prizes
  drop constraint if exists chk_prizes_eligibility;
alter table prizes
  add constraint chk_prizes_eligibility
  check (eligibility in ('all', 'checked_in'));
