-- Security hardening pass (Sep 2026), addressing findings from Supabase's
-- own security advisor (mcp get_advisors type=security):
--
-- 1. get_ai_context_snapshot had a mutable search_path (WARN:
--    function_search_path_mutable) — pinning it prevents a schema/search
--    path manipulation attack from redirecting its unqualified table
--    references (though it already qualifies everything with `public.`,
--    pinning is the defense-in-depth standard regardless).
--
-- 2. auto_provision_liafrik_admin is a trigger function (AFTER INSERT ON
--    auth.users) — it should never be callable directly via RPC, only via
--    the trigger machinery, which runs under the function's own privileges
--    regardless of role grants. Revoking EXECUTE from authenticated/anon/
--    PUBLIC removes it from the exposed API surface entirely with zero
--    functional impact (the trigger keeps firing normally).
--
-- Left untouched, deliberately: the ~15 other SECURITY DEFINER functions
-- the advisor flags as "callable by authenticated" (admin_extend_org_access,
-- admin_set_org_plan, admin_set_org_access_until, rbac_check,
-- org_subscription_status, etc.) — these are genuinely meant to be called
-- directly via supabase.rpc() by signed-in users, and each one that's
-- sensitive already gates itself internally with is_super_admin()/
-- is_platform_exempt()/ownership checks (see AGENTS.md "RLS & permissions"
-- section). Revoking EXECUTE on these would break real, working features.
ALTER FUNCTION public.get_ai_context_snapshot(uuid) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.auto_provision_liafrik_admin() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_provision_liafrik_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.auto_provision_liafrik_admin() FROM PUBLIC;
