create table if not exists public.confidence_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  interview_id uuid not null,
  attempt_number integer not null,
  knew_what_to_say smallint not null check (knew_what_to_say between 1 and 5),
  felt_unjudged smallint not null check (felt_unjudged between 1 and 5),
  real_interview_readiness smallint not null check (real_interview_readiness between 1 and 5),
  recovered_when_stuck smallint not null check (recovered_when_stuck between 1 and 5),
  self_belief_score smallint not null check (self_belief_score between 20 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists confidence_checkins_user_interview_attempt_idx
on public.confidence_checkins (user_id, interview_id, attempt_number);

alter table public.interview_sessions
add column if not exists completed_at timestamptz,
add column if not exists ended_normally boolean,
add column if not exists ended_reason text,
add column if not exists first_response_seconds numeric,
add column if not exists user_message_count integer,
add column if not exists pause_count integer,
add column if not exists attempt_number integer;
