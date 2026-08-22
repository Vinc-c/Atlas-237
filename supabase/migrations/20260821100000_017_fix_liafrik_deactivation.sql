-- BUG FIX: the @liafrik.com domain trust in is_super_admin() never checked
-- the `active` flag on the auto-provisioned super_admins row, so
-- deactivating (or removing) a @liafrik.com super admin through the Super
-- Admin UI had NO real effect — they'd keep full access purely because of
-- their email domain. This defeats the "min 2 admins, admins can be
-- removed/deactivated" protection for any @liafrik.com account.
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
    EXISTS (SELECT 1 FROM auth.users WHERE id = check_user_id AND email ILIKE '%@liafrik.com')
    AND NOT EXISTS (
      SELECT 1 FROM public.super_admins sa
      WHERE sa.email = (SELECT email FROM auth.users WHERE id = check_user_id) AND sa.active = false
    )
  );
$$;
