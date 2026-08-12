-- ============================================================
-- HARBOR — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste all -> Run)
-- ============================================================

-- 1. PROFILES
-- Extends Supabase's built-in auth.users with a role and contact info.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. CATEGORIES
create table if not exists public.categories (
  id text primary key,
  label text not null,
  icon text not null default 'Cpu',
  sort_order int not null default 0
);

alter table public.categories enable row level security;
create policy "Anyone can view categories" on public.categories for select using (true);
create policy "Admins can manage categories" on public.categories for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.categories (id, label, icon, sort_order) values
  ('laptops', 'Laptops', 'Laptop', 1),
  ('smartphones', 'Smartphones', 'Smartphone', 2),
  ('tablets', 'Tablets', 'Tablet', 3),
  ('accessories', 'Accessories', 'Headphones', 4),
  ('parts', 'Computer Parts', 'Cpu', 5),
  ('networking', 'Networking', 'Wifi', 6),
  ('cameras', 'Cameras', 'Camera', 7),
  ('watches', 'Smart Watches', 'Watch', 8)
on conflict (id) do nothing;


-- 3. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id text references public.categories(id),
  price numeric not null default 0,
  specs text,
  tag text,
  active boolean not null default true,
  created_at timestamp with time zone default now()
);

alter table public.products enable row level security;
create policy "Anyone can view active products" on public.products for select using (active = true);
create policy "Admins can view all products" on public.products for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins can manage products" on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- 4. SERVICES
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text not null default 'Wrench',
  active boolean not null default true,
  sort_order int not null default 0
);

alter table public.services enable row level security;
create policy "Anyone can view active services" on public.services for select using (active = true);
create policy "Admins can manage services" on public.services for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.services (title, description, icon, sort_order) values
  ('Computer & Phone Repair', 'Screen replacement, battery swaps, water damage, hardware diagnostics and more.', 'Wrench', 1),
  ('Software Installation', 'Operating systems, licensed office tools, security software, and system optimization.', 'Download', 2),
  ('WiFi & CCTV Installation', 'Home and business network setup and CCTV camera installation with remote viewing.', 'ShieldCheck', 3),
  ('IT Support', 'Ongoing technical support, troubleshooting, maintenance, and IT consulting.', 'LifeBuoy', 4)
on conflict do nothing;


-- 5. POLICIES
-- Admin-editable text pages (Privacy Policy, Returns, Terms, etc).
create table if not exists public.policies (
  slug text primary key,
  title text not null,
  content text not null default '',
  updated_at timestamp with time zone default now()
);

alter table public.policies enable row level security;
create policy "Anyone can view policies" on public.policies for select using (true);
create policy "Admins can manage policies" on public.policies for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.policies (slug, title, content) values
  ('privacy', 'Privacy Policy', 'Write your privacy policy here from the Admin dashboard.'),
  ('returns', 'Returns & Warranty', 'Write your returns and warranty policy here from the Admin dashboard.'),
  ('terms', 'Terms of Service', 'Write your terms of service here from the Admin dashboard.')
on conflict (slug) do nothing;


-- 6. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  customer_name text,
  customer_phone text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  total numeric not null default 0,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create their own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can view all orders" on public.orders for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins can update orders" on public.orders for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- 7. ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  price numeric not null,
  qty int not null default 1
);

alter table public.order_items enable row level security;
create policy "Users can view items from their own orders" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Users can insert items into their own orders" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Admins can view all order items" on public.order_items for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ============================================================
-- LAST STEP (do this manually, after you sign up on the live site):
-- Turn your own account into an Admin account by running:
--
--   update public.profiles set role = 'admin' where id =
--     (select id from auth.users where email = 'YOUR-ADMIN-EMAIL@example.com');
--
-- ============================================================
