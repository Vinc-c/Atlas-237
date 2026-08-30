-- 032: fix subscriptions upsert conflict.
--
-- Several edge functions (payunit-initialize, payunit-verify,
-- payunit-webhook, flutterwave-verify, paystack-verify) upsert into
-- `subscriptions` with `onConflict: 'org_id'`, which requires a real
-- UNIQUE constraint on that column to work — without one, Postgres has no
-- conflict target to match on and the upsert fails outright.
--
-- NOTE: this migration was applied directly to production (via the
-- Supabase MCP connector) before this file was committed — reconstructed
-- here from `supabase_migrations.schema_migrations` so the repo and the
-- live database stay in sync. Wrapped in a guard so it's safe to re-run
-- (plain ALTER TABLE ADD CONSTRAINT has no IF NOT EXISTS form).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_org_id_key'
  ) THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_org_id_key UNIQUE (org_id);
  END IF;
END $$;
