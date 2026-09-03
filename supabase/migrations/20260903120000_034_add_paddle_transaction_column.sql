-- Adds the reference column needed to record a Paddle-verified subscription
-- payment, mirroring the existing flutterwave_tx_ref / payunit_transaction_id
-- / paystack_reference columns added in earlier migrations. Paddle is the
-- fourth PSP registered in src/lib/psp.ts.
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paddle_transaction_id text;
