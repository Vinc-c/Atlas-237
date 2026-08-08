import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Plus, Building2, User, CalendarClock, KanbanSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import type { Deal, Pipeline, PipelineStage } from '@/types';

interface DealsKanbanProps {
  title: string;
  headerAction?: ReactNode;
}

export function DealsKanban({ title, headerAction }: DealsKanbanProps) {
  const { profile } = useAuth();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineId, setPipelineId] = useState('');
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragDealId, setDragDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [quickAddStage, setQuickAddStage] = useState<PipelineStage | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickValue, setQuickValue] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: pls } = await supabase.from('pipelines').select('*').order('sort_order');
      setPipelines(pls || []);
      if (pls && pls.length > 0) setPipelineId(pls[0].id);
      else setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!pipelineId) return;
    loadBoard(pipelineId);
  }, [pipelineId]);

  async function loadBoard(pid: string) {
    setLoading(true);
    const [{ data: sts }, { data: dls }] = await Promise.all([
      supabase.from('pipeline_stages').select('*').eq('pipeline_id', pid).order('sort_order'),
      supabase
        .from('deals')
        .select('*, stage:pipeline_stages(*), contact:contacts(*), company:companies(*)')
        .eq('pipeline_id', pid)
        .eq('status', 'open')
        .order('created_at', { ascending: false }),
    ]);
    setStages(sts || []);
    setDeals((dls || []) as Deal[]);
    setLoading(false);
  }

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    for (const stage of stages) map[stage.id] = [];
    for (const deal of deals) {
      if (deal.stage_id && map[deal.stage_id]) map[deal.stage_id].push(deal);
    }
    return map;
  }, [stages, deals]);

  async function moveDeal(dealId: string, stage: PipelineStage) {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage_id: stage.id, probability: stage.probability, stage } : d));
    const { error } = await supabase
      .from('deals')
      .update({ stage_id: stage.id, probability: stage.probability })
      .eq('id', dealId);
    if (error) loadBoard(pipelineId);
  }

  async function handleQuickAdd() {
    if (!quickAddStage || !quickName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('deals').insert({
      name: quickName.trim(),
      value: quickValue,
      pipeline_id: pipelineId,
      stage_id: quickAddStage.id,
      probability: quickAddStage.probability,
      owner_id: profile?.id,
      status: 'open',
    });
    setSaving(false);
    if (!error) {
      setQuickAddStage(null);
      setQuickName('');
      setQuickValue(0);
      loadBoard(pipelineId);
    }
  }

  if (loading && stages.length === 0 && pipelines.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={title} actions={headerAction} />
        <Loading />
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={title} actions={headerAction} />
        <div className="card">
          <EmptyState
            icon={<KanbanSquare size={28} />}
            title="No pipeline yet"
            description="Create a pipeline with stages first, then your open deals will show up here as a board."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={title}
        actions={
          <div className="flex items-center gap-2">
            {pipelines.length > 1 && (
              <select className="input !w-auto" value={pipelineId} onChange={e => setPipelineId(e.target.value)}>
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            {headerAction}
          </div>
        }
      />

      {loading ? (
        <Loading />
      ) : stages.length === 0 ? (
        <div className="card">
          <EmptyState icon={<KanbanSquare size={28} />} title="No stages yet" description="Add stages to this pipeline to start tracking deals." />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {stages.map(stage => {
            const stageDeals = dealsByStage[stage.id] || [];
            const total = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            return (
              <div
                key={stage.id}
                className={`flex w-72 flex-shrink-0 flex-col rounded-xl border bg-ink-50/60 transition-colors ${dragOverStage === stage.id ? 'border-primary-400 bg-primary-50/60' : 'border-ink-100'}`}
                onDragOver={e => { e.preventDefault(); setDragOverStage(stage.id); }}
                onDragLeave={() => setDragOverStage(prev => (prev === stage.id ? null : prev))}
                onDrop={e => {
                  e.preventDefault();
                  setDragOverStage(null);
                  if (dragDealId) moveDeal(dragDealId, stage);
                  setDragDealId(null);
                }}
              >
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="truncate text-sm font-semibold text-ink-800">{stage.name}</span>
                    <span className="flex-shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink-500 border border-ink-100">{stageDeals.length}</span>
                  </div>
                  <button onClick={() => { setQuickAddStage(stage); setQuickName(''); setQuickValue(0); }} className="p-1 rounded text-ink-400 hover:bg-white hover:text-primary-600 transition-colors">
                    <Plus size={15} />
                  </button>
                </div>
                <div className="px-3 pb-2 text-xs font-medium text-ink-500">
                  $ {total.toLocaleString()} · {stage.probability}% avg
                </div>

                <div className="flex-1 space-y-2 px-2 pb-3 min-h-[80px]">
                  {stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDragDealId(deal.id)}
                      onDragEnd={() => setDragDealId(null)}
                      className={`cursor-grab rounded-lg border border-ink-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow active:cursor-grabbing ${dragDealId === deal.id ? 'opacity-50' : ''}`}
                    >
                      <p className="text-sm font-semibold text-ink-800 truncate">{deal.name}</p>
                      <p className="mt-1 text-sm font-bold text-primary-700">$ {(deal.value || 0).toLocaleString()}</p>
                      <div className="mt-2 space-y-1">
                        {deal.company && (
                          <div className="flex items-center gap-1.5 text-xs text-ink-500 truncate">
                            <Building2 size={12} /> {deal.company.name}
                          </div>
                        )}
                        {deal.contact && (
                          <div className="flex items-center gap-1.5 text-xs text-ink-500 truncate">
                            <User size={12} /> {deal.contact.first_name} {deal.contact.last_name}
                          </div>
                        )}
                        {deal.closing_date && (
                          <div className="flex items-center gap-1.5 text-xs text-ink-400">
                            <CalendarClock size={12} /> {new Date(deal.closing_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="rounded-lg border border-dashed border-ink-200 py-6 text-center text-xs text-ink-400">
                      Drop a deal here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!quickAddStage} onClose={() => setQuickAddStage(null)} title={`New deal — ${quickAddStage?.name ?? ''}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Deal name</label>
            <input className="input" value={quickName} onChange={e => setQuickName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Value</label>
            <input type="number" className="input" value={quickValue} onChange={e => setQuickValue(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setQuickAddStage(null)} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={handleQuickAdd} disabled={saving || !quickName.trim()} className="btn-primary btn-sm">
            {saving ? 'Adding…' : 'Add deal'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
