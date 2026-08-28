-- ============================================================
-- 025: Close a critical billing-integrity gap.
--
-- Audit finding: subscription plan changes were entirely client-trusted.
-- Two separate paths let ANY user grant their own org a paid plan for
-- $0, with no payment verification at all:
--
-- 1. "org owners can manage subscriptions" was a FOR ALL policy — any
--    user with role='owner' in their own org could INSERT/UPDATE the
--    subscriptions table directly (e.g. status: 'active', plan:
--    'enterprise', price_cents: 0) via a raw table write, no edge
--    function or payment provider involved at all.
-- 2. "org_update_own" on organizations allowed UPDATE of every column,
--    including `plan` and `trial_ends_at` — any org member (not just the
--    owner) could set plan: 'enterprise' or push trial_ends_at decades
--    into the future directly.
--
-- Separately, recordSubscription() in src/lib/flutterwave.ts (called
-- after the Flutterwave popup's client-side success callback) wrote the
-- same tables directly from the browser with the tx_ref/payment_id the
-- CLIENT claimed, without ever calling Flutterwave's own server-side
-- verification API — so even the "real" checkout flow could be
-- triggered with fabricated values by calling that function (or the
-- underlying table writes) directly, bypassing the actual popup.
--
-- Fix: plan grants now only ever happen through the flutterwave-verify /
-- paystack-verify / payunit-verify edge functions, each of which
-- independently confirms the transaction with the payment provider's own
-- API (using a secret key that never reaches the browser) using the
-- Supabase service role — which always bypasses RLS — before writing
-- anything. Regular authenticated users can no longer write to these
-- columns/tables at all, closing both paths above at the same time.
-- ============================================================

-- 1. organizations.plan / trial_ends_at can no longer be changed by a
--    normal authenticated write, no matter what RLS policy exists —
--    column-level privilege is enforced independently of RLS.
REVOKE UPDATE (plan, trial_ends_at) ON public.organizations FROM authenticated;

-- 2. subscriptions can be read by org members but never written by them
--    directly — only the service role (used by the *-verify edge
--    functions) can write.
DROP POLICY IF EXISTS "org owners can manage subscriptions" ON public.subscriptions;

-- 3. The Super Admin panel legitimately needs to change a customer org's
--    plan / extend their access by hand (comps, manual corrections,
--    support cases) — the two REVOKEs above would otherwise break that
--    real feature too. These SECURITY DEFINER RPCs restore it, scoped to
--    super admins / platform-exempt staff only, auditable through the
--    existing platform_audit_log via log_platform_action (called
--    separately by the frontend, same as before).
CREATE OR REPLACE FUNCTION public.admin_set_org_plan(target_org_id uuid, new_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_super_admin(auth.uid()) OR public.is_platform_exempt(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF new_plan NOT IN ('starter', 'growth', 'pro', 'enterprise') THEN
    RAISE EXCEPTION 'Unknown plan';
  END IF;
  UPDATE public.organizations SET plan = new_plan WHERE id = target_org_id;
  UPDATE public.subscriptions SET plan = new_plan WHERE org_id = target_org_id AND status = 'active';
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_extend_org_access(target_org_id uuid, extend_days int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  now_ts timestamptz := now();
  org_row public.organizations%ROWTYPE;
  sub_row public.subscriptions%ROWTYPE;
  base timestamptz;
BEGIN
  IF NOT (public.is_super_admin(auth.uid()) OR public.is_platform_exempt(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO org_row FROM public.organizations WHERE id = target_org_id;
  IF org_row.trial_ends_at IS NULL OR org_row.trial_ends_at > now_ts OR org_row.status = 'trial' THEN
    base := GREATEST(COALESCE(org_row.trial_ends_at, now_ts), now_ts) + (extend_days || ' days')::interval;
    UPDATE public.organizations SET trial_ends_at = base WHERE id = target_org_id;
  END IF;

  SELECT * INTO sub_row FROM public.subscriptions WHERE org_id = target_org_id AND status = 'active' LIMIT 1;
  IF FOUND THEN
    base := GREATEST(COALESCE(sub_row.current_period_end, now_ts), now_ts) + (extend_days || ' days')::interval;
    UPDATE public.subscriptions SET current_period_end = base WHERE id = sub_row.id;
  END IF;
END;
$$;

-- 4. Third PSP: Paystack. Same shape as the existing flutterwave_* /
--    payunit_transaction_id columns.
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paystack_reference text;
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_ref ON public.subscriptions(paystack_reference) WHERE paystack_reference IS NOT NULL;


