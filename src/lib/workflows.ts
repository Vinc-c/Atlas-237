import { supabase } from '@/lib/supabase';
import { triggerWebhooks, WEBHOOK_EVENTS, type WebhookEvent } from '@/lib/webhooks';
import type { Workflow } from '@/types';

/**
 * The vocabulary of things a workflow can actually do. Kept small and each
 * one maps directly onto a real, already-existing table — no action type
 * here is invented UI with nothing behind it. Extending this list is how
 * future workflow capabilities should be added (not a parallel "fake"
 * mechanism), so `runWorkflow` below stays the single real executor.
 */
export type WorkflowActionType = 'create_task' | 'create_notification' | 'trigger_webhook';

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
}

export const WORKFLOW_ACTION_TYPES: { value: WorkflowActionType; label: { fr: string; en: string } }[] = [
  { value: 'create_task', label: { fr: 'Créer une tâche', en: 'Create a task' } },
  { value: 'create_notification', label: { fr: 'Créer une notification', en: 'Create a notification' } },
  { value: 'trigger_webhook', label: { fr: 'Déclencher un webhook', en: 'Trigger a webhook' } },
];

export { WEBHOOK_EVENTS };

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
 * tables (tasks, notifications) or the real webhook-delivery path — this is
 * what makes "Run now" a genuine action rather than a no-op status change.
 * Every step is attempted even if an earlier one fails, so one bad action
 * doesn't hide whether the others worked; the aggregate `status` reflects
 * whether all, some, or none of them succeeded.
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
      switch (action.type) {
        case 'create_task': {
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
          break;
        }
        case 'create_notification': {
          const { error } = await supabase.from('notifications').insert({
            user_id: userId,
            type: 'workflow',
            title: action.title || workflow.name,
            message: action.message || null,
            link: '/app/ai-workflows',
          });
          if (error) throw error;
          steps.push({ action: action.type, ok: true, detail: `Notification "${action.title || workflow.name}" sent` });
          break;
        }
        case 'trigger_webhook': {
          if (!action.event) throw new Error('No event selected for this webhook action');
          await triggerWebhooks(action.event, {
            workflow_id: workflow.id,
            workflow_name: workflow.name,
            triggered_manually: true,
          });
          steps.push({ action: action.type, ok: true, detail: `Fired "${action.event}" to subscribed webhooks` });
          break;
        }
        default:
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
 * shown in the UI isn't invented), and bumps run_count — the same counter
 * the UI already displayed, previously always stuck at 0 because nothing
 * ever incremented it.
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
