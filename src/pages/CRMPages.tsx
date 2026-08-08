import { useEffect, useState } from 'react';
import { Users, Building2, UserPlus, Handshake, KanbanSquare, Activity, Calendar } from 'lucide-react';
import { ListPage, type FormField } from '@/components/ListPage';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { Badge, PageHeader } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import type { Contact, Company, Lead, Deal } from '@/types';

export function ContactsPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'first_name', label: t('auth.firstName', language), type: 'text', required: true },
    { key: 'last_name', label: t('auth.lastName', language), type: 'text', required: true },
    { key: 'email', label: t('common.email', language), type: 'email' },
    { key: 'phone', label: t('common.phone', language), type: 'tel' },
    { key: 'job_title', label: 'Title', type: 'text' },
    { key: 'company', label: t('common.company', language), type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'lead', label: 'Lead' },
    ], defaultValue: 'active' },
    { key: 'lead_score', label: 'Lead Score', type: 'number', defaultValue: 0 },
    { key: 'tags', label: 'Tags (comma-separated)', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <ListPage<Contact>
      table="contacts"
      title={t('nav.contacts', language)}
      subtitle=""
      columns={[
        { key: 'first_name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.first_name} {r.last_name}</span> },
        { key: 'email', label: t('common.email', language), render: (r) => r.email || '—' },
        { key: 'phone', label: t('common.phone', language), render: (r) => r.phone || '—' },
        { key: 'job_title', label: 'Title', render: (r) => r.job_title || '—' },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge> },
        { key: 'lead_score', label: 'Score', render: (r) => <span className="font-semibold">{r.lead_score}</span> },
      ]}
      formFields={fields}
      emptyIcon={<Users size={28} />}
      emptyTitle="No contacts yet"
      emptyDescription="Add your first contact to start building your CRM."
      orderBy="created_at"
      importable
    />
  );
}

export function CompaniesPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'name', label: t('common.name', language), type: 'text', required: true },
    { key: 'industry', label: 'Industry', type: 'text' },
    { key: 'website', label: 'Website', type: 'text' },
    { key: 'size', label: 'Size', type: 'select', options: [
      { value: '1-10', label: '1-10' }, { value: '11-50', label: '11-50' }, { value: '51-200', label: '51-200' }, { value: '201-500', label: '201-500' }, { value: '500+', label: '500+' },
    ]},
    { key: 'city', label: 'City', type: 'text' },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'revenue', label: 'Revenue', type: 'number' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' },
    ], defaultValue: 'active' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <ListPage<Company>
      table="companies"
      title={t('nav.companies', language)}
      columns={[
        { key: 'name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
        { key: 'industry', label: 'Industry', render: (r) => r.industry || '—' },
        { key: 'website', label: 'Website', render: (r) => r.website ? <a href={r.website} target="_blank" rel="noopener" className="text-primary-600 hover:underline">{r.website}</a> : '—' },
        { key: 'size', label: 'Size', render: (r) => r.size || '—' },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge> },
      ]}
      formFields={fields}
      emptyIcon={<Building2 size={28} />}
      emptyTitle="No companies yet"
      emptyDescription="Add companies to organize your contacts and deals."
      orderBy="created_at"
    />
  );
}

export function LeadsPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'first_name', label: t('auth.firstName', language), type: 'text', required: true },
    { key: 'last_name', label: t('auth.lastName', language), type: 'text', required: true },
    { key: 'email', label: t('common.email', language), type: 'email' },
    { key: 'phone', label: t('common.phone', language), type: 'tel' },
    { key: 'company_name', label: t('common.company', language), type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'source', label: 'Source', type: 'select', options: [
      { value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' }, { value: 'cold_outreach', label: 'Cold Outreach' }, { value: 'event', label: 'Event' }, { value: 'social', label: 'Social' },
    ]},
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'qualified', label: 'Qualified' }, { value: 'converted', label: 'Converted' }, { value: 'lost', label: 'Lost' },
    ], defaultValue: 'new' },
    { key: 'temperature', label: 'Temperature', type: 'select', options: [
      { value: 'hot', label: 'Hot' }, { value: 'warm', label: 'Warm' }, { value: 'cold', label: 'Cold' },
    ], defaultValue: 'warm' },
    { key: 'potential_value', label: 'Potential Value', type: 'number', defaultValue: 0 },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <ListPage<Lead>
      table="leads"
      title={t('nav.leads', language)}
      columns={[
        { key: 'first_name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.first_name} {r.last_name}</span> },
        { key: 'company_name', label: t('common.company', language), render: (r) => r.company_name || '—' },
        { key: 'source', label: 'Source', render: (r) => r.source || '—' },
        { key: 'temperature', label: 'Temperature', render: (r) => <Badge variant={r.temperature === 'hot' ? 'error' : r.temperature === 'warm' ? 'warning' : 'neutral'}>{r.temperature}</Badge> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'converted' ? 'success' : r.status === 'lost' ? 'error' : 'primary'}>{r.status}</Badge> },
        { key: 'potential_value', label: 'Value', render: (r) => `$${(r.potential_value || 0).toLocaleString()}` },
      ]}
      formFields={fields}
      emptyIcon={<UserPlus size={28} />}
      emptyTitle="No leads yet"
      emptyDescription="Capture your first lead to start your sales pipeline."
      orderBy="created_at"
      importable
    />
  );
}

export function DealsPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'name', label: 'Deal Name', type: 'text', required: true },
    { key: 'value', label: 'Value', type: 'number', required: true, defaultValue: 0 },
    { key: 'closing_date', label: 'Closing Date', type: 'date' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'open', label: 'Open' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' },
    ], defaultValue: 'open' },
    { key: 'probability', label: 'Probability %', type: 'number', defaultValue: 0 },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <ListPage<Deal>
      table="deals"
      title={t('nav.deals', language)}
      columns={[
        { key: 'name', label: 'Deal', render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
        { key: 'value', label: t('common.value', language), render: (r) => <span className="font-semibold">$ {(r.value || 0).toLocaleString()}</span> },
        { key: 'probability', label: 'Probability', render: (r) => `${r.probability}%` },
        { key: 'closing_date', label: 'Close Date', render: (r) => r.closing_date ? new Date(r.closing_date).toLocaleDateString(language) : '—' },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'won' ? 'success' : r.status === 'lost' ? 'error' : 'primary'}>{r.status}</Badge> },
      ]}
      formFields={fields}
      emptyIcon={<Handshake size={28} />}
      emptyTitle="No deals yet"
      emptyDescription="Create your first deal to track revenue opportunities."
      relations="*, stage:pipeline_stages(*), contact:contacts(*), company:companies(*)"
      orderBy="created_at"
    />
  );
}

export function PipelinesPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'name', label: t('common.name', language), type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
  ];

  return (
    <ListPage<{ id: string; name: string; description: string | null; sort_order: number; [key: string]: unknown }>
      table="pipelines"
      title={t('nav.pipelines', language)}
      columns={[
        { key: 'name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
        { key: 'description', label: 'Description', render: (r) => r.description || '—' },
      ]}
      formFields={fields}
      emptyIcon={<KanbanSquare size={28} />}
      emptyTitle="No pipelines yet"
      emptyDescription="Create a pipeline to visualize your sales process."
      orderBy="sort_order"
    />
  );
}

export function ActivitiesPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'call', label: 'Call' }, { value: 'email', label: 'Email' }, { value: 'meeting', label: 'Meeting' }, { value: 'note', label: 'Note' }, { value: 'task', label: 'Task' },
    ], defaultValue: 'call' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' },
    ], defaultValue: 'pending' },
    { key: 'scheduled_at', label: 'Scheduled At', type: 'date' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ];

  return (
    <ListPage<{ id: string; title: string; type: string; status: string; scheduled_at: string | null; description: string | null; [key: string]: unknown }>
      table="activities"
      title={t('nav.activities', language)}
      columns={[
        { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-ink-800">{r.title}</span> },
        { key: 'type', label: 'Type', render: (r) => <Badge variant="primary">{r.type}</Badge> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge> },
        { key: 'scheduled_at', label: 'Scheduled', render: (r) => r.scheduled_at ? new Date(r.scheduled_at).toLocaleDateString(language) : '—' },
      ]}
      formFields={fields}
      emptyIcon={<Activity size={28} />}
      emptyTitle="No activities yet"
      emptyDescription="Log calls, emails, and meetings to track engagement."
      orderBy="created_at"
    />
  );
}

export function CalendarPage() {
  const { language } = useAuth();
  const lang = language;
  const [activities, setActivities] = useState<{ id: string; title: string; type: string; status: string; scheduled_at: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('activities').select('id,title,type,status,scheduled_at').order('scheduled_at', { ascending: true, nullsFirst: false })
      .then(({ data }) => { setActivities((data || []) as typeof activities); setLoading(false); });
  }, []);

  const now = new Date();
  const upcoming = activities.filter(a => a.scheduled_at && new Date(a.scheduled_at) >= now);
  const past = activities.filter(a => a.scheduled_at && new Date(a.scheduled_at) < now);

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.calendar', lang)} subtitle="" />
      {loading ? (
        <Loading text={t('common.loading', lang)} />
      ) : activities.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Calendar size={28} />} title={lang === 'fr' ? 'Aucun événement' : 'No events'} description={lang === 'fr' ? 'Vos activités planifiées apparaîtront ici.' : 'Your scheduled activities and meetings appear here.'} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-bold text-ink-900 mb-4">{lang === 'fr' ? 'À venir' : 'Upcoming'}</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-ink-400 py-4 text-center">{t('common.noData', lang)}</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(a => (
                  <div key={a.id} className="flex items-start gap-3 py-2 border-b border-ink-50 last:border-0">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary-50 text-primary-600 flex-shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-800">{a.title}</p>
                      <p className="text-xs text-ink-500">{a.scheduled_at ? new Date(a.scheduled_at).toLocaleString(lang) : '—'} · {a.type}</p>
                    </div>
                    <Badge variant={a.status === 'completed' ? 'success' : 'warning'}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-ink-900 mb-4">{lang === 'fr' ? 'Passés' : 'Past'}</h3>
            {past.length === 0 ? (
              <p className="text-sm text-ink-400 py-4 text-center">{t('common.noData', lang)}</p>
            ) : (
              <div className="space-y-3">
                {past.map(a => (
                  <div key={a.id} className="flex items-start gap-3 py-2 border-b border-ink-50 last:border-0 opacity-70">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100 text-ink-500 flex-shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-800">{a.title}</p>
                      <p className="text-xs text-ink-500">{a.scheduled_at ? new Date(a.scheduled_at).toLocaleString(lang) : '—'} · {a.type}</p>
                    </div>
                    <Badge variant={a.status === 'completed' ? 'success' : 'warning'}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
