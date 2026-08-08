import { useEffect, useState } from 'react';
import { Bell, ScrollText, Settings, CreditCard, Gauge, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, Badge, StatCard } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import type { Notification, AuditLog, Organization } from '@/types';

export function NotificationsPage() {
  const { language, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (profile?.id) query = query.eq('user_id', profile.id);
    query.then(({ data }) => { setNotifications((data || []) as Notification[]); setLoading(false); });
  }, [profile?.id]);

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.notifications', language)} subtitle="" />
      {notifications.length === 0 ? (
        <div className="card"><EmptyState icon={<Bell size={28} />} title="No notifications" description="You're all caught up! New notifications will appear here." /></div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.read ? 'border-primary-200' : ''}`}>
              <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-ink-300'}`} />
              <div className="flex-1">
                <p className="font-medium text-ink-800">{n.title}</p>
                {n.message && <p className="text-sm text-ink-500 mt-0.5">{n.message}</p>}
                <p className="text-xs text-ink-400 mt-1">{new Date(n.created_at).toLocaleString(language)}</p>
              </div>
              {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-primary-600 hover:underline">Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AuditLogPage() {
  const { language } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setLogs((data || []) as AuditLog[]); setLoading(false); });
  }, []);

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.auditLog', language)} subtitle="" />
      {logs.length === 0 ? (
        <div className="card"><EmptyState icon={<ScrollText size={28} />} title="No audit logs" description="System and AI actions will be logged here for compliance." /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-ink-100 bg-ink-50/50">
              <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Actor</th>
              <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Action</th>
              <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Entity</th>
              <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Date</th>
            </tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-ink-50 last:border-0 table-row-hover">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.actor_type === 'ai' ? 'primary' : 'neutral'}>{log.actor_type}</Badge>
                      <span className="text-ink-700">{log.actor_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-700">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-ink-500">{log.entity_name || log.entity_type || '—'}</td>
                  <td className="px-4 py-3 text-sm text-ink-500">{new Date(log.created_at).toLocaleString(language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { language, organization, profile } = useAuth();
  const [org, setOrg] = useState<Organization | null>(organization);
  const [saving, setSaving] = useState(false);

  async function saveOrg() {
    setSaving(true);
    if (org) {
      await supabase.from('organizations').update({
        name: org.name, industry: org.industry, website: org.website,
        country: org.country, address: org.address, currency: org.currency,
      }).eq('id', org.id);
    }
    setSaving(false);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.settings', language)} subtitle="" />
      <div className="max-w-2xl space-y-6">
        <div className="card p-6">
          <h3 className="font-bold text-ink-800 mb-4">Organization</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Company Name</label>
              <input className="input" value={org?.name || ''} onChange={e => setOrg({ ...org!, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Industry</label>
              <input className="input" value={org?.industry || ''} onChange={e => setOrg({ ...org!, industry: e.target.value })} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" value={org?.website || ''} onChange={e => setOrg({ ...org!, website: e.target.value })} />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" value={org?.country || ''} onChange={e => setOrg({ ...org!, country: e.target.value })} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={org?.currency || 'USD'} onChange={e => setOrg({ ...org!, currency: e.target.value })}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="MAD">MAD</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <input className="input" value={org?.address || ''} onChange={e => setOrg({ ...org!, address: e.target.value })} />
            </div>
          </div>
          <button onClick={saveOrg} disabled={saving} className="btn-primary btn-sm mt-4">{t('common.save', language)}</button>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-ink-800 mb-4">Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('auth.firstName', language)}</label>
              <input className="input" defaultValue={profile?.first_name || ''} />
            </div>
            <div>
              <label className="label">{t('auth.lastName', language)}</label>
              <input className="input" defaultValue={profile?.last_name || ''} />
            </div>
            <div>
              <label className="label">{t('common.email', language)}</label>
              <input className="input" defaultValue={profile?.email || ''} disabled />
            </div>
            <div>
              <label className="label">{t('common.phone', language)}</label>
              <input className="input" defaultValue={profile?.phone || ''} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillingPage() {
  const { language, organization } = useAuth();
  const lang = language;
  const plans = [
    { name: 'Starter', price: 0, features: ['5 AI employees', '1,000 contacts', 'Basic analytics', 'Email support'] },
    { name: 'Pro', price: 49, features: ['15 AI employees', '10,000 contacts', 'Advanced analytics', 'Priority support', 'API access'] },
    { name: 'Business', price: 149, features: ['Unlimited AI employees', 'Unlimited contacts', 'Custom dashboards', '24/7 support', 'Webhooks & API'] },
    { name: 'Enterprise', price: -1, features: ['Everything in Business', 'Custom AI training', 'SSO & SAML', 'Dedicated manager', 'SLA guarantee'] },
  ];
  const currentPlan = organization?.plan || 'starter';

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.billing', lang)} subtitle="" />
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-500">Current Plan</p>
            <p className="text-2xl font-bold text-ink-900 capitalize">{currentPlan}</p>
            {organization?.trial_ends_at && (
              <p className="text-sm text-warning-600 mt-1">Trial ends {new Date(organization.trial_ends_at).toLocaleDateString(lang)}</p>
            )}
          </div>
          <CreditCard size={32} className="text-ink-300" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.name} className={`card p-6 ${plan.name.toLowerCase() === currentPlan ? 'border-primary-300 ring-2 ring-primary-100' : ''}`}>
            <h3 className="font-bold text-ink-800">{plan.name}</h3>
            <p className="text-2xl font-bold text-ink-900 mt-2">
              {plan.price === -1 ? 'Custom' : plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map(f => (
                <li key={f} className="text-sm text-ink-600 flex items-start gap-2">
                  <span className="text-success-500 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className={`btn-sm w-full mt-4 rounded-lg font-medium ${plan.name.toLowerCase() === currentPlan ? 'bg-ink-100 text-ink-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
              {plan.name.toLowerCase() === currentPlan ? 'Current' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsagePage() {
  const { language } = useAuth();
  const lang = language;
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.usage', lang)} subtitle="" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="AI Tasks" value="0" icon={<Sparkles size={20} />} color="primary" />
        <StatCard label="API Calls" value="0" icon={<Gauge size={20} />} color="accent" />
        <StatCard label="Storage" value="0 MB" icon={<Gauge size={20} />} color="success" />
        <StatCard label="Active Users" value="1" icon={<Gauge size={20} />} color="warning" />
      </div>
      <div className="card p-6">
        <h3 className="font-bold text-ink-800 mb-4">Monthly Usage</h3>
        <div className="space-y-4">
          {['AI Tasks', 'API Calls', 'Storage', 'Contacts', 'Emails Sent'].map(item => (
            <div key={item}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-600">{item}</span>
                <span className="text-ink-400">0 / 10,000</span>
              </div>
              <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AskAtlasPage() {
  const { language } = useAuth();
  const lang = language;
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');

  function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: lang === 'fr' ? "Je suis Atlas, votre assistant IA. Cette fonctionnalité sera bientôt disponible avec une intégration LLM complète." : "I'm Atlas, your AI assistant. This feature will be available soon with full LLM integration." }]);
    }, 800);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.askAtlas', lang)} subtitle="" />
      <div className="card p-0 h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="font-bold text-ink-800">{t('dash.askAtlas', lang)}</h3>
              <p className="text-sm text-ink-500 mt-1 max-w-md text-center">{t('dash.askPlaceholder', lang)}</p>
            </div>
          ) : messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-800'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100 p-4 flex gap-2">
          <input
            className="input flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={t('dash.askPlaceholder', lang)}
          />
          <button onClick={send} className="btn-primary btn-sm">{lang === 'fr' ? 'Envoyer' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}
