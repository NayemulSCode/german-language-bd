-- One row per user holding their learning progress as JSON (see src/lib/storage.ts).
-- The browser talks to this table directly with the public anon key; row-level security is what
-- keeps every user's data private, so do not disable it.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  -- lessons, review cards (about 90 bytes per word) and daily activity stay well under this even at B1;
  -- the limit stops abuse of the free-tier storage
  constraint progress_data_size check (pg_column_size(data) < 500000)
);

alter table public.progress enable row level security;

-- a signed-in user can read, create, change and delete only their own row
-- (dropped first so this script can be run again safely)
drop policy if exists "progress: owner full access" on public.progress;
create policy "progress: owner full access"
  on public.progress
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- anonymous visitors get nothing
revoke all on public.progress from anon;

-- Newer Supabase projects do not expose tables created by SQL to the Data API by default.
-- Signed-in users need these privileges; row-level security above still limits them to their own row.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.progress to authenticated;
