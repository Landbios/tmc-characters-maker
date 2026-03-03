-- Create the characters table
create table characters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text,
  subtitle text,
  image_url text,
  age text,
  height text,
  nationality text,
  element_primary text,
  element_secondary text,
  special_ability_name text,
  special_ability_desc text,
  clan_name text,
  clan_desc text,
  type_name text,
  type_desc text,
  quote text,
  theme_color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table characters enable row level security;

-- Policies
create policy "Users can create their own characters"
on characters for insert
with check (auth.uid() = user_id);

create policy "Users can update their own characters"
on characters for update
using (auth.uid() = user_id);

create policy "Users can delete their own characters"
on characters for delete
using (auth.uid() = user_id);

create policy "Users can view their own characters"
on characters for select
using (auth.uid() = user_id);

create policy "Anyone can view characters via public link"
on characters for select
using (true);
