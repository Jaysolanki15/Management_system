create table if not exists public.allowed_login_emails (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint allowed_login_emails_lowercase check (email = lower(email))
);

-- Replace these example addresses with the only emails allowed to use the app.
insert into public.allowed_login_emails (email)
values
  ('owner@example.com'),
  ('staff@example.com')
on conflict (email) do nothing;

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

alter table public.allowed_login_emails enable row level security;

drop policy if exists "Allowed users can read allowed emails" on public.allowed_login_emails;
create policy "Allowed users can read allowed emails" on public.allowed_login_emails
for select using (public.is_allowed_user());

drop policy if exists "Users can read own products" on public.products;
drop policy if exists "Users can insert own products" on public.products;
drop policy if exists "Users can update own products" on public.products;
drop policy if exists "Users can delete own products" on public.products;
drop policy if exists "Users can read own shops" on public.shops;
drop policy if exists "Users can insert own shops" on public.shops;
drop policy if exists "Users can update own shops" on public.shops;
drop policy if exists "Users can delete own shops" on public.shops;
drop policy if exists "Users can read own expenses" on public.expenses;
drop policy if exists "Users can insert own expenses" on public.expenses;
drop policy if exists "Users can update own expenses" on public.expenses;
drop policy if exists "Users can delete own expenses" on public.expenses;
drop policy if exists "Users can read own production" on public.production;
drop policy if exists "Users can insert own production" on public.production;
drop policy if exists "Users can update own production" on public.production;
drop policy if exists "Users can delete own production" on public.production;

drop policy if exists "Allowed users can read products" on public.products;
drop policy if exists "Allowed users can insert products" on public.products;
drop policy if exists "Allowed users can update products" on public.products;
drop policy if exists "Allowed users can delete products" on public.products;
drop policy if exists "Allowed users can read shops" on public.shops;
drop policy if exists "Allowed users can insert shops" on public.shops;
drop policy if exists "Allowed users can update shops" on public.shops;
drop policy if exists "Allowed users can delete shops" on public.shops;
drop policy if exists "Allowed users can read expenses" on public.expenses;
drop policy if exists "Allowed users can insert expenses" on public.expenses;
drop policy if exists "Allowed users can update expenses" on public.expenses;
drop policy if exists "Allowed users can delete expenses" on public.expenses;
drop policy if exists "Allowed users can read production" on public.production;
drop policy if exists "Allowed users can insert production" on public.production;
drop policy if exists "Allowed users can update production" on public.production;
drop policy if exists "Allowed users can delete production" on public.production;

drop index if exists public.products_user_status_idx;
drop index if exists public.shops_user_city_idx;
drop index if exists public.expenses_user_date_idx;
drop index if exists public.expenses_user_category_idx;
drop index if exists public.production_user_date_idx;
drop index if exists public.production_user_product_idx;

alter table public.products drop constraint if exists products_user_id_name_key;
alter table public.shops drop constraint if exists shops_user_id_shop_name_phone_key;

alter table public.products drop column if exists user_id;
alter table public.shops drop column if exists user_id;
alter table public.expenses drop column if exists user_id;
alter table public.production drop column if exists user_id;

create index if not exists products_status_idx on public.products(status);
create index if not exists shops_city_idx on public.shops(city);
create index if not exists expenses_date_idx on public.expenses(expense_date desc);
create index if not exists expenses_category_idx on public.expenses(category);
create index if not exists production_date_idx on public.production(production_date desc);
create index if not exists production_product_idx on public.production(product_id);

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
