import { supabase } from '@/lib/supabase';
import { triggerWebhooks, WEBHOOK_EVENTS, type WebhookEvent } from '@/lib/webhooks';
import type { Workflow } from '@/types';

/**
 * The vocabulary of things a workflow can actually do. Kept small and each
 * one maps directly onto a real, already-existing table or a real outbound
 * call in supabase/functions/integration-action — no action type here is
 * invented UI with nothing behind it. Extending this list is how future
 * workflow capabilities should be added (not a parallel "fake" mechanism),
 * so `runWorkflow` below stays the single real executor.
 */
export type WorkflowActionType =
  | 'create_task' | 'create_notification' | 'trigger_webhook'
  | 'send_telegram' | 'send_sms' | 'mailchimp_subscribe' | 'call_custom_app'
  | 'send_whatsapp' | 'hubspot_upsert_contact' | 'freshdesk_create_ticket'
  | 'mollie_create_payment' | 'cinetpay_create_payment' | 'wave_create_checkout'
  | 'chapa_initialize' | 'campay_collect' | 'shopify_create_customer' | 'woocommerce_create_customer';

export interface WorkflowAction {
  type: WorkflowActionType;
  /** create_task, create_notification */
  title?: string;
  /** create_task */
  description?: string;
  due_in_days?: number;
  /** create_notification */
  message?: string;
  /** trigger_webhook */
  event?: WebhookEvent;
  /** call_custom_app: which saved Custom App to call */
  integration_id?: string;
  /**
   * Generic key/value params for every integration-backed action (send_sms,
   * send_whatsapp, hubspot_upsert_contact, the payment-gateway actions,
   * call_custom_app's path/method, etc.) — see WORKFLOW_PARAM_FIELDS for
   * which keys each action type expects. Keeps this interface from growing
   * one bespoke field per provider.
   */
  params?: Record<string, string>;
}

export const WORKFLOW_ACTION_TYPES: { value: WorkflowActionType; label: { fr: string; en: string } }[] = [
  { value: 'create_task', label: { fr: 'Créer une tâche', en: 'Create a task' } },
  { value: 'create_notification', label: { fr: 'Créer une notification', en: 'Create a notification' } },
  { value: 'trigger_webhook', label: { fr: 'Déclencher un webhook', en: 'Trigger a webhook' } },
  { value: 'send_telegram', label: { fr: 'Envoyer un message Telegram', en: 'Send a Telegram message' } },
  { value: 'send_sms', label: { fr: 'Envoyer un SMS (Twilio)', en: 'Send an SMS (Twilio)' } },
  { value: 'send_whatsapp', label: { fr: 'Envoyer un message WhatsApp', en: 'Send a WhatsApp message' } },
  { value: 'mailchimp_subscribe', label: { fr: 'Ajouter à une liste Mailchimp', en: 'Add to a Mailchimp list' } },
  { value: 'hubspot_upsert_contact', label: { fr: 'Créer un contact HubSpot', en: 'Create a HubSpot contact' } },
  { value: 'freshdesk_create_ticket', label: { fr: 'Créer un ticket Freshdesk', en: 'Create a Freshdesk ticket' } },
  { value: 'shopify_create_customer', label: { fr: 'Créer un client Shopify', en: 'Create a Shopify customer' } },
  { value: 'woocommerce_create_customer', label: { fr: 'Créer un client WooCommerce', en: 'Create a WooCommerce customer' } },
  { value: 'mollie_create_payment', label: { fr: 'Créer un paiement Mollie', en: 'Create a Mollie payment' } },
  { value: 'cinetpay_create_payment', label: { fr: 'Créer un paiement CinetPay', en: 'Create a CinetPay payment' } },
  { value: 'wave_create_checkout', label: { fr: 'Créer un paiement Wave', en: 'Create a Wave checkout' } },
  { value: 'chapa_initialize', label: { fr: 'Créer un paiement Chapa', en: 'Create a Chapa payment' } },
  { value: 'campay_collect', label: { fr: 'Collecter un paiement CamPay', en: 'Collect a CamPay payment' } },
  { value: 'call_custom_app', label: { fr: 'Appeler une app personnalisée', en: 'Call a Custom App' } },
];

/** Which integration provider each action needs connected — drives the "not connected yet" warning in the workflow editor. */
export const WORKFLOW_ACTION_PROVIDER: Partial<Record<WorkflowActionType, string>> = {
  send_telegram: 'telegram',
  send_sms: 'twilio',
  mailchimp_subscribe: 'mailchimp',
  send_whatsapp: 'whatsapp',
  hubspot_upsert_contact: 'hubspot',
  freshdesk_create_ticket: 'freshdesk',
  mollie_create_payment: 'mollie',
  cinetpay_create_payment: 'cinetpay',
  wave_create_checkout: 'wave',
  chapa_initialize: 'chapa',
  campay_collect: 'campay',
  shopify_create_customer: 'shopify',
  woocommerce_create_customer: 'woocommerce',
};

/** Field schema per action type, used to render the right inputs in the workflow editor. Matches exactly what supabase/functions/integration-action/index.ts reads from `params`. */
export const WORKFLOW_PARAM_FIELDS: Partial<Record<WorkflowActionType, { key: string; label: { fr: string; en: string }; placeholder?: string }[]>> = {
  send_sms: [
    { key: 'to', label: { fr: 'Numéro destinataire', en: 'To (phone number)' }, placeholder: '+15551234567' },
    { key: 'message', label: { fr: 'Message', en: 'Message' } },
  ],
  send_whatsapp: [
    { key: 'to', label: { fr: 'Numéro (avec indicatif)', en: 'Phone number (with country code)' }, placeholder: '2376xxxxxxxx' },
    { key: 'message', label: { fr: 'Message', en: 'Message' } },
  ],
  mailchimp_subscribe: [
    { key: 'list_id', label: { fr: 'ID de liste (audience)', en: 'List (audience) ID' } },
    { key: 'email', label: { fr: 'Email', en: 'Email' } },
  ],
  hubspot_upsert_contact: [
    { key: 'email', label: { fr: 'Email', en: 'Email' } },
    { key: 'firstname', label: { fr: 'Prénom', en: 'First name' } },
    { key: 'lastname', label: { fr: 'Nom', en: 'Last name' } },
  ],
  freshdesk_create_ticket: [
    { key: 'subject', label: { fr: 'Sujet', en: 'Subject' } },
    { key: 'description', label: { fr: 'Description', en: 'Description' } },
    { key: 'email', label: { fr: 'Email du client', en: 'Customer email' } },
  ],
  shopify_create_customer: [
    { key: 'email', label: { fr: 'Email', en: 'Email' } },
    { key: 'first_name', label: { fr: 'Prénom', en: 'First name' } },
    { key: 'last_name', label: { fr: 'Nom', en: 'Last name' } },
  ],
  woocommerce_create_customer: [
    { key: 'email', label: { fr: 'Email', en: 'Email' } },
    { key: 'first_name', label: { fr: 'Prénom', en: 'First name' } },
    { key: 'last_name', label: { fr: 'Nom', en: 'Last name' } },
  ],
  mollie_create_payment: [
    { key: 'amount', label: { fr: 'Montant', en: 'Amount' }, placeholder: '10.00' },
    { key: 'currency', label: { fr: 'Devise', en: 'Currency' }, placeholder: 'EUR' },
    { key: 'description', label: { fr: 'Description', en: 'Description' } },
  ],
  cinetpay_create_payment: [
    { key: 'amount', label: { fr: 'Montant', en: 'Amount' }, placeholder: '5000' },
    { key: 'currency', label: { fr: 'Devise', en: 'Currency' }, placeholder: 'XOF' },
    { key: 'description', label: { fr: 'Description', en: 'Description' } },
  ],
  wave_create_checkout: [
    { key: 'amount', label: { fr: 'Montant', en: 'Amount' }, placeholder: '5000' },
    { key: 'currency', label: { fr: 'Devise', en: 'Currency' }, placeholder: 'XOF' },
  ],
  chapa_initialize: [
    { key: 'amount', label: { fr: 'Montant', en: 'Amount' }, placeholder: '100' },
    { key: 'email', label: { fr: 'Email du client', en: 'Customer email' } },
    { key: 'first_name', label: { fr: 'Prénom', en: 'First name' } },
    { key: 'last_name', label: { fr: 'Nom', en: 'Last name' } },
  ],
  campay_collect: [
    { key: 'amount', label: { fr: 'Montant', en: 'Amount' }, placeholder: '1000' },
    { key: 'phone_number', label: { fr: 'Numéro de téléphone', en: 'Phone number' }, placeholder: '2376xxxxxxxx' },
    { key: 'description', label: { fr: 'Description', en: 'Description' } },
  ],
  call_custom_app: [
    { key: 'path', label: { fr: 'Chemin (ex: /webhook)', en: 'Path (e.g. /webhook)' } },
    { key: 'method', label: { fr: 'Méthode HTTP', en: 'HTTP method' }, placeholder: 'POST' },
  ],
};

export { WEBHOOK_EVENTS };

/**
 * Calls the `integration-action` edge function, which performs a real
 * outbound call to a connected marketplace app using that org's stored
 * credentials — see supabase/functions/integration-action/index.ts. This is
 * what makes every action in WORKFLOW_ACTION_PROVIDER real instead of
 * another layer of stored-but-unused configuration.
 */
async function callIntegrationAction(action: string, params: Record<string, unknown>, integrationId?: string): Promise<{ ok: boolean; msg: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token || '';
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, params, integration_id: integrationId }),
    });
    const result = await res.json().catch(() => null);
    return { ok: Boolean(result?.ok), msg: result?.msg || `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, msg: e instanceof Error ? e.message : 'Request failed' };
  }
}

export interface WorkflowRunStep {
  action: WorkflowActionType;
  ok: boolean;
  detail: string;
}

export interface WorkflowRunResult {
  status: 'success' | 'partial' | 'error';
  steps: WorkflowRunStep[];
  error: string | null;
}

/**
 * Actually executes a workflow's configured actions in order, against real
 * tables (tasks, notifications), the real webhook-delivery path, or a real
 * connected marketplace app — this is what makes "Run now" a genuine action
 * rather than a no-op status change. Every step is attempted even if an
 * earlier one fails, so one bad action doesn't hide whether the others
 * worked; the aggregate `status` reflects whether all, some, or none of
 * them succeeded.
 */
export async function runWorkflow(workflow: Workflow, userId: string | null): Promise<WorkflowRunResult> {
  const actions = (Array.isArray(workflow.actions) ? workflow.actions : []) as WorkflowAction[];
  const steps: WorkflowRunStep[] = [];

  if (actions.length === 0) {
    return {
      status: 'error',
      steps: [],
      error: 'No actions configured for this workflow — add at least one action before running it.',
    };
  }

  for (const action of actions) {
    try {
      if (action.type === 'create_task') {
        const dueDate = action.due_in_days
          ? new Date(Date.now() + action.due_in_days * 24 * 60 * 60 * 1000).toISOString()
          : null;
        const { error } = await supabase.from('tasks').insert({
          title: action.title || workflow.name,
          description: action.description || `Created by workflow "${workflow.name}"`,
          due_date: dueDate,
          related_type: 'workflow',
          related_id: workflow.id,
          created_by: userId,
        });
        if (error) throw error;
        steps.push({ action: action.type, ok: true, detail: `Task "${action.title || workflow.name}" created` });
      } else if (action.type === 'create_notification') {
        const { error } = await supabase.from('notifications').insert({
          user_id: userId,
          type: 'workflow',
          title: action.title || workflow.name,
          message: action.message || null,
          link: '/app/ai-workflows',
        });
        if (error) throw error;
        steps.push({ action: action.type, ok: true, detail: `Notification "${action.title || workflow.name}" sent` });
      } else if (action.type === 'trigger_webhook') {
        if (!action.event) throw new Error('No event selected for this webhook action');
        await triggerWebhooks(action.event, {
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          triggered_manually: true,
        });
        steps.push({ action: action.type, ok: true, detail: `Fired "${action.event}" to subscribed webhooks` });
      } else if (action.type === 'call_custom_app') {
        if (!action.integration_id) throw new Error('No Custom App selected for this action');
        const result = await callIntegrationAction('call_custom_app', action.params || {}, action.integration_id);
        steps.push({ action: action.type, ok: result.ok, detail: result.msg });
      } else if (WORKFLOW_ACTION_PROVIDER[action.type]) {
        const result = await callIntegrationAction(action.type, action.params || {});
        steps.push({ action: action.type, ok: result.ok, detail: result.msg });
      } else {
        steps.push({ action: action.type, ok: false, detail: `Unknown action type: ${action.type}` });
      }
    } catch (e) {
      steps.push({ action: action.type, ok: false, detail: e instanceof Error ? e.message : 'Action failed' });
    }
  }

  const successCount = steps.filter((s) => s.ok).length;
  const status: WorkflowRunResult['status'] =
    successCount === steps.length ? 'success' : successCount === 0 ? 'error' : 'partial';

  return {
    status,
    steps,
    error: status === 'error' ? (steps.find((s) => !s.ok)?.detail ?? 'All actions failed') : null,
  };
}

/**
 * Runs the workflow, persists a real workflow_runs row (so the run history
 * shown in the UI isn't invented), and bumps run_count.
 */
export async function executeAndLogWorkflow(workflow: Workflow, userId: string | null): Promise<WorkflowRunResult> {
  const startedAt = new Date().toISOString();
  const result = await runWorkflow(workflow, userId);
  const completedAt = new Date().toISOString();

  await supabase.from('workflow_runs').insert({
    workflow_id: workflow.id,
    status: result.status === 'success' ? 'completed' : result.status === 'partial' ? 'completed' : 'failed',
    trigger_data: { manual: true, triggered_by: userId },
    steps: result.steps,
    error: result.error,
    started_at: startedAt,
    completed_at: completedAt,
  });

  await supabase.from('workflows').update({ run_count: (workflow.run_count || 0) + 1 }).eq('id', workflow.id);

  return result;
}
