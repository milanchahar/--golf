# Golf Heroes Platform

Play Golf. Win Prizes. Change Lives. Every subscription generates dynamic target rewards while guaranteeing a minimum 10% direct flow to selected charities.

Everything is fully implemented under a monolithic Next.js App Router build incorporating Stripe, Supabase, and Resend.

## Installation & Orchestration

These deployment steps specify a blank-state production build directly leveraging your fresh Vercel, Supabase, and Stripe instances.

### 1. Database Provisioning (Supabase)
1. Initialize a new project on [Supabase](https://supabase.com).
2. Open the SQL Editor and directly copy/paste the full contents of `supabase_schema_complete.sql`.
3. Hit `Run`. This master script handles Table scaffolding, RLS configuration, Trigger sequences (auth linkages / charity counters), and private/public storage bucket initializations automatically.
4. From your Supabase Project settings, copy your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Payments (Stripe)
1. Create a [Stripe Account](https://stripe.com).
2. Inside Products, build two subscriptions:
   - Monthly Plan: €9.99 (Recurring)
   - Yearly Plan: €99.99 (Recurring)
3. Copy both internal Price IDs.
4. Establish your webhook endpoint mapping to `https://your-domain.vercel.app/api/webhooks/stripe`. Ensure it tracks the following events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`, `customer.subscription.updated`
5. Reveal your Webhook Signature Secret and Platform Secret.

### 3. Email Engine (Resend)
1. Start an interface proxy on [Resend](https://resend.com).
2. Verify your domain (DKIM/SPF) or operate it securely within `onboarding@resend.dev` locally.
3. Grab your `RESEND_API_KEY`.

### 4. Hosting & Deployment (Vercel)
1. Link your repo directly to [Vercel](https://vercel.com).
2. Map your variables using `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_MONTHLY_PRICE_ID=...
STRIPE_YEARLY_PRICE_ID=...

RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
ADMIN_EMAIL=...

NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```
3. Establish your deployment. Everything installs properly automatically through standard `npm install`. The specific required packages added under this sprint were `npm install resend react-hot-toast framer-motion`.

## Creating The First Admin Overlords
1. Start the live build, go to Signup, and run a generic auth registration.
2. Jump to your Supabase Table editor -> `profiles`.
3. Locate your account row, double click the `role` field, and swap `user` to `admin`.
4. Refresh the platform. You now have access to `/admin` to map charities and track logic.
