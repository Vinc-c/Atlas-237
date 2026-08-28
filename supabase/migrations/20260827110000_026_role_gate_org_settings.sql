-- ============================================================
-- 026: Role-gate organization settings and plan purchases.
--
-- Audit finding while reviewing the Settings module: any org member —
-- including the lowest-privilege roles (sales, marketing, support,
-- member) — could change org-wide settings (name, country, currency,
-- timezone, address) and initiate a plan purchase, with no role check
-- anywhere, client or server. That's not a cross-tenant leak (still
-- scoped to their own org), but it's a real access-control gap for a
-- multi-tenant SaaS: these are owner/admin-level actions. Restricting
-- only in the UI (as a first pass) would repeat the exact "looks blocked,
-- isn't really" pattern already fixed elsewhere this session — so this
-- is enforced at the RLS layer too, not just hidden in the frontend.
-- ============================================================

CREATE OR REPLACE FUNCTION public.user_is_org_admin(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    public.is_super_admin(auth.uid())
    OR public.is_platform_exempt(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND org_id = target_org_id AND role IN ('owner', 'admin')
    );
$$;

COMMENT ON FUNCTION public.user_is_org_admin IS
  'True if the caller is an owner/admin of target_org_id, or a super admin / billing-exempt platform staff member. Used to gate org-wide settings changes.';

DROP POLICY IF EXISTS "org_update_admin_only" ON public.organizations;
CREATE POLICY "org_update_admin_only" ON public.organizations AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.user_is_org_admin(id)) WITH CHECK (public.user_is_org_admin(id));
