-- ═══════════════════════════════════════════════════════════════════════════
-- golf_scores table — Section 3
-- Run this in the Supabase SQL editor AFTER the existing schema from Section 1.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists golf_scores (
  id          uuid    primary key default gen_random_uuid(),
  user_id     uuid    not null references profiles(id) on delete cascade,
  score       int     not null check (score >= 1 and score <= 45),
  score_date  date    not null,
  created_at  timestamp with time zone default timezone('utc', now()),
  updated_at  timestamp with time zone default timezone('utc', now()),
  unique (user_id, score_date)
);

-- Performance index: most queries order by user + newest date first
create index if not exists golf_scores_user_date_idx
  on golf_scores (user_id, score_date desc);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table golf_scores enable row level security;

-- Users can SELECT their own scores
create policy "Users can read own scores."
  on golf_scores for select
  using (auth.uid() = user_id);

-- Users can INSERT their own scores
create policy "Users can insert own scores."
  on golf_scores for insert
  with check (auth.uid() = user_id);

-- Users can UPDATE their own scores
create policy "Users can update own scores."
  on golf_scores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can DELETE their own scores
create policy "Users can delete own scores."
  on golf_scores for delete
  using (auth.uid() = user_id);

-- Admins can SELECT ALL scores (read-only admin access)
create policy "Admins can read all scores."
  on golf_scores for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ─── Auto-update updated_at trigger ──────────────────────────────────────────

create or replace function public.handle_golf_score_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_golf_score_updated
  before update on golf_scores
  for each row execute procedure public.handle_golf_score_updated_at();
