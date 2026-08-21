import { useEffect, useState } from 'react';
import {
  DollarSign, UserPlus, Flame, Handshake, AlertTriangle,
  Calendar, CheckCircle, Receipt, LifeBuoy, Bot, Clock,
  TrendingUp, Sparkles, Zap, X, Activity as ActivityIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { askAtlas } from '@/lib/askAtlas';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import { StatCard, PageHeader } from '@/components/ui';
import { Loading } from '@/components/Loading';
import type { AITask, Approval, Activity } from '@/types';

interface DashboardStats {
  revenue: number;
  newLeads: number;
  hotLeads: number;
  openDeals: number;
  dealsAtRisk: number;
  upcomingMeetings: number;
  overdueTasks: number;
  unpaidInvoices: number;
  openTickets: number;
  aiCompleted: number;
  aiPending: number;
}

export function DashboardPage() {
  const { language, profile, organization } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [command, setCommand] = useState('');
  const [busyApproval, setBusyApproval] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [
        leadsRes, hotLeadsRes, dealsRes, dealsAtRiskRes,
        upcomingRes, overdueRes, unpaidRes, ticketsRes,
        aiCompletedRes, aiPendingRes, activitiesRes, approvalsRes, aiTasksRes,
        paymentsRes,
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('temperature', 'hot'),
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open').lt('closing_date', new Date().toISOString()),
        supabase.from('activities').select('*', { count: 'exact', head: true }).eq('type', 'meeting').eq('status', 'pending').gte('scheduled_at', new Date().toISOString()),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending').lt('due_date', new Date().toISOString()),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).neq('payment_status', 'paid'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('ai_tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('ai_tasks').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('approvals').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
        supabase.from('ai_tasks').select('*, agent:ai_agents(*)').order('created_at', { ascending: false }).limit(5),
        supabase.from('payments').select('amount'),
      ]);

      const revenue = (paymentsRes.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        revenue,
        newLeads: leadsRes.count || 0,
        hotLeads: hotLeadsRes.count || 0,
        openDeals: dealsRes.count || 0,
        dealsAtRisk: dealsAtRiskRes.count || 0,
        upcomingMeetings: upcomingRes.count || 0,
        overdueTasks: overdueRes.count || 0,
        unpaidInvoices: unpaidRes.count || 0,
        openTickets: ticketsRes.count || 0,
        aiCompleted: aiCompletedRes.count || 0,
        aiPending: aiPendingRes.count || 0,
      });
      setRecentActivities(activitiesRes.data as Activity[] || []);
      setPendingApprovals(approvalsRes.data as Approval[] || []);
      setAiTasks(aiTasksRes.data as AITask[] || []);
    } catch {
      // tables may be empty
    } finally {
      setLoading(false);
    }
  }

  async function decideApproval(id: string, decision: 'approved' | 'rejected') {
    setBusyApproval(id);
    const { error } = await supabase.from('approvals').update({
      status: decision,
      decided_at: new Date().toISOString(),
      decided_by: profile?.id || null,
    }).eq('id', id);
    if (error) { alert(error.message); setBusyApproval(null); return; }
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
    setBusyApproval(null);
  }

  async function runCommand() {
    if (!command.trim()) return;
    setAiThinking(true);
    setAiReply(null);
    try {
      const answer = await askAtlas(command, lang);
      setAiReply(answer.text);
    } catch {
      setAiReply(lang === 'fr' ? "Désolé, je n'ai pas pu récupérer les données." : "Sorry, I couldn't fetch the data.");
    } finally {
      setAiThinking(false);
    }
  }

  if (loading) return <Loading fullPage text={t('common.loading', language)} />;

  const lang = language;
  const currency = organization?.currency || 'USD';
  const fmtMoney = (n: number) => new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${t('nav.commandCenter', lang)}`}
        subtitle={lang === 'fr'
          ? `Bonjour ${profile?.first_name || ''}, voici votre entreprise aujourd'hui`
          : `Hello ${profile?.first_name || ''}, here's your business today`}
      />

      {/* AI Command Bar */}
      <div className="card p-4 mb-6 bg-gradient-to-r from-primary-600 to-primary-700 border-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white flex-shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{t('dash.askAtlas', lang)}</p>
            <input
              className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder={t('dash.askPlaceholder', lang)}
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runCommand()}
            />
          </div>
          <button onClick={runCommand} className="btn bg-white text-primary-700 hover:bg-white/90 font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-1.5">
            <Zap size={16} />
            {lang === 'fr' ? 'Exécuter' : 'Execute'}
          </button>
        </div>
        {aiThinking && (
          <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
            <Sparkles size={14} className="animate-pulse" /> {lang === 'fr' ? 'Atlas analyse vos données…' : 'Atlas is analysing your data…'}
          </div>
        )}
        {aiReply && !aiThinking && (
          <div className="mt-3 rounded-lg bg-white/15 border border-white/20 px-4 py-3 text-sm text-white flex items-start justify-between gap-3">
            <span>{aiReply}</span>
            <button onClick={() => setAiReply(null)} className="flex-none text-white/60 hover:text-white"><X size={14} /></button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label={t('dash.revenue', lang)} value={fmtMoney(stats?.revenue || 0)} icon={<DollarSign size={20} />} color="success" />
        <StatCard label={t('dash.newLeads', lang)} value={stats?.newLeads || 0} icon={<UserPlus size={20} />} color="primary" />
        <StatCard label={t('dash.hotLeads', lang)} value={stats?.hotLeads || 0} icon={<Flame size={20} />} color="error" />
        <StatCard label={t('dash.openDeals', lang)} value={stats?.openDeals || 0} icon={<Handshake size={20} />} color="primary" />
        <StatCard label={t('dash.dealsAtRisk', lang)} value={stats?.dealsAtRisk || 0} icon={<AlertTriangle size={20} />} color="warning" />
        <StatCard label={t('dash.upcomingMeetings', lang)} value={stats?.upcomingMeetings || 0} icon={<Calendar size={20} />} color="accent" />
        <StatCard label={t('dash.overdueTasks', lang)} value={stats?.overdueTasks || 0} icon={<Clock size={20} />} color="error" />
        <StatCard label={t('dash.unpaidInvoices', lang)} value={stats?.unpaidInvoices || 0} icon={<Receipt size={20} />} color="warning" />
        <StatCard label={t('dash.customerIssues', lang)} value={stats?.openTickets || 0} icon={<LifeBuoy size={20} />} color="error" />
        <StatCard label={t('dash.aiActionsCompleted', lang)} value={stats?.aiCompleted || 0} icon={<CheckCircle size={20} />} color="success" />
        <StatCard label={t('dash.aiActionsPending', lang)} value={stats?.aiPending || 0} icon={<Bot size={20} />} color="primary" />
      </div>

      {/* Two column: Recent Activity + Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900">{t('nav.activities', lang)}</h3>
            <TrendingUp size={18} className="text-ink-400" />
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-ink-400 py-8 text-center">{t('common.noData', lang)}</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 py-2 border-b border-ink-50 last:border-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                    act.performed_by === 'ai' ? 'bg-primary-50 text-primary-600' : 'bg-ink-100 text-ink-600'
                  }`}>
                    {act.performed_by === 'ai' ? <Bot size={16} /> : <ActivityIcon size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{act.title}</p>
                    <p className="text-xs text-ink-500">{new Date(act.created_at).toLocaleDateString(lang)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900">{t('nav.approvals', lang)}</h3>
            <span className="badge-warning">{pendingApprovals.length}</span>
          </div>
          {pendingApprovals.length === 0 ? (
            <p className="text-sm text-ink-400 py-8 text-center">{t('common.noData', lang)}</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((ap) => (
                <div key={ap.id} className="flex items-start justify-between gap-3 py-2 border-b border-ink-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{ap.description}</p>
                    <p className="text-xs text-ink-500">{ap.agent_name} · {ap.action_type}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => decideApproval(ap.id, 'approved')}
                      disabled={busyApproval === ap.id}
                      className="btn-sm bg-success-600 text-white hover:bg-success-700 px-2 py-1 rounded text-xs disabled:opacity-50"
                    >
                      {t('common.approve', lang)}
                    </button>
                    <button
                      onClick={() => decideApproval(ap.id, 'rejected')}
                      disabled={busyApproval === ap.id}
                      className="btn-sm bg-error-500 text-white hover:bg-error-600 px-2 py-1 rounded text-xs disabled:opacity-50"
                    >
                      {t('common.reject', lang)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Tasks */}
      {aiTasks.length > 0 && (
        <div className="card p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900">{t('nav.aiTasks', lang)}</h3>
            <Bot size={18} className="text-ink-400" />
          </div>
          <div className="space-y-2">
            {aiTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b border-ink-50 last:border-0">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  task.status === 'completed' ? 'bg-success-500' :
                  task.status === 'in_progress' ? 'bg-primary-500 animate-pulse' :
                  task.status === 'failed' ? 'bg-error-500' : 'bg-ink-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{task.title}</p>
                  <p className="text-xs text-ink-500">{task.agent?.name || 'AI Agent'} · {task.status}</p>
                </div>
                {task.progress > 0 && task.progress < 100 && (
                  <div className="w-20 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
