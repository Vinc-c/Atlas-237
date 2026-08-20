-- ============================================================
-- 008: Security fixes
--
-- 1. `super_admins`: RLS is already enabled by the current
--    20260819..._006_super_admin_rbac.sql migration, so this file only
--    re-asserts it (idempotent, harmless if already set) as a safety
--    net in case an older 006 variant without the fix is ever the one
--    applied to a given environment.
--
-- 2. `platform_stats` and `platform_finance_summary` are views
--    aggregating platform-wide business metrics (MRR, total orgs,
--    total revenue/expenses, ...). Both were queried directly by the
--    frontend via `.from(...).select('*')` with NO super-admin gate —
--    the original migration 006 comment even says "policy on view not
--    supported; use function gate" but that gate was never
--    implemented, and the newer platform-staff-accounting migration
--    repeats the same gap for platform_finance_summary. Any
--    authenticated user (any tenant, any role) could read
--    platform-wide MRR, org counts, and total revenue/expenses. Fixed
--    by revoking direct SELECT and exposing both only through
--    SECURITY DEFINER functions that check is_super_admin().
--
-- 3. The 'branding' storage bucket (used to upload org logos from
--    SystemPages.tsx) was referenced by the frontend but never created
--    by any migration, so uploads would fail with "bucket not found."
-- ============================================================

-- 1. Enable RLS on super_admins (idempotent safety net; see note above)
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 2. Lock down platform_stats behind a super-admin-only function
REVOKE ALL ON public.platform_stats FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS SETOF public.platform_stats
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'insufficient_privilege' USING HINT = 'Super admin access required';
  END IF;
  RETURN QUERY SELECT * FROM public.platform_stats;
END;
$$;

REVOKE ALL ON FUNCTION public.get_platform_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;

-- 2b. Same gap on platform_finance_summary (revenue/expenses/MRR), introduced by the
--     platform-staff-accounting migration: no REVOKE, no gate. Any authenticated user
--     could read the platform's total revenue and expenses directly via
--     `.from('platform_finance_summary').select('*')`.
REVOKE ALL ON public.platform_finance_summary FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_platform_finance_summary()
RETURNS SETOF public.platform_finance_summary
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'insufficient_privilege' USING HINT = 'Super admin access required';
  END IF;
  RETURN QUERY SELECT * FROM public.platform_finance_summary;
END;
$$;

REVOKE ALL ON FUNCTION public.get_platform_finance_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_platform_finance_summary() TO authenticated;

-- 3. Create the 'branding' storage bucket + scoped policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Logos are public to read (they're rendered in the app UI/branding)
DROP POLICY IF EXISTS "Public read branding" ON storage.objects;
CREATE POLICY "Public read branding" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

-- Only members of the org may upload/replace their own org's logo.
-- Upload path convention (see SystemPages.tsx): logos/{org_id}/logo.{ext}
DROP POLICY IF EXISTS "Org members upload own branding" ON storage.objects;
CREATE POLICY "Org members upload own branding" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'branding'
    AND (storage.foldername(name))[1] = 'logos'
    AND (storage.foldername(name))[2] = (
      SELECT org_id::text FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Org members update own branding" ON storage.objects;
CREATE POLICY "Org members update own branding" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'branding'
    AND (storage.foldername(name))[1] = 'logos'
    AND (storage.foldername(name))[2] = (
      SELECT org_id::text FROM public.profiles WHERE id = auth.uid()
    )
  );
