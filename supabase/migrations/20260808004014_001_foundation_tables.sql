/*
# Foundation Part 1: Tables and Helper Function

Creates all multi-tenant CRM tables. Policies come in a separate migration.
*/

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  website text,
  country text,
  address text,
  employees integer,
  revenue numeric(14,2),
  currency text DEFAULT 'USD',
  timezone text DEFAULT 'UTC',
  plan text DEFAULT 'starter',
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'member',
  phone text,
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- HELPER FUNCTION: Get current user's org_id
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- PIPELINES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- PIPELINE STAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  probability integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  color text DEFAULT '#94a3b8',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  website text,
  size text,
  country text,
  address text,
  city text,
  revenue numeric(14,2),
  status text DEFAULT 'active',
  owner_id uuid REFERENCES public.profiles(id),
  tags text[],
  notes text,
  custom_fields jsonb DEFAULT '{}',
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  whatsapp text,
  job_title text,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  role text,
  address text,
  country text,
  city text,
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  lead_source text,
  status text DEFAULT 'active',
  lead_score integer DEFAULT 0,
  customer_value numeric(14,2) DEFAULT 0,
  tags text[],
  notes text,
  custom_fields jsonb DEFAULT '{}',
  owner_id uuid REFERENCES public.profiles(id),
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  company_name text,
  title text,
  source text,
  status text DEFAULT 'new',
  temperature text DEFAULT 'warm',
  qualification text DEFAULT 'unqualified',
  lead_score integer DEFAULT 0,
  potential_value numeric(14,2) DEFAULT 0,
  conversion_probability integer DEFAULT 0,
  assigned_to uuid REFERENCES public.profiles(id),
  ai_agent_id uuid,
  last_activity_at timestamptz,
  next_activity_at timestamptz,
  notes text,
  tags text[],
  custom_fields jsonb DEFAULT '{}',
  converted_contact_id uuid REFERENCES public.contacts(id),
  converted_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  value numeric(14,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  probability integer DEFAULT 0,
  expected_revenue numeric(14,2) DEFAULT 0,
  closing_date date,
  pipeline_id uuid REFERENCES public.pipelines(id) ON DELETE SET NULL,
  stage_id uuid REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'open',
  won_reason text,
  lost_reason text,
  competitors text[],
  notes text,
  tags text[],
  custom_fields jsonb DEFAULT '{}',
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  ai_agent_id uuid,
  performed_by text DEFAULT 'human',
  scheduled_at timestamptz,
  completed_at timestamptz,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium',
  status text DEFAULT 'pending',
  assignee_id uuid REFERENCES public.profiles(id),
  ai_agent_id uuid,
  due_date timestamptz,
  completed_at timestamptz,
  related_type text,
  related_id uuid,
  created_by uuid REFERENCES public.profiles(id),
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  category text,
  type text DEFAULT 'product',
  description text,
  price numeric(14,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  tax_rate numeric(5,2) DEFAULT 0,
  status text DEFAULT 'active',
  stock integer,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- QUOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  quote_number text NOT NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  status text DEFAULT 'draft',
  subtotal numeric(14,2) DEFAULT 0,
  discount numeric(14,2) DEFAULT 0,
  tax numeric(14,2) DEFAULT 0,
  total numeric(14,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  expiration_date date,
  notes text,
  terms text,
  owner_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- QUOTE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  name text NOT NULL,
  description text,
  quantity integer DEFAULT 1,
  unit_price numeric(14,2) DEFAULT 0,
  discount numeric(14,2) DEFAULT 0,
  total numeric(14,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'unpaid',
  fulfillment_status text DEFAULT 'unfulfilled',
  subtotal numeric(14,2) DEFAULT 0,
  discount numeric(14,2) DEFAULT 0,
  tax numeric(14,2) DEFAULT 0,
  total numeric(14,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  notes text,
  owner_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  name text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price numeric(14,2) DEFAULT 0,
  total numeric(14,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  status text DEFAULT 'draft',
  payment_status text DEFAULT 'unpaid',
  subtotal numeric(14,2) DEFAULT 0,
  discount numeric(14,2) DEFAULT 0,
  tax numeric(14,2) DEFAULT 0,
  total numeric(14,2) DEFAULT 0,
  amount_paid numeric(14,2) DEFAULT 0,
  amount_due numeric(14,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  issue_date date DEFAULT CURRENT_DATE,
  due_date date,
  notes text,
  terms text,
  owner_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- INVOICE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  name text NOT NULL,
  description text,
  quantity integer DEFAULT 1,
  unit_price numeric(14,2) DEFAULT 0,
  discount numeric(14,2) DEFAULT 0,
  total numeric(14,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  currency text DEFAULT 'USD',
  method text,
  status text DEFAULT 'completed',
  reference text,
  payment_date timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_number text NOT NULL,
  subject text NOT NULL,
  description text,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  category text,
  department text,
  assigned_to uuid REFERENCES public.profiles(id),
  ai_agent_id uuid,
  sla_due_at timestamptz,
  resolved_at timestamptz,
  internal_notes text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'email',
  status text DEFAULT 'draft',
  channel text DEFAULT 'email',
  audience text,
  subject text,
  content text,
  template text,
  start_date timestamptz,
  end_date timestamptz,
  budget numeric(14,2) DEFAULT 0,
  spent numeric(14,2) DEFAULT 0,
  metrics jsonb DEFAULT '{}',
  owner_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- AI AGENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  description text,
  capabilities text[],
  permissions jsonb DEFAULT '{}',
  enabled boolean DEFAULT true,
  approval_required boolean DEFAULT true,
  risk_level text DEFAULT 'low',
  performance jsonb DEFAULT '{}',
  usage_count integer DEFAULT 0,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- AI TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  title text NOT NULL,
  instruction text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  risk_level text DEFAULT 'low',
  plan jsonb DEFAULT '[]',
  result jsonb,
  progress integer DEFAULT 0,
  requires_approval boolean DEFAULT false,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  related_type text,
  related_id uuid,
  requested_by uuid REFERENCES public.profiles(id),
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- AI MEMORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  type text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  category text,
  enabled boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- KNOWLEDGE DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text,
  category text,
  description text,
  file_path text,
  file_size bigint,
  mime_type text,
  status text DEFAULT 'active',
  tags text[],
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- WORKFLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_type text,
  trigger_config jsonb DEFAULT '{}',
  conditions jsonb DEFAULT '[]',
  actions jsonb DEFAULT '[]',
  enabled boolean DEFAULT true,
  run_count integer DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- WORKFLOW RUNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES public.workflows(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  trigger_data jsonb DEFAULT '{}',
  steps jsonb DEFAULT '[]',
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- APPROVALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_task_id uuid REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
  agent_name text,
  action_type text NOT NULL,
  description text NOT NULL,
  details jsonb DEFAULT '{}',
  risk_level text DEFAULT 'medium',
  status text DEFAULT 'pending',
  decided_by uuid REFERENCES public.profiles(id),
  decided_at timestamptz,
  decision text,
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_type text NOT NULL,
  actor_name text,
  actor_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  entity_name text,
  changes jsonb DEFAULT '{}',
  reason text,
  source text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INTEGRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL,
  category text,
  status text DEFAULT 'disconnected',
  connected_at timestamptz,
  last_sync_at timestamptz,
  config jsonb DEFAULT '{}',
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- API KEYS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text,
  permissions jsonb DEFAULT '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- WEBHOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL DEFAULT public.user_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL,
  active boolean DEFAULT true,
  secret text,
  last_triggered_at timestamptz,
  last_response_code integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
  tbls text[] := ARRAY[
    'organizations','profiles','pipelines','pipeline_stages','contacts',
    'companies','leads','deals','activities','tasks','products','quotes',
    'orders','invoices','payments','tickets','campaigns','ai_agents',
    'ai_tasks','ai_memory','knowledge_documents','workflows','workflow_runs',
    'approvals','notifications','integrations','webhooks','api_keys'
  ];
BEGIN
  FOREACH t SLICE 0 IN ARRAY tbls LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t);
  END LOOP;
END $$;

-- ============================================================
-- HANDLE NEW USER SIGNUP: Create profile + org
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.organizations (name, plan, trial_ends_at)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email || '''s Organization'), 'starter', now() + interval '14 days')
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON public.companies(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON public.leads(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON public.deals(org_id);
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON public.activities(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON public.tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON public.products(org_id);
CREATE INDEX IF NOT EXISTS idx_quotes_org_id ON public.quotes(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_org_id ON public.orders(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON public.invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_id ON public.payments(org_id);
CREATE INDEX IF NOT EXISTS idx_tickets_org_id ON public.tickets(org_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON public.campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_org_id ON public.ai_agents(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_org_id ON public.ai_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_org_id ON public.ai_memory(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON public.notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_approvals_org_id ON public.approvals(org_id);
CREATE INDEX IF NOT EXISTS idx_workflows_org_id ON public.workflows(org_id);
CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON public.integrations(org_id);
