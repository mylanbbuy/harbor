-- ============================================================
-- HARBOR — Migration 002: Stock, Payments (Selcom), Buyer role
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- 1. Rename role 'customer' -> 'buyer' (new users are Buyers by default)
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'buyer' where role = 'customer';
alter table public.profiles alter column role set default 'buyer';
alter table public.profiles add constraint profiles_role_check check (role in ('buyer', 'admin'));


-- 2. Stock on products
alter table public.products add column if not exists stock int not null default 0;


-- 3. Payment fields on orders
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add column if not exists payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid', 'processing', 'paid', 'failed', 'refunded'));
alter table public.orders add column if not exists payment_reference text; -- our own order_id sent to Selcom
alter table public.orders add column if not exists selcom_transid text;    -- Selcom's transaction id
alter table public.orders add column if not exists payment_gateway_url text;
alter table public.orders add column if not exists paid_at timestamp with time zone;

alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'));


-- 4. Atomic stock check + decrement, called from the checkout API route
-- using the service role (bypasses RLS). Raises an exception (and rolls back)
-- if any item does not have enough stock, so an order is never created
-- with an oversold item.
create or replace function public.decrement_stock(items jsonb)
returns void as $$
declare
  item jsonb;
  current_stock int;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    select stock into current_stock from public.products where id = (item->>'product_id')::uuid for update;
    if current_stock is null then
      raise exception 'Product % not found', item->>'product_id';
    end if;
    if current_stock < (item->>'qty')::int then
      raise exception 'Not enough stock for product %', item->>'product_id';
    end if;
    update public.products set stock = stock - (item->>'qty')::int where id = (item->>'product_id')::uuid;
  end loop;
end;
$$ language plpgsql security definer;


-- 5. Restore stock helper (used on cancellation/refund)
create or replace function public.restore_stock(items jsonb)
returns void as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    update public.products set stock = stock + (item->>'qty')::int where id = (item->>'product_id')::uuid;
  end loop;
end;
$$ language plpgsql security definer;


-- 6. Buyer <-> Admin messaging (per order, simple thread)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  sender_id uuid references auth.users on delete set null,
  sender_role text not null check (sender_role in ('buyer', 'admin')),
  body text not null,
  created_at timestamp with time zone default now()
);

alter table public.messages enable row level security;
create policy "Buyers can view messages on their own orders" on public.messages for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Buyers can send messages on their own orders" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "Admins can view all messages" on public.messages for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins can send messages on any order" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- NOTE: This migration renames the buyer role. If you already assigned
-- yourself as admin via schema.sql instructions, your role is untouched
-- (only 'customer' rows were renamed to 'buyer').
-- ============================================================
