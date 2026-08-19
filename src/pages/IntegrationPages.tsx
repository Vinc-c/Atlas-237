import { Plug, Webhook, Plus, Check, Trash2, Ban, Copy, Key, ExternalLink, Eye, EyeOff, Send, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { Modal } from '@/components/Modal';
import { BrandLogo } from '@/components/BrandLogos';
import type { Integration, ApiKey, Webhook as WebhookType } from '@/types';

interface AppDef {
  provider: string;
  name: string;
  category: string;
  authType: 'oauth' | 'api_key' | 'webhook_url';
  configFields?: { key: string; label: string; placeholder: string; type?: string }[];
  docsUrl: string;
}

const AVAILABLE_APPS: AppDef[] = [
  { provider: 'gmail', name: 'Gmail', category: 'Email', authType: 'oauth', docsUrl: 'https://developers.google.com/gmail/api' },
  { provider: 'outlook', name: 'Outlook', category: 'Email', authType: 'oauth', docsUrl: 'https://learn.microsoft.com/graph' },
  { provider: 'stripe', name: 'Stripe', category: 'Payments', authType: 'api_key', configFields: [{ key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' }, { key: 'publishable_key', label: 'Publishable Key', placeholder: 'pk_live_...' }], docsUrl: 'https://stripe.com/docs/api' },
  { provider: 'slack', name: 'Slack', category: 'Communication', authType: 'oauth', docsUrl: 'https://api.slack.com' },
  { provider: 'whatsapp', name: 'WhatsApp', category: 'Messaging', authType: 'api_key', configFields: [{ key: 'api_token', label: 'API Token', placeholder: 'temp_xxx', type: 'password' }, { key: 'phone_number_id', label: 'Phone Number ID', placeholder: '123456...' }], docsUrl: 'https://developers.facebook.com/docs/whatsapp' },
  { provider: 'telegram', name: 'Telegram', category: 'Messaging', authType: 'api_key', configFields: [{ key: 'bot_token', label: 'Bot Token', placeholder: '123456:ABC-DEF...', type: 'password' }], docsUrl: 'https://core.telegram.org/bots/api' },
  { provider: 'zoom', name: 'Zoom', category: 'Video', authType: 'oauth', docsUrl: 'https://developers.zoom.us' },
  { provider: 'google_meet', name: 'Google Meet', category: 'Video', authType: 'oauth', docsUrl: 'https://developers.google.com/meet' },
  { provider: 'aircall', name: 'Aircall', category: 'Calling', authType: 'api_key', configFields: [{ key: 'api_token', label: 'API Token', placeholder: 'aircall_xxx', type: 'password' }, { key: 'app_id', label: 'App ID', placeholder: '12345' }], docsUrl: 'https://developer.aircall.io' },
  { provider: 'calendly', name: 'Calendly', category: 'Scheduling', authType: 'api_key', configFields: [{ key: 'personal_access_token', label: 'Personal Access Token', placeholder: 'cal_pat_xxx', type: 'password' }], docsUrl: 'https://developer.calendly.com' },
  { provider: 'hubspot', name: 'HubSpot', category: 'CRM', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'pat-na1-xxx', type: 'password' }], docsUrl: 'https://developers.hubspot.com' },
  { provider: 'quickbooks', name: 'QuickBooks', category: 'Accounting', authType: 'oauth', docsUrl: 'https://developer.intuit.com' },
  { provider: 'mailchimp', name: 'Mailchimp', category: 'Marketing', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxxx-us1', type: 'password' }], docsUrl: 'https://mailchimp.com/developer' },
  { provider: 'twilio', name: 'Twilio', category: 'SMS / Voice', authType: 'api_key', configFields: [{ key: 'account_sid', label: 'Account SID', placeholder: 'ACxxx' }, { key: 'auth_token', label: 'Auth Token', placeholder: 'xxx', type: 'password' }, { key: 'from_number', label: 'From Number', placeholder: '+1234567890' }], docsUrl: 'https://www.twilio.com/docs' },
  { provider: 'shopify', name: 'Shopify', category: 'E-commerce', authType: 'api_key', configFields: [{ key: 'shop_domain', label: 'Shop Domain', placeholder: 'mystore.myshopify.com' }, { key: 'access_token', label: 'Access Token', placeholder: 'shpat_xxx', type: 'password' }], docsUrl: 'https://shopify.dev/docs/api' },
];

const WEBHOOK_EVENTS = [
  'contact.created', 'contact.updated', 'contact.deleted',
  'lead.created', 'lead.updated', 'lead.converted',
  'deal.created', 'deal.updated', 'deal.won', 'deal.lost',
  'invoice.created', 'invoice.paid', 'invoice.overdue',
  'payment.received', 'activity.created',
];

export function MarketplacePage() {
  const { language } = useAuth();
  const lang = language;
  const [connected, setConnected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [configApp, setConfigApp] = useState<AppDef | null>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    supabase.from('integrations').select('provider,status')
      .then(({ data }) => {
        setConnected((data || []).filter((i: Integration) => i.status === 'connected').map((i: Integration) => i.provider));
      });
  }, []);

  async function toggleConnect(app: AppDef) {
    if (connected.includes(app.provider)) {
      setBusy(app.provider);
      await supabase.from('integrations').delete().eq('provider', app.provider);
      setConnected(prev => prev.filter(p => p !== app.provider));
      setBusy(null);
    } else if (app.authType === 'oauth') {
      setConfigApp(app);
    } else {
      setConfigApp(app);
      setConfigData({});
    }
  }

  async function confirmConnect() {
    if (!configApp) return;
    setConnecting(true);
    const rand = () => crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
    const fullKey = 'atlas_' + configApp.provider + '_' + rand();
    const keyPrefix = fullKey.substring(0, 14);
    const { error } = await supabase.from('integrations').insert({
      provider: configApp.provider,
      category: configApp.category,
      status: 'connected',
      connected_at: new Date().toISOString(),
      config: { ...configData, key_prefix: keyPrefix, auth_type: configApp.authType },
    });
    if (!error) {
      setConnected(prev => [...prev, configApp.provider]);
      setConfigApp(null);
      setConfigData({});
    }
    setConnecting(false);
  }

  function oauthConnect(app: AppDef) {
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state_' + app.provider, state);
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const authUrls: Record<string, string> = {
      gmail: `https://accounts.google.com/o/oauth2/v2/auth?scope=https://mail.google.com/&response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      google_meet: `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/meetings&response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      slack: `https://slack.com/oauth/v2/authorize?scope=chat:write,channels:read&redirect_uri=${redirectUri}&state=${state}`,
      zoom: `https://zoom.us/oauth/authorize?response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      outlook: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?scope=https://graph.microsoft.com/.default&response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      quickbooks: `https://appcenter.intuit.com/connect/oauth2?scope=com.intuit.quickbooks.accounting&redirect_uri=${redirectUri}&state=${state}`,
    };
    const authUrl = authUrls[app.provider];
    if (authUrl) {
      window.open(authUrl, '_blank', 'width=600,height=700');
    }
    setConfigApp(null);
  }

  const categories = ['all', ...Array.from(new Set(AVAILABLE_APPS.map(a => a.category)))];
  const filtered = filter === 'all' ? AVAILABLE_APPS : AVAILABLE_APPS.filter(a => a.category === filter);

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.appMarketplace', lang)} subtitle="" />
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`btn-sm px-3 py-1.5 rounded-lg font-medium capitalize ${filter === c ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(app => {
          const isConnected = connected.includes(app.provider);
          return (
            <div key={app.provider} className="card-hover p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white ring-1 ring-ink-100 shadow-sm flex-shrink-0">
                  <BrandLogo provider={app.provider} size={32} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-ink-800 truncate">{app.name}</h3>
                  <p className="text-xs text-ink-500">{app.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="neutral">{app.authType === 'oauth' ? 'OAuth' : 'API Key'}</Badge>
                <a href={app.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                  Docs <ExternalLink size={10} />
                </a>
              </div>
              <button
                onClick={() => toggleConnect(app)}
                disabled={busy === app.provider}
                className={`btn-sm w-full ${isConnected ? 'bg-success-600 text-white hover:bg-success-700' : 'btn-secondary'}`}
              >
                {busy === app.provider ? '...' : isConnected ? <><Check size={14} /> {lang === 'fr' ? 'Connecté' : 'Connected'}</> : <><Plus size={14} /> {lang === 'fr' ? 'Connecter' : 'Connect'}</>}
              </button>
            </div>
          );
        })}
      </div>

      <Modal open={!!configApp} onClose={() => setConfigApp(null)} title={lang === 'fr' ? `Connecter ${configApp?.name}` : `Connect ${configApp?.name}`} size="md">
        <div className="space-y-4">
          {configApp?.authType === 'oauth' ? (
            <div className="rounded-lg bg-primary-50 border border-primary-200 p-4 text-sm text-primary-800">
              <p className="font-medium mb-2">{lang === 'fr' ? 'Authentification OAuth' : 'OAuth Authentication'}</p>
              <p className="text-primary-700 mb-3">
                {lang === 'fr' ? 'Vous serez redirigé vers le site de ' : 'You will be redirected to '}
                <span className="font-semibold">{configApp?.name}</span>
                {lang === 'fr' ? ' pour autoriser l\'accès. Après autorisation, l\'app sera connectée à votre compte.' : ' to authorize access. After authorization, the app will be connected to your account.'}
              </p>
              <button onClick={() => oauthConnect(configApp)} disabled={connecting} className="btn-primary btn-sm w-full">
                <ExternalLink size={14} />
                {lang === 'fr' ? 'Continuer vers ' : 'Continue to '}{configApp?.name}
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink-500">
                {lang === 'fr' ? 'Entrez vos identifiants API. Vous pouvez les trouver dans la documentation de ' : 'Enter your API credentials. You can find them in the '}
                <a href={configApp?.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{configApp?.name} docs</a>.
              </p>
              {configApp?.configFields?.map(field => (
                <div key={field.key}>
                  <label className="label">{field.label}</label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' ? 'password' : 'text'}
                      className="input pr-10"
                      value={configData[field.key] || ''}
                      onChange={e => setConfigData({ ...configData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfigApp(null)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
                <button onClick={confirmConnect} disabled={connecting || (configApp?.configFields || []).some(f => !configData[f.key])} className="btn-primary btn-sm">
                  {connecting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {lang === 'fr' ? 'Connecter' : 'Connect'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export function ConnectedAppsPage() {
  const { language } = useAuth();
  const lang = language;
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [editApp, setEditApp] = useState<Integration | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('integrations').select('*').order('created_at', { ascending: false });
    setIntegrations((data || []) as Integration[]);
    setLoading(false);
  }

  async function disconnect(id: string) {
    setBusy(id);
    await supabase.from('integrations').delete().eq('id', id);
    setBusy(null);
    load();
  }

  async function syncApp(intg: Integration) {
    setBusy(intg.id);
    await supabase.from('integrations').update({ last_sync_at: new Date().toISOString() }).eq('id', intg.id);
    setBusy(null);
    load();
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.connectedApps', lang)} subtitle="" />
      {integrations.length === 0 ? (
        <div className="card"><EmptyState icon={<Plug size={28} />} title={lang === 'fr' ? 'Aucune app connectée' : 'No connected apps'} description={lang === 'fr' ? 'Connectez des apps depuis le marketplace.' : 'Connect apps from the marketplace to sync your data.'} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(intg => {
            const appDef = AVAILABLE_APPS.find(a => a.provider === intg.provider);
            return (
              <div key={intg.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-ink-100 shadow-sm flex-shrink-0">
                      <BrandLogo provider={intg.provider} size={28} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-ink-800 capitalize truncate">{appDef?.name || intg.provider}</p>
                      <p className="text-xs text-ink-500">{intg.category}</p>
                    </div>
                  </div>
                  <Badge variant={intg.status === 'connected' ? 'success' : 'neutral'}>{intg.status}</Badge>
                </div>
                {intg.last_sync_at && (
                  <p className="text-xs text-ink-400 mb-3">{lang === 'fr' ? 'Dernière sync: ' : 'Last sync: '}{new Date(intg.last_sync_at).toLocaleString(lang)}</p>
                )}
                <div className="flex items-center gap-2">
                  {appDef?.authType === 'api_key' && (
                    <button onClick={() => setEditApp(intg)} className="btn-ghost btn-sm flex-1" title={lang === 'fr' ? 'Configurer' : 'Configure'}>
                      <SettingsIcon size={14} /> {lang === 'fr' ? 'Config' : 'Config'}
                    </button>
                  )}
                  <button onClick={() => syncApp(intg)} disabled={busy === intg.id} className="btn-ghost btn-sm flex-1" title={lang === 'fr' ? 'Synchroniser' : 'Sync'}>
                    {busy === intg.id ? <Loader2 size={14} className="animate-spin" /> : <Plug size={14} />} {lang === 'fr' ? 'Sync' : 'Sync'}
                  </button>
                  <button onClick={() => disconnect(intg.id)} disabled={busy === intg.id} className="btn-secondary btn-sm flex-1">
                    {lang === 'fr' ? 'Déconnecter' : 'Disconnect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!editApp} onClose={() => setEditApp(null)} title={lang === 'fr' ? 'Configuration' : 'Configuration'} size="md">
        {editApp && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <BrandLogo provider={editApp.provider} size={28} />
              <span className="font-bold text-ink-800 capitalize">{editApp.provider}</span>
            </div>
            <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-600 font-mono">
              {Object.entries(editApp.config || {}).filter(([k]) => k !== 'key_prefix').map(([k, v]) => (
                <div key={k} className="flex justify-between py-0.5">
                  <span className="text-ink-500">{k}:</span>
                  <span className="truncate ml-2 max-w-[150px]">{String(v).substring(0, 8)}••••</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-400">{lang === 'fr' ? 'Pour des raisons de sécurité, les valeurs sont masquées. Déconnectez et reconnectez pour mettre à jour.' : 'For security, values are masked. Disconnect and reconnect to update.'}</p>
            <button onClick={() => { disconnect(editApp.id); setEditApp(null); }} className="btn-secondary btn-sm w-full">
              {lang === 'fr' ? 'Déconnecter pour reconfigurer' : 'Disconnect to reconfigure'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100 transition-colors"
      title="Copy"
    >
      {copied ? <><Check size={12} className="text-success-600" /> {label || 'Copied!'}</> : <><Copy size={12} /> {label || 'Copy'}</>}
    </button>
  );
}

export function APIWebhooksPage() {
  const { language } = useAuth();
  const lang = language;
  const [tab, setTab] = useState<'keys' | 'webhooks'>('keys');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [whUrl, setWhUrl] = useState('');
  const [whEvents, setWhEvents] = useState<string[]>([]);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    const [keysRes, whRes] = await Promise.all([
      supabase.from('api_keys').select('*').order('created_at', { ascending: false }),
      supabase.from('webhooks').select('*').order('created_at', { ascending: false }),
    ]);
    setApiKeys((keysRes.data || []) as ApiKey[]);
    setWebhooks((whRes.data || []) as WebhookType[]);
    setLoading(false);
  }

  async function createKey() {
    if (!keyName.trim()) return;
    const rand = () => crypto.getRandomValues(new Uint8Array(24)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
    const fullKey = 'atlas_sk_' + rand();
    const keyPrefix = fullKey.substring(0, 18) + '••••';
    const { data, error } = await supabase.from('api_keys').insert({
      name: keyName.trim(),
      key_prefix: keyPrefix,
      permissions: { scopes: ['read', 'write'] },
    }).select().single();
    if (!error && data) {
      setNewlyCreatedKey(fullKey);
      setApiKeys(prev => [data as ApiKey, ...prev]);
    }
    setKeyName('');
    setModalOpen(false);
  }

  async function revokeKey(id: string) {
    if (!confirm(lang === 'fr' ? 'Révoquer cette clé ? Elle ne pourra plus être utilisée.' : 'Revoke this key? It cannot be used anymore.')) return;
    await supabase.from('api_keys').update({ active: false }).eq('id', id);
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, active: false } : k));
  }

  async function createWebhook() {
    if (!whUrl.trim() || whEvents.length === 0) return;
    const randSec = () => crypto.getRandomValues(new Uint8Array(24)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
    const secret = 'whsec_' + randSec();
    const { data, error } = await supabase.from('webhooks').insert({
      url: whUrl.trim(),
      events: whEvents,
      secret,
      active: true,
    }).select().single();
    if (!error && data) {
      setWebhooks(prev => [data as WebhookType, ...prev]);
      setWhUrl(''); setWhEvents([]);
      setModalOpen(false);
    }
  }

  async function toggleWebhook(wh: WebhookType) {
    const next = !wh.active;
    await supabase.from('webhooks').update({ active: next }).eq('id', wh.id);
    setWebhooks(prev => prev.map(w => w.id === wh.id ? { ...w, active: next } : w));
  }

  async function deleteWebhook(id: string) {
    if (!confirm(lang === 'fr' ? 'Supprimer ce webhook ?' : 'Delete this webhook?')) return;
    await supabase.from('webhooks').delete().eq('id', id);
    setWebhooks(prev => prev.filter(w => w.id !== id));
  }

  async function testWebhook(wh: WebhookType) {
    setTesting(wh.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ url: wh.url, secret: wh.secret, event: 'test.ping' }),
      });
      const result = await res.json();
      setTestResult(prev => ({ ...prev, [wh.id]: { ok: result.ok, msg: result.msg } }));
      if (result.ok) {
        await supabase.from('webhooks').update({ last_response_code: 200, last_triggered_at: new Date().toISOString() }).eq('id', wh.id);
      }
    } catch (e: any) {
      setTestResult(prev => ({ ...prev, [wh.id]: { ok: false, msg: e.message } }));
    }
    setTesting(null);
  }

  if (loading) return <Loading text={t('common.loading', lang)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.apiWebhooks', lang)}
        actions={
          <button onClick={() => { setModalOpen(true); setNewlyCreatedKey(null); }} className="btn-primary btn-sm">
            <Plus size={16} /> {tab === 'keys' ? (lang === 'fr' ? 'Nouvelle clé' : 'New API Key') : (lang === 'fr' ? 'Nouveau webhook' : 'New Webhook')}
          </button>
        }
      />
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('keys')} className={`btn-sm px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'keys' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
          <Key size={14} className="inline mr-1.5" /> API Keys ({apiKeys.length})
        </button>
        <button onClick={() => setTab('webhooks')} className={`btn-sm px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'webhooks' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
          <Webhook size={14} className="inline mr-1.5" /> Webhooks ({webhooks.length})
        </button>
      </div>

      {tab === 'keys' ? (
        <div className="space-y-4">
          {newlyCreatedKey && (
            <div className="card p-5 border-2 border-warning-300 bg-warning-50">
              <div className="flex items-center gap-2 mb-2">
                <Key size={18} className="text-warning-600" />
                <h3 className="font-bold text-warning-800">{lang === 'fr' ? 'Clé API créée — copiez-la maintenant !' : 'API Key created — copy it now!'}</h3>
              </div>
              <p className="text-sm text-warning-700 mb-3">{lang === 'fr' ? 'Pour des raisons de sécurité, cette clé ne sera plus jamais affichée.' : 'For security, this key will never be shown again.'}</p>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-warning-200 p-3">
                <code className="flex-1 text-sm font-mono text-ink-800 break-all">{newlyCreatedKey}</code>
                <CopyButton text={newlyCreatedKey} label={lang === 'fr' ? 'Copier' : 'Copy'} />
              </div>
              <button onClick={() => setNewlyCreatedKey(null)} className="btn-secondary btn-sm mt-3">{lang === 'fr' ? 'J\'ai copié la clé' : 'I\'ve copied the key'}</button>
            </div>
          )}
          {apiKeys.length === 0 ? (
            <div className="card"><EmptyState icon={<Key size={28} />} title={lang === 'fr' ? 'Aucune clé API' : 'No API keys'} description={lang === 'fr' ? 'Créez une clé pour accéder à l\'API Atlas CRM.' : 'Create an API key to access the Atlas CRM API.'} /></div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                  <thead><tr className="border-b border-ink-100 bg-ink-50/50">
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wide px-4 py-3">{lang === 'fr' ? 'Nom' : 'Name'}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wide px-4 py-3">{lang === 'fr' ? 'Clé' : 'Key'}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wide px-4 py-3">{lang === 'fr' ? 'Statut' : 'Status'}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">{lang === 'fr' ? 'Créée le' : 'Created'}</th>
                    <th className="w-28 px-4 py-3" />
                  </tr></thead>
                  <tbody>
                    {apiKeys.map(k => (
                      <tr key={k.id} className="border-b border-ink-50 last:border-0 table-row-hover">
                        <td className="px-4 py-3 text-sm font-medium text-ink-800">{k.name}</td>
                        <td className="px-4 py-3 text-sm text-ink-500 font-mono">
                          <div className="flex items-center gap-2">
                            <span>{showKeyMap[k.id] ? (k.key_prefix || '••••') : `${(k.key_prefix || '••••').split('•')[0]}••••`}</span>
                            <button onClick={() => setShowKeyMap(prev => ({ ...prev, [k.id]: !prev[k.id] }))} className="p-1 text-ink-400 hover:text-ink-600">
                              {showKeyMap[k.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <CopyButton text={k.key_prefix || ''} />
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant={k.active ? 'success' : 'neutral'}>{k.active ? (lang === 'fr' ? 'Active' : 'Active') : (lang === 'fr' ? 'Révoquée' : 'Revoked')}</Badge></td>
                        <td className="px-4 py-3 text-sm text-ink-500 hidden sm:table-cell">{new Date(k.created_at).toLocaleDateString(lang)}</td>
                        <td className="px-4 py-3">
                          {k.active && (
                            <button onClick={() => revokeKey(k.id)} title={lang === 'fr' ? 'Révoquer' : 'Revoke'} className="p-1.5 rounded text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors">
                              <Ban size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="card p-4 bg-primary-50/50 border border-primary-100">
            <p className="text-xs text-ink-600">
              <span className="font-semibold">{lang === 'fr' ? 'Comment l\'utiliser : ' : 'How to use: '}</span>
              {lang === 'fr' ? 'Ajoutez l\'en-tête `Authorization: Bearer atlas_sk_...` à vos requêtes API.' : 'Add the `Authorization: Bearer atlas_sk_...` header to your API requests.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.length === 0 ? (
            <div className="card"><EmptyState icon={<Webhook size={28} />} title={lang === 'fr' ? 'Aucun webhook' : 'No webhooks'} description={lang === 'fr' ? 'Enregistrez un webhook pour recevoir des notifications en temps réel.' : 'Register a webhook to receive real-time event notifications.'} /></div>
          ) : (
            <div className="space-y-3">
              {webhooks.map(wh => (
                <div key={wh.id} className="card p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Webhook size={16} className="text-primary-600 flex-shrink-0" />
                        <p className="font-medium text-ink-800 font-mono text-sm break-all">{wh.url}</p>
                        <CopyButton text={wh.url} />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {wh.events.map(ev => (
                          <span key={ev} className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">{ev}</span>
                        ))}
                      </div>
                      {wh.secret && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-ink-400">{lang === 'fr' ? 'Secret de signature :' : 'Signing secret:'}</span>
                          <code className="text-xs font-mono text-ink-600 bg-ink-50 px-2 py-0.5 rounded">{showKeyMap[wh.id] ? wh.secret : 'whsec_••••••••'}</code>
                          <button onClick={() => setShowKeyMap(prev => ({ ...prev, [wh.id]: !prev[wh.id] }))} className="p-1 text-ink-400 hover:text-ink-600">
                            {showKeyMap[wh.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <CopyButton text={wh.secret} />
                        </div>
                      )}
                      {wh.last_triggered_at && (
                        <p className="text-xs text-ink-400">{lang === 'fr' ? 'Dernier déclenchement : ' : 'Last triggered: '}{new Date(wh.last_triggered_at).toLocaleString(lang)}{wh.last_response_code !== null && ` (${wh.last_response_code})`}</p>
                      )}
                      {testResult[wh.id] && (
                        <p className={`text-xs mt-1 ${testResult[wh.id].ok ? 'text-success-600' : 'text-error-600'}`}>
                          {lang === 'fr' ? 'Test : ' : 'Test: '}{testResult[wh.id].msg}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={wh.active ? 'success' : 'neutral'}>{wh.active ? (lang === 'fr' ? 'Actif' : 'Active') : (lang === 'fr' ? 'Désactivé' : 'Disabled')}</Badge>
                      <button onClick={() => testWebhook(wh)} disabled={testing === wh.id} title={lang === 'fr' ? 'Tester' : 'Test'} className="p-1.5 rounded text-ink-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                        {testing === wh.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </button>
                      <button onClick={() => toggleWebhook(wh)} title={wh.active ? (lang === 'fr' ? 'Désactiver' : 'Disable') : (lang === 'fr' ? 'Activer' : 'Enable')} className="p-1.5 rounded text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors">
                        <Plug size={14} />
                      </button>
                      <button onClick={() => deleteWebhook(wh.id)} title={lang === 'fr' ? 'Supprimer' : 'Delete'} className="p-1.5 rounded text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="card p-4 bg-primary-50/50 border border-primary-100">
            <p className="text-xs text-ink-600">
              <span className="font-semibold">{lang === 'fr' ? 'Comment ça marche : ' : 'How it works: '}</span>
              {lang === 'fr' ? 'Atlas CRM envoie un POST JSON à votre URL avec l\'en-tête `X-Atlas-Signature` contenant le secret. Vérifiez le secret pour confirmer l\'origine.' : 'Atlas CRM sends a JSON POST to your URL with an `X-Atlas-Signature` header containing the secret. Verify the secret to confirm authenticity.'}
            </p>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={tab === 'keys' ? (lang === 'fr' ? 'Nouvelle clé API' : 'New API Key') : (lang === 'fr' ? 'Nouveau webhook' : 'New Webhook')}>
        {tab === 'keys' ? (
          <div>
            <label className="label">{lang === 'fr' ? 'Nom de la clé' : 'Key Name'}</label>
            <input className="input" value={keyName} onChange={e => setKeyName(e.target.value)} placeholder={lang === 'fr' ? 'ex: Production API' : 'e.g. Production API'} autoFocus />
            <p className="text-xs text-ink-400 mt-2">{lang === 'fr' ? 'La clé complète sera affichée une seule fois après création.' : 'The full key will be shown once after creation.'}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
              <button onClick={createKey} disabled={!keyName.trim()} className="btn-primary btn-sm">{t('common.create', lang)}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">{lang === 'fr' ? 'URL du webhook' : 'Webhook URL'}</label>
              <input className="input" value={whUrl} onChange={e => setWhUrl(e.target.value)} placeholder="https://example.com/webhook" autoFocus />
            </div>
            <div>
              <label className="label">{lang === 'fr' ? 'Événements à écouter' : 'Events to listen'}</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin p-1">
                {WEBHOOK_EVENTS.map(ev => (
                  <label key={ev} className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whEvents.includes(ev)}
                      onChange={e => setWhEvents(e.target.checked ? [...whEvents, ev] : whEvents.filter(x => x !== ev))}
                      className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="font-mono text-xs">{ev}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-1">{whEvents.length} {lang === 'fr' ? 'événement(s) sélectionné(s)' : 'event(s) selected'}</p>
            </div>
            <div>
              <label className="label">{lang === 'fr' ? 'Secret de signature (auto-généré)' : 'Signing secret (auto-generated)'}</label>
              <p className="text-xs text-ink-400">{lang === 'fr' ? 'Un secret sera généré automatiquement pour sécuriser vos webhooks.' : 'A secret will be auto-generated to secure your webhooks.'}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
              <button onClick={createWebhook} disabled={!whUrl.trim() || whEvents.length === 0} className="btn-primary btn-sm">{t('common.create', lang)}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
