import { LayoutGrid, Lightbulb, DollarSign, Users, Handshake, Target, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, StatCard } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { UpgradeGate } from '@/components/UpgradeGate';
import { hasFeature } from '@/lib/plans';

export function ReportsPage() {
  const { language } = useAuth();
  const lang = language;
  const navigate = useNavigate();
  const reportRoutes: Record<string, string> = {
    'Sales Report': '/app/deals', 'Rapport de ventes': '/app/deals',
    'Lead Report': '/app/leads', 'Rapport de leads': '/app/leads',
    'Deal Report': '/app/deals',
    'Activity Report': '/app/activities',
  };
  const reports = [
    { name: lang === 'fr' ? 'Rapport de ventes' : 'Sales Report', desc: lang === 'fr' ? 'Pipeline et revenus' : 'Pipeline & revenue', icon: DollarSign, color: 'success' as const },
    { name: lang === 'fr' ? 'Rapport de leads' : 'Lead Report', desc: lang === 'fr' ? 'Conversion et source' : 'Conversion & source', icon: Users, color: 'primary' as const },
    { name: lang === 'fr' ? 'Rapport d\'affaires' : 'Deal Report', desc: lang === 'fr' ? 'Gains et pertes' : 'Win/loss analysis', icon: Handshake, color: 'accent' as const },
    { name: lang === 'fr' ? 'Rapport d\'activité' : 'Activity Report', desc: lang === 'fr' ? 'Appels et emails' : 'Calls & emails', icon: Target, color: 'warning' as const },
  ];
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.reports', lang)} subtitle="" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map(r => (
          <button
            key={r.name}
            onClick={() => navigate(reportRoutes[r.name] || '/app/dashboards')}
            className="card-hover p-5 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${r.color === 'success' ? 'bg-success-50 text-success-600' : r.color === 'primary' ? 'bg-primary-50 text-primary-600' : r.color === 'accent' ? 'bg-accent-50 text-accent-600' : 'bg-warning-50 text-warning-600'}`}>
                <r.icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-ink-800">{r.name}</h3>
                <p className="text-sm text-ink-500">{r.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface DashboardRecord {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export function DashboardsPage() {
  const { language, organization } = useAuth();
  const lang = language;
  const navigate = useNavigate();
  const plan = organization?.plan || 'starter';
  const customDashboardsAllowed = hasFeature(plan, 'customDashboards');
  const [stats, setStats] = useState({ revenue: 0, openDeals: 0, newLeads: 0 });
  const [dashboards, setDashboards] = useState<DashboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [dealsRes, leadsRes, paymentsRes, dashRes] = await Promise.all([
          supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open'),
          supabase.from('leads').select('*', { count: 'exact', head: true }),
          supabase.from('payments').select('amount'),
          supabase.from('dashboards').select('*').order('created_at', { ascending: false }),
        ]);
        const revenue = (paymentsRes.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        setStats({ revenue, openDeals: dealsRes.count || 0, newLeads: leadsRes.count || 0 });
        setDashboards((dashRes.data || []) as DashboardRecord[]);
      } catch {
        // tables may be empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createDashboard() {
    if (!organization || !name.trim()) return;
    const { data, error } = await supabase.from('dashboards').insert({
      org_id: organization.id,
      name: name.trim(),
      description: desc.trim(),
      config: { widgets: ['revenue', 'deals', 'leads'] },
    }).select().single();
    if (!error && data) setDashboards(prev => [data, ...prev]);
    setName(''); setDesc(''); setShowForm(false);
  }

  async function deleteDashboard(id: string) {
    const { error } = await supabase.from('dashboards').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setDashboards(prev => prev.filter(d => d.id !== id));
  }

  const currency = organization?.currency || 'USD';
  const fmtMoney = (n: number) => new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.dashboards', lang)}
        subtitle=""
        actions={
          customDashboardsAllowed ? (
            <button onClick={() => setShowForm(true)} className="btn-primary btn-sm">
              <Plus size={16} /> {lang === 'fr' ? 'Créer' : 'Create'}
            </button>
          ) : undefined
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t('dash.revenue', lang)} value={loading ? '…' : fmtMoney(stats.revenue)} icon={<DollarSign size={20} />} color="success" />
        <StatCard label={t('dash.openDeals', lang)} value={loading ? '…' : String(stats.openDeals)} icon={<Handshake size={20} />} color="primary" />
        <StatCard label={t('dash.newLeads', lang)} value={loading ? '…' : String(stats.newLeads)} icon={<Users size={20} />} color="accent" />
      </div>

      {!customDashboardsAllowed ? (
        <div className="mt-6">
          <UpgradeGate language={lang} feature={lang === 'fr' ? 'Tableaux de bord personnalisés' : 'Custom dashboards'} minPlan="pro" />
        </div>
      ) : (
      <>
      {showForm && (
        <div className="card mt-6 p-5 space-y-3">
          <h3 className="font-bold text-ink-800">{lang === 'fr' ? 'Nouveau tableau de bord' : 'New Dashboard'}</h3>
          <div>
            <label className="label">{lang === 'fr' ? 'Nom' : 'Name'}</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder={lang === 'fr' ? 'Tableau de bord ventes' : 'Sales dashboard'} />
          </div>
          <div>
            <label className="label">{lang === 'fr' ? 'Description' : 'Description'}</label>
            <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder={lang === 'fr' ? 'Vue d\'ensemble des ventes' : 'Sales overview'} />
          </div>
          <div className="flex gap-2">
            <button onClick={createDashboard} disabled={!name.trim()} className="btn-primary btn-sm">{t('common.create', lang)}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {dashboards.length === 0 ? (
          <div className="card">
            <EmptyState icon={<LayoutGrid size={28} />} title={lang === 'fr' ? 'Aucun tableau de bord' : 'No dashboards'} description={lang === 'fr' ? 'Créez un tableau de bord personnalisé avec vos KPI.' : 'Create a custom dashboard with your key metrics.'} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboards.map(d => (
              <div key={d.id} className="card p-5 hover:border-primary-200 hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/app/dashboards')}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <LayoutGrid size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink-800">{d.name}</h3>
                      <p className="text-xs text-ink-500">{d.description || (lang === 'fr' ? 'Sans description' : 'No description')}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteDashboard(d.id)} className="p-1.5 rounded text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors" title={lang === 'fr' ? 'Supprimer' : 'Delete'}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}

export function AIInsightsPage() {
  const { language, organization } = useAuth();
  const lang = language;
  const plan = organization?.plan || 'starter';
  const allowed = hasFeature(plan, 'advancedAnalytics');
  const [insights, setInsights] = useState<{ title: string; desc: string; severity: 'error' | 'warning' | 'success' }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dealsAtRiskRes, hotLeadsRes, unpaidRes, paymentsRes] = await Promise.all([
          supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open').lt('closing_date', new Date().toISOString()),
          supabase.from('leads').select('*', { count: 'exact', head: true }).eq('temperature', 'hot').neq('status', 'converted'),
          supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('payment_status', 'unpaid'),
          supabase.from('payments').select('amount'),
        ]);
        const revenue = (paymentsRes.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        const next: { title: string; desc: string; severity: 'error' | 'warning' | 'success' }[] = [];
        if ((dealsAtRiskRes.count || 0) > 0) next.push({
          title: lang === 'fr' ? `${dealsAtRiskRes.count} affaires risquent d'être perdues` : `${dealsAtRiskRes.count} deals at risk of being lost`,
          desc: lang === 'fr' ? 'Action requise cette semaine' : 'Action needed this week', severity: 'error',
        });
        if ((hotLeadsRes.count || 0) > 0) next.push({
          title: lang === 'fr' ? `${hotLeadsRes.count} leads chauds non contactés` : `${hotLeadsRes.count} hot leads not contacted`,
          desc: lang === 'fr' ? 'Suivi recommandé sous 48h' : 'Follow up within 48h recommended', severity: 'warning',
        });
        if (revenue > 0) next.push({
          title: lang === 'fr' ? `Revenu cumulé: ${revenue.toLocaleString()}` : `Total revenue: ${revenue.toLocaleString()}`,
          desc: lang === 'fr' ? 'Tendance positive continue' : 'Continued positive trend', severity: 'success',
        });
        if ((unpaidRes.count || 0) > 0) next.push({
          title: lang === 'fr' ? `${unpaidRes.count} factures impayées` : `${unpaidRes.count} invoices unpaid`,
          desc: lang === 'fr' ? 'Relance automatique suggérée' : 'Automated reminder suggested', severity: 'warning',
        });
        setInsights(next);
      } catch {
        // tables may be empty
      } finally {
        setLoading(false);
      }
    })();
  }, [lang]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={t('nav.aiInsights', lang)} subtitle="" />
        <div className="card p-6 text-center text-sm text-ink-500">{t('common.loading', lang)}</div>
      </div>
    );
  }

  if (!allowed) return <UpgradeGate language={lang} feature={lang === 'fr' ? 'Analytique avancée & Insights IA' : 'Advanced Analytics & AI Insights'} minPlan="growth" />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.aiInsights', lang)} subtitle="" />
      {insights.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Lightbulb size={28} />} title={lang === 'fr' ? 'Aucune insight pour le moment' : 'No insights yet'} description={lang === 'fr' ? 'Les analyses IA apparaîtront ici à mesure que vos données augmentent.' : 'AI insights will appear here as your data grows.'} />
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="card p-4 flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                ins.severity === 'error' ? 'bg-error-50 text-error-600' :
                ins.severity === 'warning' ? 'bg-warning-50 text-warning-600' : 'bg-success-50 text-success-600'
              }`}>
                <Lightbulb size={18} />
              </div>
              <div>
                <p className="font-medium text-ink-800">{ins.title}</p>
                <p className="text-sm text-ink-500 mt-0.5">{ins.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
