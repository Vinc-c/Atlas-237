import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, FileSpreadsheet, CheckCircle2, Loader2, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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
  importable?: boolean;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

function ImportModal({ table, fields, onClose, onDone, language }: {
  table: string;
  fields: FormField[];
  onClose: () => void;
  onDone: (imported: number) => void;
  language: string;
}) {
  const lang = language;
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMap, setFieldMap] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'done'>('upload');
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function handleFile(f: File) {
    setError('');
    setFile(f);
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, unknown>[];
          const cols = results.meta.fields || [];
          setRows(data);
          setHeaders(cols);
          autoMap(cols);
          setStep('map');
        },
        error: (err) => setError(err.message),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
          const cols = data.length > 0 ? Object.keys(data[0]) : [];
          setRows(data);
          setHeaders(cols);
          autoMap(cols);
          setStep('map');
        } catch (err: any) { setError(err.message); }
      };
      reader.readAsArrayBuffer(f);
    } else {
      setError(lang === 'fr' ? 'Format non supporté. Utilisez CSV ou XLSX.' : 'Unsupported format. Use CSV or XLSX.');
    }
  }

  function autoMap(cols: string[]) {
    const map: Record<string, string> = {};
    fields.forEach(f => {
      const match = cols.find(c => c.toLowerCase().trim() === f.key.toLowerCase() || c.toLowerCase().trim() === f.label.toLowerCase());
      if (match) map[f.key] = match;
    });
    setFieldMap(map);
  }

  function downloadTemplate() {
    const header = fields.map(f => f.label).join(',');
    const sample = fields.map(f => f.defaultValue ?? '').join(',');
    const blob = new Blob([header + '\n' + sample + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${table}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function mappedRows(): Record<string, unknown>[] {
    return rows.map(r => {
      const obj: Record<string, unknown> = {};
      fields.forEach(f => {
        const csvCol = fieldMap[f.key];
        if (csvCol && r[csvCol] !== undefined) {
          obj[f.key] = f.type === 'number' ? Number(r[csvCol]) || 0 : String(r[csvCol]);
        }
      });
      return obj;
    }).filter(obj => Object.keys(obj).length > 0);
  }

  async function doImport() {
    setImporting(true);
    setError('');
    const data = mappedRows();
    try {
      const { error: insErr } = await supabase.from(table).insert(data);
      if (insErr) throw insErr;
      setImportedCount(data.length);
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  const mapped = mappedRows();

  return (
    <Modal open onClose={onClose} title={lang === 'fr' ? 'Importer des données' : 'Import Data'} size="lg">
      <div className="flex items-center gap-2 mb-4 text-sm">
        {['upload', 'map', 'preview', 'done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === s ? 'bg-primary-600 text-white' : i < ['upload', 'map', 'preview', 'done'].indexOf(step) ? 'bg-success-500 text-white' : 'bg-ink-200 text-ink-500'}`}>
              {i < ['upload', 'map', 'preview', 'done'].indexOf(step) ? <CheckCircle2 size={12} /> : i + 1}
            </span>
            <span className="capitalize text-ink-600 hidden sm:inline">{s}</span>
            {i < 3 && <span className="text-ink-300 mx-1">→</span>}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg bg-error-50 border border-error-200 px-4 py-2 text-sm text-error-700 flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}

      {step === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-ink-200 hover:border-ink-300'}`}
          >
            <FileSpreadsheet size={40} className="mx-auto text-ink-400 mb-3" />
            <p className="text-sm font-medium text-ink-700 mb-1">{lang === 'fr' ? 'Glissez votre fichier ici' : 'Drop your file here'}</p>
            <p className="text-xs text-ink-400 mb-3">{lang === 'fr' ? 'ou' : 'or'}</p>
            <label className="btn-primary btn-sm cursor-pointer inline-flex">
              <Upload size={14} /> {lang === 'fr' ? 'Choisir un fichier' : 'Choose file'}
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
            <p className="text-xs text-ink-400 mt-3">CSV, XLSX, XLS {lang === 'fr' ? '(max 1000 lignes recommandé)' : '(max 1000 rows recommended)'}</p>
          </div>
          <button onClick={downloadTemplate} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            <Download size={14} /> {lang === 'fr' ? 'Télécharger le modèle CSV' : 'Download CSV template'}
          </button>
        </div>
      )}

      {step === 'map' && (
        <div className="space-y-4">
          <p className="text-sm text-ink-600">{lang === 'fr' ? `Associez les colonnes de votre fichier aux champs de ${table}.` : `Map your file columns to ${table} fields.`}</p>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {fields.map(f => (
              <div key={f.key} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-medium text-ink-600">{f.label}{f.required && <span className="text-error-500"> *</span>}</label>
                  <p className="text-[10px] text-ink-400 font-mono">{f.key}</p>
                </div>
                <span className="text-ink-300">→</span>
                <select className="input flex-1" value={fieldMap[f.key] || ''} onChange={e => setFieldMap(prev => ({ ...prev, [f.key]: e.target.value }))}>
                  <option value="">{lang === 'fr' ? '— Ignorer —' : '— Skip —'}</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep('upload')} className="btn-secondary btn-sm">← {lang === 'fr' ? 'Retour' : 'Back'}</button>
            <button onClick={() => setStep('preview')} disabled={Object.keys(fieldMap).length === 0} className="btn-primary btn-sm">{lang === 'fr' ? 'Aperçu' : 'Preview'} →</button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <p className="text-sm text-ink-600">{lang === 'fr' ? `${mapped.length} ligne(s) seront importées dans ${table}.` : `${mapped.length} row(s) will be imported into ${table}.`}</p>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-ink-50 sticky top-0">
                  <tr>{fields.filter(f => fieldMap[f.key]).map(f => <th key={f.key} className="px-3 py-2 text-left font-semibold text-ink-600">{f.label}</th>)}</tr>
                </thead>
                <tbody>
                  {mapped.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-t border-ink-50">
                      {fields.filter(f => fieldMap[f.key]).map(f => <td key={f.key} className="px-3 py-2 text-ink-700 truncate max-w-[120px]">{String(row[f.key] ?? '—')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {mapped.length > 50 && <p className="text-xs text-ink-400">{lang === 'fr' ? `Affichage des 50 premières sur ${mapped.length}.` : `Showing first 50 of ${mapped.length}.`}</p>}
          <div className="flex justify-between">
            <button onClick={() => setStep('map')} className="btn-secondary btn-sm">← {lang === 'fr' ? 'Retour' : 'Back'}</button>
            <button onClick={doImport} disabled={importing || mapped.length === 0} className="btn-primary btn-sm">
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {lang === 'fr' ? `Importer ${mapped.length} ligne(s)` : `Import ${mapped.length} row(s)`}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 mx-auto mb-4">
            <CheckCircle2 size={32} className="text-success-600" />
          </div>
          <h3 className="font-bold text-ink-800 text-lg mb-1">{importedCount} {lang === 'fr' ? 'ligne(s) importée(s) avec succès !' : 'row(s) imported successfully!'}</h3>
          <p className="text-sm text-ink-500 mb-4">{lang === 'fr' ? 'Vos données sont maintenant disponibles.' : 'Your data is now available.'}</p>
          <button onClick={() => onDone(importedCount)} className="btn-primary btn-sm">{lang === 'fr' ? 'Terminer' : 'Done'}</button>
        </div>
      )}
    </Modal>
  );
}

export function ListPage<T extends { id: string; [key: string]: unknown }>({
  table, title, subtitle, columns, formFields, emptyIcon, emptyTitle, emptyDescription, select, relations, orderBy, importable,
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
  const [importOpen, setImportOpen] = useState(false);

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
    if (!confirm(t('list.deleteConfirm', language))) return;
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
          <div className="flex items-center gap-2">
            {importable && (
              <button onClick={() => setImportOpen(true)} className="btn-secondary btn-sm">
                <Upload size={16} /> {language === 'fr' ? 'Importer' : 'Import'}
              </button>
            )}
            <button onClick={openCreate} className="btn-primary btn-sm">
              <Plus size={16} /> {t('common.add', language)}
            </button>
          </div>
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

      {importOpen && (
        <ImportModal
          table={table}
          fields={formFields}
          language={language}
          onClose={() => setImportOpen(false)}
          onDone={() => { setImportOpen(false); load(); }}
        />
      )}
    </div>
  );
}
