-- ============================================================
-- 032: Fix "there is no unique or exclusion constraint matching the
-- ON CONFLICT specification" on every payment provider's verify step.
--
-- flutterwave-verify, paystack-verify, and payunit-initialize all do
-- `.upsert({...}, { onConflict: 'org_id' })` on public.subscriptions,
-- treating subscriptions as one row per org (consistent with every
-- other read of this table in the app, e.g. org_billing_ok/
-- org_subscription_status which both LIMIT 1 by org_id). But no
-- migration ever actually created a UNIQUE constraint or index on
-- org_id — only a plain (non-unique) index existed. Postgres requires
-- a real unique/exclusion constraint on the exact conflict target
-- columns to plan an ON CONFLICT upsert at all; without one it fails
-- outright, for every provider, at the final step of every checkout.
--
-- No duplicate org_id rows exist today (verified before writing this),
-- so this constraint can be added directly with no cleanup step needed.
-- ============================================================

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_org_id_key UNIQUE (org_id);
