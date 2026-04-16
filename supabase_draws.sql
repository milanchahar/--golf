-- ═══════════════════════════════════════════════════════════════════════════
-- draws + draw_entries tables — Section 4: Draw Engine
-- Run this in the Supabase SQL editor AFTER supabase_golf_scores.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── draws ────────────────────────────────────────────────────────────────────
create table if not exists draws (
  id                      uuid    primary key default gen_random_uuid(),
  draw_month              text    not null, -- "YYYY-MM" e.g. "2026-04"
  status                  text    not null default 'pending'
                            check (status in ('pending', 'simulated', 'published')),
  draw_type               text    not null default 'random'
                            check (draw_type in ('random', 'algorithmic')),
  drawn_numbers           int[]   not null default '{}',
  jackpot_carried_over    boolean not null default false,
  jackpot_carry_from_draw_id uuid references draws(id),
  created_at              timestamp with time zone default timezone('utc', now()),
  published_at            timestamp with time zone,
  unique (draw_month)
);

alter table draws enable row level security;

-- Public can read published draws
create policy "Anyone can view published draws."
  on draws for select
  using (status = 'published');

-- Admins can read all draws (including pending/simulated)
create policy "Admins can read all draws."
  on draws for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Only admins can insert draws
create policy "Admins can insert draws."
  on draws for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Only admins can update draws (simulate / publish)
create policy "Admins can update draws."
  on draws for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ─── draw_entries ─────────────────────────────────────────────────────────────
create table if not exists draw_entries (
  id           uuid    primary key default gen_random_uuid(),
  draw_id      uuid    not null references draws(id) on delete cascade,
  user_id      uuid    not null references profiles(id) on delete cascade,
  user_scores  int[]   not null,            -- snapshot of user's scores at draw time
  match_count  int     not null default 0   check (match_count >= 0 and match_count <= 5),
  is_winner    boolean not null default false,
  prize_tier   text                         check (prize_tier in ('5-match', '4-match', '3-match')),
  prize_amount decimal(10,2),
  created_at   timestamp with time zone default timezone('utc', now()),
  unique (draw_id, user_id)
);

alter table draw_entries enable row level security;

-- Users can view their own entries
create policy "Users can read own draw entries."
  on draw_entries for select
  using (auth.uid() = user_id);

-- Admins can read all entries
create policy "Admins can read all draw entries."
  on draw_entries for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Only admins (server-side via service role) can insert entries
create policy "Admins can insert draw entries."
  on draw_entries for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Only admins can update entries
create policy "Admins can update draw entries."
  on draw_entries for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
