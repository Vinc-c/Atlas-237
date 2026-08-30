-- ============================================================
-- 030: Close the remaining gaps flagged by Supabase's own security
-- advisor after 022-029 were applied.
--
-- 1. Three functions had a mutable search_path (user_org_id,
--    update_updated_at, org_subscription_status) — a function without a
--    pinned search_path can, in specific edge cases, be tricked into
--    resolving an unqualified name to an object in a schema the caller
--    controls rather than the intended one. Pinned to `public`, matching
--    every other function in this app.
--
-- 2. Every SECURITY DEFINER helper in this schema was still callable by
--    the `anon` role (i.e. a request with no Authorization header at
--    all) via PostgREST's auto-generated /rest/v1/rpc/* endpoints. Each
--    of these functions already checks auth.uid() internally and safely
--    returns false/raises for a null caller, so this was not a working
--    exploit — but it's unnecessary exposed surface for a CRM where
--    nothing should ever be reachable pre-authentication, and quietly
--    invites future functions to be less careful. Revoked from `anon`
--    only; `authenticated` grants are untouched since several of these
--    (link_super_admin, seed_demo_data, admin_set_org_plan,
--    admin_extend_org_access) are genuinely called directly via
--    supabase.rpc() by signed-in users.
-- ============================================================

CREATE OR REPLACE FUNCTION public.user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.org_subscription_status(check_org_id uuid)
RETURNS TABLE(status text, plan text, trial_ends_at timestamptz, current_period_end timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(
      (SELECT status FROM public.subscriptions WHERE org_id = check_org_id AND status = 'active' ORDER BY created_at DESC LIMIT 1),
      CASE
        WHEN EXISTS (SELECT 1 FROM public.organizations WHERE id = check_org_id AND trial_ends_at > now()) THEN 'trialing'
        ELSE 'expired'
      END
    ) AS status,
    COALESCE(
      (SELECT plan FROM public.subscriptions WHERE org_id = check_org_id AND status = 'active' ORDER BY created_at DESC LIMIT 1),
      (SELECT plan FROM public.organizations WHERE id = check_org_id)
    ) AS plan,
    (SELECT trial_ends_at FROM public.organizations WHERE id = check_org_id) AS trial_ends_at,
    (SELECT current_period_end FROM public.subscriptions WHERE org_id = check_org_id AND status = 'active' ORDER BY created_at DESC LIMIT 1) AS current_period_end;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_extend_org_access(uuid, int) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_org_plan(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.auto_provision_liafrik_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_platform_exempt(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.link_super_admin(text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_platform_action(uuid, text, text, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.org_billing_ok(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.org_plan_has_feature(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.org_subscription_status(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_org_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rbac_check(uuid, text, text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_rbac_roles() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_demo_data(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.user_is_org_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.user_org_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.count_active_super_admins() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_platform_finance_summary() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_platform_stats() FROM anon;
