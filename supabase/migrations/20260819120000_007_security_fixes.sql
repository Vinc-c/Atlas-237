-- ============================================================
-- 007: Security fixes
--
-- 1. `super_admins` had RLS policies defined (migration 006, section 10)
--    but RLS was never enabled on the table. Without RLS enabled,
--    Postgres ignores the policies entirely and the table is readable/
--    writable by any role with default grants on the public schema —
--    exposing super admin emails and founder status. This mirrors every
--    other table in migration 006 (rbac_roles, sales_codes,
--    platform_audit_log, employee_kpis, teams, dashboards, ...), which
--    all correctly call ENABLE ROW LEVEL SECURITY.
--
-- 2. `platform_stats` is a view aggregating platform-wide business
--    metrics (MRR, total orgs, total users, ...). It was queried
--    directly by the frontend via `.from('platform_stats').select('*')`
--    with no super-admin gate — migration 006's own comment says
--    "policy on view not supported; use function gate" but that gate
--    was never implemented. Any authenticated user could read
--    platform-wide MRR and org counts. Fixed by revoking direct SELECT
--    and exposing the data only through a SECURITY DEFINER function
--    that checks is_super_admin().
--
-- 3. The 'branding' storage bucket (used to upload org logos from
--    SystemPages.tsx) was referenced by the frontend but never created
--    by any migration, so uploads would fail with "bucket not found."
-- ============================================================

-- 1. Enable RLS on super_admins (policies already exist from migration 006)
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
