-- Story: AI support assistant (epic ai-automation)
-- Audit trail of support replies. Records which messages were AI-generated,
-- edited by a human, or written from scratch. Safe to run on an existing DB.

create table if not exists support_drafts (
  id bigint generated always as identity primary key,
  guest_id bigint references guests(id),
  inquiry text not null,
  draft text,
  final_text text,
  source varchar(20) not null default 'ai',
  created_at timestamptz not null default now(),

  constraint chk_support_drafts_source
    check (source in ('ai', 'edited', 'human'))
);
