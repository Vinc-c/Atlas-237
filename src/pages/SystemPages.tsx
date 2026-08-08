import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ScrollText, Settings, CreditCard, Gauge, Sparkles, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { askAtlas } from '@/lib/askAtlas';
import { t } from '@/lib/i18n';
import { initiateFlutterwaveCheckout, recordSubscription, PLAN_PRICES, isFlutterwaveConfigured } from '@/lib/flutterwave';
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
  const { language, organization, session } = useAuth();
  const lang = language;
  const [currentPlan, setCurrentPlan] = useState(organization?.plan || 'starter');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { setCurrentPlan(organization?.plan || 'starter'); }, [organization?.plan]);

  const plans = [
    { name: 'Starter', key: 'starter', price: 19, features: [lang === 'fr' ? '5 employés IA' : '5 AI employees', lang === 'fr' ? '1 000 contacts' : '1,000 contacts', lang === 'fr' ? 'Analytique de base' : 'Basic analytics', lang === 'fr' ? 'Support e-mail' : 'Email support'] },
    { name: 'Growth', key: 'growth', price: 49, features: [lang === 'fr' ? '15 employés IA' : '15 AI employees', lang === 'fr' ? '10 000 contacts' : '10,000 contacts', lang === 'fr' ? 'Analytique avancée' : 'Advanced analytics', lang === 'fr' ? 'Support prioritaire' : 'Priority support', lang === 'fr' ? 'Accès API' : 'API access'] },
    { name: 'Pro', key: 'pro', price: 119, features: [lang === 'fr' ? 'Employés IA illimités' : 'Unlimited AI employees', lang === 'fr' ? 'Contacts illimités' : 'Unlimited contacts', lang === 'fr' ? 'Tableaux de bord personnalisés' : 'Custom dashboards', lang === 'fr' ? 'Support 24/7' : '24/7 support', lang === 'fr' ? 'Webhooks & API' : 'Webhooks & API'] },
    { name: 'Enterprise', key: 'enterprise', price: -1, features: [lang === 'fr' ? 'Tout Pro inclus' : 'Everything in Pro', lang === 'fr' ? 'IA personnalisée' : 'Custom AI training', 'SSO & SAML', lang === 'fr' ? 'Gestionnaire dédié' : 'Dedicated manager', lang === 'fr' ? 'Garantie SLA' : 'SLA guarantee'] },
  ];

  async function changePlan(plan: typeof plans[number]) {
    if (!organization || plan.key === currentPlan) return;
    if (plan.key === 'enterprise') {
      window.location.href = 'mailto:sales@atlascrm.com?subject=Atlas%20CRM%20Enterprise%20Plan';
      return;
    }
    setBusy(plan.key);
    initiateFlutterwaveCheckout({
      plan: plan.key,
      email: session?.user?.email || '',
      orgId: organization.id,
      onSuccess: async (txRef, paymentId) => {
        const res = await recordSubscription({ orgId: organization.id, plan: plan.key, txRef, paymentId });
        if (res.success) {
          setCurrentPlan(plan.key);
          setBusy(null);
        } else {
          alert(res.error || 'Payment failed');
          setBusy(null);
        }
      },
      onClose: () => setBusy(null),
    });
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.billing', lang)} subtitle="" />
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-500">{lang === 'fr' ? 'Plan actuel' : 'Current Plan'}</p>
            <p className="text-2xl font-bold text-ink-900 capitalize">{currentPlan}</p>
            {organization?.trial_ends_at && (
              <p className="text-sm text-warning-600 mt-1">
                {lang === 'fr' ? 'Essai jusqu\'au' : 'Trial ends'} {new Date(organization.trial_ends_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
              </p>
            )}
          </div>
          <CreditCard size={32} className="text-ink-300" />
        </div>
        {!isFlutterwaveConfigured() && (
          <p className="mt-3 rounded-lg bg-warning-50 p-2 text-xs text-warning-700">
            {lang === 'fr' ? 'Paiement Flutterwave non configuré. Ajoutez VITE_FLW_PUBLIC_KEY dans les variables d\'environnement.' : 'Flutterwave payment not configured. Add VITE_FLW_PUBLIC_KEY to environment variables.'}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div key={plan.name} className={`card p-6 ${isCurrent ? 'border-primary-300 ring-2 ring-primary-100' : ''}`}>
              <h3 className="font-bold text-ink-800">{plan.name}</h3>
              <p className="text-2xl font-bold text-ink-900 mt-2">
                {plan.price === -1 ? (lang === 'fr' ? 'Sur devis' : 'Custom') : `$${plan.price}/${lang === 'fr' ? 'mois' : 'mo'}`}
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="text-sm text-ink-600 flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => changePlan(plan)}
                disabled={isCurrent || busy !== null}
                className={`btn-sm w-full mt-4 rounded-lg font-medium inline-flex items-center justify-center gap-1.5 ${isCurrent ? 'bg-ink-100 text-ink-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                {busy === plan.key ? <Loader2 size={14} className="animate-spin" /> : null}
                {busy === plan.key ? (lang === 'fr' ? 'Paiement...' : 'Paying...') : isCurrent ? (lang === 'fr' ? 'Actuel' : 'Current') : plan.key === 'enterprise' ? (lang === 'fr' ? 'Contacter' : 'Contact Sales') : (lang === 'fr' ? 'Payer' : 'Pay')}
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
  const navigate = useNavigate();
  const lang = language;
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; route?: string }[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const suggestions = lang === 'fr'
    ? ['Combien de deals ouverts ?', 'Quels sont mes leads chauds ?', 'Quel est mon revenu ?', 'Factures impayées ?']
    : ['How many open deals?', 'Show my hot leads', 'What is my revenue?', 'Unpaid invoices?'];

  async function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || thinking) return;
    const userMsg = { role: 'user' as const, text: value };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    try {
      const answer = await askAtlas(value, lang);
      setMessages((prev) => [...prev, { role: 'ai', text: answer.text, route: answer.route }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: lang === 'fr' ? 'Désolé, je n\'ai pas pu récupérer les données.' : 'Sorry, I couldn\'t fetch the data.' }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.askAtlas', lang)} subtitle={lang === 'fr' ? 'Posez une question sur votre entreprise — les réponses viennent de vos données réelles.' : 'Ask a question about your business — answers come from your real data.'} />
      <div className="card p-0 h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="font-bold text-ink-800">{t('dash.askAtlas', lang)}</h3>
              <p className="text-sm text-ink-500 mt-1 max-w-md text-center">{t('dash.askPlaceholder', lang)}</p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-800'}`}>
                {msg.text}
                {msg.route && (
                  <button onClick={() => navigate(msg.route!)} className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline">
                    {lang === 'fr' ? 'Voir' : 'View'} <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="max-w-md px-4 py-2 rounded-xl text-sm bg-ink-100 text-ink-400 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" /> {lang === 'fr' ? 'Atlas analyse vos données…' : 'Atlas is analysing your data…'}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-ink-100 p-4 flex gap-2">
          <input
            className="input flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={t('dash.askPlaceholder', lang)}
            disabled={thinking}
          />
          <button onClick={() => send()} disabled={thinking} className="btn-primary btn-sm">{lang === 'fr' ? 'Envoyer' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}
