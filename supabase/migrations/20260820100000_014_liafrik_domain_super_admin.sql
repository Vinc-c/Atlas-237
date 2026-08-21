-- Any @liafrik.com email is automatically a super admin — Liafrik.com is
-- the parent company operating this platform (Atlas CRM, Libooks, Os, ...).
-- Individually seeded emails in super_admins remain valid too (e.g. founders
-- who might use a different personal email), but the entire @liafrik.com
-- domain is trusted by default rather than requiring manual seeding per
-- address.

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
  ) OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = check_user_id AND email ILIKE '%@liafrik.com'
  );
$$;

-- Auto-provision a super_admins row for @liafrik.com signups so they show
-- up in the Super Admin management UI (and can be individually deactivated
-- by an existing super admin if ever needed) rather than being an invisible
-- domain-wide bypass with no audit trail.
CREATE OR REPLACE FUNCTION public.auto_provision_liafrik_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email ILIKE '%@liafrik.com' THEN
    INSERT INTO public.super_admins (user_id, email, is_founder, active)
    VALUES (NEW.id, NEW.email, false, true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id, active = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_liafrik_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_liafrik_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_provision_liafrik_admin();
