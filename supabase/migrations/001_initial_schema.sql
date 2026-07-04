create extension if not exists "pgcrypto";

create type public.weight_unit as enum ('KG', 'GM');
create type public.product_status as enum ('Active', 'Inactive');
create type public.expense_category as enum (
  'Oil',
  'Gas',
  'Flour',
  'Salary',
  'Electricity',
  'Transport',
  'Maintenance',
  'Packaging',
  'Other',
  'Household'
);
create type public.payment_method as enum ('Cash', 'UPI', 'Bank Transfer', 'Card', 'Credit', 'Other');

create table public.allowed_login_emails (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint allowed_login_emails_lowercase check (email = lower(email))
);

-- Replace these example addresses with the only emails allowed to use the app.
insert into public.allowed_login_emails (email)
values
  ('owner@example.com'),
  ('staff@example.com');

create or replace function public.is_allowed_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.allowed_login_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  wholesale_price numeric(12, 2) not null check (wholesale_price >= 0),
  weight numeric(12, 3) not null check (weight > 0),
  weight_unit public.weight_unit not null default 'GM',
  description text,
  status public.product_status not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null,
  owner_name text not null,
  phone text not null,
  alternate_phone text,
  address text not null,
  city text,
  state text,
  pincode text,
  google_maps_link text,
  gst_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_name, phone),
  constraint shops_phone_digits check (phone ~ '^[0-9+ -]{7,16}$'),
  constraint shops_alt_phone_digits check (alternate_phone is null or alternate_phone ~ '^[0-9+ -]{7,16}$')
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.expense_category not null,
  amount numeric(12, 2) not null check (amount > 0),
  expense_date date not null default current_date,
  notes text,
  payment_method public.payment_method not null default 'Cash',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.production (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  production_date date not null default current_date,
  quantity numeric(12, 3) not null check (quantity > 0),
  unit public.weight_unit not null default 'KG',
  quantity_kg numeric(12, 3) generated always as (
    case when unit = 'GM' then quantity / 1000 else quantity end
  ) stored,
  notes text,
  shift text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

create trigger shops_set_updated_at before update on public.shops
for each row execute function public.set_updated_at();

create trigger expenses_set_updated_at before update on public.expenses
for each row execute function public.set_updated_at();

create trigger production_set_updated_at before update on public.production
for each row execute function public.set_updated_at();

create index products_status_idx on public.products(status);
create index products_search_idx on public.products using gin (to_tsvector('simple', name || ' ' || coalesce(description, '')));
create index shops_city_idx on public.shops(city);
create index shops_search_idx on public.shops using gin (to_tsvector('simple', shop_name || ' ' || owner_name || ' ' || phone || ' ' || address));
create index expenses_date_idx on public.expenses(expense_date desc);
create index expenses_category_idx on public.expenses(category);
create index production_date_idx on public.production(production_date desc);
create index production_product_idx on public.production(product_id);

alter table public.allowed_login_emails enable row level security;
alter table public.products enable row level security;
alter table public.shops enable row level security;
alter table public.expenses enable row level security;
alter table public.production enable row level security;

create policy "Allowed users can read allowed emails" on public.allowed_login_emails
for select using (public.is_allowed_user());

create policy "Allowed users can read products" on public.products
for select using (public.is_allowed_user());
create policy "Allowed users can insert products" on public.products
for insert with check (public.is_allowed_user());
create policy "Allowed users can update products" on public.products
for update using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "Allowed users can delete products" on public.products
for delete using (public.is_allowed_user());

create policy "Allowed users can read shops" on public.shops
for select using (public.is_allowed_user());
create policy "Allowed users can insert shops" on public.shops
for insert with check (public.is_allowed_user());
create policy "Allowed users can update shops" on public.shops
for update using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "Allowed users can delete shops" on public.shops
for delete using (public.is_allowed_user());

create policy "Allowed users can read expenses" on public.expenses
for select using (public.is_allowed_user());
create policy "Allowed users can insert expenses" on public.expenses
for insert with check (public.is_allowed_user());
create policy "Allowed users can update expenses" on public.expenses
for update using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "Allowed users can delete expenses" on public.expenses
for delete using (public.is_allowed_user());

create policy "Allowed users can read production" on public.production
for select using (public.is_allowed_user());
create policy "Allowed users can insert production" on public.production
for insert with check (public.is_allowed_user());
create policy "Allowed users can update production" on public.production
for update using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "Allowed users can delete production" on public.production
for delete using (public.is_allowed_user());
