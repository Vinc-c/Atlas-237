import { BarChart3, LayoutGrid, Lightbulb, TrendingUp, DollarSign, Users, Handshake, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import { PageHeader, StatCard } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';

export function ReportsPage() {
  const { language } = useAuth();
  const lang = language;
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
          <div key={r.name} className="card-hover p-5 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${r.color}-50 text-${r.color}-600`}>
                <r.icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-ink-800">{r.name}</h3>
                <p className="text-sm text-ink-500">{r.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardsPage() {
  const { language } = useAuth();
  const lang = language;
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.dashboards', lang)} subtitle="" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t('dash.revenue', lang)} value="$0" icon={<DollarSign size={20} />} color="success" />
        <StatCard label={t('dash.openDeals', lang)} value="0" icon={<Handshake size={20} />} color="primary" />
        <StatCard label={t('dash.newLeads', lang)} value="0" icon={<Users size={20} />} color="accent" />
      </div>
      <div className="card mt-6">
        <EmptyState icon={<LayoutGrid size={28} />} title="Custom Dashboards" description="Create custom dashboards with your key metrics and KPIs." />
      </div>
    </div>
  );
}

export function AIInsightsPage() {
  const { language } = useAuth();
  const lang = language;
  const insights = [
    { title: lang === 'fr' ? '3 affaires risquent d\'être perdues' : '3 deals at risk of being lost', desc: lang === 'fr' ? 'Action requise cette semaine' : 'Action needed this week', severity: 'error' },
    { title: lang === 'fr' ? '5 leads chauds non contactés' : '5 hot leads not contacted', desc: lang === 'fr' ? 'Suivi recommandé sous 48h' : 'Follow up within 48h recommended', severity: 'warning' },
    { title: lang === 'fr' ? 'Revenu en hausse de 12%' : 'Revenue up 12% this month', desc: lang === 'fr' ? 'Tendance positive continue' : 'Continued positive trend', severity: 'success' },
    { title: lang === 'fr' ? '2 factures en retard de paiement' : '2 invoices overdue', desc: lang === 'fr' ? 'Relance automatique suggérée' : 'Automated reminder suggested', severity: 'warning' },
  ];
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.aiInsights', lang)} subtitle="" />
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
    </div>
  );
}
