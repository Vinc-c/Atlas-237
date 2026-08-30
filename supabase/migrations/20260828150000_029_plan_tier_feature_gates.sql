-- ============================================================
-- 029: Enforce plan-tier feature gates at the RLS layer.
--
-- Audit finding (point raised: "les accès sont-ils réels selon la
-- matrice des prix ?"): migration 024 already closed the gap where an
-- expired/no-subscription org could keep writing data via a direct API
-- call. But that only checks *subscription status* (active vs expired),
-- never *which plan* the org is on. src/lib/plans.ts defines a real
-- feature matrix (e.g. quotesInvoicing / tickets / knowledgeBase /
-- workflowAutomation are all `false` on Starter) and the UI hides those
-- pages accordingly via UpgradeGate — but nothing stopped a Starter-plan
-- org (with a perfectly valid, active subscription) from calling the
-- Supabase API directly and creating quotes, tickets, knowledge-base
-- articles or workflows anyway. Same class of bug as 024, one layer up:
-- the paywall was real for status, cosmetic for plan tier.
--
-- Fix: a SQL mirror of the relevant booleans from PLAN_FEATURES in
-- src/lib/plans.ts, applied as a RESTRICTIVE policy (ANDed with the
-- existing org-membership and billing-status policies, changes neither).
-- Super admins and platform-exempt staff are exempt, matching every
-- other gate in this app.
--
-- MAINTENANCE NOTE: this table is a hand-kept mirror of PLAN_FEATURES in
-- src/lib/plans.ts. If that TS matrix changes (a feature moves to a
-- different minimum plan), update org_plan_has_feature() to match in the
-- same change — nothing enforces the two stay in sync automatically.
-- ============================================================

CREATE OR REPLACE FUNCTION public.org_plan_has_feature(target_org_id uuid, feature text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    public.is_super_admin(auth.uid())
    OR public.is_platform_exempt(auth.uid())
    OR CASE (SELECT plan FROM public.organizations WHERE id = target_org_id)
         WHEN 'starter' THEN false
         WHEN 'growth' THEN feature IN ('quotesInvoicing', 'tickets', 'workflowAutomation', 'webhooks', 'apiAccess')
         WHEN 'pro' THEN feature IN ('quotesInvoicing', 'tickets', 'workflowAutomation', 'webhooks', 'apiAccess', 'knowledgeBase')
         WHEN 'enterprise' THEN true
         ELSE false
       END;
$$;

COMMENT ON FUNCTION public.org_plan_has_feature IS
  'True if target_org_id''s plan includes `feature` (mirrors PLAN_FEATURES in src/lib/plans.ts), or the caller is a super admin / platform-exempt staff member. Used as a RESTRICTIVE RLS check alongside org_billing_ok().';

-- quotesInvoicing -> quotes, quote_items, invoices, invoice_items
DROP POLICY IF EXISTS "quotes_plan_gate_insert" ON public.quotes;
CREATE POLICY "quotes_plan_gate_insert" ON public.quotes AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'quotesInvoicing'));
DROP POLICY IF EXISTS "quotes_plan_gate_update" ON public.quotes;
CREATE POLICY "quotes_plan_gate_update" ON public.quotes AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'quotesInvoicing')) WITH CHECK (public.org_plan_has_feature(org_id, 'quotesInvoicing'));

DROP POLICY IF EXISTS "quote_items_plan_gate_insert" ON public.quote_items;
CREATE POLICY "quote_items_plan_gate_insert" ON public.quote_items AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'quotesInvoicing'));
DROP POLICY IF EXISTS "quote_items_plan_gate_update" ON public.quote_items;
CREATE POLICY "quote_items_plan_gate_update" ON public.quote_items AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'quotesInvoicing')) WITH CHECK (public.org_plan_has_feature(org_id, 'quotesInvoicing'));

DROP POLICY IF EXISTS "invoices_plan_gate_insert" ON public.invoices;
CREATE POLICY "invoices_plan_gate_insert" ON public.invoices AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'quotesInvoicing'));
DROP POLICY IF EXISTS "invoices_plan_gate_update" ON public.invoices;
CREATE POLICY "invoices_plan_gate_update" ON public.invoices AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'quotesInvoicing')) WITH CHECK (public.org_plan_has_feature(org_id, 'quotesInvoicing'));

DROP POLICY IF EXISTS "invoice_items_plan_gate_insert" ON public.invoice_items;
CREATE POLICY "invoice_items_plan_gate_insert" ON public.invoice_items AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'quotesInvoicing'));
DROP POLICY IF EXISTS "invoice_items_plan_gate_update" ON public.invoice_items;
CREATE POLICY "invoice_items_plan_gate_update" ON public.invoice_items AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'quotesInvoicing')) WITH CHECK (public.org_plan_has_feature(org_id, 'quotesInvoicing'));

-- tickets -> tickets
DROP POLICY IF EXISTS "tickets_plan_gate_insert" ON public.tickets;
CREATE POLICY "tickets_plan_gate_insert" ON public.tickets AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'tickets'));
DROP POLICY IF EXISTS "tickets_plan_gate_update" ON public.tickets;
CREATE POLICY "tickets_plan_gate_update" ON public.tickets AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'tickets')) WITH CHECK (public.org_plan_has_feature(org_id, 'tickets'));

-- knowledgeBase -> knowledge_documents
DROP POLICY IF EXISTS "knowledge_documents_plan_gate_insert" ON public.knowledge_documents;
CREATE POLICY "knowledge_documents_plan_gate_insert" ON public.knowledge_documents AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'knowledgeBase'));
DROP POLICY IF EXISTS "knowledge_documents_plan_gate_update" ON public.knowledge_documents;
CREATE POLICY "knowledge_documents_plan_gate_update" ON public.knowledge_documents AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'knowledgeBase')) WITH CHECK (public.org_plan_has_feature(org_id, 'knowledgeBase'));

-- workflowAutomation -> workflows, workflow_runs
DROP POLICY IF EXISTS "workflows_plan_gate_insert" ON public.workflows;
CREATE POLICY "workflows_plan_gate_insert" ON public.workflows AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'workflowAutomation'));
DROP POLICY IF EXISTS "workflows_plan_gate_update" ON public.workflows;
CREATE POLICY "workflows_plan_gate_update" ON public.workflows AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'workflowAutomation')) WITH CHECK (public.org_plan_has_feature(org_id, 'workflowAutomation'));

DROP POLICY IF EXISTS "workflow_runs_plan_gate_insert" ON public.workflow_runs;
CREATE POLICY "workflow_runs_plan_gate_insert" ON public.workflow_runs AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'workflowAutomation'));
DROP POLICY IF EXISTS "workflow_runs_plan_gate_update" ON public.workflow_runs;
CREATE POLICY "workflow_runs_plan_gate_update" ON public.workflow_runs AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'workflowAutomation')) WITH CHECK (public.org_plan_has_feature(org_id, 'workflowAutomation'));

-- webhooks -> webhooks
DROP POLICY IF EXISTS "webhooks_plan_gate_insert" ON public.webhooks;
CREATE POLICY "webhooks_plan_gate_insert" ON public.webhooks AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'webhooks'));
DROP POLICY IF EXISTS "webhooks_plan_gate_update" ON public.webhooks;
CREATE POLICY "webhooks_plan_gate_update" ON public.webhooks AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'webhooks')) WITH CHECK (public.org_plan_has_feature(org_id, 'webhooks'));

-- apiAccess -> api_keys
DROP POLICY IF EXISTS "api_keys_plan_gate_insert" ON public.api_keys;
CREATE POLICY "api_keys_plan_gate_insert" ON public.api_keys AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.org_plan_has_feature(org_id, 'apiAccess'));
DROP POLICY IF EXISTS "api_keys_plan_gate_update" ON public.api_keys;
CREATE POLICY "api_keys_plan_gate_update" ON public.api_keys AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.org_plan_has_feature(org_id, 'apiAccess')) WITH CHECK (public.org_plan_has_feature(org_id, 'apiAccess'));
