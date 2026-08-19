/*
# Platform Staff, Accounting/Finance, and Subscription Exemption

1. platform_staff_roles: Custom roles for staff with permissions JSON
2. platform_staff: Staff accounts created by super admins (bypass billing)
3. platform_expenses: Platform-level expense tracking
4. platform_revenue: Platform-level revenue tracking
5. is_platform_exempt(): Checks super admin OR active staff → bypasses paywall
6. platform_finance_summary view for accounting dashboard
*/

-- 1. PLATFORM STAFF ROLES (table only, policies after platform_staff exists)
CREATE TABLE IF NOT EXISTS public.platform_staff_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_system boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. PLATFORM STAFF
CREATE TABLE IF NOT EXISTS public.platform_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role_id uuid REFERENCES public.platform_staff_roles(id) ON DELETE SET NULL,
  role_name text NOT NULL DEFAULT 'Support Agent',
  department text,
  phone text,
  active boolean NOT NULL DEFAULT true,
  exempt_from_billing boolean NOT NULL DEFAULT true,
  hired_at date DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_staff_user_id ON public.platform_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_staff_active ON public.platform_staff(active);

-- Now RLS for both tables
ALTER TABLE public.platform_staff_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "super admins manage staff roles" ON public.platform_staff_roles;
CREATE POLICY "super admins manage staff roles" ON public.platform_staff_roles FOR ALL
  TO authenticated USING (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "staff read own roles" ON public.platform_staff_roles;
CREATE POLICY "staff read own roles" ON public.platform_staff_roles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.platform_staff WHERE user_id = auth.uid() AND active = true)
  );

ALTER TABLE public.platform_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "super admins manage staff" ON public.platform_staff;
CREATE POLICY "super admins manage staff" ON public.platform_staff FOR ALL
  TO authenticated USING (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "staff read own profile" ON public.platform_staff;
CREATE POLICY "staff read own profile" ON public.platform_staff FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- Seed default staff roles
INSERT INTO public.platform_staff_roles (name, description, permissions, is_system)
SELECT 'Platform Manager', 'Manages day-to-day platform operations',
  '{"modules":["users","subscriptions","analytics","accounting"],"actions":["read","write"]}', true
WHERE NOT EXISTS (SELECT 1 FROM public.platform_staff_roles WHERE name = 'Platform Manager');

INSERT INTO public.platform_staff_roles (name, description, permissions, is_system)
SELECT 'Finance Officer', 'Manages accounting and financial reports',
  '{"modules":["accounting","analytics"],"actions":["read","write"]}', true
WHERE NOT EXISTS (SELECT 1 FROM public.platform_staff_roles WHERE name = 'Finance Officer');

INSERT INTO public.platform_staff_roles (name, description, permissions, is_system)
SELECT 'Support Agent', 'Read-only access to users and tenants',
  '{"modules":["users"],"actions":["read"]}', true
WHERE NOT EXISTS (SELECT 1 FROM public.platform_staff_roles WHERE name = 'Support Agent');

-- 3. PLATFORM EXPENSES
CREATE TABLE IF NOT EXISTS public.platform_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  description text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  vendor text,
  status text NOT NULL DEFAULT 'approved',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_expenses_date ON public.platform_expenses(expense_date DESC);

ALTER TABLE public.platform_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "super admins manage expenses" ON public.platform_expenses;
CREATE POLICY "super admins manage expenses" ON public.platform_expenses FOR ALL
  TO authenticated USING (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "staff read expenses" ON public.platform_expenses;
CREATE POLICY "staff read expenses" ON public.platform_expenses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.platform_staff WHERE user_id = auth.uid() AND active = true)
  );

-- 4. PLATFORM REVENUE
CREATE TABLE IF NOT EXISTS public.platform_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  category text NOT NULL DEFAULT 'subscription',
  description text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  revenue_date date NOT NULL DEFAULT CURRENT_DATE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_revenue_date ON public.platform_revenue(revenue_date DESC);

ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "super admins manage revenue" ON public.platform_revenue;
CREATE POLICY "super admins manage revenue" ON public.platform_revenue FOR ALL
  TO authenticated USING (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "staff read revenue" ON public.platform_revenue;
CREATE POLICY "staff read revenue" ON public.platform_revenue FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.platform_staff WHERE user_id = auth.uid() AND active = true)
  );

-- 5. IS PLATFORM EXEMPT (bypass paywall)
CREATE OR REPLACE FUNCTION public.is_platform_exempt(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_super_admin(check_user_id)
  OR EXISTS (
    SELECT 1 FROM public.platform_staff
    WHERE user_id = check_user_id AND active = true AND exempt_from_billing = true
  )
  OR EXISTS (
    SELECT 1 FROM public.platform_staff
    WHERE email = (SELECT email FROM auth.users WHERE id = check_user_id)
      AND active = true AND exempt_from_billing = true
  );
$$;

-- 6. PLATFORM FINANCE SUMMARY VIEW
CREATE OR REPLACE VIEW public.platform_finance_summary AS
SELECT
  (SELECT coalesce(sum(amount_cents),0) FROM public.platform_revenue WHERE revenue_date >= date_trunc('month', now())) AS revenue_mtd,
  (SELECT coalesce(sum(amount_cents),0) FROM public.platform_expenses WHERE expense_date >= date_trunc('month', now())) AS expenses_mtd,
  (SELECT coalesce(sum(amount_cents),0) FROM public.platform_revenue) AS revenue_total,
  (SELECT coalesce(sum(amount_cents),0) FROM public.platform_expenses) AS expenses_total,
  (SELECT coalesce(sum(price_cents),0) FROM public.subscriptions WHERE status = 'active') AS subscription_mrr,
  (SELECT count(*) FROM public.platform_expenses WHERE expense_date >= date_trunc('month', now())) AS expense_count_mtd,
  (SELECT count(*) FROM public.platform_revenue WHERE revenue_date >= date_trunc('month', now())) AS revenue_count_mtd;

ALTER VIEW public.platform_finance_summary OWNER TO postgres;
