-- ============================================================
-- 023: Super admin / platform staff security hardening
--
-- Requested: @liafrik.com super admin emails and platform staff must
-- keep full, unrestricted, un-billed access to the platform — but that
-- access needs to be tightly protected. Auditing the existing
-- implementation surfaced three real gaps:
--
-- 1. CRITICAL — privilege escalation in link_super_admin(). The RPC
--    trusted its `login_email` / `login_user_id` PARAMETERS instead of
--    deriving identity from the caller's own session. Any authenticated
--    user (any tenant, any role) could call:
--      supabase.rpc('link_super_admin', {
--        login_email: '<a real super admin's email>',
--        login_user_id: '<their own user id>'
--      })
--    ...and since the function only checked `email = login_email`, it
--    would re-point that super_admins row's user_id to the caller,
--    instantly granting them full super admin access — without ever
--    proving they own that email address. Fixed by ignoring the
--    parameters entirely and always deriving the identity from
--    auth.uid() / auth.users server-side.
--
-- 2. The @liafrik.com domain auto-trust in is_super_admin() granted
--    access the moment a matching auth.users row existed — which
--    happens immediately on signup, before the email is verified.
--    Depending on Supabase Auth project settings this could allow
--    someone to register an unverified address claiming the domain and
--    briefly appear as a super admin. Fixed by requiring
--    email_confirmed_at IS NOT NULL for the domain-trust branch.
--    Individually seeded/linked super_admins rows are unaffected (an
--    existing super admin vetted those explicitly).
--
-- 3. log_platform_action() inserted into the platform-wide audit log
--    using a caller-supplied p_actor_id with no check that it matched
--    the caller, and no check that the caller was even staff. Any
--    authenticated user could forge audit log entries attributed to
--    someone else. Fixed by always using auth.uid() as the actor and
--    requiring the caller to be a super admin or active platform staff.
-- ============================================================

-- 1. Fix the privilege escalation
CREATE OR REPLACE FUNCTION public.link_super_admin(login_email text DEFAULT NULL, login_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid := auth.uid();
  caller_email text;
BEGIN
  -- Parameters are accepted (and ignored) only so existing frontend
  -- call sites keep working without a client change. Identity is never
  -- trusted from the caller — it is always derived from the
  -- authenticated session and the auth.users row that belongs to it.
  IF caller_id IS NULL THEN
    RETURN;
  END IF;

  SELECT email INTO caller_email FROM auth.users WHERE id = caller_id;
  IF caller_email IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.super_admins
  SET user_id = caller_id, updated_at = now()
  WHERE email = caller_email AND user_id IS DISTINCT FROM caller_id;
END;
$$;

-- 2. Require a verified email for the @liafrik.com domain-trust branch
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = check_user_id AND active = true
  ) OR EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE email = (SELECT email FROM auth.users WHERE id = check_user_id) AND active = true
  ) OR (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = check_user_id AND email ILIKE '%@liafrik.com' AND email_confirmed_at IS NOT NULL
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.super_admins sa
      WHERE sa.email = (SELECT email FROM auth.users WHERE id = check_user_id) AND sa.active = false
    )
  );
$$;

-- 3. Stop audit log actor spoofing: always log as the real caller, and
--    require them to actually be staff/super admin to write at all.
CREATE OR REPLACE FUNCTION public.log_platform_action(p_actor_id uuid, p_action text, p_target_type text DEFAULT NULL, p_target_id text DEFAULT NULL, p_target_email text DEFAULT NULL, p_details jsonb DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid := auth.uid();
BEGIN
  -- p_actor_id is accepted (and ignored) for backward compatibility with
  -- existing call sites; the logged actor is always the real caller.
  IF caller_id IS NULL OR NOT public.is_platform_exempt(caller_id) THEN
    RETURN;
  END IF;
  INSERT INTO public.platform_audit_log (actor_id, actor_email, action, target_type, target_id, target_email, details)
  VALUES (caller_id, (SELECT email FROM auth.users WHERE id = caller_id), p_action, p_target_type, p_target_id, p_target_email, p_details);
END;
$$;
