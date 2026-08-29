import { useEffect, useState } from 'react';
import { Bot, ListTodo, Workflow, Brain, BookOpen, CheckSquare, Zap, Check, X } from 'lucide-react';
import { ListPage, type FormField } from '@/components/ListPage';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import type { AIAgent, AITask, Approval, AIMemory, KnowledgeDocument, Workflow as WorkflowType } from '@/types';
import { usePlanAccess } from '@/lib/plans';
import { UpgradeGate } from '@/components/UpgradeGate';

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
  const { language } = useAuth();
  const { hasFeature: hasPlanFeature } = usePlanAccess();
  const allowed = hasPlanFeature('workflowAutomation');
  const fields: FormField[] = [
    { key: 'name', label: t('common.name', language), type: 'text', required: true },
    { key: 'description', label: t('list.description', language), type: 'textarea' },
    { key: 'trigger_type', label: t('list.trigger', language), type: 'select', options: [
      { value: 'manual', label: t('status.manual', language) }, { value: 'schedule', label: t('status.schedule', language) }, { value: 'event', label: t('status.event', language) }, { value: 'webhook', label: t('status.webhook', language) },
    ], defaultValue: 'manual' },
    { key: 'enabled', label: t('list.enabled', language), type: 'select', options: [
      { value: 'true', label: t('status.yes', language) }, { value: 'false', label: t('status.no', language) },
    ], defaultValue: 'true' },
  ];

  return !allowed ? (
    <UpgradeGate language={language} feature={t('nav.aiWorkflows', language)} minPlan="growth" />
  ) : (
    <ListPage<WorkflowType>
      table="workflows"
      title={t('nav.aiWorkflows', language)}
      columns={[
        { key: 'name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
        { key: 'trigger_type', label: t('list.trigger', language), render: (r) => r.trigger_type || '—' },
        { key: 'enabled', label: t('list.enabled', language), render: (r) => <Badge variant={r.enabled ? 'success' : 'neutral'}>{r.enabled ? t('status.yes', language) : t('status.no', language)}</Badge> },
        { key: 'run_count', label: t('list.runs', language), render: (r) => r.run_count },
      ]}
      formFields={fields}
      emptyIcon={<Workflow size={28} />}
      emptyTitle={t('empty.noWorkflows', language)}
      emptyDescription={t('empty.noWorkflowsDesc', language)}
      orderBy="created_at"
    />
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
