-- ============================================================
-- H&M Clone — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─── Enable UUID extension ────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ─────────────────────────────────────────────
-- Extends auth.users (created automatically by Supabase Auth)
create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    name        text not null default '',
    role        text not null default 'user' check (role in ('user', 'admin')),
    phone       text,
    created_at  timestamptz not null default now()
);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
    insert into public.profiles (id, name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ─── ADDRESSES ────────────────────────────────────────────
create table if not exists public.addresses (
    id          uuid primary key default uuid_generate_v4(),
    user_id     uuid not null references public.profiles(id) on delete cascade,
    line1       text not null,
    line2       text,
    city        text not null,
    postcode    text not null,
    country     text not null default 'India',
    is_default  boolean not null default false,
    created_at  timestamptz not null default now()
);

-- ─── PRODUCTS ─────────────────────────────────────────────
create table if not exists public.products (
    id              text primary key,
    name            text not null,
    category        text not null check (category in ('women','men','kids','home')),
    subcategory     text not null default '',
    price           integer not null,         -- stored in paise (₹) × 1, but we keep as rupees integer
    original_price  integer,
    images          text[] not null default '{}',
    colors          jsonb not null default '[]',   -- [{name, hex}]
    sizes           text[] not null default '{}',
    description     text not null default '',
    details         text[] not null default '{}',
    care            text[] not null default '{}',
    tags            text[] not null default '{}',
    rating          numeric(3,1) not null default 0,
    reviews         integer not null default 0,
    is_new          boolean not null default false,
    is_sale         boolean not null default false,
    is_best_seller  boolean not null default false,
    stock           integer not null default 100,
    created_at      timestamptz not null default now()
);

-- ─── CART ITEMS ───────────────────────────────────────────
create table if not exists public.cart_items (
    id          uuid primary key default uuid_generate_v4(),
    user_id     uuid not null references public.profiles(id) on delete cascade,
    product_id  text not null references public.products(id) on delete cascade,
    quantity    integer not null default 1 check (quantity > 0),
    size        text not null,
    color       text not null,
    created_at  timestamptz not null default now(),
    unique (user_id, product_id, size, color)
);

-- ─── WISHLIST ITEMS ───────────────────────────────────────
create table if not exists public.wishlist_items (
    id          uuid primary key default uuid_generate_v4(),
    user_id     uuid not null references public.profiles(id) on delete cascade,
    product_id  text not null references public.products(id) on delete cascade,
    created_at  timestamptz not null default now(),
    unique (user_id, product_id)
);

-- ─── ORDERS ───────────────────────────────────────────────
create table if not exists public.orders (
    id                  uuid primary key default uuid_generate_v4(),
    user_id             uuid not null references public.profiles(id) on delete cascade,
    status              text not null default 'Processing'
                            check (status in ('Processing','Confirmed','Shipped','Delivered','Cancelled')),
    shipping_method     text not null default 'standard' check (shipping_method in ('standard','express')),
    subtotal            integer not null,
    delivery_fee        integer not null default 0,
    total               integer not null,
    address_snapshot    jsonb not null,             -- {line1, line2, city, postcode, country, firstName, lastName, phone}
    razorpay_order_id   text,
    razorpay_payment_id text,
    payment_status      text not null default 'pending'
                            check (payment_status in ('pending','paid','failed')),
    created_at          timestamptz not null default now()
);

-- ─── ORDER ITEMS ──────────────────────────────────────────
create table if not exists public.order_items (
    id          uuid primary key default uuid_generate_v4(),
    order_id    uuid not null references public.orders(id) on delete cascade,
    product_id  text,                              -- nullable — product may be deleted later
    name        text not null,
    image       text not null default '',
    price       integer not null,
    quantity    integer not null,
    size        text not null,
    color       text not null
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.addresses      enable row level security;
alter table public.products       enable row level security;
alter table public.cart_items     enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- PROFILES
create policy "Users can view own profile"
    on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
    on public.profiles for update using (auth.uid() = id);

-- ADDRESSES
create policy "Users manage own addresses"
    on public.addresses for all using (auth.uid() = user_id);

-- PRODUCTS — anyone can read; only admins can write
create policy "Anyone can view products"
    on public.products for select using (true);
create policy "Admins can insert products"
    on public.products for insert
    with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update products"
    on public.products for update
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete products"
    on public.products for delete
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- CART
create policy "Users manage own cart"
    on public.cart_items for all using (auth.uid() = user_id);

-- WISHLIST
create policy "Users manage own wishlist"
    on public.wishlist_items for all using (auth.uid() = user_id);

-- ORDERS — users see own orders; service role bypasses RLS for creation
create policy "Users view own orders"
    on public.orders for select using (auth.uid() = user_id);
create policy "Users insert own orders"
    on public.orders for insert with check (auth.uid() = user_id);

-- ORDER ITEMS — readable if user owns the parent order
create policy "Users view own order items"
    on public.order_items for select
    using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Users insert own order items"
    on public.order_items for insert
    with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- ============================================================
-- STORAGE BUCKET (run this too)
-- ============================================================
-- Create the product-images bucket via the Supabase dashboard OR run:
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Public read on product-images"
    on storage.objects for select
    using (bucket_id = 'product-images');

create policy "Admins can upload product images"
    on storage.objects for insert
    with check (
        bucket_id = 'product-images' and
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

create policy "Admins can delete product images"
    on storage.objects for delete
    using (
        bucket_id = 'product-images' and
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );
