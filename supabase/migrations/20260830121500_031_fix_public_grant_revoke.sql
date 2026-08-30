-- ============================================================
-- 031: Fix 030 — `REVOKE ... FROM anon` alone doesn't work in Postgres.
-- Every new function grants EXECUTE to the pseudo-role PUBLIC by default,
-- and `anon`/`authenticated` inherit that grant implicitly regardless of
-- any REVOKE targeted only at them specifically — which is exactly why
-- Supabase's advisor still flagged every function after 030. The correct
-- fix is REVOKE ... FROM PUBLIC, then explicitly GRANT back to
-- `authenticated` only for the functions genuinely called via
-- supabase.rpc() from signed-in users in this app.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.admin_extend_org_access(uuid, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_org_plan(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_provision_liafrik_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_platform_exempt(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.link_super_admin(text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_platform_action(uuid, text, text, text, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.org_billing_ok(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.org_plan_has_feature(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.org_subscription_status(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_org_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rbac_check(uuid, text, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.seed_default_rbac_roles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.seed_demo_data(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_is_org_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_org_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.count_active_super_admins() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_platform_finance_summary() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_platform_stats() FROM PUBLIC;

-- Re-grant to `authenticated` only: helper functions used inside RLS
-- policy bodies (invoked implicitly by Postgres as the policy owner
-- evaluates it, not via a direct RPC call, but authenticated still needs
-- USAGE to satisfy the policy evaluation context for its own rows) plus
-- the handful the frontend genuinely calls with supabase.rpc().
GRANT EXECUTE ON FUNCTION public.is_platform_exempt(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_billing_ok(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_plan_has_feature(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_org_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_subscription_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rbac_check(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_super_admin(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_demo_data(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_org_plan(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_extend_org_access(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_platform_action(uuid, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_active_super_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_finance_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;
-- auto_provision_liafrik_admin, handle_new_user, prevent_profile_org_change,
-- rls_auto_enable, seed_default_rbac_roles are pure trigger functions —
-- Postgres invokes triggers as the function owner regardless of EXECUTE
-- grants, so no role needs a direct grant on them at all.
