-- Adds PayUnit as a second, independently-usable PSP alongside Flutterwave.
-- The two coexist: whichever has real API credentials configured (as Edge
-- Function secrets) is what customers can actually use — the frontend
-- detects availability at runtime rather than the app being hard-wired to
-- one processor.
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_provider text NOT NULL DEFAULT 'flutterwave';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payunit_transaction_id text;
CREATE INDEX IF NOT EXISTS idx_subscriptions_payunit_tx ON public.subscriptions(payunit_transaction_id) WHERE payunit_transaction_id IS NOT NULL;
