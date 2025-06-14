-- Create tags table
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  color text not null default '#3B82F6',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add description and tags columns to addresses table
alter table public.addresses 
add column description text,
add column tags jsonb default '[]';

-- Enable RLS (Row Level Security) on tags table
alter table public.tags enable row level security;

-- Create policies to allow all operations on tags (you may want to restrict this later)
create policy "Allow all operations on tags" on public.tags
for all using (true);

-- Create indexes for performance
create index idx_addresses_tags on public.addresses using gin(tags);
create index idx_tags_name on public.tags(name);

-- Create trigger to automatically update updated_at on tags table
create trigger update_tags_updated_at before update on public.tags
for each row execute function public.update_updated_at_column();