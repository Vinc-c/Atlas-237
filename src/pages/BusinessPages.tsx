import { Package, FileText, ShoppingCart, Receipt, CreditCard, Megaphone, LifeBuoy } from 'lucide-react';
import { ListPage, type FormField } from '@/components/ListPage';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import { Badge } from '@/components/ui';
import type { Product, Invoice, Ticket, Campaign } from '@/types';

export function ProductsPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'name', label: t('common.name', language), type: 'text', required: true },
    { key: 'sku', label: 'SKU', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'price', label: 'Price', type: 'number', required: true, defaultValue: 0 },
    { key: 'stock', label: 'Stock', type: 'number' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' },
    ], defaultValue: 'active' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ];

  return (
    <ListPage<Product>
      table="products"
      title={t('nav.products', language)}
      columns={[
        { key: 'name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
        { key: 'sku', label: 'SKU', render: (r) => r.sku || '—' },
        { key: 'category', label: 'Category', render: (r) => r.category || '—' },
        { key: 'price', label: 'Price', render: (r) => <span className="font-semibold">$ {(r.price || 0).toLocaleString()}</span> },
        { key: 'stock', label: 'Stock', render: (r) => r.stock ?? '—' },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge> },
      ]}
      formFields={fields}
      emptyIcon={<Package size={28} />}
      emptyTitle="No products yet"
      emptyDescription="Add products to your catalog to start selling."
      orderBy="created_at"
    />
  );
}

export function QuotesPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'quote_number', label: 'Quote #', type: 'text', required: true },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'accepted', label: 'Accepted' }, { value: 'rejected', label: 'Rejected' },
    ], defaultValue: 'draft' },
    { key: 'total', label: 'Total', type: 'number', defaultValue: 0 },
    { key: 'expiration_date', label: 'Expiration Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <ListPage<{ id: string; quote_number: string; status: string; total: number; expiration_date: string | null; [key: string]: unknown }>
      table="quotes"
      title={t('nav.quotes', language)}
      columns={[
        { key: 'quote_number', label: 'Quote #', render: (r) => <span className="font-medium text-ink-800">{r.quote_number}</span> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'error' : 'warning'}>{r.status}</Badge> },
        { key: 'total', label: t('common.total', language), render: (r) => `$ ${(r.total || 0).toLocaleString()}` },
        { key: 'expiration_date', label: 'Expires', render: (r) => r.expiration_date ? new Date(r.expiration_date).toLocaleDateString(language) : '—' },
      ]}
      formFields={fields}
      emptyIcon={<FileText size={28} />}
      emptyTitle="No quotes yet"
      emptyDescription="Create quotes to send proposals to your customers."
      orderBy="created_at"
    />
  );
}

export function OrdersPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'order_number', label: 'Order #', type: 'text', required: true },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'shipped', label: 'Shipped' }, { value: 'delivered', label: 'Delivered' }, { value: 'cancelled', label: 'Cancelled' },
    ], defaultValue: 'pending' },
    { key: 'payment_status', label: 'Payment', type: 'select', options: [
      { value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' },
    ], defaultValue: 'unpaid' },
    { key: 'total', label: 'Total', type: 'number', defaultValue: 0 },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <ListPage<{ id: string; order_number: string; status: string; payment_status: string; total: number; [key: string]: unknown }>
      table="orders"
      title={t('nav.orders', language)}
      columns={[
        { key: 'order_number', label: 'Order #', render: (r) => <span className="font-medium text-ink-800">{r.order_number}</span> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant="primary">{r.status}</Badge> },
        { key: 'payment_status', label: 'Payment', render: (r) => <Badge variant={r.payment_status === 'paid' ? 'success' : r.payment_status === 'partial' ? 'warning' : 'error'}>{r.payment_status}</Badge> },
        { key: 'total', label: t('common.total', language), render: (r) => `$ ${(r.total || 0).toLocaleString()}` },
      ]}
      formFields={fields}
      emptyIcon={<ShoppingCart size={28} />}
      emptyTitle="No orders yet"
      emptyDescription="Orders will appear here once customers purchase."
      orderBy="created_at"
    />
  );
}

export function InvoicesPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'invoice_number', label: 'Invoice #', type: 'text', required: true },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' },
    ], defaultValue: 'draft' },
    { key: 'payment_status', label: 'Payment', type: 'select', options: [
      { value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' },
    ], defaultValue: 'unpaid' },
    { key: 'total', label: 'Total', type: 'number', defaultValue: 0 },
    { key: 'issue_date', label: 'Issue Date', type: 'date' },
    { key: 'due_date', label: 'Due Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <ListPage<Invoice>
      table="invoices"
      title={t('nav.invoices', language)}
      columns={[
        { key: 'invoice_number', label: 'Invoice #', render: (r) => <span className="font-medium text-ink-800">{r.invoice_number}</span> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'paid' ? 'success' : r.status === 'overdue' ? 'error' : 'warning'}>{r.status}</Badge> },
        { key: 'payment_status', label: 'Payment', render: (r) => <Badge variant={r.payment_status === 'paid' ? 'success' : r.payment_status === 'partial' ? 'warning' : 'error'}>{r.payment_status}</Badge> },
        { key: 'total', label: t('common.total', language), render: (r) => <span className="font-semibold">$ {(r.total || 0).toLocaleString()}</span> },
        { key: 'due_date', label: 'Due', render: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString(language) : '—' },
      ]}
      formFields={fields}
      emptyIcon={<Receipt size={28} />}
      emptyTitle="No invoices yet"
      emptyDescription="Create invoices to bill your customers."
      relations="*, contact:contacts(*), company:companies(*)"
      orderBy="created_at"
    />
  );
}

export function PaymentsPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'amount', label: 'Amount', type: 'number', required: true },
    { key: 'method', label: 'Method', type: 'select', options: [
      { value: 'card', label: 'Card' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'cash', label: 'Cash' }, { value: 'check', label: 'Check' }, { value: 'stripe', label: 'Stripe' },
    ]},
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' },
    ], defaultValue: 'completed' },
    { key: 'reference', label: 'Reference', type: 'text' },
  ];

  return (
    <ListPage<{ id: string; amount: number; method: string; status: string; reference: string | null; [key: string]: unknown }>
      table="payments"
      title={t('nav.payments', language)}
      columns={[
        { key: 'amount', label: 'Amount', render: (r) => <span className="font-semibold">$ {(r.amount || 0).toLocaleString()}</span> },
        { key: 'method', label: 'Method', render: (r) => r.method || '—' },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'error' : 'warning'}>{r.status}</Badge> },
        { key: 'reference', label: 'Reference', render: (r) => r.reference || '—' },
      ]}
      formFields={fields}
      emptyIcon={<CreditCard size={28} />}
      emptyTitle="No payments yet"
      emptyDescription="Record payments received from customers."
      orderBy="created_at"
    />
  );
}

export function MarketingPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'name', label: t('common.name', language), type: 'text', required: true },
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'social', label: 'Social' }, { value: 'ads', label: 'Ads' },
    ], defaultValue: 'email' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'completed', label: 'Completed' },
    ], defaultValue: 'draft' },
    { key: 'budget', label: 'Budget', type: 'number', defaultValue: 0 },
    { key: 'subject', label: 'Subject', type: 'text' },
    { key: 'content', label: 'Content', type: 'textarea' },
  ];

  return (
    <ListPage<Campaign>
      table="campaigns"
      title={t('nav.marketing', language)}
      columns={[
        { key: 'name', label: t('common.name', language), render: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
        { key: 'type', label: 'Type', render: (r) => <Badge variant="primary">{r.type}</Badge> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'active' ? 'success' : r.status === 'completed' ? 'neutral' : 'warning'}>{r.status}</Badge> },
        { key: 'budget', label: 'Budget', render: (r) => `$ ${(r.budget || 0).toLocaleString()}` },
      ]}
      formFields={fields}
      emptyIcon={<Megaphone size={28} />}
      emptyTitle="No campaigns yet"
      emptyDescription="Launch marketing campaigns to reach your audience."
      orderBy="created_at"
    />
  );
}

export function SupportPage() {
  const { language } = useAuth();
  const fields: FormField[] = [
    { key: 'ticket_number', label: 'Ticket #', type: 'text', required: true },
    { key: 'subject', label: 'Subject', type: 'text', required: true },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' },
    ], defaultValue: 'medium' },
    { key: 'status', label: t('common.status', language), type: 'select', options: [
      { value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In Progress' }, { value: 'resolved', label: 'Resolved' }, { value: 'closed', label: 'Closed' },
    ], defaultValue: 'open' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ];

  return (
    <ListPage<Ticket>
      table="tickets"
      title={t('nav.support', language)}
      columns={[
        { key: 'ticket_number', label: 'Ticket #', render: (r) => <span className="font-medium text-ink-800">{r.ticket_number}</span> },
        { key: 'subject', label: 'Subject', render: (r) => r.subject },
        { key: 'priority', label: 'Priority', render: (r) => <Badge variant={r.priority === 'urgent' ? 'error' : r.priority === 'high' ? 'warning' : 'neutral'}>{r.priority}</Badge> },
        { key: 'status', label: t('common.status', language), render: (r) => <Badge variant={r.status === 'resolved' || r.status === 'closed' ? 'success' : 'primary'}>{r.status}</Badge> },
      ]}
      formFields={fields}
      emptyIcon={<LifeBuoy size={28} />}
      emptyTitle="No tickets yet"
      emptyDescription="Customer support tickets will appear here."
      relations="*, contact:contacts(*), company:companies(*)"
      orderBy="created_at"
    />
  );
}
