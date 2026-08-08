import { Store, Plug, Webhook, Plus, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { Modal } from '@/components/Modal';
import type { Integration, ApiKey, Webhook as WebhookType } from '@/types';

const AVAILABLE_APPS = [
  { provider: 'gmail', name: 'Gmail', category: 'Email', color: 'bg-error-50 text-error-600' },
  { provider: 'outlook', name: 'Outlook', category: 'Email', color: 'bg-primary-50 text-primary-600' },
  { provider: 'stripe', name: 'Stripe', category: 'Payments', color: 'bg-secondary-50 text-secondary-600' },
  { provider: 'slack', name: 'Slack', category: 'Communication', color: 'bg-accent-50 text-accent-600' },
  { provider: 'zoom', name: 'Zoom', category: 'Video', color: 'bg-primary-50 text-primary-600' },
  { provider: 'hubspot', name: 'HubSpot', category: 'CRM', color: 'bg-warning-50 text-warning-600' },
  { provider: 'quickbooks', name: 'QuickBooks', category: 'Accounting', color: 'bg-secondary-50 text-secondary-600' },
  { provider: 'mailchimp', name: 'Mailchimp', category: 'Marketing', color: 'bg-accent-50 text-accent-600' },
  { provider: 'twilio', name: 'Twilio', category: 'SMS', color: 'bg-error-50 text-error-600' },
  { provider: 'shopify', name: 'Shopify', category: 'E-commerce', color: 'bg-success-50 text-success-600' },
];

export function MarketplacePage() {
  const { language } = useAuth();
  const lang = language;
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.appMarketplace', lang)} subtitle="" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AVAILABLE_APPS.map(app => (
          <div key={app.provider} className="card-hover p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${app.color}`}>
                <Store size={22} />
              </div>
              <div>
                <h3 className="font-bold text-ink-800">{app.name}</h3>
                <p className="text-xs text-ink-500">{app.category}</p>
              </div>
            </div>
            <button className="btn-secondary btn-sm w-full">
              <Plus size={14} /> {lang === 'fr' ? 'Connecter' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConnectedAppsPage() {
  const { language } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('integrations').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setIntegrations((data || []) as Integration[]); setLoading(false); });
  }, []);

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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Plug size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-ink-800">{intg.provider}</p>
                    <p className="text-xs text-ink-500">{intg.category}</p>
                  </div>
                </div>
                <Badge variant={intg.status === 'connected' ? 'success' : 'neutral'}>{intg.status}</Badge>
              </div>
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

  async function createWebhook() {
    await supabase.from('webhooks').insert({ url: whUrl, events: whEvents.split(',').map(e => e.trim()) });
    setModalOpen(false); setWhUrl(''); setWhEvents('');
    const { data } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false });
    setWebhooks((data || []) as WebhookType[]);
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
              </tr></thead>
              <tbody>
                {apiKeys.map(k => (
                  <tr key={k.id} className="border-b border-ink-50 last:border-0 table-row-hover">
                    <td className="px-4 py-3 text-sm font-medium text-ink-800">{k.name}</td>
                    <td className="px-4 py-3 text-sm text-ink-500 font-mono">{k.key_prefix}••••</td>
                    <td className="px-4 py-3"><Badge variant={k.active ? 'success' : 'neutral'}>{k.active ? 'Active' : 'Revoked'}</Badge></td>
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
                <Badge variant={wh.active ? 'success' : 'neutral'}>{wh.active ? 'Active' : 'Disabled'}</Badge>
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
