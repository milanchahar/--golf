-- Section 6: Charity System Tables and Triggers

create table charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  banner_image_url text,
  website_url text,
  is_featured boolean default false,
  is_active boolean default true,
  total_raised decimal(10,2) default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid references charities(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  location text,
  image_url text,
  created_at timestamp default now()
);

create table charity_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  charity_id uuid references charities(id) on delete cascade,
  amount decimal(10,2) not null,
  contribution_month text not null, -- "2026-04"
  contribution_type text default 'subscription', -- 'subscription' or 'independent'
  created_at timestamp default now()
);

-- Enable RLS
alter table charities enable row level security;
alter table charity_events enable row level security;
alter table charity_contributions enable row level security;

-- Policies
create policy "Anyone can select active charities" on charities
  for select using (is_active = true);

create policy "Admin can insert charities" on charities
  for insert with check ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Admin can update charities" on charities
  for update using ((select role from profiles where id = auth.uid()) = 'admin');
  
create policy "Admin can delete charities" on charities
  for delete using ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Anyone can select charity events" on charity_events
  for select using (true);
  
create policy "Admin can insert charity events" on charity_events
  for insert with check ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Admin can update charity events" on charity_events
  for update using ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Admin can delete charity events" on charity_events
  for delete using ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Users can select own contributions" on charity_contributions
  for select using (auth.uid() = user_id);
  
create policy "Admin can select all contributions" on charity_contributions
  for select using ((select role from profiles where id = auth.uid()) = 'admin');

-- Triggers
create or replace function update_charity_total_raised()
returns trigger as $$
begin
  update charities
  set total_raised = total_raised + NEW.amount
  where id = NEW.charity_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_contribution_inserted
after insert on charity_contributions
for each row execute procedure update_charity_total_raised();
