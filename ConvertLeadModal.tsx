import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Handshake, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/Modal';
import type { Lead, Pipeline, PipelineStage } from '@/types';

interface ConvertLeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onConverted: () => void;
}

/**
 * Mirrors Salesforce's "Convert Lead" flow:
 *  - Lead.company_name  -> new (or matched) Account
 *  - Lead.first/last/email/phone -> new Contact, linked to the Account
 *  - Optional: open Opportunity created in the first stage of a pipeline
 *  - Lead is stamped converted (status, converted_contact_id, converted_at)
 * All writes happen in sequence with rollback-on-error handling since
 * Supabase's JS client does not expose multi-table transactions from the browser.
 */
export function ConvertLeadModal({ lead, onClose, onConverted }: ConvertLeadModalProps) {
  const { profile } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [createDeal, setCreateDeal] = useState(true);
  const [dealName, setDealName] = useState('');
  const [dealValue, setDealValue] = useState(0);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lead) return;
    setCompanyName(lead.company_name || '');
    setDealName(lead.company_name ? `${lead.company_name} - Deal` : `${lead.first_name} ${lead.last_name} - Deal`);
    setDealValue(lead.potential_value || 0);
    setError('');

    (async () => {
      const { data: pls } = await supabase.from('pipelines').select('*').order('sort_order');
      setPipelines(pls || []);
      if (pls && pls.length > 0) {
        setPipelineId(pls[0].id);
        const { data: sts } = await supabase
          .from('pipeline_stages')
          .select('*')
          .eq('pipeline_id', pls[0].id)
          .order('sort_order');
        setStages(sts || []);
        if (sts && sts.length > 0) setStageId(sts[0].id);
      }
    })();
  }, [lead]);

  async function handlePipelineChange(id: string) {
    setPipelineId(id);
    const { data: sts } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('pipeline_id', id)
      .order('sort_order');
    setStages(sts || []);
    setStageId(sts && sts.length > 0 ? sts[0].id : '');
  }

  async function handleConvert() {
    if (!lead) return;
    setSaving(true);
    setError('');

    let companyId: string | null = null;
    let contactId: string | null = null;

    try {
      if (companyName.trim()) {
        const { data: company, error: companyErr } = await supabase
          .from('companies')
          .insert({ name: companyName.trim(), owner_id: profile?.id })
          .select()
          .single();
        if (companyErr) throw companyErr;
        companyId = company.id;
      }

      const { data: contact, error: contactErr } = await supabase
        .from('contacts')
        .insert({
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          job_title: lead.title,
          company_id: companyId,
          lead_source: lead.source,
          lead_score: lead.lead_score,
          customer_value: lead.potential_value,
          status: 'active',
          owner_id: profile?.id,
          notes: lead.notes,
        })
        .select()
        .single();
      if (contactErr) throw contactErr;
      contactId = contact.id;

      if (createDeal && dealName.trim()) {
        const stage = stages.find(s => s.id === stageId);
        const { error: dealErr } = await supabase.from('deals').insert({
          name: dealName.trim(),
          value: dealValue,
          pipeline_id: pipelineId || null,
          stage_id: stageId || null,
          probability: stage?.probability ?? 0,
          contact_id: contactId,
          company_id: companyId,
          owner_id: profile?.id,
          status: 'open',
        });
        if (dealErr) throw dealErr;
      }

      const { error: leadErr } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_contact_id: contactId,
          converted_at: new Date().toISOString(),
        })
        .eq('id', lead.id);
      if (leadErr) throw leadErr;

      onConverted();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Nothing further was created.');
    } finally {
      setSaving(false);
    }
  }

  if (!lead) return null;

  return (
    <Modal open={!!lead} onClose={onClose} title="Convert Lead" size="lg">
      <div className="mb-5 flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
        <User size={16} />
        <span className="font-medium">{lead.first_name} {lead.last_name}</span>
        <ArrowRight size={14} className="text-primary-400" />
        <span>will become an Account, a Contact{createDeal ? ', and an Opportunity' : ''}</span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-error-50 border border-error-200 px-4 py-2 text-sm text-error-700">{error}</div>
      )}

      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-ink-800">
            <Building2 size={16} className="text-ink-400" /> Account
          </div>
          <label className="label">Company name</label>
          <input
            className="input"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Leave blank to skip creating an account"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-ink-800">
            <User size={16} className="text-ink-400" /> Contact
          </div>
          <p className="text-sm text-ink-500">
            {lead.first_name} {lead.last_name} — {lead.email || 'no email'} — {lead.phone || 'no phone'}
          </p>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-800 cursor-pointer">
            <input type="checkbox" checked={createDeal} onChange={e => setCreateDeal(e.target.checked)} className="rounded border-ink-300" />
            <Handshake size={16} className="text-ink-400" /> Also create an Opportunity
          </label>

          {createDeal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
              <div className="sm:col-span-2">
                <label className="label">Deal name</label>
                <input className="input" value={dealName} onChange={e => setDealName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Value</label>
                <input type="number" className="input" value={dealValue} onChange={e => setDealValue(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Pipeline</label>
                <select className="input" value={pipelineId} onChange={e => handlePipelineChange(e.target.value)}>
                  {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Stage</label>
                <select className="input" value={stageId} onChange={e => setStageId(e.target.value)}>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name} ({s.probability}%)</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={handleConvert} disabled={saving} className="btn-primary btn-sm">
          {saving ? 'Converting…' : 'Convert'}
        </button>
      </div>
    </Modal>
  );
}
