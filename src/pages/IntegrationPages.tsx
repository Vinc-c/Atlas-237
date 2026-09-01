import { Plug, Webhook, Plus, Check, Trash2, Ban, Copy, Key, ExternalLink, Eye, EyeOff, Send, Settings as SettingsIcon, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { getErrorMessage } from '@/lib/errors';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { Modal } from '@/components/Modal';
import { BrandLogo } from '@/components/BrandLogos';
import { UpgradeGate } from '@/components/UpgradeGate';
import { usePlanAccess } from '@/lib/plans';
import type { Integration, ApiKey, Webhook as WebhookType } from '@/types';
import { validateKeyFormat, LIVE_VERIFIABLE_PROVIDERS } from '@/lib/integrationValidation';
import { WEBHOOK_EVENTS } from '@/lib/webhooks';

interface AppDef {
  provider: string;
  name: string;
  category: string;
  authType: 'oauth' | 'api_key' | 'webhook_url';
  configFields?: { key: string; label: string; placeholder: string; type?: string }[];
  docsUrl: string;
  /** Only meaningful for category 'Payments' — drives the Cards/Mobile Money/Transfers sub-filter. */
  paymentType?: 'cards' | 'mobile_money' | 'transfers';
}

const AVAILABLE_APPS: AppDef[] = [
  { provider: 'openai', name: 'OpenAI (ChatGPT)', category: 'AI', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'sk-xxx', type: 'password' }], docsUrl: 'https://platform.openai.com/api-keys' },
  { provider: 'anthropic', name: 'Anthropic (Claude)', category: 'AI', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'sk-ant-xxx', type: 'password' }], docsUrl: 'https://console.anthropic.com/settings/keys' },
  { provider: 'gemini', name: 'Google Gemini', category: 'AI', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'AIzaSy...', type: 'password' }], docsUrl: 'https://aistudio.google.com/apikey' },
  { provider: 'libooks', name: 'Libooks', category: 'Accounting', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'lbk_live_xxx', type: 'password' }, { key: 'workspace_id', label: 'Workspace ID', placeholder: 'e.g. your Libooks workspace slug' }], docsUrl: 'https://libooks.liafrik.com' },
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
  { provider: 'sellia', name: 'Sellia', category: 'E-commerce', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'sel_live_xxx', type: 'password' }, { key: 'store_id', label: 'Store ID', placeholder: 'e.g. your Sellia store slug' }], docsUrl: 'https://sellia.liafrik.com' },
  { provider: 'woocommerce', name: 'WooCommerce', category: 'E-commerce', authType: 'api_key', configFields: [{ key: 'shop_url', label: 'Store URL', placeholder: 'https://mystore.com' }, { key: 'consumer_key', label: 'Consumer Key', placeholder: 'ck_xxx' }, { key: 'consumer_secret', label: 'Consumer Secret', placeholder: 'cs_xxx', type: 'password' }], docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs' },
  { provider: 'prestashop', name: 'PrestaShop', category: 'E-commerce', authType: 'api_key', configFields: [{ key: 'shop_url', label: 'Store URL', placeholder: 'https://mystore.com' }, { key: 'api_key', label: 'Webservice Key', placeholder: 'PSWS_xxx', type: 'password' }], docsUrl: 'https://devdocs.prestashop-project.org/8/webservice' },
  { provider: 'bigcommerce', name: 'BigCommerce', category: 'E-commerce', authType: 'api_key', configFields: [{ key: 'store_hash', label: 'Store Hash', placeholder: 'abc123' }, { key: 'access_token', label: 'Access Token', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://developer.bigcommerce.com' },

  // Automation
  { provider: 'zapier', name: 'Zapier', category: 'Automation', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'zap_xxx', type: 'password' }], docsUrl: 'https://zapier.com/developer' },
  { provider: 'make', name: 'Make (Integromat)', category: 'Automation', authType: 'api_key', configFields: [{ key: 'api_token', label: 'API Token', placeholder: 'mk_xxx', type: 'password' }], docsUrl: 'https://www.make.com/en/api-documentation' },
  { provider: 'n8n', name: 'n8n', category: 'Automation', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'n8n_api_xxx', type: 'password' }, { key: 'instance_url', label: 'Instance URL', placeholder: 'https://myinstance.n8n.cloud' }], docsUrl: 'https://docs.n8n.io' },
  { provider: 'pipedream', name: 'Pipedream', category: 'Automation', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'pd_xxx', type: 'password' }], docsUrl: 'https://pipedream.com/docs/api/rest' },

  // Payments
  { provider: 'paypal', name: 'PayPal', category: 'Payments', authType: 'oauth', docsUrl: 'https://developer.paypal.com/docs/api/overview', paymentType: 'cards' },
  { provider: 'adyen', name: 'Adyen', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'AQE...', type: 'password' }, { key: 'merchant_account', label: 'Merchant Account', placeholder: 'YourCompanyECOM' }], docsUrl: 'https://docs.adyen.com', paymentType: 'cards' },
  { provider: 'mollie', name: 'Mollie', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'live_xxx', type: 'password' }], docsUrl: 'https://docs.mollie.com', paymentType: 'cards' },
  { provider: 'checkout_com', name: 'Checkout.com', category: 'Payments', authType: 'api_key', configFields: [{ key: 'secret_key', label: 'Secret Key', placeholder: 'sk_xxx', type: 'password' }], docsUrl: 'https://api-reference.checkout.com', paymentType: 'cards' },
  { provider: 'worldline', name: 'Worldline', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }, { key: 'merchant_id', label: 'Merchant ID', placeholder: 'xxx' }], docsUrl: 'https://docs.worldline-solutions.com', paymentType: 'cards' },
  { provider: 'nexi', name: 'Nexi', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://developer.nexi.it', paymentType: 'cards' },
  { provider: 'gocardless', name: 'GoCardless', category: 'Payments', authType: 'oauth', docsUrl: 'https://developer.gocardless.com', paymentType: 'transfers' },
  { provider: 'viva_wallet', name: 'Viva Wallet', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }, { key: 'merchant_id', label: 'Merchant ID', placeholder: 'xxx' }], docsUrl: 'https://developer.vivawallet.com', paymentType: 'cards' },
  { provider: 'revolut_business', name: 'Revolut Business', category: 'Payments', authType: 'oauth', docsUrl: 'https://developer.revolut.com/docs/business', paymentType: 'transfers' },
  { provider: 'flutterwave', name: 'Flutterwave', category: 'Payments', authType: 'api_key', configFields: [{ key: 'secret_key', label: 'Secret Key', placeholder: 'FLWSECK-xxx', type: 'password' }], docsUrl: 'https://developer.flutterwave.com/docs', paymentType: 'mobile_money' },
  { provider: 'paystack', name: 'Paystack', category: 'Payments', authType: 'api_key', configFields: [{ key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_xxx', type: 'password' }], docsUrl: 'https://paystack.com/docs/api', paymentType: 'mobile_money' },
  { provider: 'mpesa', name: 'M-Pesa', category: 'Payments', authType: 'api_key', configFields: [{ key: 'consumer_key', label: 'Consumer Key', placeholder: 'xxx' }, { key: 'consumer_secret', label: 'Consumer Secret', placeholder: 'xxx', type: 'password' }, { key: 'shortcode', label: 'Shortcode', placeholder: '174379' }], docsUrl: 'https://developer.safaricom.co.ke', paymentType: 'mobile_money' },
  { provider: 'interswitch', name: 'Interswitch', category: 'Payments', authType: 'api_key', configFields: [{ key: 'client_id', label: 'Client ID', placeholder: 'xxx' }, { key: 'client_secret', label: 'Client Secret', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://docs.interswitchgroup.com', paymentType: 'cards' },
  { provider: 'dpo_group', name: 'DPO Group', category: 'Payments', authType: 'api_key', configFields: [{ key: 'company_token', label: 'Company Token', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://docs.dpogroup.com', paymentType: 'mobile_money' },
  { provider: 'cellulant', name: 'Cellulant', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://developers.cellulant.io', paymentType: 'mobile_money' },
  { provider: 'fawry', name: 'Fawry', category: 'Payments', authType: 'api_key', configFields: [{ key: 'merchant_code', label: 'Merchant Code', placeholder: 'xxx' }, { key: 'security_key', label: 'Security Key', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://developer.fawry.com', paymentType: 'mobile_money' },
  { provider: 'payfast', name: 'PayFast', category: 'Payments', authType: 'api_key', configFields: [{ key: 'merchant_id', label: 'Merchant ID', placeholder: 'xxx' }, { key: 'merchant_key', label: 'Merchant Key', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://developers.payfast.co.za', paymentType: 'cards' },
  { provider: 'peach_payments', name: 'Peach Payments', category: 'Payments', authType: 'api_key', configFields: [{ key: 'entity_id', label: 'Entity ID', placeholder: 'xxx' }, { key: 'access_token', label: 'Access Token', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://docs.peachpayments.com', paymentType: 'cards' },
  { provider: 'payunit', name: 'PayUnit', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }, { key: 'api_username', label: 'API Username', placeholder: 'xxx' }], docsUrl: 'https://docs.payunit.net', paymentType: 'mobile_money' },
  { provider: 'campay', name: 'CamPay', category: 'Payments', authType: 'api_key', configFields: [{ key: 'app_username', label: 'App Username', placeholder: 'xxx' }, { key: 'app_password', label: 'App Password', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://www.campay.net/docs', paymentType: 'mobile_money' },
  { provider: 'cinetpay', name: 'CinetPay', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }, { key: 'site_id', label: 'Site ID', placeholder: 'xxx' }], docsUrl: 'https://docs.cinetpay.com', paymentType: 'mobile_money' },
  { provider: 'kkiapay', name: 'Kkiapay', category: 'Payments', authType: 'api_key', configFields: [{ key: 'private_key', label: 'Private Key', placeholder: 'xxx', type: 'password' }, { key: 'public_key', label: 'Public Key', placeholder: 'xxx' }], docsUrl: 'https://docs.kkiapay.me', paymentType: 'mobile_money' },
  { provider: 'wave', name: 'Wave', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'wave_sn_prod_xxx', type: 'password' }], docsUrl: 'https://docs.wave.com/business', paymentType: 'mobile_money' },
  { provider: 'orange_money', name: 'Orange Money API', category: 'Payments', authType: 'api_key', configFields: [{ key: 'client_id', label: 'Client ID', placeholder: 'xxx' }, { key: 'client_secret', label: 'Client Secret', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://developer.orange.com/apis/om-webpay', paymentType: 'mobile_money' },
  { provider: 'mtn_momo', name: 'MTN MoMo API', category: 'Payments', authType: 'api_key', configFields: [{ key: 'subscription_key', label: 'Subscription Key', placeholder: 'xxx', type: 'password' }, { key: 'api_user', label: 'API User', placeholder: 'xxx' }], docsUrl: 'https://momodeveloper.mtn.com', paymentType: 'mobile_money' },
  { provider: 'chapa', name: 'Chapa', category: 'Payments', authType: 'api_key', configFields: [{ key: 'secret_key', label: 'Secret Key', placeholder: 'CHASECK-xxx', type: 'password' }], docsUrl: 'https://developer.chapa.co', paymentType: 'mobile_money' },
  { provider: 'semoa', name: 'Semoa', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://semoa.io', paymentType: 'mobile_money' },
  { provider: 'maxicash', name: 'MaxiCash', category: 'Payments', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }, { key: 'merchant_id', label: 'Merchant ID', placeholder: 'xxx' }], docsUrl: 'https://www.maxicashapp.com/developers', paymentType: 'mobile_money' },

  // Accounting
  { provider: 'xero', name: 'Xero', category: 'Accounting', authType: 'oauth', docsUrl: 'https://developer.xero.com' },
  { provider: 'sage', name: 'Sage', category: 'Accounting', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }], docsUrl: 'https://developer.sage.com' },

  // Customer Support
  { provider: 'zendesk', name: 'Zendesk', category: 'Support', authType: 'oauth', docsUrl: 'https://developer.zendesk.com' },
  { provider: 'intercom', name: 'Intercom', category: 'Support', authType: 'oauth', docsUrl: 'https://developers.intercom.com' },
  { provider: 'freshdesk', name: 'Freshdesk', category: 'Support', authType: 'api_key', configFields: [{ key: 'api_key', label: 'API Key', placeholder: 'xxx', type: 'password' }, { key: 'domain', label: 'Domain', placeholder: 'yourcompany.freshdesk.com' }], docsUrl: 'https://developers.freshdesk.com' },

  // Communication / Messaging
  { provider: 'facebook_messenger', name: 'Facebook Messenger', category: 'Messaging', authType: 'oauth', docsUrl: 'https://developers.facebook.com/docs/messenger-platform' },
  { provider: 'instagram_dm', name: 'Instagram DM', category: 'Messaging', authType: 'oauth', docsUrl: 'https://developers.facebook.com/docs/messenger-platform/instagram' },

  // Video
  { provider: 'microsoft_teams', name: 'Microsoft Teams', category: 'Video', authType: 'oauth', docsUrl: 'https://learn.microsoft.com/microsoftteams/platform' },

  // Scheduling
  { provider: 'google_calendar', name: 'Google Calendar', category: 'Scheduling', authType: 'oauth', docsUrl: 'https://developers.google.com/calendar' },

  // Marketing
  { provider: 'meta_ads', name: 'Meta Ads', category: 'Marketing', authType: 'oauth', docsUrl: 'https://developers.facebook.com/docs/marketing-apis' },
  { provider: 'google_ads', name: 'Google Ads', category: 'Marketing', authType: 'oauth', docsUrl: 'https://developers.google.com/google-ads/api/docs/start' },
  { provider: 'linkedin_ads', name: 'LinkedIn Ads', category: 'Marketing', authType: 'oauth', docsUrl: 'https://learn.microsoft.com/linkedin/marketing' },

  // Storage / Documents
  { provider: 'google_drive', name: 'Google Drive', category: 'Storage', authType: 'oauth', docsUrl: 'https://developers.google.com/drive' },
  { provider: 'dropbox', name: 'Dropbox', category: 'Storage', authType: 'oauth', docsUrl: 'https://www.dropbox.com/developers/documentation' },
  { provider: 'docusign', name: 'DocuSign', category: 'Storage', authType: 'oauth', docsUrl: 'https://developers.docusign.com' },

  // Project Management
  { provider: 'notion', name: 'Notion', category: 'Project Management', authType: 'oauth', docsUrl: 'https://developers.notion.com' },
  { provider: 'asana', name: 'Asana', category: 'Project Management', authType: 'oauth', docsUrl: 'https://developers.asana.com' },
  { provider: 'trello', name: 'Trello', category: 'Project Management', authType: 'oauth', docsUrl: 'https://developer.atlassian.com/cloud/trello' },
];

export function MarketplacePage() {
  const { language } = useAuth();
  const lang = language;
  const [connected, setConnected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [configApp, setConfigApp] = useState<AppDef | null>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [paymentSubFilter, setPaymentSubFilter] = useState<'all' | 'cards' | 'mobile_money' | 'transfers'>('all');
  const [customAppOpen, setCustomAppOpen] = useState(false);
  const [customApp, setCustomApp] = useState({
    name: '', baseUrl: '', authType: 'bearer' as 'none' | 'bearer' | 'api_key_header' | 'basic',
    headerName: 'X-API-Key', credential: '', username: '',
  });
  const [customConnecting, setCustomConnecting] = useState(false);
  const [customError, setCustomError] = useState('');

  async function confirmCustomConnect() {
    if (!customApp.name.trim() || !customApp.baseUrl.trim()) return;
    setCustomError('');
    try {
      new URL(customApp.baseUrl);
    } catch {
      setCustomError(lang === 'fr' ? 'URL de base invalide.' : 'Invalid base URL.');
      return;
    }
    setCustomConnecting(true);
    const slug = customApp.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'app';
    const provider = `custom_${slug}_${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from('integrations').insert({
      provider,
      category: 'Custom',
      status: 'connected',
      connected_at: new Date().toISOString(),
      config: {
        display_name: customApp.name.trim(),
        base_url: customApp.baseUrl.trim(),
        auth_type: customApp.authType,
        header_name: customApp.authType === 'api_key_header' ? customApp.headerName : undefined,
        credential: customApp.authType !== 'none' ? customApp.credential : undefined,
        username: customApp.authType === 'basic' ? customApp.username : undefined,
        is_custom: true,
      },
    });
    if (error) { setCustomError(error.message); setCustomConnecting(false); return; }
    setConnected(prev => [...prev, provider]);
    setCustomAppOpen(false);
    setCustomApp({ name: '', baseUrl: '', authType: 'bearer', headerName: 'X-API-Key', credential: '', username: '' });
    setCustomConnecting(false);
  }

  useEffect(() => {
    supabase.from('integrations').select('provider,status')
      .then(({ data }) => {
        const rows = (data || []) as Pick<Integration, 'provider' | 'status'>[];
        setConnected(rows.filter((i) => i.status === 'connected').map((i) => i.provider));
      });
  }, []);

  async function toggleConnect(app: AppDef) {
    if (connected.includes(app.provider)) {
      setBusy(app.provider);
      const { error } = await supabase.from('integrations').delete().eq('provider', app.provider);
      if (error) { alert(error.message); setBusy(null); return; }
      setConnected(prev => prev.filter(p => p !== app.provider));
      setBusy(null);
    } else if (app.authType === 'oauth') {
      setConfigApp(app);
      setConnectError('');
    } else {
      setConfigApp(app);
      setConfigData({});
      setConnectError('');
    }
  }

  async function confirmConnect() {
    if (!configApp) return;
    setConnectError('');

    // 1. Format validation — catches an obviously-wrong-provider key
    //    (e.g. a Gemini key pasted into the Claude field) instantly,
    //    with no network call.
    const formatCheck = validateKeyFormat(configApp.provider, configData);
    if (!formatCheck.ok) {
      const field = configApp.configFields?.find(f => f.key === formatCheck.field);
      const fieldLabel = field?.label || (lang === 'fr' ? 'ce champ' : 'this field');
      if (formatCheck.message === 'required') {
        setConnectError(lang === 'fr' ? `${fieldLabel} est requis.` : `${fieldLabel} is required.`);
      } else if (formatCheck.message.startsWith('format_mismatch:')) {
        const hint = formatCheck.message.slice('format_mismatch:'.length);
        setConnectError(
          lang === 'fr'
            ? `Ça ne ressemble pas à une clé ${configApp.name} valide (${hint}). Vérifiez que vous n'avez pas collé la clé d'un autre fournisseur.`
            : `This doesn't look like a valid ${configApp.name} key (${hint}). Double-check you didn't paste a key from a different provider.`
        );
      } else {
        setConnectError(lang === 'fr' ? 'Cette valeur semble incorrecte ou incomplète.' : 'This value looks incorrect or incomplete.');
      }
      return;
    }

    setConnecting(true);

    // 2. Live verification — for the providers we can actually call,
    //    reject a correctly-formatted but wrong/expired/revoked key
    //    before ever saving it as "connected".
    let verified = false;
    if (LIVE_VERIFIABLE_PROVIDERS.has(configApp.provider)) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-integration-key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ provider: configApp.provider, config: configData }),
        });
        const result = await res.json();
        if (!result.ok) {
          setConnectError(result.message || (lang === 'fr' ? 'La vérification a échoué. Vérifiez vos identifiants.' : 'Verification failed. Please check your credentials.'));
          setConnecting(false);
          return;
        }
        verified = Boolean(result.verified);
      } catch {
        // Network/edge-function issue — don't hard-block the connection
        // over an infrastructure hiccup, but don't claim it was verified.
        verified = false;
      }
    }

    const rand = () => crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
    const fullKey = 'atlas_' + configApp.provider + '_' + rand();
    const keyPrefix = fullKey.substring(0, 14);
    const { error } = await supabase.from('integrations').insert({
      provider: configApp.provider,
      category: configApp.category,
      status: 'connected',
      connected_at: new Date().toISOString(),
      config: { ...configData, key_prefix: keyPrefix, auth_type: configApp.authType, verified },
    });
    if (error) { alert(error.message); setConnecting(false); return; }
    setConnected(prev => [...prev, configApp.provider]);
    setConfigApp(null);
    setConfigData({});
    setConnectError('');
    setConnecting(false);
  }

  // OAuth client IDs are public (safe to expose to the frontend) but each provider
  // requires a real app registered in its developer console before it can work.
  // Set these as VITE_<PROVIDER>_CLIENT_ID environment variables once registered;
  // until then, we show an honest "setup required" state instead of a doomed popup.
  const OAUTH_CLIENT_IDS: Record<string, string | undefined> = {
    gmail: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    google_meet: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    slack: import.meta.env.VITE_SLACK_CLIENT_ID,
    zoom: import.meta.env.VITE_ZOOM_CLIENT_ID,
    outlook: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    quickbooks: import.meta.env.VITE_QUICKBOOKS_CLIENT_ID,
    paypal: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    gocardless: import.meta.env.VITE_GOCARDLESS_CLIENT_ID,
    revolut_business: import.meta.env.VITE_REVOLUT_CLIENT_ID,
    xero: import.meta.env.VITE_XERO_CLIENT_ID,
    intercom: import.meta.env.VITE_INTERCOM_CLIENT_ID,
    facebook_messenger: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
    instagram_dm: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
    meta_ads: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
    microsoft_teams: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    google_calendar: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    google_ads: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    google_drive: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    linkedin_ads: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
    dropbox: import.meta.env.VITE_DROPBOX_CLIENT_ID,
    docusign: import.meta.env.VITE_DOCUSIGN_CLIENT_ID,
    notion: import.meta.env.VITE_NOTION_CLIENT_ID,
    asana: import.meta.env.VITE_ASANA_CLIENT_ID,
    trello: import.meta.env.VITE_TRELLO_CLIENT_ID,
    // Zendesk requires a per-account subdomain before an authorize URL can be built,
    // so it intentionally has no client id here and always shows the "setup required" panel.
  };

  function isOAuthReady(provider: string) {
    return Boolean(OAUTH_CLIENT_IDS[provider]);
  }

  function oauthConnect(app: AppDef) {
    const clientId = OAUTH_CLIENT_IDS[app.provider];
    if (!clientId) return; // guarded in UI; no-op safeguard
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state_' + app.provider, state);
    sessionStorage.setItem('oauth_provider', app.provider);
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const authUrls: Record<string, string> = {
      gmail: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&scope=https://mail.google.com/&response_type=code&access_type=offline&prompt=consent&redirect_uri=${redirectUri}&state=${state}`,
      google_meet: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&scope=https://www.googleapis.com/auth/meetings&response_type=code&access_type=offline&prompt=consent&redirect_uri=${redirectUri}&state=${state}`,
      slack: `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,channels:read&redirect_uri=${redirectUri}&state=${state}`,
      zoom: `https://zoom.us/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      outlook: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&scope=https://graph.microsoft.com/.default offline_access&response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      quickbooks: `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&scope=com.intuit.quickbooks.accounting&response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      paypal: `https://www.paypal.com/connect?flowEntry=static&client_id=${clientId}&scope=openid&redirect_uri=${redirectUri}&state=${state}`,
      gocardless: `https://connect.gocardless.com/oauth/authorize?client_id=${clientId}&initial_view=login&scope=read_write&response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      revolut_business: `https://business.revolut.com/app-confirm?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`,
      xero: `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid profile email accounting.transactions offline_access&state=${state}`,
      intercom: `https://app.intercom.com/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`,
      facebook_messenger: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=pages_messaging&state=${state}`,
      instagram_dm: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_manage_messages&state=${state}`,
      meta_ads: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=ads_management,ads_read&state=${state}`,
      microsoft_teams: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&scope=https://graph.microsoft.com/.default offline_access&response_type=code&redirect_uri=${redirectUri}&state=${state}`,
      google_calendar: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&scope=https://www.googleapis.com/auth/calendar&response_type=code&access_type=offline&prompt=consent&redirect_uri=${redirectUri}&state=${state}`,
      google_ads: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&scope=https://www.googleapis.com/auth/adwords&response_type=code&access_type=offline&prompt=consent&redirect_uri=${redirectUri}&state=${state}`,
      google_drive: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&scope=https://www.googleapis.com/auth/drive&response_type=code&access_type=offline&prompt=consent&redirect_uri=${redirectUri}&state=${state}`,
      linkedin_ads: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=r_ads%20rw_ads&state=${state}`,
      dropbox: `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}&token_access_type=offline`,
      docusign: `https://account.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`,
      notion: `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}&state=${state}`,
      asana: `https://app.asana.com/-/oauth_authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`,
      trello: `https://trello.com/1/authorize?expiration=never&name=Atlas%20CRM&scope=read,write&response_type=token&key=${clientId}&return_url=${redirectUri}`,
    };
    const authUrl = authUrls[app.provider];
    if (authUrl) {
      window.open(authUrl, '_blank', 'width=600,height=700');
    }
    setConfigApp(null);
  }

  const categories = ['all', ...Array.from(new Set(AVAILABLE_APPS.map(a => a.category)))];
  const filtered = AVAILABLE_APPS
    .filter(a => filter === 'all' || a.category === filter)
    .filter(a => filter !== 'Payments' || paymentSubFilter === 'all' || a.paymentType === paymentSubFilter)
    .filter(a => !search.trim() || a.name.toLowerCase().includes(search.trim().toLowerCase()));

  const categoryLabels: Record<string, string> = {
    all: lang === 'fr' ? 'Tous' : 'All',
    AI: 'IA',
    Accounting: lang === 'fr' ? 'Comptabilité' : 'Accounting',
    Email: 'Email',
    Payments: lang === 'fr' ? 'Paiements' : 'Payments',
    Communication: lang === 'fr' ? 'Communication' : 'Communication',
    Messaging: 'Messaging',
    Video: lang === 'fr' ? 'Vidéo' : 'Video',
    Scheduling: 'Scheduling',
    'CRM Sync': 'CRM Sync',
    Marketing: 'Marketing',
    'SMS/Voice': 'SMS/Voice',
    'E-commerce': 'E-commerce',
    Automation: lang === 'fr' ? 'Automatisation' : 'Automation',
    Support: lang === 'fr' ? 'Support client' : 'Customer Support',
    Storage: lang === 'fr' ? 'Stockage' : 'Storage',
    'Project Management': lang === 'fr' ? 'Gestion de projet' : 'Project Management',
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.appMarketplace', lang)}
        subtitle=""
        actions={
          <button onClick={() => setCustomAppOpen(true)} className="btn-secondary btn-sm">
            <Plug size={16} /> {lang === 'fr' ? 'Connecter une app personnalisée' : 'Connect a custom app'}
          </button>
        }
      />
      <div className="mb-4 relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          className="input pl-9"
          placeholder={lang === 'fr' ? 'Rechercher une intégration...' : 'Search integrations...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map(c => (
          <button key={c} onClick={() => { setFilter(c); setPaymentSubFilter('all'); }} className={`btn-sm px-3 py-1.5 rounded-lg font-medium ${filter === c ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
            {categoryLabels[c] || c}
          </button>
        ))}
      </div>
      {filter === 'Payments' && (
        <div className="flex flex-wrap gap-2 mb-4 pl-1">
          {([
            { key: 'all', label: lang === 'fr' ? 'Tous' : 'All' },
            { key: 'cards', label: lang === 'fr' ? 'Cartes bancaires' : 'Cards' },
            { key: 'mobile_money', label: 'Mobile Money' },
            { key: 'transfers', label: lang === 'fr' ? 'Virements' : 'Transfers' },
          ] as const).map(sf => (
            <button key={sf.key} onClick={() => setPaymentSubFilter(sf.key)} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${paymentSubFilter === sf.key ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-ink-200 text-ink-500 hover:bg-ink-50'}`}>
              {sf.label}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-ink-400 mb-3">
        {filtered.length} {lang === 'fr' ? 'intégration' + (filtered.length !== 1 ? 's' : '') : 'integration' + (filtered.length !== 1 ? 's' : '')}
        {filter !== 'all' ? ` ${lang === 'fr' ? 'dans' : 'in'} ${categoryLabels[filter] || filter}` : ''}
      </p>
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
            isOAuthReady(configApp.provider) ? (
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
              <div className="rounded-lg bg-warning-50 border border-warning-200 p-4 text-sm text-warning-800">
                <p className="font-medium mb-2">{lang === 'fr' ? 'Configuration requise' : 'Setup required'}</p>
                <p className="text-warning-700">
                  {lang === 'fr'
                    ? `La connexion ${configApp?.name} n'est pas encore activée sur cette plateforme. Un administrateur doit d'abord enregistrer une application OAuth auprès de ${configApp?.name}.`
                    : `${configApp?.name} sign-in isn't enabled on this platform yet. An admin needs to register an OAuth app with ${configApp?.name} first.`}
                </p>
                <a href={configApp?.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-xs mt-2 inline-block">
                  {configApp?.name} {lang === 'fr' ? 'documentation développeur' : 'developer docs'} →
                </a>
              </div>
            )
          ) : (
            <>
              <p className="text-sm text-ink-500">
                {lang === 'fr' ? 'Entrez vos identifiants API. Vous pouvez les trouver dans la documentation de ' : 'Enter your API credentials. You can find them in the '}
                <a href={configApp?.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{configApp?.name} docs</a>.
              </p>
              {configApp && LIVE_VERIFIABLE_PROVIDERS.has(configApp.provider) && (
                <p className="flex items-center gap-1.5 text-xs text-success-600">
                  <Check size={13} /> {lang === 'fr' ? 'Cette clé sera vérifiée en direct auprès de ' : 'This key will be live-verified with '}{configApp.name}.
                </p>
              )}
              {connectError && (
                <p className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">{connectError}</p>
              )}
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
                  {connecting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {connecting ? (lang === 'fr' ? 'Vérification...' : 'Verifying...') : (lang === 'fr' ? 'Connecter' : 'Connect')}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={customAppOpen} onClose={() => setCustomAppOpen(false)} title={lang === 'fr' ? 'Connecter une app personnalisée' : 'Connect a custom app'} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ink-500">
            {lang === 'fr'
              ? 'Connectez n\'importe quel service ayant une API REST : donnez son URL de base et la méthode d\'authentification qu\'il attend.'
              : 'Connect any service with a REST API: give its base URL and the authentication method it expects.'}
          </p>
          <div>
            <label className="label">{lang === 'fr' ? "Nom de l'app" : 'App name'}</label>
            <input className="input" value={customApp.name} onChange={e => setCustomApp({ ...customApp, name: e.target.value })} placeholder={lang === 'fr' ? 'ex: Mon ERP interne' : 'e.g. My internal ERP'} />
          </div>
          <div>
            <label className="label">{lang === 'fr' ? 'URL de base de l\'API' : 'API base URL'}</label>
            <input className="input" value={customApp.baseUrl} onChange={e => setCustomApp({ ...customApp, baseUrl: e.target.value })} placeholder="https://api.example.com" />
          </div>
          <div>
            <label className="label">{lang === 'fr' ? "Type d'authentification" : 'Authentication type'}</label>
            <select className="input" value={customApp.authType} onChange={e => setCustomApp({ ...customApp, authType: e.target.value as typeof customApp.authType })}>
              <option value="bearer">{lang === 'fr' ? 'Jeton Bearer (Authorization: Bearer ...)' : 'Bearer token (Authorization: Bearer ...)'}</option>
              <option value="api_key_header">{lang === 'fr' ? 'Clé API dans un en-tête personnalisé' : 'API key in a custom header'}</option>
              <option value="basic">{lang === 'fr' ? 'Authentification basique (utilisateur/mot de passe)' : 'Basic auth (username/password)'}</option>
              <option value="none">{lang === 'fr' ? 'Aucune (API publique)' : 'None (public API)'}</option>
            </select>
          </div>
          {customApp.authType === 'api_key_header' && (
            <div>
              <label className="label">{lang === 'fr' ? "Nom de l'en-tête" : 'Header name'}</label>
              <input className="input" value={customApp.headerName} onChange={e => setCustomApp({ ...customApp, headerName: e.target.value })} placeholder="X-API-Key" />
            </div>
          )}
          {customApp.authType === 'basic' && (
            <div>
              <label className="label">{lang === 'fr' ? "Nom d'utilisateur" : 'Username'}</label>
              <input className="input" value={customApp.username} onChange={e => setCustomApp({ ...customApp, username: e.target.value })} />
            </div>
          )}
          {customApp.authType !== 'none' && (
            <div>
              <label className="label">{customApp.authType === 'basic' ? (lang === 'fr' ? 'Mot de passe' : 'Password') : (lang === 'fr' ? 'Jeton / Clé' : 'Token / Key')}</label>
              <input type="password" className="input" value={customApp.credential} onChange={e => setCustomApp({ ...customApp, credential: e.target.value })} />
            </div>
          )}
          {customError && <p className="text-xs text-error-600">{customError}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setCustomAppOpen(false)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
            <button onClick={confirmCustomConnect} disabled={customConnecting || !customApp.name.trim() || !customApp.baseUrl.trim()} className="btn-primary btn-sm">
              {customConnecting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {lang === 'fr' ? 'Connecter' : 'Connect'}
            </button>
          </div>
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
    const { error } = await supabase.from('integrations').delete().eq('id', id);
    if (error) alert(error.message);
    setBusy(null);
    load();
  }

  async function syncApp(intg: Integration) {
    if (!LIVE_VERIFIABLE_PROVIDERS.has(intg.provider)) {
      // Being honest here matters: there is no real data-sync or live check
      // implemented for this provider yet, so a "Sync" button that only
      // stamped last_sync_at would be a fake success signal. Say so instead
      // of pretending something happened.
      alert(lang === 'fr'
        ? "Il n'existe pas encore de vérification en direct pour cette app — la connexion est enregistrée mais rien ne peut être re-testé automatiquement pour le moment."
        : 'There is no live check implemented for this app yet — the connection is stored, but nothing can be automatically re-tested right now.');
      return;
    }
    setBusy(intg.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-integration-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session?.access_token || ''}` },
        body: JSON.stringify({ provider: intg.provider, config: intg.config }),
      });
      const result = await res.json();
      const { error } = await supabase.from('integrations').update({
        last_sync_at: new Date().toISOString(),
        status: result.ok ? 'connected' : 'error',
        error: result.ok ? null : (result.message || (lang === 'fr' ? 'La vérification a échoué.' : 'Verification failed.')),
        config: { ...intg.config, verified: Boolean(result.verified) },
      }).eq('id', intg.id);
      if (error) alert(error.message);
    } catch (e) {
      alert(getErrorMessage(e));
    }
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
            const isCustom = intg.provider.startsWith('custom_');
            const displayName = appDef?.name || (intg.config as { display_name?: string } | null)?.display_name || intg.provider;
            return (
              <div key={intg.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-ink-100 shadow-sm flex-shrink-0">
                      <BrandLogo provider={intg.provider} size={28} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-ink-800 truncate">{displayName}</p>
                      <p className="text-xs text-ink-500">{intg.category}</p>
                    </div>
                  </div>
                  <Badge variant={intg.status === 'connected' ? 'success' : 'neutral'}>{intg.status}</Badge>
                </div>
                {intg.last_sync_at && (
                  <p className="text-xs text-ink-400 mb-3">{lang === 'fr' ? 'Dernière sync: ' : 'Last sync: '}{new Date(intg.last_sync_at).toLocaleString(lang)}</p>
                )}
                <div className="flex items-center gap-2">
                  {(appDef?.authType === 'api_key' || isCustom) && (
                    <button onClick={() => setEditApp(intg)} className="btn-ghost btn-sm flex-1" title={lang === 'fr' ? 'Configurer' : 'Configure'}>
                      <SettingsIcon size={14} /> {lang === 'fr' ? 'Config' : 'Config'}
                    </button>
                  )}
                  <button onClick={() => syncApp(intg)} disabled={busy === intg.id} className="btn-ghost btn-sm flex-1" title={LIVE_VERIFIABLE_PROVIDERS.has(intg.provider) ? (lang === 'fr' ? 'Retester la connexion en direct' : 'Re-test the live connection') : (lang === 'fr' ? 'Aucune vérification en direct disponible' : 'No live check available')}>
                    {busy === intg.id ? <Loader2 size={14} className="animate-spin" /> : <Plug size={14} />} {LIVE_VERIFIABLE_PROVIDERS.has(intg.provider) ? (lang === 'fr' ? 'Tester' : 'Test') : (lang === 'fr' ? 'Sync' : 'Sync')}
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
  const { hasFeature: hasPlanFeature } = usePlanAccess();
  const allowed = hasPlanFeature('apiAccess') || hasPlanFeature('webhooks');
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
    const { error } = await supabase.from('api_keys').update({ active: false }).eq('id', id);
    if (error) { alert(error.message); return; }
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
    const { error } = await supabase.from('webhooks').update({ active: next }).eq('id', wh.id);
    if (error) { alert(error.message); return; }
    setWebhooks(prev => prev.map(w => w.id === wh.id ? { ...w, active: next } : w));
  }

  async function deleteWebhook(id: string) {
    if (!confirm(lang === 'fr' ? 'Supprimer ce webhook ?' : 'Delete this webhook?')) return;
    const { error } = await supabase.from('webhooks').delete().eq('id', id);
    if (error) { alert(error.message); return; }
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
        const { error: persistErr } = await supabase.from('webhooks').update({ last_response_code: 200, last_triggered_at: new Date().toISOString() }).eq('id', wh.id);
        if (persistErr) console.error('failed to persist webhook test result:', persistErr.message);
      }
    } catch (e) {
      setTestResult(prev => ({ ...prev, [wh.id]: { ok: false, msg: getErrorMessage(e) } }));
    }
    setTesting(null);
  }

  if (loading) return <Loading text={t('common.loading', lang)} />;
  if (!allowed) return <UpgradeGate language={lang} feature="API & Webhooks" minPlan="growth" />;

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
