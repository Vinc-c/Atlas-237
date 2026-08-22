-- CRITICAL BUG FIX: handle_new_user() always created a brand new
-- organization for every signup, including invited team members. When an
-- admin invited a colleague via TeamPages, that colleague ended up owning
-- their OWN separate organization (role='owner') instead of joining the
-- inviter's organization as a team member. Team invitations were completely
-- non-functional at the database level.
--
-- Fix: if the new auth.users row carries invite_org_id (set by the new
-- invite-team-member edge function) in raw_user_meta_data, attach the
-- profile to that EXISTING organization with the given role instead of
-- creating a new one. Demo data seeding and sales-code tracking only make
-- sense for genuinely new organizations, so they're skipped for invited
-- members too.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  signup_country text; signup_currency text; signup_timezone text; signup_sales_code text;
  sales_code_rec record;
  invite_org_id uuid;
  invite_role text;
BEGIN
  invite_org_id := NULLIF(NEW.raw_user_meta_data->>'invite_org_id', '')::uuid;
  invite_role := COALESCE(NEW.raw_user_meta_data->>'invite_role', 'member');

  IF invite_org_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.organizations WHERE id = invite_org_id) THEN
    INSERT INTO public.profiles (id, org_id, email, first_name, last_name, role)
    VALUES (NEW.id, invite_org_id, NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''), invite_role)
    ON CONFLICT (id) DO NOTHING;
    PERFORM public.link_super_admin(NEW.email, NEW.id);
    RETURN NEW;
  END IF;

  signup_country := COALESCE(NEW.raw_user_meta_data->>'country', '');
  signup_currency := COALESCE(NEW.raw_user_meta_data->>'currency', 'USD');
  signup_timezone := COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC');
  signup_sales_code := COALESCE(NEW.raw_user_meta_data->>'sales_code', '');

  INSERT INTO public.organizations (name, plan, trial_ends_at, country, currency, timezone, signup_sales_code)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email || '''s Organization'),
    'starter', now() + interval '14 days',
    NULLIF(signup_country, ''), signup_currency, signup_timezone, NULLIF(signup_sales_code, '')
  )
  RETURNING id INTO new_org_id;

  INSERT INTO public.profiles (id, org_id, email, first_name, last_name, role)
  VALUES (NEW.id, new_org_id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''), 'owner');

  IF signup_sales_code IS NOT NULL AND signup_sales_code <> '' THEN
    SELECT * INTO sales_code_rec FROM public.sales_codes WHERE code = signup_sales_code AND active = true;
    IF FOUND THEN
      UPDATE public.sales_codes SET uses_count = uses_count + 1, updated_at = now() WHERE id = sales_code_rec.id;
      INSERT INTO public.sales_code_conversions (sales_code_id, org_id, signup_email, plan_subscribed)
      VALUES (sales_code_rec.id, new_org_id, NEW.email, 'starter') ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  BEGIN
    PERFORM public.seed_demo_data(new_org_id, NEW.id);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'seed_demo_data failed for org %: %', new_org_id, SQLERRM;
  END;

  PERFORM public.link_super_admin(NEW.email, NEW.id);
  RETURN NEW;
END;
$$;
