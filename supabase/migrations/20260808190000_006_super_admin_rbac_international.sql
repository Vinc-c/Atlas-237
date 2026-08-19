-- ============================================================
-- Migration 006: Super Admin, RBAC, Sales Codes, International onboarding, Branding
-- ============================================================

-- ============================================================
-- 1. SUPER ADMINS (platform-level)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_founder boolean NOT NULL DEFAULT false,
  twofa_required boolean NOT NULL DEFAULT true,
  twofa_verified_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON public.super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_active ON public.super_admins(active);

-- Seed the 3 founders as super admins (matched by email at first login via RPC)
-- The actual user_id linkage happens when they sign in; we store emails as placeholders.
INSERT INTO public.super_admins (email, is_founder, active)
VALUES
  ('vincentnogue@yahoo.com', true, true),
  ('vincentnogue2@gmail.com', true, true),
  ('webdxb1@gmail.com', true, true)
ON CONFLICT (email) DO NOTHING;

-- Helper: check if a user is an active super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE user_id = check_user_id AND active = true
  ) OR EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE email = (SELECT email FROM auth.users WHERE id = check_user_id)
      AND active = true
  );
$$;

-- Helper: count active super admins (for the min-2 rule)
CREATE OR REPLACE FUNCTION public.count_active_super_admins()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT count(*)::integer FROM public.super_admins WHERE active = true;
$$;

-- Helper: link a super admin's user_id on first login
CREATE OR REPLACE FUNCTION public.link_super_admin(login_email text, login_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.super_admins
  SET user_id = login_user_id, updated_at = now()
  WHERE email = login_email AND user_id IS DISTINCT FROM login_user_id;
END;
$$;

-- ============================================================
-- 2. RBAC — single engine, platform + tenant scope
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rbac_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL = platform-level role
  name text NOT NULL,
  description text,
  scope text NOT NULL DEFAULT 'tenant', -- 'platform' | 'tenant'
  is_system boolean NOT NULL DEFAULT false, -- system roles cannot be deleted
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE INDEX IF NOT EXISTS idx_rbac_roles_org_id ON public.rbac_roles(org_id);

CREATE TABLE IF NOT EXISTS public.rbac_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.rbac_roles(id) ON DELETE CASCADE,
  module text NOT NULL,       -- 'contacts', 'deals', 'billing', 'super_admin', etc.
  action text NOT NULL,       -- 'read', 'write', 'delete', 'export'
  created_at timestamptz DEFAULT now(),
  UNIQUE (role_id, module, action)
);

CREATE INDEX IF NOT EXISTS idx_rbac_permissions_role_id ON public.rbac_permissions(role_id);

-- Map existing profiles.role to rbac_roles (link table)
CREATE TABLE IF NOT EXISTS public.rbac_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.rbac_roles(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE, -- tenant scope
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_rbac_user_roles_user_id ON public.rbac_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_user_roles_org_id ON public.rbac_user_roles(org_id);

-- RLS for RBAC tables
ALTER TABLE public.rbac_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read roles" ON public.rbac_roles FOR SELECT
  USING (org_id IS NULL OR org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org admins manage roles" ON public.rbac_roles FOR ALL
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin')));

ALTER TABLE public.rbac_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read permissions" ON public.rbac_permissions FOR SELECT
  USING (role_id IN (SELECT id FROM public.rbac_roles WHERE org_id IS NULL OR org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "org admins manage permissions" ON public.rbac_permissions FOR ALL
  USING (role_id IN (SELECT id FROM public.rbac_roles WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))));

ALTER TABLE public.rbac_user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.rbac_user_roles FOR SELECT
  USING (user_id = auth.uid() OR org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- RBAC check function: does user have permission for module/action in org?
CREATE OR REPLACE FUNCTION public.rbac_check(check_user_id uuid, check_module text, check_action text, check_org_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rbac_user_roles ur
    JOIN public.rbac_permissions p ON p.role_id = ur.role_id
    JOIN public.rbac_roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
      AND p.module = check_module
      AND p.action = check_action
      AND (check_org_id IS NULL OR ur.org_id = check_org_id OR r.scope = 'platform')
  ) OR EXISTS (
    -- org owner has full access to their tenant
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role = 'owner' AND org_id = check_org_id
  ) OR public.is_super_admin(check_user_id);
$$;

-- ============================================================
-- 3. SALES CODES (commercial tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sales_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  salesperson_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salesperson_email text NOT NULL,
  salesperson_name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  max_uses integer, -- NULL = unlimited
  uses_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_codes_code ON public.sales_codes(code);
CREATE INDEX IF NOT EXISTS idx_sales_codes_salesperson_id ON public.sales_codes(salesperson_id);

CREATE TABLE IF NOT EXISTS public.sales_code_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_code_id uuid NOT NULL REFERENCES public.sales_codes(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  signup_email text NOT NULL,
  plan_subscribed text,
  conversion_value_cents integer,
  converted_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_code_conversions_code_id ON public.sales_code_conversions(sales_code_id);

ALTER TABLE public.sales_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_code_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage sales codes" ON public.sales_codes FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admins read sales codes" ON public.sales_codes FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admins read conversions" ON public.sales_code_conversions FOR SELECT USING (public.is_super_admin(auth.uid()));
-- Allow signup to use a code without auth (public read of active codes by code value)
CREATE POLICY "public can look up active sales codes" ON public.sales_codes FOR SELECT USING (active = true);

-- ============================================================
-- 4. PLATFORM ANALYTICS (aggregated views for Super Admin)
-- ============================================================
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT count(*) FROM public.organizations) AS total_orgs,
  (SELECT count(*) FROM public.profiles) AS total_users,
  (SELECT count(*) FROM public.organizations WHERE plan = 'starter') AS starter_count,
  (SELECT count(*) FROM public.organizations WHERE plan = 'growth') AS growth_count,
  (SELECT count(*) FROM public.organizations WHERE plan = 'pro') AS pro_count,
  (SELECT count(*) FROM public.organizations WHERE plan = 'enterprise') AS enterprise_count,
  (SELECT count(*) FROM public.subscriptions WHERE status = 'active') AS active_subs,
  (SELECT coalesce(sum(price_cents),0) FROM public.subscriptions WHERE status = 'active') AS mrr_cents,
  (SELECT count(*) FROM public.organizations WHERE trial_ends_at > now()) AS active_trials,
  (SELECT count(*) FROM public.organizations WHERE created_at > now() - interval '30 days') AS new_orgs_30d;

ALTER VIEW public.platform_stats OWNER TO postgres;

-- ============================================================
-- 5. INTERNATIONAL — extend organizations with currency/country/timezone defaults
-- (columns already exist: currency, country, timezone. Add logo_url + sales_code tracking)
-- ============================================================
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS branding_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS signup_sales_code text;

-- ============================================================
-- 6. PLATFORM AUDIT LOG (immutable, for super admin actions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.platform_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text NOT NULL,
  action text NOT NULL,        -- 'super_admin.add', 'super_admin.remove', 'user.suspend', 'impersonate.start'
  target_type text,
  target_id text,
  target_email text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_audit_log_created_at ON public.platform_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_audit_log_actor_id ON public.platform_audit_log(actor_id);

ALTER TABLE public.platform_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins read platform audit log" ON public.platform_audit_log FOR SELECT USING (public.is_super_admin(auth.uid()));

-- Helper to append to platform audit log (SECURITY DEFINER so any super admin can write)
CREATE OR REPLACE FUNCTION public.log_platform_action(p_actor_id uuid, p_action text, p_target_type text DEFAULT NULL, p_target_id text DEFAULT NULL, p_target_email text DEFAULT NULL, p_details jsonb DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.platform_audit_log (actor_id, actor_email, action, target_type, target_id, target_email, details)
  VALUES (p_actor_id, (SELECT email FROM auth.users WHERE id = p_actor_id), p_action, p_target_type, p_target_id, p_target_email, p_details);
END;
$$;

-- ============================================================
-- 7. EMPLOYEE PERFORMANCE (Super Admin KPIs)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.employee_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_email text NOT NULL,
  employee_name text NOT NULL,
  period text NOT NULL,        -- '2026-Q3', '2026-08'
  target_revenue_cents integer DEFAULT 0,
  actual_revenue_cents integer DEFAULT 0,
  target_deals integer DEFAULT 0,
  actual_deals integer DEFAULT 0,
  activity_score integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (employee_id, period)
);

ALTER TABLE public.employee_kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage kpis" ON public.employee_kpis FOR ALL USING (public.is_super_admin(auth.uid()));

-- ============================================================
-- 7b. TEAMS (tenant-level team management)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  lead_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_teams_org_id ON public.teams(org_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read teams" ON public.teams FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org admins manage teams" ON public.teams FOR ALL
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin')));
CREATE POLICY "org members read team_members" ON public.team_members FOR SELECT
  USING (team_id IN (SELECT id FROM public.teams WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "org admins manage team_members" ON public.team_members FOR ALL
  USING (team_id IN (SELECT id FROM public.teams WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))));

-- ============================================================
-- 7b. CUSTOM DASHBOARDS (per-org saved dashboards)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboards_org_id ON public.dashboards(org_id);

ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read dashboards" ON public.dashboards FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org members create dashboards" ON public.dashboards FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org members update dashboards" ON public.dashboards FOR UPDATE
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org members delete dashboards" ON public.dashboards FOR DELETE
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- 8. DEFAULT RBAC roles per new org (trigger on organization insert)
-- ============================================================
CREATE OR REPLACE FUNCTION public.seed_default_rbac_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_role_id uuid;
  admin_role_id uuid;
  member_role_id uuid;
BEGIN
  -- Owner role (full access to all modules)
  INSERT INTO public.rbac_roles (org_id, name, description, scope, is_system)
  VALUES (NEW.id, 'Owner', 'Full access', 'tenant', true)
  RETURNING id INTO owner_role_id;

  INSERT INTO public.rbac_permissions (role_id, module, action) VALUES
    (owner_role_id, 'contacts', 'read'), (owner_role_id, 'contacts', 'write'), (owner_role_id, 'contacts', 'delete'), (owner_role_id, 'contacts', 'export'),
    (owner_role_id, 'companies', 'read'), (owner_role_id, 'companies', 'write'), (owner_role_id, 'companies', 'delete'), (owner_role_id, 'companies', 'export'),
    (owner_role_id, 'leads', 'read'), (owner_role_id, 'leads', 'write'), (owner_role_id, 'leads', 'delete'), (owner_role_id, 'leads', 'export'),
    (owner_role_id, 'deals', 'read'), (owner_role_id, 'deals', 'write'), (owner_role_id, 'deals', 'delete'), (owner_role_id, 'deals', 'export'),
    (owner_role_id, 'invoices', 'read'), (owner_role_id, 'invoices', 'write'), (owner_role_id, 'invoices', 'delete'), (owner_role_id, 'invoices', 'export'),
    (owner_role_id, 'reports', 'read'), (owner_role_id, 'reports', 'write'), (owner_role_id, 'reports', 'export'),
    (owner_role_id, 'team', 'read'), (owner_role_id, 'team', 'write'),
    (owner_role_id, 'settings', 'read'), (owner_role_id, 'settings', 'write'),
    (owner_role_id, 'billing', 'read'), (owner_role_id, 'billing', 'write');

  -- Admin role (most access, no billing delete)
  INSERT INTO public.rbac_roles (org_id, name, description, scope, is_system)
  VALUES (NEW.id, 'Admin', 'Administrative access', 'tenant', true)
  RETURNING id INTO admin_role_id;

  INSERT INTO public.rbac_permissions (role_id, module, action) VALUES
    (admin_role_id, 'contacts', 'read'), (admin_role_id, 'contacts', 'write'), (admin_role_id, 'contacts', 'delete'), (admin_role_id, 'contacts', 'export'),
    (admin_role_id, 'companies', 'read'), (admin_role_id, 'companies', 'write'), (admin_role_id, 'companies', 'delete'), (admin_role_id, 'companies', 'export'),
    (admin_role_id, 'leads', 'read'), (admin_role_id, 'leads', 'write'), (admin_role_id, 'leads', 'delete'), (admin_role_id, 'leads', 'export'),
    (admin_role_id, 'deals', 'read'), (admin_role_id, 'deals', 'write'), (admin_role_id, 'deals', 'delete'), (admin_role_id, 'deals', 'export'),
    (admin_role_id, 'invoices', 'read'), (admin_role_id, 'invoices', 'write'),
    (admin_role_id, 'reports', 'read'), (admin_role_id, 'reports', 'export'),
    (admin_role_id, 'team', 'read'), (admin_role_id, 'team', 'write'),
    (admin_role_id, 'settings', 'read'), (admin_role_id, 'settings', 'write'),
    (admin_role_id, 'billing', 'read');

  -- Member role (read-only + basic CRM write)
  INSERT INTO public.rbac_roles (org_id, name, description, scope, is_system)
  VALUES (NEW.id, 'Member', 'Basic access', 'tenant', true)
  RETURNING id INTO member_role_id;

  INSERT INTO public.rbac_permissions (role_id, module, action) VALUES
    (member_role_id, 'contacts', 'read'), (member_role_id, 'contacts', 'write'),
    (member_role_id, 'companies', 'read'),
    (member_role_id, 'leads', 'read'), (member_role_id, 'leads', 'write'),
    (member_role_id, 'deals', 'read'),
    (member_role_id, 'reports', 'read');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_organization_created_seed_rbac ON public.organizations;
CREATE TRIGGER on_organization_created_seed_rbac
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_rbac_roles();

-- ============================================================
-- 9. PLATFORM-LEVEL RBAC role (Super Admin scope)
-- Use WHERE NOT EXISTS to avoid duplicate (NULL org_id breaks ON CONFLICT)
-- ============================================================
INSERT INTO public.rbac_roles (org_id, name, description, scope, is_system)
SELECT NULL, 'Super Admin', 'Full platform access', 'platform', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.rbac_roles WHERE org_id IS NULL AND name = 'Super Admin'
);

-- ============================================================
-- 10. RLS for super_admins table (only super admins can read/manage)
-- ============================================================
CREATE POLICY "super admins read super_admins" ON public.super_admins FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admins manage super_admins" ON public.super_admins FOR ALL USING (public.is_super_admin(auth.uid()));

-- ============================================================
-- 11. PLATFORM_STATS view RLS (super admins only via policy on view not supported; use function gate)
-- ============================================================
CREATE POLICY "super admins read platform audit" ON public.platform_audit_log FOR SELECT USING (public.is_super_admin(auth.uid()));

-- ============================================================
-- 12. UPDATE handle_new_user to capture international onboarding fields
-- (country, currency, timezone, sales_code) from signup metadata
-- ============================================================

-- Add status column to organizations (for super admin suspend/reactivate)
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  signup_country text;
  signup_currency text;
  signup_timezone text;
  signup_sales_code text;
  sales_code_rec record;
BEGIN
  signup_country := COALESCE(NEW.raw_user_meta_data->>'country', '');
  signup_currency := COALESCE(NEW.raw_user_meta_data->>'currency', 'USD');
  signup_timezone := COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC');
  signup_sales_code := COALESCE(NEW.raw_user_meta_data->>'sales_code', '');

  INSERT INTO public.organizations (name, plan, trial_ends_at, country, currency, timezone, signup_sales_code)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email || '''s Organization'),
    'starter',
    now() + interval '14 days',
    NULLIF(signup_country, ''),
    signup_currency,
    signup_timezone,
    NULLIF(signup_sales_code, '')
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

  -- Track sales code conversion if a code was provided
  IF signup_sales_code IS NOT NULL AND signup_sales_code <> '' THEN
    SELECT * INTO sales_code_rec FROM public.sales_codes WHERE code = signup_sales_code AND active = true;
    IF FOUND THEN
      UPDATE public.sales_codes SET uses_count = uses_count + 1, updated_at = now() WHERE id = sales_code_rec.id;
      INSERT INTO public.sales_code_conversions (sales_code_id, org_id, signup_email, plan_subscribed)
      VALUES (sales_code_rec.id, new_org_id, NEW.email, 'starter')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Seed demo data; if it fails for any reason, the user account
  -- and org/profile are still created successfully.
  BEGIN
    PERFORM public.seed_demo_data(new_org_id, NEW.id);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'seed_demo_data failed for org %: %', new_org_id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
