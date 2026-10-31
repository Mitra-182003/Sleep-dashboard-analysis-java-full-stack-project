-- DreamBetter schema for Supabase.
-- Run this script once in Supabase Dashboard -> SQL Editor.
-- The Spring Boot API authenticates users with Supabase and accesses this
-- table through the Supabase database connection.

create table if not exists public.sleep_logs (
    id varchar(36) primary key,
    user_id varchar(128) not null,
    sleep_date varchar(40) not null,
    bedtime varchar(40) not null,
    wake_time varchar(40) not null,
    quality integer not null check (quality between 1 and 10),
    mood varchar(80),
    notes varchar(2000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_sleep_logs_user_date unique (user_id, sleep_date)
);

create index if not exists idx_sleep_logs_user_date
    on public.sleep_logs (user_id, sleep_date desc);

-- The API uses Supabase user IDs in user_id and enforces ownership in its service
-- layer. RLS is enabled as defense in depth for direct Supabase access.
alter table public.sleep_logs enable row level security;

-- No browser policy is added intentionally: this application does not expose
-- the Supabase client to the browser. If direct Supabase client access is
-- added later, create policies tied to that authentication provider first.
