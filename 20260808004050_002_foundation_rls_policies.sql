/*
# Foundation Part 2: Row Level Security Policies

Enables RLS and creates CRUD policies on all tables.
Each policy checks org membership via user_org_id() helper.
*/

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS
DROP POLICY IF EXISTS "org_select_own" ON public.organizations;
CREATE POLICY "org_select_own" ON public.organizations FOR SELECT TO authenticated USING (id = public.user_org_id());
DROP POLICY IF EXISTS "org_update_own" ON public.organizations;
CREATE POLICY "org_update_own" ON public.organizations FOR UPDATE TO authenticated USING (id = public.user_org_id()) WITH CHECK (id = public.user_org_id());

-- PROFILES
DROP POLICY IF EXISTS "profile_select_own_org" ON public.profiles;
CREATE POLICY "profile_select_own_org" ON public.profiles FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "profile_insert_own" ON public.profiles;
CREATE POLICY "profile_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
CREATE POLICY "profile_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Generic CRUD policy generator pattern for org-scoped tables
-- We create 4 policies per table: select, insert, update, delete

-- PIPELINES
DROP POLICY IF EXISTS "pipelines_select_own" ON public.pipelines;
CREATE POLICY "pipelines_select_own" ON public.pipelines FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "pipelines_insert_own" ON public.pipelines;
CREATE POLICY "pipelines_insert_own" ON public.pipelines FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "pipelines_update_own" ON public.pipelines;
CREATE POLICY "pipelines_update_own" ON public.pipelines FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "pipelines_delete_own" ON public.pipelines;
CREATE POLICY "pipelines_delete_own" ON public.pipelines FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- PIPELINE_STAGES
DROP POLICY IF EXISTS "stages_select_own" ON public.pipeline_stages;
CREATE POLICY "stages_select_own" ON public.pipeline_stages FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "stages_insert_own" ON public.pipeline_stages;
CREATE POLICY "stages_insert_own" ON public.pipeline_stages FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "stages_update_own" ON public.pipeline_stages;
CREATE POLICY "stages_update_own" ON public.pipeline_stages FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "stages_delete_own" ON public.pipeline_stages;
CREATE POLICY "stages_delete_own" ON public.pipeline_stages FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- COMPANIES
DROP POLICY IF EXISTS "companies_select_own" ON public.companies;
CREATE POLICY "companies_select_own" ON public.companies FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "companies_insert_own" ON public.companies;
CREATE POLICY "companies_insert_own" ON public.companies FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "companies_update_own" ON public.companies;
CREATE POLICY "companies_update_own" ON public.companies FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "companies_delete_own" ON public.companies;
CREATE POLICY "companies_delete_own" ON public.companies FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- CONTACTS
DROP POLICY IF EXISTS "contacts_select_own" ON public.contacts;
CREATE POLICY "contacts_select_own" ON public.contacts FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "contacts_insert_own" ON public.contacts;
CREATE POLICY "contacts_insert_own" ON public.contacts FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "contacts_update_own" ON public.contacts;
CREATE POLICY "contacts_update_own" ON public.contacts FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "contacts_delete_own" ON public.contacts;
CREATE POLICY "contacts_delete_own" ON public.contacts FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- LEADS
DROP POLICY IF EXISTS "leads_select_own" ON public.leads;
CREATE POLICY "leads_select_own" ON public.leads FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "leads_insert_own" ON public.leads;
CREATE POLICY "leads_insert_own" ON public.leads FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "leads_update_own" ON public.leads;
CREATE POLICY "leads_update_own" ON public.leads FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "leads_delete_own" ON public.leads;
CREATE POLICY "leads_delete_own" ON public.leads FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- DEALS
DROP POLICY IF EXISTS "deals_select_own" ON public.deals;
CREATE POLICY "deals_select_own" ON public.deals FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "deals_insert_own" ON public.deals;
CREATE POLICY "deals_insert_own" ON public.deals FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "deals_update_own" ON public.deals;
CREATE POLICY "deals_update_own" ON public.deals FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "deals_delete_own" ON public.deals;
CREATE POLICY "deals_delete_own" ON public.deals FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- ACTIVITIES
DROP POLICY IF EXISTS "activities_select_own" ON public.activities;
CREATE POLICY "activities_select_own" ON public.activities FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "activities_insert_own" ON public.activities;
CREATE POLICY "activities_insert_own" ON public.activities FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "activities_update_own" ON public.activities;
CREATE POLICY "activities_update_own" ON public.activities FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "activities_delete_own" ON public.activities;
CREATE POLICY "activities_delete_own" ON public.activities FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- TASKS
DROP POLICY IF EXISTS "tasks_select_own" ON public.tasks;
CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "tasks_insert_own" ON public.tasks;
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- PRODUCTS
DROP POLICY IF EXISTS "products_select_own" ON public.products;
CREATE POLICY "products_select_own" ON public.products FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "products_insert_own" ON public.products;
CREATE POLICY "products_insert_own" ON public.products FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "products_update_own" ON public.products;
CREATE POLICY "products_update_own" ON public.products FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "products_delete_own" ON public.products;
CREATE POLICY "products_delete_own" ON public.products FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- QUOTES
DROP POLICY IF EXISTS "quotes_select_own" ON public.quotes;
CREATE POLICY "quotes_select_own" ON public.quotes FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "quotes_insert_own" ON public.quotes;
CREATE POLICY "quotes_insert_own" ON public.quotes FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "quotes_update_own" ON public.quotes;
CREATE POLICY "quotes_update_own" ON public.quotes FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "quotes_delete_own" ON public.quotes;
CREATE POLICY "quotes_delete_own" ON public.quotes FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- QUOTE_ITEMS
DROP POLICY IF EXISTS "quote_items_select_own" ON public.quote_items;
CREATE POLICY "quote_items_select_own" ON public.quote_items FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "quote_items_insert_own" ON public.quote_items;
CREATE POLICY "quote_items_insert_own" ON public.quote_items FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "quote_items_update_own" ON public.quote_items;
CREATE POLICY "quote_items_update_own" ON public.quote_items FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "quote_items_delete_own" ON public.quote_items;
CREATE POLICY "quote_items_delete_own" ON public.quote_items FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- ORDERS
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "orders_delete_own" ON public.orders;
CREATE POLICY "orders_delete_own" ON public.orders FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- ORDER_ITEMS
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "order_items_update_own" ON public.order_items;
CREATE POLICY "order_items_update_own" ON public.order_items FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "order_items_delete_own" ON public.order_items;
CREATE POLICY "order_items_delete_own" ON public.order_items FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- INVOICES
DROP POLICY IF EXISTS "invoices_select_own" ON public.invoices;
CREATE POLICY "invoices_select_own" ON public.invoices FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "invoices_insert_own" ON public.invoices;
CREATE POLICY "invoices_insert_own" ON public.invoices FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "invoices_update_own" ON public.invoices;
CREATE POLICY "invoices_update_own" ON public.invoices FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "invoices_delete_own" ON public.invoices;
CREATE POLICY "invoices_delete_own" ON public.invoices FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- INVOICE_ITEMS
DROP POLICY IF EXISTS "invoice_items_select_own" ON public.invoice_items;
CREATE POLICY "invoice_items_select_own" ON public.invoice_items FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "invoice_items_insert_own" ON public.invoice_items;
CREATE POLICY "invoice_items_insert_own" ON public.invoice_items FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "invoice_items_update_own" ON public.invoice_items;
CREATE POLICY "invoice_items_update_own" ON public.invoice_items FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "invoice_items_delete_own" ON public.invoice_items;
CREATE POLICY "invoice_items_delete_own" ON public.invoice_items FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- PAYMENTS
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own" ON public.payments FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "payments_delete_own" ON public.payments;
CREATE POLICY "payments_delete_own" ON public.payments FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- TICKETS
DROP POLICY IF EXISTS "tickets_select_own" ON public.tickets;
CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "tickets_insert_own" ON public.tickets;
CREATE POLICY "tickets_insert_own" ON public.tickets FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "tickets_update_own" ON public.tickets;
CREATE POLICY "tickets_update_own" ON public.tickets FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "tickets_delete_own" ON public.tickets;
CREATE POLICY "tickets_delete_own" ON public.tickets FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- CAMPAIGNS
DROP POLICY IF EXISTS "campaigns_select_own" ON public.campaigns;
CREATE POLICY "campaigns_select_own" ON public.campaigns FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "campaigns_insert_own" ON public.campaigns;
CREATE POLICY "campaigns_insert_own" ON public.campaigns FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "campaigns_update_own" ON public.campaigns;
CREATE POLICY "campaigns_update_own" ON public.campaigns FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "campaigns_delete_own" ON public.campaigns;
CREATE POLICY "campaigns_delete_own" ON public.campaigns FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- AI_AGENTS
DROP POLICY IF EXISTS "ai_agents_select_own" ON public.ai_agents;
CREATE POLICY "ai_agents_select_own" ON public.ai_agents FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_agents_insert_own" ON public.ai_agents;
CREATE POLICY "ai_agents_insert_own" ON public.ai_agents FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_agents_update_own" ON public.ai_agents;
CREATE POLICY "ai_agents_update_own" ON public.ai_agents FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_agents_delete_own" ON public.ai_agents;
CREATE POLICY "ai_agents_delete_own" ON public.ai_agents FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- AI_TASKS
DROP POLICY IF EXISTS "ai_tasks_select_own" ON public.ai_tasks;
CREATE POLICY "ai_tasks_select_own" ON public.ai_tasks FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_tasks_insert_own" ON public.ai_tasks;
CREATE POLICY "ai_tasks_insert_own" ON public.ai_tasks FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_tasks_update_own" ON public.ai_tasks;
CREATE POLICY "ai_tasks_update_own" ON public.ai_tasks FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_tasks_delete_own" ON public.ai_tasks;
CREATE POLICY "ai_tasks_delete_own" ON public.ai_tasks FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- AI_MEMORY
DROP POLICY IF EXISTS "ai_memory_select_own" ON public.ai_memory;
CREATE POLICY "ai_memory_select_own" ON public.ai_memory FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_memory_insert_own" ON public.ai_memory;
CREATE POLICY "ai_memory_insert_own" ON public.ai_memory FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_memory_update_own" ON public.ai_memory;
CREATE POLICY "ai_memory_update_own" ON public.ai_memory FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "ai_memory_delete_own" ON public.ai_memory;
CREATE POLICY "ai_memory_delete_own" ON public.ai_memory FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- KNOWLEDGE_DOCUMENTS
DROP POLICY IF EXISTS "knowledge_select_own" ON public.knowledge_documents;
CREATE POLICY "knowledge_select_own" ON public.knowledge_documents FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "knowledge_insert_own" ON public.knowledge_documents;
CREATE POLICY "knowledge_insert_own" ON public.knowledge_documents FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "knowledge_update_own" ON public.knowledge_documents;
CREATE POLICY "knowledge_update_own" ON public.knowledge_documents FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "knowledge_delete_own" ON public.knowledge_documents;
CREATE POLICY "knowledge_delete_own" ON public.knowledge_documents FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- WORKFLOWS
DROP POLICY IF EXISTS "workflows_select_own" ON public.workflows;
CREATE POLICY "workflows_select_own" ON public.workflows FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "workflows_insert_own" ON public.workflows;
CREATE POLICY "workflows_insert_own" ON public.workflows FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "workflows_update_own" ON public.workflows;
CREATE POLICY "workflows_update_own" ON public.workflows FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "workflows_delete_own" ON public.workflows;
CREATE POLICY "workflows_delete_own" ON public.workflows FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- WORKFLOW_RUNS
DROP POLICY IF EXISTS "workflow_runs_select_own" ON public.workflow_runs;
CREATE POLICY "workflow_runs_select_own" ON public.workflow_runs FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "workflow_runs_insert_own" ON public.workflow_runs;
CREATE POLICY "workflow_runs_insert_own" ON public.workflow_runs FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "workflow_runs_update_own" ON public.workflow_runs;
CREATE POLICY "workflow_runs_update_own" ON public.workflow_runs FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "workflow_runs_delete_own" ON public.workflow_runs;
CREATE POLICY "workflow_runs_delete_own" ON public.workflow_runs FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- APPROVALS
DROP POLICY IF EXISTS "approvals_select_own" ON public.approvals;
CREATE POLICY "approvals_select_own" ON public.approvals FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "approvals_insert_own" ON public.approvals;
CREATE POLICY "approvals_insert_own" ON public.approvals FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "approvals_update_own" ON public.approvals;
CREATE POLICY "approvals_update_own" ON public.approvals FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "approvals_delete_own" ON public.approvals;
CREATE POLICY "approvals_delete_own" ON public.approvals FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- AUDIT_LOGS (no update/delete — append-only)
DROP POLICY IF EXISTS "audit_logs_select_own" ON public.audit_logs;
CREATE POLICY "audit_logs_select_own" ON public.audit_logs FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "audit_logs_insert_own" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_own" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own" ON public.notifications FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- INTEGRATIONS
DROP POLICY IF EXISTS "integrations_select_own" ON public.integrations;
CREATE POLICY "integrations_select_own" ON public.integrations FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "integrations_insert_own" ON public.integrations;
CREATE POLICY "integrations_insert_own" ON public.integrations FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "integrations_update_own" ON public.integrations;
CREATE POLICY "integrations_update_own" ON public.integrations FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "integrations_delete_own" ON public.integrations;
CREATE POLICY "integrations_delete_own" ON public.integrations FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- API_KEYS (no update — immutable once created, delete to revoke)
DROP POLICY IF EXISTS "api_keys_select_own" ON public.api_keys;
CREATE POLICY "api_keys_select_own" ON public.api_keys FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "api_keys_insert_own" ON public.api_keys;
CREATE POLICY "api_keys_insert_own" ON public.api_keys FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "api_keys_delete_own" ON public.api_keys;
CREATE POLICY "api_keys_delete_own" ON public.api_keys FOR DELETE TO authenticated USING (org_id = public.user_org_id());

-- WEBHOOKS
DROP POLICY IF EXISTS "webhooks_select_own" ON public.webhooks;
CREATE POLICY "webhooks_select_own" ON public.webhooks FOR SELECT TO authenticated USING (org_id = public.user_org_id());
DROP POLICY IF EXISTS "webhooks_insert_own" ON public.webhooks;
CREATE POLICY "webhooks_insert_own" ON public.webhooks FOR INSERT TO authenticated WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "webhooks_update_own" ON public.webhooks;
CREATE POLICY "webhooks_update_own" ON public.webhooks FOR UPDATE TO authenticated USING (org_id = public.user_org_id()) WITH CHECK (org_id = public.user_org_id());
DROP POLICY IF EXISTS "webhooks_delete_own" ON public.webhooks;
CREATE POLICY "webhooks_delete_own" ON public.webhooks FOR DELETE TO authenticated USING (org_id = public.user_org_id());
