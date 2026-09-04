-- Complements admin_extend_org_access (relative "+N days") with a way to
-- set an EXACT expiration date directly — the "custom end date" option the
-- Super Admin subscriptions UI needs. Same authorization and audit-logging
-- model as admin_extend_org_access; only the target computation differs
-- (an absolute timestamp instead of "current + N days").
CREATE OR REPLACE FUNCTION public.admin_set_org_access_until(target_org_id uuid, until_ts timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_row public.organizations%ROWTYPE;
  sub_row public.subscriptions%ROWTYPE;
BEGIN
  IF NOT (public.is_super_admin(auth.uid()) OR public.is_platform_exempt(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO org_row FROM public.organizations WHERE id = target_org_id;
  IF org_row.trial_ends_at IS NULL OR org_row.trial_ends_at > now() OR org_row.status = 'trial' THEN
    UPDATE public.organizations SET trial_ends_at = until_ts WHERE id = target_org_id;
  END IF;

  SELECT * INTO sub_row FROM public.subscriptions WHERE org_id = target_org_id AND status = 'active' LIMIT 1;
  IF FOUND THEN
    UPDATE public.subscriptions SET current_period_end = until_ts WHERE id = sub_row.id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_org_access_until(uuid, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_org_access_until(uuid, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_org_access_until(uuid, timestamptz) TO authenticated;
