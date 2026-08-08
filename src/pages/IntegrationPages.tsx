import { Store, Plug, Webhook, Plus, Check, Trash2, Ban } from 'lucide-react';
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

const AVAILABLE_APPS = [
  { provider: 'gmail', name: 'Gmail', category: 'Email' },
  { provider: 'outlook', name: 'Outlook', category: 'Email' },
  { provider: 'stripe', name: 'Stripe', category: 'Payments' },
  { provider: 'slack', name: 'Slack', category: 'Communication' },
  { provider: 'zoom', name: 'Zoom', category: 'Video' },
  { provider: 'hubspot', name: 'HubSpot', category: 'CRM' },
  { provider: 'quickbooks', name: 'QuickBooks', category: 'Accounting' },
  { provider: 'mailchimp', name: 'Mailchimp', category: 'Marketing' },
  { provider: 'twilio', name: 'Twilio', category: 'SMS' },
  { provider: 'shopify', name: 'Shopify', category: 'E-commerce' },
];

export function MarketplacePage() {
  const { language } = useAuth();
  const lang = language;
  const [connected, setConnected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('integrations').select('provider,status')
      .then(({ data }) => {
        setConnected((data || []).filter((i: Integration) => i.status === 'connected').map((i: Integration) => i.provider));
      });
  }, []);

  async function toggleConnect(provider: string, name: string, category: string) {
    setBusy(provider);
    if (connected.includes(provider)) {
      await supabase.from('integrations').delete().eq('provider', provider);
      setConnected(prev => prev.filter(p => p !== provider));
    } else {
      const { error } = await supabase.from('integrations').insert({
        provider,
        category,
        status: 'connected',
        connected_at: new Date().toISOString(),
      });
      if (!error) setConnected(prev => [...prev, provider]);
    }
    setBusy(null);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.appMarketplace', lang)} subtitle="" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AVAILABLE_APPS.map(app => {
          const isConnected = connected.includes(app.provider);
          return (
            <div key={app.provider} className="card-hover p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white ring-1 ring-ink-100 shadow-sm">
                  <BrandLogo provider={app.provider} size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-ink-800">{app.name}</h3>
                  <p className="text-xs text-ink-500">{app.category}</p>
                </div>
              </div>
              <button
                onClick={() => toggleConnect(app.provider, app.name, app.category)}
                disabled={busy === app.provider}
                className={`btn-sm w-full ${isConnected ? 'bg-success-600 text-white hover:bg-success-700' : 'btn-secondary'}`}
              >
                {isConnected ? <><Check size={14} /> {lang === 'fr' ? 'Connecté' : 'Connected'}</> : <><Plus size={14} /> {lang === 'fr' ? 'Connecter' : 'Connect'}</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConnectedAppsPage() {
  const { language } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

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

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.connectedApps', language)} subtitle="" />
      {integrations.length === 0 ? (
        <div className="card"><EmptyState icon={<Plug size={28} />} title="No connected apps" description="Connect apps from the marketplace to sync your data." /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(intg => (
            <div key={intg.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-ink-100 shadow-sm">
                    <BrandLogo provider={intg.provider} size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-ink-800 capitalize">{intg.provider}</p>
                    <p className="text-xs text-ink-500">{intg.category}</p>
                  </div>
                </div>
                <Badge variant={intg.status === 'connected' ? 'success' : 'neutral'}>{intg.status}</Badge>
              </div>
              <button
                onClick={() => disconnect(intg.id)}
                disabled={busy === intg.id}
                className="btn-secondary btn-sm w-full mt-4"
              >
                {busy === intg.id ? '...' : (language === 'fr' ? 'Déconnecter' : 'Disconnect')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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
  const [whUrl, setWhUrl] = useState('');
  const [whEvents, setWhEvents] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('api_keys').select('*').order('created_at', { ascending: false }),
      supabase.from('webhooks').select('*').order('created_at', { ascending: false }),
    ]).then(([keysRes, whRes]) => {
      setApiKeys((keysRes.data || []) as ApiKey[]);
      setWebhooks((whRes.data || []) as WebhookType[]);
      setLoading(false);
    });
  }, []);

  async function createKey() {
    const prefix = 'atlas_' + Math.random().toString(36).substring(2, 10);
    await supabase.from('api_keys').insert({ name: keyName, key_prefix: prefix });
    setModalOpen(false); setKeyName('');
    const { data } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
    setApiKeys((data || []) as ApiKey[]);
  }

  async function revokeKey(id: string) {
    await supabase.from('api_keys').update({ active: false }).eq('id', id);
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, active: false } : k));
  }

  async function createWebhook() {
    await supabase.from('webhooks').insert({ url: whUrl, events: whEvents.split(',').map(e => e.trim()) });
    setModalOpen(false); setWhUrl(''); setWhEvents('');
    const { data } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false });
    setWebhooks((data || []) as WebhookType[]);
  }

  async function toggleWebhook(wh: WebhookType) {
    const next = !wh.active;
    await supabase.from('webhooks').update({ active: next }).eq('id', wh.id);
    setWebhooks(prev => prev.map(w => w.id === wh.id ? { ...w, active: next } : w));
  }

  async function deleteWebhook(id: string) {
    await supabase.from('webhooks').delete().eq('id', id);
    setWebhooks(prev => prev.filter(w => w.id !== id));
  }

  if (loading) return <Loading text={t('common.loading', lang)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.apiWebhooks', lang)}
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm">
            <Plus size={16} /> {tab === 'keys' ? 'API Key' : 'Webhook'}
          </button>
        }
      />
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('keys')} className={`btn-sm px-3 py-1.5 rounded-lg font-medium ${tab === 'keys' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600'}`}>API Keys</button>
        <button onClick={() => setTab('webhooks')} className={`btn-sm px-3 py-1.5 rounded-lg font-medium ${tab === 'webhooks' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600'}`}>Webhooks</button>
      </div>

      {tab === 'keys' ? (
        apiKeys.length === 0 ? (
          <div className="card"><EmptyState icon={<Webhook size={28} />} title="No API keys" description="Create an API key to access the Atlas CRM API." /></div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Key</th>
                <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr></thead>
              <tbody>
                {apiKeys.map(k => (
                  <tr key={k.id} className="border-b border-ink-50 last:border-0 table-row-hover">
                    <td className="px-4 py-3 text-sm font-medium text-ink-800">{k.name}</td>
                    <td className="px-4 py-3 text-sm text-ink-500 font-mono">{k.key_prefix}••••</td>
                    <td className="px-4 py-3"><Badge variant={k.active ? 'success' : 'neutral'}>{k.active ? 'Active' : 'Revoked'}</Badge></td>
                    <td className="px-4 py-3">
                      {k.active && (
                        <button onClick={() => revokeKey(k.id)} title="Revoke" className="p-1.5 rounded text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors">
                          <Ban size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        webhooks.length === 0 ? (
          <div className="card"><EmptyState icon={<Webhook size={28} />} title="No webhooks" description="Register a webhook to receive real-time event notifications." /></div>
        ) : (
          <div className="space-y-3">
            {webhooks.map(wh => (
              <div key={wh.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-800 font-mono text-sm">{wh.url}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{wh.events.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={wh.active ? 'success' : 'neutral'}>{wh.active ? 'Active' : 'Disabled'}</Badge>
                  <button onClick={() => toggleWebhook(wh)} title={wh.active ? 'Disable' : 'Enable'} className="p-1.5 rounded text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors">
                    <Plug size={14} />
                  </button>
                  <button onClick={() => deleteWebhook(wh.id)} title="Delete" className="p-1.5 rounded text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={tab === 'keys' ? 'New API Key' : 'New Webhook'}>
        {tab === 'keys' ? (
          <div>
            <label className="label">Key Name</label>
            <input className="input" value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="e.g. Production API" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
              <button onClick={createKey} className="btn-primary btn-sm">{t('common.create', lang)}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Webhook URL</label>
              <input className="input" value={whUrl} onChange={e => setWhUrl(e.target.value)} placeholder="https://example.com/webhook" />
            </div>
            <div>
              <label className="label">Events (comma-separated)</label>
              <input className="input" value={whEvents} onChange={e => setWhEvents(e.target.value)} placeholder="contact.created, deal.won" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
              <button onClick={createWebhook} className="btn-primary btn-sm">{t('common.create', lang)}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
