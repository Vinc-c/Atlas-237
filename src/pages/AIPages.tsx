import { useEffect, useState } from 'react';
import { Bot, ListTodo, Workflow, Brain, BookOpen, CheckSquare, Zap, Check, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { ListPage, type FormField } from '@/components/ListPage';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { Modal } from '@/components/Modal';
import type { AIAgent, AITask, Approval, AIMemory, KnowledgeDocument, Workflow as WorkflowType, WorkflowRun } from '@/types';
import { usePlanAccess } from '@/lib/plans';
import { UpgradeGate } from '@/components/UpgradeGate';
import { WORKFLOW_ACTION_TYPES, WORKFLOW_ACTION_PROVIDER, WORKFLOW_PARAM_FIELDS, WEBHOOK_EVENTS, executeAndLogWorkflow, type WorkflowAction, type WorkflowRunResult } from '@/lib/workflows';

export function AIEmployeesPage() {
  const { language } = useAuth();
  const { features } = usePlanAccess();
  const maxRows = features.maxAIEmployees === 'unlimited' ? null : features.maxAIEmployees;
  const fields: FormField[] = [
    { key: 'name', label: t('common.name', language), type: 'text', required: true },
    { key: 'role', label: t('list.role', language), type: 'text', required: true },
    { key: 'description', label: t('list.description', language), type: 'textarea' },
    { key: 'risk_level', label: t('list.riskLevel', language), type: 'select', options: [
      { value: 'low', label: t('status.low', language) }, { value: 'medium', label: t('status.medium', language) }, { value: 'high', label: t('status.high', language) },
    ], defaultValue: 'low' },
    { key: 'enabled', label: t('list.enabled', language), type: 'select', options: [
      { value: 'true', label: t('status.yes', language) }, { value: 'false', label: t('status.no', language) },
    ], defaultValue: 'true' },
  ];

  return (
    <ListPage<AIAgent>
      table="ai_agents"
      title={t('nav.aiEmployees', language)}
      columns={[
        { key: 'name', label: t('common.name', language), render: (r) => (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${r.enabled ? 'bg-success-500 animate-pulse' : 'bg-ink-300'}`} />
            <span className="font-medium text-ink-800">{r.name}</span>
          </div>
        )},
        { key: 'role', label: t('list.role', language), render: (r) => r.role },
        { key: 'risk_level', label: t('list.riskLevel', language), render: (r) => <Badge variant={r.risk_level === 'high' ? 'error' : r.risk_level === 'medium' ? 'warning' : 'success'}>{r.risk_level}</Badge> },
        { key: 'usage_count', label: t('list.tasksDone', language), render: (r) => r.usage_count },
      ]}
      formFields={fields}
      emptyIcon={<Bot size={28} />}
      emptyTitle={t('empty.noAiEmployees', language)}
      emptyDescription={t('empty.noAiEmployeesDesc', language)}
      orderBy="created_at"
      maxRows={maxRows}
      maxRowsMessage={maxRows != null ? (language === 'fr'
        ? `Limite de ${maxRows} employés IA atteinte pour votre plan. Passez à un plan supérieur pour en ajouter davantage.`
        : `You've reached the ${maxRows}-AI-employee limit for your plan. Upgrade to add more.`) : undefined}
    />
  );
}

export function AITasksPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'title', label: t('list.title', language), type: 'text', required: true },
    { key: 'instruction', label: t('list.instruction', language), type: 'textarea' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'pending', label: t('status.pending', language) }, { value: 'in_progress', label: t('status.inProgress', language) }, { value: 'completed', label: t('status.completed', language) }, { value: 'failed', label: t('status.failed', language) },
    ], defaultValue: 'pending' },
    { key: 'priority', label: t('list.priority', language), type: 'select', options: [
      { value: 'low', label: t('status.low', language) }, { value: 'medium', label: t('status.medium', language) }, { value: 'high', label: t('status.high', language) },
    ], defaultValue: 'medium' },
  ];

  return (
    <ListPage<AITask>
      table="ai_tasks"
      title={t('nav.aiTasks', language)}
      columns={[
        { key: 'title', label: t('list.title', language), render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'error' : r.status === 'in_progress' ? 'primary' : 'warning'}>{r.status}</Badge> },
        { key: 'priority', label: t('list.priority', language), render: (r) => <Badge variant={r.priority === 'high' ? 'error' : 'neutral'}>{r.priority}</Badge> },
        { key: 'progress', label: t('list.progress', language), render: (r) => (
          <div className="w-24 h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${r.progress}%` }} />
          </div>
        )},
      ]}
      formFields={fields}
      emptyIcon={<ListTodo size={28} />}
      emptyTitle={t('empty.noAiTasks', language)}
      emptyDescription={t('empty.noAiTasksDesc', language)}
      relations="*, agent:ai_agents(*)"
      orderBy="created_at"
    />
  );
}

export function ApprovalsPage() {
  const { language } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from('approvals').select('*').order('created_at', { ascending: false });
    setApprovals((data || []) as Approval[]);
    setLoading(false);
  }

  async function decide(id: string, decision: string) {
    const { error } = await supabase.from('approvals').update({ status: decision === 'approved' ? 'approved' : 'rejected', decided_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert(error.message); return; }
    load();
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.approvals', language)} subtitle="" />
      {approvals.length === 0 ? (
        <div className="card">
          <EmptyState icon={<CheckSquare size={28} />} title={t('empty.noApprovals', language)} description={t('empty.noApprovalsDesc', language)} />
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map(ap => (
            <div key={ap.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                  ap.risk_level === 'high' ? 'bg-error-50 text-error-600' : ap.risk_level === 'medium' ? 'bg-warning-50 text-warning-600' : 'bg-success-50 text-success-600'
                }`}>
                  <Zap size={18} />
                </div>
                <div>
                  <p className="font-medium text-ink-800">{ap.description}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{ap.agent_name} · {ap.action_type} · <Badge variant={ap.risk_level === 'high' ? 'error' : 'warning'}>{ap.risk_level}</Badge></p>
                </div>
              </div>
              {ap.status === 'pending' ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => decide(ap.id, 'approved')} className="btn-sm bg-success-600 text-white hover:bg-success-700 px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-medium">
                    <Check size={14} /> {t('common.approve', language)}
                  </button>
                  <button onClick={() => decide(ap.id, 'rejected')} className="btn-sm bg-error-500 text-white hover:bg-error-600 px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-medium">
                    <X size={14} /> {t('common.reject', language)}
                  </button>
                </div>
              ) : (
                <Badge variant={ap.status === 'approved' ? 'success' : 'error'}>{ap.status}</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AIWorkflowsPage() {
  const { language, profile } = useAuth();
  const lang = language;
  const { hasFeature: hasPlanFeature } = usePlanAccess();
  const allowed = hasPlanFeature('workflowAutomation');
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('manual');
  const [enabled, setEnabled] = useState(true);
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<Record<string, WorkflowRunResult>>({});
  const [customApps, setCustomApps] = useState<{ id: string; name: string }[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [agentId, setAgentId] = useState('');

  useEffect(() => { if (allowed) load(); else setLoading(false); }, [allowed]);

  async function load() {
    const [wfRes, runsRes, integRes, agentsRes] = await Promise.all([
      supabase.from('workflows').select('*').order('created_at', { ascending: false }),
      supabase.from('workflow_runs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('integrations').select('id, provider, config').eq('status', 'connected'),
      supabase.from('ai_agents').select('id, name').order('name'),
    ]);
    setWorkflows((wfRes.data || []) as WorkflowType[]);
    setRuns((runsRes.data || []) as WorkflowRun[]);
    const integs = (integRes.data || []) as { id: string; provider: string; config: Record<string, unknown> }[];
    setCustomApps(integs.filter(i => i.config?.is_custom).map(i => ({ id: i.id, name: String(i.config?.display_name || i.provider) })));
    setConnectedProviders(new Set(integs.map(i => i.provider)));
    setAgents((agentsRes.data || []) as { id: string; name: string }[]);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setName(''); setDescription(''); setTriggerType('manual'); setEnabled(true); setAgentId('');
    setActions([{ type: 'create_task', title: '' }]);
    setModalOpen(true);
  }

  function openEdit(wf: WorkflowType) {
    setEditing(wf);
    setName(wf.name); setDescription(wf.description || ''); setTriggerType(wf.trigger_type || 'manual'); setEnabled(wf.enabled); setAgentId(wf.agent_id || '');
    setActions((Array.isArray(wf.actions) && wf.actions.length > 0 ? wf.actions : [{ type: 'create_task', title: '' }]) as WorkflowAction[]);
    setModalOpen(true);
  }

  function updateAction(i: number, patch: Partial<WorkflowAction>) {
    setActions(prev => prev.map((a, idx) => idx === i ? { ...a, ...patch } : a));
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      trigger_type: triggerType,
      enabled,
      actions,
      agent_id: agentId || null,
    };
    const { error } = editing
      ? await supabase.from('workflows').update(payload).eq('id', editing.id)
      : await supabase.from('workflows').insert(payload);
    setSaving(false);
    if (error) { alert(error.message); return; }
    setModalOpen(false);
    load();
  }

  async function toggleEnabled(wf: WorkflowType) {
    const { error } = await supabase.from('workflows').update({ enabled: !wf.enabled }).eq('id', wf.id);
    if (error) { alert(error.message); return; }
    setWorkflows(prev => prev.map(w => w.id === wf.id ? { ...w, enabled: !w.enabled } : w));
  }

  async function remove(wf: WorkflowType) {
    if (!confirm(t('list.deleteConfirm', lang))) return;
    const { error } = await supabase.from('workflows').delete().eq('id', wf.id);
    if (error) { alert(error.message); return; }
    load();
  }

  async function runNow(wf: WorkflowType) {
    setRunning(wf.id);
    const result = await executeAndLogWorkflow(wf, profile?.id || null);
    setRunResult(prev => ({ ...prev, [wf.id]: result }));
    setRunning(null);
    load();
  }

  if (!allowed) return <UpgradeGate language={lang} feature={t('nav.aiWorkflows', lang)} minPlan="growth" />;
  if (loading) return <Loading text={t('common.loading', lang)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.aiWorkflows', lang)}
        subtitle={lang === 'fr' ? 'Chaque flux exécute de vraies actions — création de tâches, notifications et déclenchement de vos webhooks connectés.' : 'Each workflow runs real actions — creating tasks, sending notifications, and firing your connected webhooks.'}
        actions={<button onClick={openCreate} className="btn-primary btn-sm"><Plus size={16} /> {lang === 'fr' ? 'Nouveau flux' : 'New workflow'}</button>}
      />

      {workflows.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Workflow size={28} />} title={t('empty.noWorkflows', lang)} description={t('empty.noWorkflowsDesc', lang)}
            action={<button onClick={openCreate} className="btn-primary btn-sm">{lang === 'fr' ? 'Créer un flux' : 'Create a workflow'}</button>} />
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map(wf => {
            const lastRun = runs.find(r => r.workflow_id === wf.id);
            const result = runResult[wf.id];
            return (
              <div key={wf.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink-800">{wf.name}</span>
                      <Badge variant={wf.enabled ? 'success' : 'neutral'}>{wf.enabled ? t('status.yes', lang) : t('status.no', lang)}</Badge>
                      <Badge variant="neutral">{wf.trigger_type || 'manual'}</Badge>
                    </div>
                    {wf.description && <p className="text-sm text-ink-500 mt-1">{wf.description}</p>}
                    <p className="text-xs text-ink-400 mt-1.5">
                      {(Array.isArray(wf.actions) ? wf.actions.length : 0)} {lang === 'fr' ? 'action(s)' : 'action(s)'} · {wf.run_count || 0} {t('list.runs', lang).toLowerCase()}
                      {wf.agent_id && agents.find(a => a.id === wf.agent_id) && <> · {agents.find(a => a.id === wf.agent_id)?.name}</>}
                      {lastRun && <> · {lang === 'fr' ? 'dernière exécution' : 'last run'}: <Badge variant={lastRun.status === 'completed' ? 'success' : 'error'}>{lastRun.status}</Badge></>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => runNow(wf)} disabled={running === wf.id} className="btn-secondary btn-sm">
                      {running === wf.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} {lang === 'fr' ? 'Exécuter' : 'Run now'}
                    </button>
                    <button onClick={() => toggleEnabled(wf)} className="btn-ghost btn-sm">{wf.enabled ? (lang === 'fr' ? 'Désactiver' : 'Disable') : (lang === 'fr' ? 'Activer' : 'Enable')}</button>
                    <button onClick={() => openEdit(wf)} className="btn-ghost btn-sm">{t('common.edit', lang)}</button>
                    <button onClick={() => remove(wf)} className="btn-ghost btn-sm text-error-600"><Trash2 size={14} /></button>
                  </div>
                </div>
                {result && (
                  <div className={`mt-3 rounded-lg border p-3 text-xs ${result.status === 'success' ? 'border-success-200 bg-success-50' : result.status === 'partial' ? 'border-warning-200 bg-warning-50' : 'border-error-200 bg-error-50'}`}>
                    {result.steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        {s.ok ? <Check size={12} className="text-success-600" /> : <X size={12} className="text-error-600" />}
                        <span className="font-medium">{s.action}</span>: {s.detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit', lang) : (lang === 'fr' ? 'Nouveau flux' : 'New workflow')} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">{t('common.name', lang)}</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">{t('list.description', lang)}</label>
            <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('list.trigger', lang)}</label>
              <select className="input" value={triggerType} onChange={e => setTriggerType(e.target.value)}>
                <option value="manual">{t('status.manual', lang)}</option>
                <option value="schedule">{t('status.schedule', lang)}</option>
                <option value="event">{t('status.event', lang)}</option>
                <option value="webhook">{t('status.webhook', lang)}</option>
              </select>
              {triggerType !== 'manual' && (
                <p className="text-xs text-ink-400 mt-1">
                  {lang === 'fr' ? 'Seul le déclenchement manuel ("Exécuter") lance réellement ce flux aujourd\'hui — planification et écoute d\'événements ne sont pas encore automatisées.' : 'Only the manual trigger ("Run now") actually runs this workflow today — scheduled and event-based triggers aren\'t automated yet.'}
                </p>
              )}
            </div>
            <div>
              <label className="label">{t('list.enabled', lang)}</label>
              <select className="input" value={enabled ? 'true' : 'false'} onChange={e => setEnabled(e.target.value === 'true')}>
                <option value="true">{t('status.yes', lang)}</option>
                <option value="false">{t('status.no', lang)}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">{lang === 'fr' ? 'Assigner à un employé IA (optionnel)' : 'Assign to an AI Employee (optional)'}</label>
            <select className="input" value={agentId} onChange={e => setAgentId(e.target.value)}>
              <option value="">{lang === 'fr' ? 'Aucun' : 'None'}</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <p className="text-xs text-ink-400 mt-1">{lang === 'fr' ? "Chaque exécution réussie de ce flux compte comme une tâche réalisée par cet employé IA." : "Each successful run of this workflow counts as a real task completed by that AI Employee."}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">{lang === 'fr' ? 'Actions' : 'Actions'}</label>
              <button type="button" onClick={() => setActions(prev => [...prev, { type: 'create_task', title: '' }])} className="btn-ghost btn-sm"><Plus size={14} /> {lang === 'fr' ? 'Ajouter' : 'Add'}</button>
            </div>
            <div className="space-y-3">
              {actions.map((action, i) => (
                <div key={i} className="rounded-lg border border-ink-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <select className="input flex-1" value={action.type} onChange={e => updateAction(i, { type: e.target.value as WorkflowAction['type'] })}>
                      {WORKFLOW_ACTION_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label[lang === 'fr' ? 'fr' : 'en']}</option>)}
                    </select>
                    <button type="button" onClick={() => setActions(prev => prev.filter((_, idx) => idx !== i))} className="btn-ghost btn-sm text-error-600"><Trash2 size={14} /></button>
                  </div>
                  {(action.type === 'create_task' || action.type === 'create_notification') && (
                    <input className="input mb-2" placeholder={lang === 'fr' ? 'Titre' : 'Title'} value={action.title || ''} onChange={e => updateAction(i, { title: e.target.value })} />
                  )}
                  {action.type === 'create_task' && (
                    <div className="grid grid-cols-2 gap-2">
                      <input className="input" placeholder={lang === 'fr' ? 'Description' : 'Description'} value={action.description || ''} onChange={e => updateAction(i, { description: e.target.value })} />
                      <input className="input" type="number" min={0} placeholder={lang === 'fr' ? "Échéance (jours)" : 'Due in (days)'} value={action.due_in_days ?? ''} onChange={e => updateAction(i, { due_in_days: e.target.value ? Number(e.target.value) : undefined })} />
                    </div>
                  )}
                  {action.type === 'create_notification' && (
                    <input className="input" placeholder={lang === 'fr' ? 'Message' : 'Message'} value={action.message || ''} onChange={e => updateAction(i, { message: e.target.value })} />
                  )}
                  {action.type === 'trigger_webhook' && (
                    <select className="input" value={action.event || ''} onChange={e => updateAction(i, { event: e.target.value as WorkflowAction['event'] })}>
                      <option value="">{lang === 'fr' ? "Choisir un événement…" : 'Choose an event…'}</option>
                      {WEBHOOK_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    </select>
                  )}
                  {action.type === 'call_custom_app' && (
                    customApps.length === 0 ? (
                      <p className="text-xs text-warning-600 mb-2">{lang === 'fr' ? "Aucune app personnalisée connectée — ajoutez-en une dans Marketplace." : 'No Custom App connected yet — add one from the Marketplace.'}</p>
                    ) : (
                      <select className="input mb-2" value={action.integration_id || ''} onChange={e => updateAction(i, { integration_id: e.target.value })}>
                        <option value="">{lang === 'fr' ? 'Choisir une app…' : 'Choose an app…'}</option>
                        {customApps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    )
                  )}
                  {WORKFLOW_ACTION_PROVIDER[action.type] && !connectedProviders.has(WORKFLOW_ACTION_PROVIDER[action.type]!) && (
                    <p className="text-xs text-warning-600 mb-2">
                      {lang === 'fr'
                        ? `${WORKFLOW_ACTION_PROVIDER[action.type]} non connecté — connectez-le dans Marketplace pour que cette action fonctionne.`
                        : `${WORKFLOW_ACTION_PROVIDER[action.type]} not connected — connect it in the Marketplace for this action to work.`}
                    </p>
                  )}
                  {WORKFLOW_PARAM_FIELDS[action.type] && (
                    <div className={`grid gap-2 ${WORKFLOW_PARAM_FIELDS[action.type]!.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {WORKFLOW_PARAM_FIELDS[action.type]!.map(field => (
                        <input
                          key={field.key}
                          className="input"
                          placeholder={`${field.label[lang === 'fr' ? 'fr' : 'en']}${field.placeholder ? ` (${field.placeholder})` : ''}`}
                          value={action.params?.[field.key] || ''}
                          onChange={e => updateAction(i, { params: { ...action.params, [field.key]: e.target.value } })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {actions.length === 0 && <p className="text-xs text-ink-400">{lang === 'fr' ? "Aucune action — ce flux ne fera rien tant que vous n'en ajoutez pas." : "No actions — this workflow won't do anything until you add one."}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
            <button onClick={save} disabled={saving || !name.trim()} className="btn-primary btn-sm">{saving ? '...' : t('common.save', lang)}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AIMemoryPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'type', label: t('list.type', language), type: 'text', required: true },
    { key: 'key', label: t('list.key', language), type: 'text', required: true },
    { key: 'value', label: t('list.value', language), type: 'textarea', required: true },
    { key: 'category', label: t('list.category', language), type: 'text' },
    { key: 'enabled', label: t('list.enabled', language), type: 'select', options: [
      { value: 'true', label: t('status.yes', language) }, { value: 'false', label: t('status.no', language) },
    ], defaultValue: 'true' },
  ];

  return (
    <ListPage<AIMemory>
      table="ai_memory"
      title={t('nav.aiMemory', language)}
      columns={[
        { key: 'key', label: t('list.key', language), render: (r) => <span className="font-medium text-ink-800">{r.key}</span> },
        { key: 'value', label: t('list.value', language), render: (r) => <span className="text-ink-600 truncate max-w-xs block">{r.value}</span> },
        { key: 'category', label: t('list.category', language), render: (r) => r.category || '—' },
        { key: 'enabled', label: t('list.enabled', language), render: (r) => <Badge variant={r.enabled ? 'success' : 'neutral'}>{r.enabled ? t('status.yes', language) : t('status.no', language)}</Badge> },
      ]}
      formFields={fields}
      emptyIcon={<Brain size={28} />}
      emptyTitle={t('empty.noMemories', language)}
      emptyDescription={t('empty.noMemoriesDesc', language)}
      orderBy="created_at"
    />
  );
}

export function KnowledgeBasePage() {
  const { language } = useAuth();
  const { hasFeature: hasPlanFeature } = usePlanAccess();
  const allowed = hasPlanFeature('knowledgeBase');
  const fields: FormField[] = [
    { key: 'title', label: t('list.title', language), type: 'text', required: true },
    { key: 'type', label: t('list.type', language), type: 'select', options: [
      { value: 'document', label: t('status.document', language) }, { value: 'url', label: t('status.url', language) }, { value: 'text', label: t('status.text', language) }, { value: 'faq', label: t('status.faq', language) },
    ], defaultValue: 'document' },
    { key: 'category', label: t('list.category', language), type: 'text' },
    { key: 'description', label: t('list.description', language), type: 'textarea' },
    { key: 'file_path', label: t('list.filePath', language), type: 'text' },
  ];

  return !allowed ? (
    <UpgradeGate language={language} feature={t('nav.knowledgeBase', language)} minPlan="pro" />
  ) : (
    <ListPage<KnowledgeDocument>
      table="knowledge_documents"
      title={t('nav.knowledgeBase', language)}
      columns={[
        { key: 'title', label: t('list.title', language), render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
        { key: 'type', label: t('list.type', language), render: (r) => <Badge variant="primary">{r.type || 'document'}</Badge> },
        { key: 'category', label: t('list.category', language), render: (r) => r.category || '—' },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant="success">{r.status}</Badge> },
      ]}
      formFields={fields}
      emptyIcon={<BookOpen size={28} />}
      emptyTitle={t('empty.noDocuments', language)}
      emptyDescription={t('empty.noDocumentsDesc', language)}
      orderBy="created_at"
    />
  );
}
