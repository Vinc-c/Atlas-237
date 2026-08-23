-- CRITICAL SECURITY FIX (multi-tenant isolation breach):
-- The only UPDATE policy on `profiles` was `id = auth.uid()`, with no
-- restriction on which columns could change. This meant ANY authenticated
-- user could run `UPDATE profiles SET org_id = '<any other org>', role =
-- 'owner' WHERE id = auth.uid()` and it would pass RLS — silently jumping
-- into any other tenant's organization as its owner. This is exactly the
-- kind of cross-tenant breach a multi-tenant SaaS must never allow.
--
-- Secondary bug fixed at the same time: because the only UPDATE policy
-- required `id = auth.uid()`, an org owner/admin could NEVER actually
-- change a teammate's role via TeamPages (the row being updated isn't
-- their own row) — the feature was fully non-functional at the DB level,
-- even though the frontend now surfaces the resulting error correctly.
--
-- Fix:
-- 1. A BEFORE UPDATE trigger hard-blocks any change to org_id on profiles
--    unless performed by a super admin — an absolute rule, defense in
--    depth regardless of which RLS policy allowed the UPDATE to proceed.
-- 2. A new RLS policy lets org owners/admins update OTHER members' rows
--    within their OWN organization only (role, active status, etc.) —
--    org_id is still protected by the trigger above even here.
CREATE OR REPLACE FUNCTION public.prevent_profile_org_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.org_id IS DISTINCT FROM OLD.org_id AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'org_id cannot be changed directly';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_org_change ON public.profiles;
CREATE TRIGGER trg_prevent_profile_org_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_org_change();

DROP POLICY IF EXISTS "profile_update_by_org_admin" ON public.profiles;
CREATE POLICY "profile_update_by_org_admin" ON public.profiles FOR UPDATE
  USING (
    org_id = public.user_org_id()
    AND EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('owner', 'admin'))
  )
  WITH CHECK (org_id = public.user_org_id());
