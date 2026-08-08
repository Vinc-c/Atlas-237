import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { Modal } from '@/components/Modal';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface ListPageProps<T extends { id: string }> {
  table: string;
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  formFields: FormField[];
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  select?: string;
  relations?: string;
  orderBy?: string;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

export function ListPage<T extends { id: string; [key: string]: unknown }>({
  table, title, subtitle, columns, formFields, emptyIcon, emptyTitle, emptyDescription, select, relations, orderBy,
}: ListPageProps<T>) {
  const { language } = useAuth();
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select(select || '*');
    if (relations) query = supabase.from(table).select(relations);
    if (orderBy) query = query.order(orderBy, { ascending: false });
    else query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (!error) setRows((data || []) as T[]);
    setLoading(false);
  }, [table, select, relations, orderBy]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    const defaults: Record<string, unknown> = {};
    formFields.forEach(f => { if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue; });
    setFormData(defaults);
    setModalOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    const data: Record<string, unknown> = {};
    formFields.forEach(f => { data[f.key] = row[f.key]; });
    setFormData(data);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const { error } = await supabase.from(table).update(formData).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(formData);
        if (error) throw error;
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: T) {
    if (!confirm('Delete this item?')) return;
    await supabase.from(table).delete().eq('id', row.id);
    load();
  }

  const filtered = search
    ? rows.filter(r => {
        const searchable = columns.map(c => String(r[c.key] ?? '')).join(' ').toLowerCase();
        return searchable.includes(search.toLowerCase());
      })
    : rows;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <button onClick={openCreate} className="btn-primary btn-sm">
            <Plus size={16} /> {t('common.add', language)}
          </button>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          className="input pl-9"
          placeholder={t('common.search', language)}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading text={t('common.loading', language)} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            action={<button onClick={openCreate} className="btn-primary btn-sm"><Plus size={16} /> {t('common.add', language)}</button>}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  {columns.map(col => (
                    <th key={col.key} className={`text-left text-xs font-semibold text-ink-500 uppercase tracking-wide px-4 py-3 ${col.className || ''}`}>
                      {col.label}
                    </th>
                  ))}
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className="group border-b border-ink-50 last:border-0 table-row-hover">
                    {columns.map(col => (
                      <td key={col.key} className={`px-4 py-3 text-sm text-ink-700 ${col.className || ''}`}>
                        {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(row)} className="p-1.5 rounded text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(row)} className="p-1.5 rounded text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('common.edit', language) : t('common.add', language)}
        size="lg"
      >
        {error && <div className="mb-4 rounded-lg bg-error-50 border border-error-200 px-4 py-2 text-sm text-error-700">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formFields.map(field => (
            <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
              <label className="label">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="input"
                  value={String(formData[field.key] ?? '')}
                  onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                >
                  <option value="">—</option>
                  {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="input min-h-[80px]"
                  value={String(formData[field.key] ?? '')}
                  onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                />
              ) : (
                <input
                  type={field.type}
                  className="input"
                  value={String(formData[field.key] ?? '')}
                  onChange={e => setFormData({
                    ...formData,
                    [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                  })}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">{t('common.cancel', language)}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm">{t('common.save', language)}</button>
        </div>
      </Modal>
    </div>
  );
}
