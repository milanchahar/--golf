-- ═══════════════════════════════════════════════════════════════════════════
-- prize_pools table — Section 5: Prize Pool Calculator
-- Run AFTER supabase_draws.sql
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists prize_pools (
  id                      uuid          primary key default gen_random_uuid(),
  draw_id                 uuid          not null references draws(id) on delete cascade unique,
  draw_month              text          not null,
  total_active_subscribers int          not null default 0,
  subscription_revenue    decimal(10,2) not null default 0,
  prize_pool_total        decimal(10,2) not null default 0,
  five_match_pool         decimal(10,2) not null default 0,
  four_match_pool         decimal(10,2) not null default 0,
  three_match_pool        decimal(10,2) not null default 0,
  jackpot_carry_in        decimal(10,2) not null default 0,
  jackpot_carry_out       decimal(10,2) not null default 0,
  five_match_winners      int           not null default 0,
  four_match_winners      int           not null default 0,
  three_match_winners     int           not null default 0,
  five_match_payout       decimal(10,2) not null default 0,
  four_match_payout       decimal(10,2) not null default 0,
  three_match_payout      decimal(10,2) not null default 0,
  created_at              timestamp with time zone default timezone('utc', now()),
  updated_at              timestamp with time zone default timezone('utc', now())
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table prize_pools enable row level security;

-- Admin: full read/write
create policy "Admins can read all prize pools."
  on prize_pools for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can insert prize pools."
  on prize_pools for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update prize pools."
  on prize_pools for update
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

-- Authenticated users: read prize pool summaries for published draws only
create policy "Users can read published prize pool summaries."
  on prize_pools for select
  using (
    exists (
      select 1 from draws
      where draws.id = prize_pools.draw_id
        and draws.status = 'published'
    )
  );

-- ─── Auto-update updated_at trigger ──────────────────────────────────────────

create or replace function public.handle_prize_pool_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_prize_pool_updated
  before update on prize_pools
  for each row execute procedure public.handle_prize_pool_updated_at();
