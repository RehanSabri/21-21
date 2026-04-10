# H&M Clone — Real Backend Setup Guide

## Stack
- **Database + Auth + Storage**: Supabase (free tier)
- **Payments**: Razorpay (test mode)
- **Deployment**: Vercel

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **API keys** from:
   `Project Settings → API`
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Run the Database Schema

1. Open your Supabase project → **SQL Editor**
2. Paste and run the entire contents of `backend/schema.sql`
3. This creates all tables, RLS policies, and the `product-images` storage bucket

---

## Step 3: Seed Products

After filling in `.env.local` (see Step 5):

```bash
npx tsx backend/seed.ts
```

---

## Step 4: Create a Razorpay Account

1. Go to [razorpay.com](https://razorpay.com) → Sign up (free)
2. In the dashboard → **Settings → API Keys → Generate Test Key**
3. Copy **Key ID** and **Key Secret**

---

## Step 5: Fill in Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
copy .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → API Keys (Test) |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → API Keys (Test) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

---

## Step 6: Set Yourself as Admin

After registering an account on the site:

1. Go to Supabase → **Table Editor → profiles**
2. Find your row and set `role` = `admin`
3. You can now access `/admin` and manage products

---

## Step 7: Run Locally

```bash
npm run dev
```

---

## Step 8: Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add all environment variables from `.env.local` in Vercel project settings
4. Deploy!

> **Note:** For Razorpay live payments, switch your Razorpay keys from test (`rzp_test_`) to live (`rzp_live_`) keys.

---

## Test Razorpay Payment (Test Mode)

Use these test credentials in the Razorpay modal:
- **UPI**: `success@razorpay`
- **Card**: `4111 1111 1111 1111`, any future date, any CVV
- **Net Banking**: Select any bank → use test credentials shown

---

## File Structure

```
backend/
  schema.sql      ← Run this in Supabase SQL Editor
  seed.ts         ← Seeds products into DB (run once)
  README.md       ← This file

src/
  lib/supabase/
    client.ts     ← Browser Supabase client
    server.ts     ← Server Supabase client + service role client
  middleware.ts   ← Session refresh + route protection
  app/api/
    user/
      profile/    ← PATCH update name/phone
      addresses/  ← GET/POST/DELETE addresses
    products/
      route.ts    ← GET (list), POST (admin create)
      [id]/       ← GET, PUT, DELETE (admin)
      upload-image/ ← POST (admin image upload)
    cart/         ← GET/POST/DELETE/PATCH
    wishlist/     ← GET/POST/DELETE
    orders/
      route.ts    ← GET/POST
      [id]/       ← GET single order
    payments/
      create-order/ ← POST (Razorpay server order)
      verify/       ← POST (signature verify + save order)
  context/
    AuthContext.tsx      ← Supabase Auth (was localStorage)
    CartContext.tsx      ← Hybrid DB+localStorage cart
    WishlistContext.tsx  ← Hybrid DB+localStorage wishlist
    ProductsContext.tsx  ← Supabase DB products
```
