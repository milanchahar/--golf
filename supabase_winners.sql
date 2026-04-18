-- Section 7: Winner Verification System

create table winner_verifications (
  id uuid primary key default gen_random_uuid(),
  draw_entry_id uuid references draw_entries(id) on delete cascade unique,
  user_id uuid references profiles(id) on delete cascade,
  draw_id uuid references draws(id) on delete cascade,
  proof_image_url text not null,
  proof_uploaded_at timestamp default now(),
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamp,
  payment_status text default 'unpaid', -- 'unpaid', 'pending', 'paid'
  payment_reference text,
  payment_completed_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table winner_verifications enable row level security;

-- Users can SELECT and INSERT their own verification rows
create policy "Users can view own verifications" on winner_verifications
  for select using (auth.uid() = user_id);

create policy "Users can insert own verifications" on winner_verifications
  for insert with check (auth.uid() = user_id);

-- Admins can SELECT all, UPDATE all
create policy "Admin can select all verifications" on winner_verifications
  for select using ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Admin can update all verifications" on winner_verifications
  for update using ((select role from profiles where id = auth.uid()) = 'admin');

-- Storage Bucket setup
insert into storage.buckets (id, name, public) values ('winner-proofs', 'winner-proofs', false) on conflict do nothing;

create policy "Users can upload to their own folder" on storage.objects
  for insert with check ( bucket_id = 'winner-proofs' and (auth.uid())::text = (string_to_array(name, '/'))[1] );
  
create policy "Users can view their own proofs" on storage.objects
  for select using ( bucket_id = 'winner-proofs' and (auth.uid())::text = (string_to_array(name, '/'))[1] );
  
create policy "Admin can view all proofs" on storage.objects
  for select using ( bucket_id = 'winner-proofs' and ((select role from profiles where id = auth.uid()) = 'admin') );
