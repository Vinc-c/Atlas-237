import { Package, FileText, ShoppingCart, Receipt, CreditCard, Megaphone, LifeBuoy } from 'lucide-react';
import { ListPage, type FormField } from '@/components/ListPage';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import { Badge } from '@/components/ui';
import { CURRENCIES, formatMoney } from '@/lib/i18n-countries';
import { usePlanAccess } from '@/lib/plans';
import { UpgradeGate } from '@/components/UpgradeGate';
import { QuickPaymentLinkButton } from '@/components/QuickPaymentLinkButton';
import type { Product, Invoice, Ticket, Campaign } from '@/types';

/**
 * Currency field for forms that record a monetary amount. Defaults to the
 * organization's onboarding currency, but the user can pick a different one
 * per record (e.g. an invoice billed to a foreign client in their currency).
 */
function currencyField(language: string, orgCurrency: string): FormField {
  return {
    key: 'currency',
    label: language === 'fr' ? 'Devise' : 'Currency',
    type: 'select',
    required: true,
    defaultValue: orgCurrency,
    options: CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} — ${c.name} (${c.symbol})` })),
  };
}

export function ProductsPage() {
  const { language, organization } = useAuth();
  const orgCurrency = organization?.currency || 'USD';
  const fields: FormField[] = [
    { key: 'name', label: t('common.name', language), type: 'text', required: true },
    { key: 'sku', label: t('list.sku', language), type: 'text' },
    { key: 'category', label: t('list.category', language), type: 'text' },
    { key: 'price', label: t('list.price', language), type: 'number', required: true, defaultValue: 0 },
    currencyField(language, orgCurrency),
    { key: 'stock', label: t('list.stock', language), type: 'number' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'active', label: t('status.active', language) }, { value: 'inactive', label: t('status.inactive', language) },
    ], defaultValue: 'active' },
    { key: 'description', label: t('list.description', language), type: 'textarea' },
  ];

  return (
    <ListPage<Product>
      table="products"
      title={t('nav.products', language)}
      columns={[
        { key: 'name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
        { key: 'sku', label: t('list.sku', language), render: (r) => r.sku || '—' },
        { key: 'category', label: t('list.category', language), render: (r) => r.category || '—' },
        { key: 'price', label: t('list.price', language), render: (r) => <span className="font-semibold">{formatMoney((r.price || 0) * 100, r.currency || orgCurrency, language)}</span> },
        { key: 'stock', label: t('list.stock', language), render: (r) => r.stock ?? '—' },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge> },
      ]}
      formFields={fields}
      emptyIcon={<Package size={28} />}
      emptyTitle={t('empty.noProducts', language)}
      emptyDescription={t('empty.noProductsDesc', language)}
      orderBy="created_at"
      importable
    />
  );
}

export function QuotesPage() {
  const { language, organization } = useAuth();
  const orgCurrency = organization?.currency || 'USD';
  const { hasFeature: hasPlanFeature } = usePlanAccess();
  const allowed = hasPlanFeature('quotesInvoicing');
  const fields: FormField[] = [
    { key: 'quote_number', label: t('list.quoteNumber', language), type: 'text', required: true },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'draft', label: t('status.draft', language) }, { value: 'sent', label: t('status.sent', language) }, { value: 'accepted', label: t('status.accepted', language) }, { value: 'rejected', label: t('status.rejected', language) },
    ], defaultValue: 'draft' },
    { key: 'total', label: t('common.total', language), type: 'number', defaultValue: 0 },
    currencyField(language, orgCurrency),
    { key: 'expiration_date', label: t('list.expirationDate', language), type: 'date' },
    { key: 'notes', label: t('list.notes', language), type: 'textarea' },
  ];

  return !allowed ? (
    <UpgradeGate language={language} feature={t('nav.quotes', language)} minPlan="growth" />
  ) : (
    <ListPage<{ id: string; quote_number: string; status: string; total: number; currency?: string; expiration_date: string | null; [key: string]: unknown }>
      table="quotes"
      title={t('nav.quotes', language)}
      columns={[
        { key: 'quote_number', label: t('list.quoteNumber', language), render: (r) => <span className="font-medium text-ink-800">{r.quote_number}</span> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'error' : 'warning'}>{r.status}</Badge> },
        { key: 'total', label: t('common.total', language), render: (r) => formatMoney((r.total || 0) * 100, (r.currency as string) || orgCurrency, language) },
        { key: 'expiration_date', label: t('list.expires', language), render: (r) => r.expiration_date ? new Date(r.expiration_date).toLocaleDateString(language) : '—' },
      ]}
      formFields={fields}
      emptyIcon={<FileText size={28} />}
      emptyTitle={t('empty.noQuotes', language)}
      emptyDescription={t('empty.noQuotesDesc', language)}
      orderBy="created_at"
    />
  );
}

export function OrdersPage() {
  const { language, organization } = useAuth();
  const orgCurrency = organization?.currency || 'USD';
  const fields: FormField[] = [
    { key: 'order_number', label: t('list.orderNumber', language), type: 'text', required: true },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'pending', label: t('status.pending', language) }, { value: 'processing', label: t('status.processing', language) }, { value: 'shipped', label: t('status.shipped', language) }, { value: 'delivered', label: t('status.delivered', language) }, { value: 'cancelled', label: t('status.cancelled', language) },
    ], defaultValue: 'pending' },
    { key: 'payment_status', label: t('list.payment', language), type: 'select', options: [
      { value: 'unpaid', label: t('status.unpaid', language) }, { value: 'partial', label: t('status.partial', language) }, { value: 'paid', label: t('status.paid', language) },
    ], defaultValue: 'unpaid' },
    { key: 'total', label: t('common.total', language), type: 'number', defaultValue: 0 },
    currencyField(language, orgCurrency),
    { key: 'notes', label: t('list.notes', language), type: 'textarea' },
  ];

  return (
    <ListPage<{ id: string; order_number: string; status: string; payment_status: string; total: number; currency?: string; [key: string]: unknown }>
      table="orders"
      title={t('nav.orders', language)}
      columns={[
        { key: 'order_number', label: t('list.orderNumber', language), render: (r) => <span className="font-medium text-ink-800">{r.order_number}</span> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant="primary">{r.status}</Badge> },
        { key: 'payment_status', label: t('list.payment', language), render: (r) => <Badge variant={r.payment_status === 'paid' ? 'success' : r.payment_status === 'partial' ? 'warning' : 'error'}>{r.payment_status}</Badge> },
        { key: 'total', label: t('common.total', language), render: (r) => formatMoney((r.total || 0) * 100, (r.currency as string) || orgCurrency, language) },
      ]}
      formFields={fields}
      emptyIcon={<ShoppingCart size={28} />}
      emptyTitle={t('empty.noOrders', language)}
      emptyDescription={t('empty.noOrdersDesc', language)}
      orderBy="created_at"
    />
  );
}

export function InvoicesPage() {
  const { language, organization } = useAuth();
  const orgCurrency = organization?.currency || 'USD';
  const { hasFeature: hasPlanFeature } = usePlanAccess();
  const allowed = hasPlanFeature('quotesInvoicing');
  const fields: FormField[] = [
    { key: 'invoice_number', label: t('list.invoiceNumber', language), type: 'text', required: true },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'draft', label: t('status.draft', language) }, { value: 'sent', label: t('status.sent', language) }, { value: 'paid', label: t('status.paid', language) }, { value: 'overdue', label: t('status.overdue', language) },
    ], defaultValue: 'draft' },
    { key: 'payment_status', label: t('list.payment', language), type: 'select', options: [
      { value: 'unpaid', label: t('status.unpaid', language) }, { value: 'partial', label: t('status.partial', language) }, { value: 'paid', label: t('status.paid', language) },
    ], defaultValue: 'unpaid' },
    { key: 'total', label: t('common.total', language), type: 'number', defaultValue: 0 },
    currencyField(language, orgCurrency),
    { key: 'issue_date', label: t('list.issueDate', language), type: 'date' },
    { key: 'due_date', label: t('list.dueDate', language), type: 'date' },
    { key: 'notes', label: t('list.notes', language), type: 'textarea' },
  ];

  return !allowed ? (
    <UpgradeGate language={language} feature={t('nav.invoices', language)} minPlan="growth" />
  ) : (
    <ListPage<Invoice>
      table="invoices"
      title={t('nav.invoices', language)}
      columns={[
        { key: 'invoice_number', label: t('list.invoiceNumber', language), render: (r) => <span className="font-medium text-ink-800">{r.invoice_number}</span> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'paid' ? 'success' : r.status === 'overdue' ? 'error' : 'warning'}>{r.status}</Badge> },
        { key: 'payment_status', label: t('list.payment', language), render: (r) => <Badge variant={r.payment_status === 'paid' ? 'success' : r.payment_status === 'partial' ? 'warning' : 'error'}>{r.payment_status}</Badge> },
        { key: 'total', label: t('common.total', language), render: (r) => <span className="font-semibold">{formatMoney((r.total || 0) * 100, r.currency || orgCurrency, language)}</span> },
        { key: 'due_date', label: t('list.due', language), render: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString(language) : '—' },
      ]}
      formFields={fields}
      emptyIcon={<Receipt size={28} />}
      emptyTitle={t('empty.noInvoices', language)}
      emptyDescription={t('empty.noInvoicesDesc', language)}
      relations="*, contact:contacts(*), company:companies(*)"
      orderBy="created_at"
      rowActions={(row) => <QuickPaymentLinkButton amount={row.total} currency={row.currency || orgCurrency} label={row.invoice_number} />}
    />
  );
}

export function PaymentsPage() {
  const { language, organization } = useAuth();
  const orgCurrency = organization?.currency || 'USD';
  const fields: FormField[] = [
    { key: 'amount', label: t('superAdmin.amount', language), type: 'number', required: true },
    currencyField(language, orgCurrency),
    { key: 'method', label: t('list.method', language), type: 'select', options: [
      { value: 'card', label: t('status.card', language) }, { value: 'bank_transfer', label: t('status.bankTransfer', language) }, { value: 'cash', label: t('status.cash', language) }, { value: 'check', label: t('status.check', language) }, { value: 'stripe', label: t('status.stripe', language) },
    ]},
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'completed', label: t('status.completed', language) }, { value: 'pending', label: t('status.pending', language) }, { value: 'failed', label: t('status.failed', language) },
    ], defaultValue: 'completed' },
    { key: 'reference', label: t('list.reference', language), type: 'text' },
  ];

  return (
    <ListPage<{ id: string; amount: number; currency?: string; method: string; status: string; reference: string | null; [key: string]: unknown }>
      table="payments"
      title={t('nav.payments', language)}
      columns={[
        { key: 'amount', label: t('superAdmin.amount', language), render: (r) => <span className="font-semibold">{formatMoney((r.amount || 0) * 100, (r.currency as string) || orgCurrency, language)}</span> },
        { key: 'method', label: t('list.method', language), render: (r) => r.method || '—' },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'error' : 'warning'}>{r.status}</Badge> },
        { key: 'reference', label: t('list.reference', language), render: (r) => r.reference || '—' },
      ]}
      formFields={fields}
      emptyIcon={<CreditCard size={28} />}
      emptyTitle={t('empty.noPayments', language)}
      emptyDescription={t('empty.noPaymentsDesc', language)}
      orderBy="created_at"
    />
  );
}

export function MarketingPage() {
  const { language, organization } = useAuth();
  const orgCurrency = organization?.currency || 'USD';
  const fields: FormField[] = [
    { key: 'name', label: t('common.name', language), type: 'text', required: true },
    { key: 'type', label: t('list.type', language), type: 'select', options: [
      { value: 'email', label: t('status.email', language) }, { value: 'sms', label: t('status.sms', language) }, { value: 'social', label: t('status.social', language) }, { value: 'ads', label: t('status.ads', language) },
    ], defaultValue: 'email' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'draft', label: t('status.draft', language) }, { value: 'active', label: t('status.active2', language) }, { value: 'paused', label: t('status.paused', language) }, { value: 'completed', label: t('status.completed', language) },
    ], defaultValue: 'draft' },
    { key: 'budget', label: t('list.budget', language), type: 'number', defaultValue: 0 },
    currencyField(language, orgCurrency),
    { key: 'subject', label: t('list.subject', language), type: 'text' },
    { key: 'content', label: t('list.content', language), type: 'textarea' },
  ];

  return (
    <ListPage<Campaign>
      table="campaigns"
      title={t('nav.marketing', language)}
      columns={[
        { key: 'name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
        { key: 'type', label: t('list.type', language), render: (r) => <Badge variant="primary">{r.type}</Badge> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'active' ? 'success' : r.status === 'completed' ? 'neutral' : 'warning'}>{r.status}</Badge> },
        { key: 'budget', label: t('list.budget', language), render: (r) => formatMoney((r.budget || 0) * 100, r.currency || orgCurrency, language) },
      ]}
      formFields={fields}
      emptyIcon={<Megaphone size={28} />}
      emptyTitle={t('empty.noCampaigns', language)}
      emptyDescription={t('empty.noCampaignsDesc', language)}
      orderBy="created_at"
    />
  );
}

export function SupportPage() {
  const { language } = useAuth();
  const { hasFeature: hasPlanFeature } = usePlanAccess();
  const allowed = hasPlanFeature('tickets');
  const fields: FormField[] = [
    { key: 'ticket_number', label: t('list.ticketNumber', language), type: 'text', required: true },
    { key: 'subject', label: t('list.subject', language), type: 'text', required: true },
    { key: 'priority', label: t('list.priority', language), type: 'select', options: [
      { value: 'low', label: t('status.low', language) }, { value: 'medium', label: t('status.medium', language) }, { value: 'high', label: t('status.high', language) }, { value: 'urgent', label: t('status.urgent', language) },
    ], defaultValue: 'medium' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'open', label: t('status.open', language) }, { value: 'in_progress', label: t('status.inProgress', language) }, { value: 'resolved', label: t('status.resolved', language) }, { value: 'closed', label: t('status.closed', language) },
    ], defaultValue: 'open' },
    { key: 'category', label: t('list.category', language), type: 'text' },
    { key: 'description', label: t('list.description', language), type: 'textarea' },
  ];

  return !allowed ? (
    <UpgradeGate language={language} feature={t('nav.support', language)} minPlan="growth" />
  ) : (
    <ListPage<Ticket>
      table="tickets"
      title={t('nav.support', language)}
      columns={[
        { key: 'ticket_number', label: t('list.ticketNumber', language), render: (r) => <span className="font-medium text-ink-800">{r.ticket_number}</span> },
        { key: 'subject', label: t('list.subject', language), render: (r) => r.subject },
        { key: 'priority', label: t('list.priority', language), render: (r) => <Badge variant={r.priority === 'urgent' ? 'error' : r.priority === 'high' ? 'warning' : 'neutral'}>{r.priority}</Badge> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'resolved' || r.status === 'closed' ? 'success' : 'primary'}>{r.status}</Badge> },
      ]}
      formFields={fields}
      emptyIcon={<LifeBuoy size={28} />}
      emptyTitle={t('empty.noTickets', language)}
      emptyDescription={t('empty.noTicketsDesc', language)}
      relations="*, contact:contacts(*), company:companies(*)"
      orderBy="created_at"
    />
  );
}
