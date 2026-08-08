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
    load();
  }, [profile?.id]);

  async function load() {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (profile?.id) query = query.eq('user_id', profile.id);
    const { data } = await query;
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', unread.map(n => n.id));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function clearAll() {
    if (!confirm(language === 'fr' ? 'Supprimer toutes les notifications ?' : 'Clear all notifications?')) return;
    let query = supabase.from('notifications').delete();
    if (profile?.id) query = query.eq('user_id', profile.id);
    await query;
    setNotifications([]);
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.notifications', language)}
        subtitle=""
        actions={notifications.length > 0 ? (
          <div className="flex gap-2">
            {unreadCount > 0 && <button onClick={markAllRead} className="btn-secondary btn-sm">{language === 'fr' ? 'Tout marquer lu' : 'Mark all read'}</button>}
            <button onClick={clearAll} className="btn-secondary btn-sm">{language === 'fr' ? 'Tout effacer' : 'Clear all'}</button>
          </div>
        ) : undefined}
      />
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
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => { setOrg(organization); }, [organization]);
  useEffect(() => {
    setFirstName(profile?.first_name || '');
    setLastName(profile?.last_name || '');
    setPhone(profile?.phone || '');
  }, [profile?.id, profile?.first_name, profile?.last_name, profile?.phone]);

  async function saveOrg() {
    setSavingOrg(true); setOrgSaved(false);
    if (org) {
      const { error } = await supabase.from('organizations').update({
        name: org.name, industry: org.industry, website: org.website,
        country: org.country, address: org.address, currency: org.currency,
      }).eq('id', org.id);
      if (!error) setOrgSaved(true);
    }
    setSavingOrg(false);
  }

  async function saveProfile() {
    if (!profile) return;
    setSavingProfile(true); setProfileSaved(false);
    const { error } = await supabase.from('profiles').update({
      first_name: firstName, last_name: lastName, phone,
    }).eq('id', profile.id);
    if (!error) setProfileSaved(true);
    setSavingProfile(false);
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
          <div className="flex items-center gap-3 mt-4">
            <button onClick={saveOrg} disabled={savingOrg} className="btn-primary btn-sm">{savingOrg ? '...' : t('common.save', language)}</button>
            {orgSaved && <span className="text-sm text-success-600">✓ Saved</span>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-ink-800 mb-4">Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('auth.firstName', language)}</label>
              <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="label">{t('auth.lastName', language)}</label>
              <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div>
              <label className="label">{t('common.email', language)}</label>
              <input className="input" defaultValue={profile?.email || ''} disabled />
            </div>
            <div>
              <label className="label">{t('common.phone', language)}</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={saveProfile} disabled={savingProfile} className="btn-primary btn-sm">{savingProfile ? '...' : t('common.save', language)}</button>
            {profileSaved && <span className="text-sm text-success-600">✓ Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillingPage() {
  const { language, organization } = useAuth();
  const lang = language;
  const [currentPlan, setCurrentPlan] = useState(organization?.plan || 'starter');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { setCurrentPlan(organization?.plan || 'starter'); }, [organization?.plan]);

  const plans = [
    { name: 'Starter', price: 0, features: ['5 AI employees', '1,000 contacts', 'Basic analytics', 'Email support'] },
    { name: 'Pro', price: 49, features: ['15 AI employees', '10,000 contacts', 'Advanced analytics', 'Priority support', 'API access'] },
    { name: 'Business', price: 149, features: ['Unlimited AI employees', 'Unlimited contacts', 'Custom dashboards', '24/7 support', 'Webhooks & API'] },
    { name: 'Enterprise', price: -1, features: ['Everything in Business', 'Custom AI training', 'SSO & SAML', 'Dedicated manager', 'SLA guarantee'] },
  ];

  async function changePlan(planName: string) {
    if (!organization || planName.toLowerCase() === currentPlan) return;
    if (planName === 'Enterprise') {
      window.location.href = 'mailto:sales@liafrik.com?subject=Atlas%20CRM%20Enterprise%20Plan';
      return;
    }
    setBusy(planName);
    const { error } = await supabase.from('organizations').update({ plan: planName.toLowerCase() }).eq('id', organization.id);
    if (!error) setCurrentPlan(planName.toLowerCase());
    setBusy(null);
  }

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
        {plans.map(plan => {
          const isCurrent = plan.name.toLowerCase() === currentPlan;
          return (
            <div key={plan.name} className={`card p-6 ${isCurrent ? 'border-primary-300 ring-2 ring-primary-100' : ''}`}>
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
              <button
                onClick={() => changePlan(plan.name)}
                disabled={isCurrent || busy !== null}
                className={`btn-sm w-full mt-4 rounded-lg font-medium ${isCurrent ? 'bg-ink-100 text-ink-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                {busy === plan.name ? '...' : isCurrent ? 'Current' : plan.name === 'Enterprise' ? (lang === 'fr' ? 'Contacter' : 'Contact Sales') : (lang === 'fr' ? 'Changer' : 'Upgrade')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UsagePage() {
  const { language } = useAuth();
  const lang = language;
  const [usage, setUsage] = useState({
    aiTasks: 0, apiCalls: 0, storage: 0, activeUsers: 1,
    contacts: 0, emailsSent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [aiTasksRes, contactsRes, invoicesRes, employeesRes] = await Promise.all([
          supabase.from('ai_tasks').select('*', { count: 'exact', head: true }),
          supabase.from('contacts').select('*', { count: 'exact', head: true }),
          supabase.from('invoices').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
        ]);
        setUsage({
          aiTasks: aiTasksRes.count || 0,
          apiCalls: (aiTasksRes.count || 0) * 12,
          storage: Math.round(((contactsRes.count || 0) * 0.2 + (invoicesRes.count || 0) * 0.5) * 10) / 10,
          activeUsers: employeesRes.count || 1,
          contacts: contactsRes.count || 0,
          emailsSent: (invoicesRes.count || 0) * 3,
        });
      } catch {
        // tables may be empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const limits: Record<string, { value: number; cap: number }> = {
    'AI Tasks': { value: usage.aiTasks, cap: 1000 },
    'API Calls': { value: usage.apiCalls, cap: 10000 },
    'Storage': { value: Math.round(usage.storage), cap: 1000 },
    'Contacts': { value: usage.contacts, cap: 10000 },
    'Emails Sent': { value: usage.emailsSent, cap: 5000 },
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.usage', lang)} subtitle="" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="AI Tasks" value={loading ? '…' : String(usage.aiTasks)} icon={<Sparkles size={20} />} color="primary" />
        <StatCard label="API Calls" value={loading ? '…' : String(usage.apiCalls)} icon={<Gauge size={20} />} color="accent" />
        <StatCard label="Storage" value={loading ? '…' : `${usage.storage} MB`} icon={<Gauge size={20} />} color="success" />
        <StatCard label="Active Users" value={loading ? '…' : String(usage.activeUsers)} icon={<Gauge size={20} />} color="warning" />
      </div>
      <div className="card p-6">
        <h3 className="font-bold text-ink-800 mb-4">Monthly Usage</h3>
        <div className="space-y-4">
          {Object.entries(limits).map(([item, { value, cap }]) => {
            const pct = Math.min(100, Math.round((value / cap) * 100));
            return (
              <div key={item}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-600">{item}</span>
                  <span className="text-ink-400">{value.toLocaleString()} / {cap.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct > 80 ? 'bg-error-500' : pct > 50 ? 'bg-warning-500' : 'bg-primary-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
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
