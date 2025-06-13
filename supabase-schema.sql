-- Create addresses table
create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  address text not null,
  chain text not null,
  network text,
  balance numeric,
  last_updated timestamp with time zone,
  tokens jsonb,
  last_transactions jsonb,
  chain_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.addresses enable row level security;

-- Create policy to allow all operations (you may want to restrict this later)
create policy "Allow all operations on addresses" on public.addresses
for all using (true);

-- Create index on address for faster lookups
create index idx_addresses_address on public.addresses(address);

-- Create index on chain for filtering
create index idx_addresses_chain on public.addresses(chain);

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_addresses_updated_at before update on public.addresses
for each row execute function public.update_updated_at_column();