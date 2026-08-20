-- Restrict count_active_super_admins() — flagged by Supabase's security
-- advisor as callable by the anon role. Low risk (returns only a count),
-- but no reason for it to be publicly callable.
REVOKE ALL ON FUNCTION public.count_active_super_admins() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.count_active_super_admins() TO authenticated;
