export type Role = 'owner' | 'admin' | 'manager' | 'sales' | 'marketing' | 'finance' | 'support' | 'member';

export type Plan = 'starter' | 'growth' | 'pro' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  country: string | null;
  address: string | null;
  employees: number | null;
  revenue: number | null;
  currency: string;
  timezone: string;
  plan: Plan;
  trial_ends_at: string | null;
  logo_url: string | null;
  branding_enabled: boolean;
  signup_sales_code: string | null;
  status: string;
  ai_provider: string;
  sso_config: Record<string, unknown> | null;
  sso_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  org_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: Role;
  phone: string | null;
  language: string;
  timezone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  job_title: string | null;
  company_id: string | null;
  role: string | null;
  address: string | null;
  country: string | null;
  city: string | null;
  language: string;
  timezone: string;
  lead_source: string | null;
  status: string;
  lead_score: number;
  customer_value: number;
  tags: string[] | null;
  notes: string | null;
  custom_fields: Record<string, unknown>;
  owner_id: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  company?: Company | null;
}

export interface Company {
  id: string;
  org_id: string;
  name: string;
  industry: string | null;
  website: string | null;
  size: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  revenue: number | null;
  currency: string;
  status: string;
  owner_id: string | null;
  tags: string[] | null;
  notes: string | null;
  custom_fields: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  title: string | null;
  source: string | null;
  status: string;
  temperature: string;
  qualification: string;
  lead_score: number;
  potential_value: number;
  conversion_probability: number;
  assigned_to: string | null;
  ai_agent_id: string | null;
  last_activity_at: string | null;
  next_activity_at: string | null;
  notes: string | null;
  tags: string[] | null;
  custom_fields: Record<string, unknown>;
  converted_contact_id: string | null;
  converted_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pipeline {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  org_id: string;
  pipeline_id: string;
  name: string;
  probability: number;
  sort_order: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  org_id: string;
  name: string;
  value: number;
  currency: string;
  probability: number;
  expected_revenue: number;
  closing_date: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  owner_id: string | null;
  status: string;
  won_reason: string | null;
  lost_reason: string | null;
  competitors: string[] | null;
  notes: string | null;
  tags: string[] | null;
  custom_fields: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  stage?: PipelineStage | null;
  contact?: Contact | null;
  company?: Company | null;
}

export interface Activity {
  id: string;
  org_id: string;
  type: string;
  title: string;
  description: string | null;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  lead_id: string | null;
  user_id: string | null;
  ai_agent_id: string | null;
  performed_by: string;
  scheduled_at: string | null;
  completed_at: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assignee_id: string | null;
  ai_agent_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  related_type: string | null;
  related_id: string | null;
  created_by: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  org_id: string;
  name: string;
  sku: string | null;
  category: string | null;
  type: string;
  description: string | null;
  price: number;
  currency: string;
  tax_rate: number;
  status: string;
  stock: number | null;
  attachments: unknown[];
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  org_id: string;
  invoice_number: string;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  order_id: string | null;
  status: string;
  payment_status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  terms: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
  contact?: Contact | null;
  company?: Company | null;
}

export interface Ticket {
  id: string;
  org_id: string;
  ticket_number: string;
  subject: string;
  description: string | null;
  contact_id: string | null;
  company_id: string | null;
  priority: string;
  status: string;
  category: string | null;
  department: string | null;
  assigned_to: string | null;
  ai_agent_id: string | null;
  sla_due_at: string | null;
  resolved_at: string | null;
  internal_notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  contact?: Contact | null;
  company?: Company | null;
}

export interface Campaign {
  id: string;
  org_id: string;
  name: string;
  type: string;
  status: string;
  channel: string;
  audience: string | null;
  subject: string | null;
  content: string | null;
  template: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  currency: string;
  spent: number;
  metrics: Record<string, unknown>;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIAgent {
  id: string;
  org_id: string;
  name: string;
  role: string;
  description: string | null;
  capabilities: string[] | null;
  permissions: Record<string, unknown>;
  enabled: boolean;
  approval_required: boolean;
  risk_level: string;
  performance: Record<string, unknown>;
  usage_count: number;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AITask {
  id: string;
  org_id: string;
  agent_id: string | null;
  title: string;
  instruction: string | null;
  status: string;
  priority: string;
  risk_level: string;
  plan: unknown[];
  result: unknown;
  progress: number;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  related_type: string | null;
  related_id: string | null;
  requested_by: string | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  agent?: AIAgent | null;
}

export interface Approval {
  id: string;
  org_id: string;
  ai_task_id: string;
  agent_name: string | null;
  action_type: string;
  description: string;
  details: Record<string, unknown>;
  risk_level: string;
  status: string;
  decided_by: string | null;
  decided_at: string | null;
  decision: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  org_id: string;
  actor_type: string;
  actor_name: string | null;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  changes: Record<string, unknown>;
  reason: string | null;
  source: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  org_id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Integration {
  id: string;
  org_id: string;
  provider: string;
  category: string | null;
  status: string;
  connected_at: string | null;
  last_sync_at: string | null;
  config: Record<string, unknown>;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  trigger_type: string | null;
  trigger_config: Record<string, unknown>;
  conditions: unknown[];
  actions: unknown[];
  enabled: boolean;
  run_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: string;
  org_id: string;
  workflow_id: string;
  status: string;
  trigger_data: Record<string, unknown>;
  steps: unknown[];
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AIMemory {
  id: string;
  org_id: string;
  type: string;
  key: string;
  value: string;
  category: string | null;
  enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  org_id: string;
  title: string;
  type: string | null;
  category: string | null;
  description: string | null;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  org_id: string;
  name: string;
  key_prefix: string | null;
  permissions: Record<string, unknown>;
  last_used_at: string | null;
  expires_at: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Webhook {
  id: string;
  org_id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string | null;
  last_triggered_at: string | null;
  last_response_code: number | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  plan: Plan;
  status: 'trialing' | 'active' | 'expired' | 'cancelled';
  price_cents: number;
  currency: string;
  billing_cycle: 'monthly' | 'annual';
  flutterwave_tx_ref: string | null;
  flutterwave_payment_id: string | null;
  flutterwave_plan_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}
