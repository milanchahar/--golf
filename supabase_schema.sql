-- Enable UUID extension just in case
create extension if not exists "uuid-ossp";

-- Create a table for public profiles
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  role text default 'subscriber' check (role in ('subscriber', 'admin')),
  subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive', 'lapsed')),
  subscription_plan text check (subscription_plan in ('monthly', 'yearly')),
  subscription_renewal_date timestamp with time zone,
  selected_charity_id uuid,
  charity_contribution_percent int default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile." on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Admins can read all profiles
create policy "Admins can read all profiles." on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can update all profiles
create policy "Admins can update all profiles." on profiles
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Create a trigger that automatically inserts a row into profiles when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
