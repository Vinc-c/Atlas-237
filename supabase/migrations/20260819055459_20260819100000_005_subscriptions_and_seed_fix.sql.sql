/*
# Fix signup + subscriptions table + Flutterwave billing foundation

Applies repo migration 005 content:
1. Rewrites seed_demo_data with corrected approvals inserts (FK fix)
2. Makes handle_new_user resilient (seed failure doesn't block signup)
3. Adds subscriptions table for Flutterwave billing + trial paywall
4. Adds org_subscription_status() RPC for paywall checks
*/

-- 1: Rewrite seed_demo_data
CREATE OR REPLACE FUNCTION public.seed_demo_data(new_org_id uuid, owner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contact1_id uuid; contact2_id uuid; contact3_id uuid; contact4_id uuid;
  company1_id uuid; company2_id uuid;
  lead1_id uuid; lead2_id uuid; lead3_id uuid;
  pipeline1_id uuid; stage1_id uuid; stage2_id uuid; stage3_id uuid;
  deal1_id uuid; deal2_id uuid;
  agent1_id uuid; agent2_id uuid; agent3_id uuid;
  product1_id uuid; product2_id uuid;
  invoice1_id uuid; ticket1_id uuid; campaign1_id uuid;
  aitask1_id uuid; aitask2_id uuid;
BEGIN
  INSERT INTO ai_agents (org_id, name, role, description, enabled, risk_level, usage_count)
  VALUES
    (new_org_id, 'Sales Master', 'Sales Representative', 'Handles lead qualification, follow-ups, and deal progression.', true, 'low', 127),
    (new_org_id, 'Finance Master', 'Finance Manager', 'Manages invoicing, payment tracking, and financial reporting.', true, 'medium', 89),
    (new_org_id, 'Support Hero', 'Support Agent', 'Handles customer tickets and resolves issues automatically.', true, 'low', 215)
  RETURNING id INTO agent1_id;
  INSERT INTO ai_agents (org_id, name, role, description, enabled, risk_level, usage_count)
  VALUES (new_org_id, 'Marketing Pro', 'Marketing Specialist', 'Creates and manages campaigns, email sequences, and social posts.', true, 'medium', 56)
  RETURNING id INTO agent2_id;
  INSERT INTO ai_agents (org_id, name, role, description, enabled, risk_level, usage_count)
  VALUES (new_org_id, 'Data Analyst', 'Business Analyst', 'Analyzes data, generates reports, and provides insights.', true, 'low', 34)
  RETURNING id INTO agent3_id;

  INSERT INTO companies (org_id, name, industry, website, size, country, city, revenue, status)
  VALUES
    (new_org_id, 'TechFlow Solutions', 'Software', 'https://techflow.com', '51-200', 'USA', 'San Francisco', 5000000, 'active'),
    (new_org_id, 'Green Energy Co', 'Energy', 'https://greenenergy.com', '201-500', 'Canada', 'Toronto', 12000000, 'active')
  RETURNING id INTO company1_id;
  INSERT INTO companies (org_id, name, industry, website, size, country, city, revenue, status)
  VALUES (new_org_id, 'InnovateLabs', 'Research', 'https://innovatelabs.io', '11-50', 'USA', 'Austin', 2000000, 'active')
  RETURNING id INTO company2_id;

  INSERT INTO contacts (org_id, first_name, last_name, email, phone, job_title, company_id, status, lead_score, tags)
  VALUES
    (new_org_id, 'Sarah', 'Johnson', 'sarah@techflow.com', '+1-555-0101', 'VP Engineering', company1_id, 'active', 85, ARRAY['decision-maker', 'tech']),
    (new_org_id, 'Michael', 'Chen', 'michael@greenenergy.com', '+1-555-0102', 'CTO', company1_id, 'active', 72, ARRAY['tech']),
    (new_org_id, 'Emily', 'Rodriguez', 'emily@innovatelabs.io', '+1-555-0103', 'CEO', company2_id, 'active', 90, ARRAY['decision-maker'])
  RETURNING id INTO contact1_id;
  INSERT INTO contacts (org_id, first_name, last_name, email, phone, job_title, company_id, status, lead_score, tags)
  VALUES (new_org_id, 'David', 'Kim', 'david@techflow.com', '+1-555-0104', 'Product Manager', company1_id, 'active', 65, ARRAY['influencer'])
  RETURNING id INTO contact2_id;
  INSERT INTO contacts (org_id, first_name, last_name, email, phone, job_title, status, lead_score, tags)
  VALUES (new_org_id, 'Lisa', 'Wang', 'lisa.wang@email.com', '+1-555-0105', 'Director', 'active', 78, ARRAY['warm'])
  RETURNING id INTO contact3_id;
  INSERT INTO contacts (org_id, first_name, last_name, email, phone, job_title, status, lead_score, tags)
  VALUES (new_org_id, 'James', 'Brown', 'james.brown@email.com', '+1-555-0106', 'Founder', 'active', 88, ARRAY['hot'])
  RETURNING id INTO contact4_id;

  INSERT INTO leads (org_id, first_name, last_name, email, phone, company_name, title, source, status, temperature, lead_score, potential_value, ai_agent_id)
  VALUES
    (new_org_id, 'Anna', 'Smith', 'anna@startup.com', '+1-555-0201', 'Startup Inc', 'CEO', 'website', 'new', 'hot', 92, 50000, agent1_id),
    (new_org_id, 'Robert', 'Lee', 'robert@corp.com', '+1-555-0202', 'Corp Group', 'VP Sales', 'referral', 'contacted', 'warm', 68, 120000, agent1_id),
    (new_org_id, 'Sophia', 'Martinez', 'sophia@enterprise.com', '+1-555-0203', 'Enterprise Ltd', 'CFO', 'cold_outreach', 'qualified', 'hot', 81, 250000, agent1_id)
  RETURNING id INTO lead1_id;
  INSERT INTO leads (org_id, first_name, last_name, email, phone, company_name, title, source, status, temperature, lead_score, potential_value)
  VALUES (new_org_id, 'Thomas', 'Anderson', 'thomas@matrix.com', '+1-555-0204', 'Matrix Corp', 'CTO', 'event', 'new', 'cold', 45, 30000)
  RETURNING id INTO lead2_id;
  INSERT INTO leads (org_id, first_name, last_name, email, phone, company_name, title, source, status, temperature, lead_score, potential_value)
  VALUES (new_org_id, 'Olivia', 'Taylor', 'olivia@brand.com', '+1-555-0205', 'Brand Co', 'Marketing Director', 'social', 'contacted', 'warm', 61, 75000)
  RETURNING id INTO lead3_id;

  INSERT INTO pipelines (org_id, name, description, sort_order)
  VALUES (new_org_id, 'Sales Pipeline', 'Standard sales pipeline', 1)
  RETURNING id INTO pipeline1_id;

  INSERT INTO pipeline_stages (org_id, pipeline_id, name, probability, sort_order, color)
  VALUES
    (new_org_id, pipeline1_id, 'Lead', 10, 1, '#94a3b8'),
    (new_org_id, pipeline1_id, 'Qualified', 30, 2, '#3398ff'),
    (new_org_id, pipeline1_id, 'Proposal', 50, 3, '#f59e0b')
  RETURNING id INTO stage1_id;
  INSERT INTO pipeline_stages (org_id, pipeline_id, name, probability, sort_order, color)
  VALUES (new_org_id, pipeline1_id, 'Negotiation', 70, 4, '#14b8a6')
  RETURNING id INTO stage2_id;
  INSERT INTO pipeline_stages (org_id, pipeline_id, name, probability, sort_order, color)
  VALUES (new_org_id, pipeline1_id, 'Closed Won', 100, 5, '#22c55e')
  RETURNING id INTO stage3_id;

  INSERT INTO deals (org_id, name, value, currency, probability, closing_date, pipeline_id, stage_id, contact_id, company_id, status)
  VALUES
    (new_org_id, 'TechFlow Enterprise License', 150000, 'USD', 70, now() + interval '14 days', pipeline1_id, stage2_id, contact1_id, company1_id, 'open'),
    (new_org_id, 'GreenEnergy Consulting', 80000, 'USD', 50, now() + interval '7 days', pipeline1_id, stage2_id, contact2_id, company1_id, 'open')
  RETURNING id INTO deal1_id;
  INSERT INTO deals (org_id, name, value, currency, probability, closing_date, pipeline_id, stage_id, contact_id, company_id, status)
  VALUES (new_org_id, 'InnovateLabs Setup', 45000, 'USD', 30, now() + interval '30 days', pipeline1_id, stage1_id, contact3_id, company2_id, 'open')
  RETURNING id INTO deal2_id;

  INSERT INTO activities (org_id, type, title, contact_id, deal_id, performed_by, scheduled_at, status)
  VALUES
    (new_org_id, 'call', 'Discovery call with Sarah Johnson', contact1_id, deal1_id, 'user', now() + interval '2 days', 'pending'),
    (new_org_id, 'email', 'Follow-up email to Michael Chen', contact2_id, deal1_id, 'ai', now() - interval '1 day', 'completed'),
    (new_org_id, 'meeting', 'Demo presentation for TechFlow', contact1_id, deal1_id, 'user', now() + interval '3 days', 'pending'),
    (new_org_id, 'call', 'Qualification call with Emily Rodriguez', contact3_id, deal2_id, 'ai', now() - interval '2 days', 'completed');

  INSERT INTO tasks (org_id, title, priority, status, due_date, ai_agent_id)
  VALUES
    (new_org_id, 'Prepare proposal for TechFlow deal', 'high', 'pending', now() + interval '3 days', agent1_id),
    (new_org_id, 'Send invoice to GreenEnergy', 'medium', 'pending', now() + interval '1 day', agent2_id),
    (new_org_id, 'Follow up with hot leads', 'high', 'completed', now() - interval '1 day', agent1_id);

  INSERT INTO ai_tasks (org_id, agent_id, title, instruction, status, priority, progress)
  VALUES
    (new_org_id, agent1_id, 'Qualify 3 new leads from website', 'Review and score new leads, contact hot ones within 24h.', 'completed', 'high', 100),
    (new_org_id, agent2_id, 'Generate monthly financial report', 'Compile revenue, expenses, and cash flow data.', 'in_progress', 'medium', 65)
  RETURNING id INTO aitask1_id, aitask2_id;
  INSERT INTO ai_tasks (org_id, agent_id, title, instruction, status, priority, progress)
  VALUES
    (new_org_id, agent3_id, 'Resolve customer support tickets', 'Handle open tickets and provide resolutions.', 'completed', 'low', 100),
    (new_org_id, agent1_id, 'Follow up with cold leads', 'Send personalized emails to 5 cold leads.', 'pending', 'medium', 0);

  INSERT INTO approvals (org_id, ai_task_id, agent_name, action_type, description, risk_level, status)
  VALUES
    (new_org_id, aitask2_id, 'Finance Master', 'send_email', 'Send invoice #INV-2024-001 to TechFlow Solutions ($150,000)', 'medium', 'pending'),
    (new_org_id, aitask1_id, 'Sales Master', 'create_quote', 'Create quote for InnovateLabs setup ($45,000)', 'low', 'pending');

  INSERT INTO products (org_id, name, sku, category, price, currency, stock, status)
  VALUES
    (new_org_id, 'Enterprise License', 'ENT-LIC-001', 'Software', 5000, 'USD', null, 'active'),
    (new_org_id, 'Professional Services', 'PRO-SVC-001', 'Services', 200, 'USD', null, 'active')
  RETURNING id INTO product1_id;
  INSERT INTO products (org_id, name, sku, category, price, currency, stock, status)
  VALUES (new_org_id, 'Support Package', 'SUP-PKG-001', 'Support', 1000, 'USD', null, 'active')
  RETURNING id INTO product2_id;

  INSERT INTO invoices (org_id, invoice_number, contact_id, company_id, status, payment_status, subtotal, total, amount_paid, amount_due, currency, issue_date, due_date)
  VALUES
    (new_org_id, 'INV-2024-001', contact1_id, company1_id, 'sent', 'unpaid', 150000, 150000, 0, 150000, 'USD', now() - interval '10 days', now() + interval '20 days'),
    (new_org_id, 'INV-2024-002', contact3_id, company2_id, 'paid', 'paid', 45000, 45000, 45000, 0, 'USD', now() - interval '30 days', now() - interval '15 days')
  RETURNING id INTO invoice1_id;

  INSERT INTO payments (org_id, amount, method, status, reference, invoice_id)
  VALUES
    (new_org_id, 45000, 'bank_transfer', 'completed', 'REF-001', invoice1_id),
    (new_org_id, 5000, 'card', 'completed', 'REF-002', null);

  INSERT INTO quotes (org_id, quote_number, status, total, expiration_date)
  VALUES
    (new_org_id, 'QUO-2024-001', 'sent', 80000, now() + interval '15 days'),
    (new_org_id, 'QUO-2024-002', 'draft', 45000, now() + interval '30 days');

  INSERT INTO orders (org_id, order_number, status, payment_status, total)
  VALUES
    (new_org_id, 'ORD-2024-001', 'delivered', 'paid', 45000),
    (new_org_id, 'ORD-2024-002', 'processing', 'unpaid', 150000);

  INSERT INTO tickets (org_id, ticket_number, subject, contact_id, priority, status, category, description, ai_agent_id)
  VALUES
    (new_org_id, 'TKT-001', 'Login issue with portal', contact2_id, 'high', 'open', 'Technical', 'User cannot access the customer portal.', agent3_id),
    (new_org_id, 'TKT-002', 'Billing question', contact1_id, 'medium', 'in_progress', 'Billing', 'Question about invoice #INV-2024-001.', null)
  RETURNING id INTO ticket1_id;

  INSERT INTO campaigns (org_id, name, type, status, budget, spent, subject, content, channel)
  VALUES
    (new_org_id, 'Q4 Product Launch', 'email', 'active', 10000, 3500, 'Introducing our new Enterprise License', 'Check out our latest offering...', 'email'),
    (new_org_id, 'Holiday Promo', 'email', 'completed', 5000, 4800, 'Special holiday pricing', 'Limited time offer...', 'email')
  RETURNING id INTO campaign1_id;

  INSERT INTO workflows (org_id, name, description, trigger_type, enabled, run_count)
  VALUES
    (new_org_id, 'Auto-assign new leads', 'When a new lead comes in, assign to Sales Master AI for qualification.', 'event', true, 45),
    (new_org_id, 'Invoice reminder sequence', 'Send payment reminders 3 days before and on due date.', 'schedule', true, 128);

  INSERT INTO ai_memory (org_id, type, key, value, category, enabled)
  VALUES
    (new_org_id, 'preference', 'communication_style', 'Professional but friendly tone. Always address by first name.', 'sales', true),
    (new_org_id, 'preference', 'follow_up_timing', 'Follow up within 24 hours for hot leads, 48 hours for warm leads.', 'sales', true),
    (new_org_id, 'fact', 'company_pricing', 'Enterprise: $5000/yr. Pro Services: $200/hr. Support: $1000/mo.', 'finance', true);

  INSERT INTO knowledge_documents (org_id, title, type, category, description, status)
  VALUES
    (new_org_id, 'Product Catalog 2024', 'document', 'Products', 'Complete product catalog with pricing and specifications.', 'processed'),
    (new_org_id, 'Sales Playbook', 'document', 'Sales', 'Guidelines for lead qualification and deal progression.', 'processed'),
    (new_org_id, 'Customer FAQ', 'faq', 'Support', 'Frequently asked questions and answers for customer support.', 'processed');

  INSERT INTO integrations (org_id, provider, category, status)
  VALUES
    (new_org_id, 'gmail', 'Email', 'connected'),
    (new_org_id, 'stripe', 'Payments', 'connected');

  INSERT INTO notifications (org_id, user_id, type, title, message, read)
  VALUES
    (new_org_id, owner_id, 'info', 'Welcome to Atlas CRM!', 'Your AI workforce is ready. Try asking Atlas to find your hottest leads.', false),
    (new_org_id, owner_id, 'approval', '2 approvals pending', 'Finance Master and Sales Master are requesting approval for actions.', false),
    (new_org_id, owner_id, 'alert', '1 deal at risk', 'TechFlow Enterprise License closing date is approaching.', false);

  INSERT INTO audit_logs (org_id, actor_type, actor_name, action, entity_type, entity_name)
  VALUES
    (new_org_id, 'system', 'System', 'create', 'organization', 'Organization created'),
    (new_org_id, 'ai', 'Sales Master', 'create', 'lead', 'Qualified 3 new leads'),
    (new_org_id, 'ai', 'Finance Master', 'create', 'invoice', 'Generated invoice INV-2024-001');

  INSERT INTO api_keys (org_id, name, key_prefix, active, created_by)
  VALUES (new_org_id, 'Production API', 'atlas_prod_', true, owner_id);

  INSERT INTO webhooks (org_id, url, events, active)
  VALUES (new_org_id, 'https://example.com/webhooks/atlas', ARRAY['contact.created', 'deal.won', 'invoice.paid'], true);
END;
$$;

-- 2: Resilient handle_new_user
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

  BEGIN
    PERFORM public.seed_demo_data(new_org_id, NEW.id);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'seed_demo_data failed for org %: %', new_org_id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3: Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'trialing',
  price_cents integer NOT NULL DEFAULT 1900,
  currency text NOT NULL DEFAULT 'USD',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  flutterwave_tx_ref text,
  flutterwave_payment_id text,
  flutterwave_plan_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON public.subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can read subscriptions" ON public.subscriptions;
CREATE POLICY "org members can read subscriptions" ON public.subscriptions
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "org owners can manage subscriptions" ON public.subscriptions;
CREATE POLICY "org owners can manage subscriptions" ON public.subscriptions
  FOR ALL USING (
    org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- 4: org_subscription_status RPC
CREATE OR REPLACE FUNCTION public.org_subscription_status(check_org_id uuid)
RETURNS TABLE(status text, plan text, trial_ends_at timestamptz, current_period_end timestamptz)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    COALESCE(
      (SELECT status FROM public.subscriptions WHERE org_id = check_org_id AND status = 'active' ORDER BY created_at DESC LIMIT 1),
      CASE
        WHEN EXISTS (SELECT 1 FROM public.organizations WHERE id = check_org_id AND trial_ends_at > now()) THEN 'trialing'
        ELSE 'expired'
      END
    ) AS status,
    COALESCE(
      (SELECT plan FROM public.subscriptions WHERE org_id = check_org_id AND status = 'active' ORDER BY created_at DESC LIMIT 1),
      (SELECT plan FROM public.organizations WHERE id = check_org_id)
    ) AS plan,
    (SELECT trial_ends_at FROM public.organizations WHERE id = check_org_id) AS trial_ends_at,
    (SELECT current_period_end FROM public.subscriptions WHERE org_id = check_org_id AND status = 'active' ORDER BY created_at DESC LIMIT 1) AS current_period_end;
$$;
