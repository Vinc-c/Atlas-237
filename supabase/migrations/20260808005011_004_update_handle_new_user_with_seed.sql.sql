
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
new_org_id uuid;
BEGIN
INSERT INTO public.organizations (name, plan, trial_ends_at)
VALUES (
  COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email || '''s Organization'),
  'starter',
  now() + interval '14 days'
)
RETURNING id INTO new_org_id;

INSERT INTO public.profiles (id, org_id, email, first_name, last_name, role)
VALUES (
  NEW.id,
  new_org_id,
  NEW.email,
  COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
  COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
  'owner'
);

-- Seed demo data for the new organization
PERFORM public.seed_demo_data(new_org_id, NEW.id);

RETURN NEW;
END;
$$;
