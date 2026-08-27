-- ============================================================
-- 024: Enforce subscription/trial status at the RLS layer, not just in
-- the frontend Paywall component.
--
-- Audit finding: Paywall.tsx blocks the UI when an org's trial/subscription
-- has expired, but every Row-Level Security policy on core business data
-- only ever checked `org_id = user_org_id()` — never subscription status.
-- That means the "paywall" was cosmetic: anyone calling the Supabase API
-- directly (browser devtools, a script, or simply a modified frontend
-- build) instead of going through the React app could keep creating and
-- editing contacts, deals, invoices, AI tasks, etc. forever after their
-- trial or subscription lapsed, with nothing stopping them at the data
-- layer. This closes that gap for real, at the only layer that can't be
-- bypassed by skipping the UI.
--
-- Design choice: this blocks INSERT and UPDATE (creating new data /
-- continuing to work existing data) once billing lapses — the actions
-- that represent ongoing use of the product. It does NOT block SELECT
-- (an org can still, in principle, be granted read access to its own
-- past data — the frontend Paywall already fully hides the UI regardless)
-- or DELETE (an org should always be able to delete its own data, e.g.
-- to clean up before closing the account, even if unpaid). Super admins
-- and platform staff exempted from billing are never blocked, matching
-- the access guarantee already made for them elsewhere.
--
-- Uses a RESTRICTIVE policy per table/command: Postgres ANDs a
-- RESTRICTIVE policy with whatever PERMISSIVE policies already exist for
-- that command, so this adds a hard requirement on top of the existing
-- org-membership policies without touching or risking their definitions.
-- ============================================================

CREATE OR REPLACE FUNCTION public.org_billing_ok(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    public.is_super_admin(auth.uid())
    OR public.is_platform_exempt(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE org_id = target_org_id AND status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.organizations
      WHERE id = target_org_id AND trial_ends_at > now()
    );
$$;

COMMENT ON FUNCTION public.org_billing_ok IS
  'True if target_org_id currently has an active subscription or a live trial, or the caller is a super admin / billing-exempt platform staff member. Used as a RESTRICTIVE RLS check on INSERT/UPDATE for core business tables.';

-- activities
DROP POLICY IF EXISTS "activities_billing_gate_insert" ON public.activities;
CREATE POLICY "activities_billing_gate_insert" ON public.activities AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "activities_billing_gate_update" ON public.activities;
CREATE POLICY "activities_billing_gate_update" ON public.activities AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- ai_agents
DROP POLICY IF EXISTS "ai_agents_billing_gate_insert" ON public.ai_agents;
CREATE POLICY "ai_agents_billing_gate_insert" ON public.ai_agents AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "ai_agents_billing_gate_update" ON public.ai_agents;
CREATE POLICY "ai_agents_billing_gate_update" ON public.ai_agents AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- ai_memory
DROP POLICY IF EXISTS "ai_memory_billing_gate_insert" ON public.ai_memory;
CREATE POLICY "ai_memory_billing_gate_insert" ON public.ai_memory AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "ai_memory_billing_gate_update" ON public.ai_memory;
CREATE POLICY "ai_memory_billing_gate_update" ON public.ai_memory AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- ai_tasks
DROP POLICY IF EXISTS "ai_tasks_billing_gate_insert" ON public.ai_tasks;
CREATE POLICY "ai_tasks_billing_gate_insert" ON public.ai_tasks AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "ai_tasks_billing_gate_update" ON public.ai_tasks;
CREATE POLICY "ai_tasks_billing_gate_update" ON public.ai_tasks AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- api_keys
DROP POLICY IF EXISTS "api_keys_billing_gate_insert" ON public.api_keys;
CREATE POLICY "api_keys_billing_gate_insert" ON public.api_keys AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "api_keys_billing_gate_update" ON public.api_keys;
CREATE POLICY "api_keys_billing_gate_update" ON public.api_keys AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- approvals
DROP POLICY IF EXISTS "approvals_billing_gate_insert" ON public.approvals;
CREATE POLICY "approvals_billing_gate_insert" ON public.approvals AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "approvals_billing_gate_update" ON public.approvals;
CREATE POLICY "approvals_billing_gate_update" ON public.approvals AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- campaigns
DROP POLICY IF EXISTS "campaigns_billing_gate_insert" ON public.campaigns;
CREATE POLICY "campaigns_billing_gate_insert" ON public.campaigns AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "campaigns_billing_gate_update" ON public.campaigns;
CREATE POLICY "campaigns_billing_gate_update" ON public.campaigns AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- companies
DROP POLICY IF EXISTS "companies_billing_gate_insert" ON public.companies;
CREATE POLICY "companies_billing_gate_insert" ON public.companies AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "companies_billing_gate_update" ON public.companies;
CREATE POLICY "companies_billing_gate_update" ON public.companies AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- contacts
DROP POLICY IF EXISTS "contacts_billing_gate_insert" ON public.contacts;
CREATE POLICY "contacts_billing_gate_insert" ON public.contacts AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "contacts_billing_gate_update" ON public.contacts;
CREATE POLICY "contacts_billing_gate_update" ON public.contacts AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- deals
DROP POLICY IF EXISTS "deals_billing_gate_insert" ON public.deals;
CREATE POLICY "deals_billing_gate_insert" ON public.deals AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "deals_billing_gate_update" ON public.deals;
CREATE POLICY "deals_billing_gate_update" ON public.deals AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- integrations
DROP POLICY IF EXISTS "integrations_billing_gate_insert" ON public.integrations;
CREATE POLICY "integrations_billing_gate_insert" ON public.integrations AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "integrations_billing_gate_update" ON public.integrations;
CREATE POLICY "integrations_billing_gate_update" ON public.integrations AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- invoice_items
DROP POLICY IF EXISTS "invoice_items_billing_gate_insert" ON public.invoice_items;
CREATE POLICY "invoice_items_billing_gate_insert" ON public.invoice_items AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "invoice_items_billing_gate_update" ON public.invoice_items;
CREATE POLICY "invoice_items_billing_gate_update" ON public.invoice_items AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- invoices
DROP POLICY IF EXISTS "invoices_billing_gate_insert" ON public.invoices;
CREATE POLICY "invoices_billing_gate_insert" ON public.invoices AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "invoices_billing_gate_update" ON public.invoices;
CREATE POLICY "invoices_billing_gate_update" ON public.invoices AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- knowledge_documents
DROP POLICY IF EXISTS "knowledge_documents_billing_gate_insert" ON public.knowledge_documents;
CREATE POLICY "knowledge_documents_billing_gate_insert" ON public.knowledge_documents AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "knowledge_documents_billing_gate_update" ON public.knowledge_documents;
CREATE POLICY "knowledge_documents_billing_gate_update" ON public.knowledge_documents AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- leads
DROP POLICY IF EXISTS "leads_billing_gate_insert" ON public.leads;
CREATE POLICY "leads_billing_gate_insert" ON public.leads AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "leads_billing_gate_update" ON public.leads;
CREATE POLICY "leads_billing_gate_update" ON public.leads AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- notifications
DROP POLICY IF EXISTS "notifications_billing_gate_insert" ON public.notifications;
CREATE POLICY "notifications_billing_gate_insert" ON public.notifications AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "notifications_billing_gate_update" ON public.notifications;
CREATE POLICY "notifications_billing_gate_update" ON public.notifications AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- order_items
DROP POLICY IF EXISTS "order_items_billing_gate_insert" ON public.order_items;
CREATE POLICY "order_items_billing_gate_insert" ON public.order_items AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "order_items_billing_gate_update" ON public.order_items;
CREATE POLICY "order_items_billing_gate_update" ON public.order_items AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- orders
DROP POLICY IF EXISTS "orders_billing_gate_insert" ON public.orders;
CREATE POLICY "orders_billing_gate_insert" ON public.orders AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "orders_billing_gate_update" ON public.orders;
CREATE POLICY "orders_billing_gate_update" ON public.orders AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- pipeline_stages
DROP POLICY IF EXISTS "pipeline_stages_billing_gate_insert" ON public.pipeline_stages;
CREATE POLICY "pipeline_stages_billing_gate_insert" ON public.pipeline_stages AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "pipeline_stages_billing_gate_update" ON public.pipeline_stages;
CREATE POLICY "pipeline_stages_billing_gate_update" ON public.pipeline_stages AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- pipelines
DROP POLICY IF EXISTS "pipelines_billing_gate_insert" ON public.pipelines;
CREATE POLICY "pipelines_billing_gate_insert" ON public.pipelines AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "pipelines_billing_gate_update" ON public.pipelines;
CREATE POLICY "pipelines_billing_gate_update" ON public.pipelines AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- products
DROP POLICY IF EXISTS "products_billing_gate_insert" ON public.products;
CREATE POLICY "products_billing_gate_insert" ON public.products AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "products_billing_gate_update" ON public.products;
CREATE POLICY "products_billing_gate_update" ON public.products AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- quote_items
DROP POLICY IF EXISTS "quote_items_billing_gate_insert" ON public.quote_items;
CREATE POLICY "quote_items_billing_gate_insert" ON public.quote_items AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "quote_items_billing_gate_update" ON public.quote_items;
CREATE POLICY "quote_items_billing_gate_update" ON public.quote_items AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- quotes
DROP POLICY IF EXISTS "quotes_billing_gate_insert" ON public.quotes;
CREATE POLICY "quotes_billing_gate_insert" ON public.quotes AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "quotes_billing_gate_update" ON public.quotes;
CREATE POLICY "quotes_billing_gate_update" ON public.quotes AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- tasks
DROP POLICY IF EXISTS "tasks_billing_gate_insert" ON public.tasks;
CREATE POLICY "tasks_billing_gate_insert" ON public.tasks AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "tasks_billing_gate_update" ON public.tasks;
CREATE POLICY "tasks_billing_gate_update" ON public.tasks AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- tickets
DROP POLICY IF EXISTS "tickets_billing_gate_insert" ON public.tickets;
CREATE POLICY "tickets_billing_gate_insert" ON public.tickets AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "tickets_billing_gate_update" ON public.tickets;
CREATE POLICY "tickets_billing_gate_update" ON public.tickets AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- webhooks
DROP POLICY IF EXISTS "webhooks_billing_gate_insert" ON public.webhooks;
CREATE POLICY "webhooks_billing_gate_insert" ON public.webhooks AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "webhooks_billing_gate_update" ON public.webhooks;
CREATE POLICY "webhooks_billing_gate_update" ON public.webhooks AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- workflow_runs
DROP POLICY IF EXISTS "workflow_runs_billing_gate_insert" ON public.workflow_runs;
CREATE POLICY "workflow_runs_billing_gate_insert" ON public.workflow_runs AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "workflow_runs_billing_gate_update" ON public.workflow_runs;
CREATE POLICY "workflow_runs_billing_gate_update" ON public.workflow_runs AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));

-- workflows
DROP POLICY IF EXISTS "workflows_billing_gate_insert" ON public.workflows;
CREATE POLICY "workflows_billing_gate_insert" ON public.workflows AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_billing_ok(org_id));
DROP POLICY IF EXISTS "workflows_billing_gate_update" ON public.workflows;
CREATE POLICY "workflows_billing_gate_update" ON public.workflows AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_billing_ok(org_id)) WITH CHECK (public.org_billing_ok(org_id));
