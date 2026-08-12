# Harbor — operated by KB Tech Solutions

Real e-commerce site: Next.js + Supabase (auth/database) + Selcom (payments).

## 1. Supabase setup
1. Create a project at supabase.com.
2. SQL Editor → run `supabase/schema.sql`, then `supabase/migration_002_payments.sql`.
3. Settings → API → copy the Project URL, anon public key, and service_role key into `.env.local` (copy `.env.local.example` first).
4. Sign up on your live site with your own email, then in SQL Editor run:
   ```sql
   update public.profiles set role = 'admin' where id =
     (select id from auth.users where email = 'YOUR-EMAIL@example.com');
   ```
   This makes you the Admin. Everyone else who signs up is a Buyer by default.

## 2. Selcom setup (payments)
Selcom is a business API — you must request access first.
1. Email **info@selcom.net** (or your Selcom business contact) asking for **Checkout API** access for an e-commerce site. Ask for both **sandbox** and **live** credentials.
2. You'll receive: API Key, API Secret, and a Vendor ID.
3. Put the sandbox ones in `.env.local` first (`SELCOM_USE_SANDBOX=true`) and test full orders end to end before going live.
4. Selcom's exact request-signing recipe isn't fully public — `lib/selcom.js` implements the documented pattern (HMAC-SHA256 digest over the signed fields). If Selcom's team gives you a different signing spec when they onboard you, that's the only function you'll need to adjust (`computeHeaders` in `lib/selcom.js`).
5. Once you're live, set `SELCOM_USE_SANDBOX=false` and use your live credentials.

## 3. Deploy
1. Push this project to a GitHub repo.
2. Import it into Vercel.
3. Add every variable from `.env.local` into Vercel's Environment Variables settings (do this for both Preview and Production).
4. Set `NEXT_PUBLIC_SITE_URL` to your real deployed domain — Selcom's redirect/cancel/webhook URLs depend on it.
5. Point your domain (e.g. harbor.co.tz) at the Vercel deployment.

## What's real vs. what needs your input
- Real: Supabase Auth (signup/login), Postgres database, Row Level Security, stock reservation, order creation, Admin dashboard (products/services/policies/orders), Selcom checkout + webhook wiring.
- Needs your input before it processes a real payment: actual Selcom API credentials (sandbox, then live) and a deployed public URL for the webhook to reach.

## Still to come (later phases)
- Buyer ↔ Admin messaging UI (the `messages` table already exists in the database)
- Multi-language UI (Swahili, English, Spanish, German, French)
- AI shopping assistant
- Full Privacy / Terms / Returns policy text (editable now from Admin → Policies, currently placeholder content)
