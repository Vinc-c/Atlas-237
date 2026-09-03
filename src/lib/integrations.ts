import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Shared helper for anything that needs to know which marketplace apps this
 * org actually has connected — used to show/hide quick actions (e.g. "Send
 * WhatsApp" on a contact) and to warn when a workflow action needs a
 * provider that isn't connected yet.
 */
export function useConnectedProviders() {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.from('integrations').select('provider').eq('status', 'connected').then(({ data }) => {
      if (cancelled) return;
      setConnected(new Set((data || []).map((d: { provider: string }) => d.provider)));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { connected, loading };
}

/**
 * Calls the `integration-action` edge function, which performs a real
 * outbound call to a connected marketplace app using that org's stored
 * credentials — see supabase/functions/integration-action/index.ts. Used
 * both by Workflow actions (src/lib/workflows.ts) and by direct, one-off
 * quick actions (e.g. "Send WhatsApp" on a Contact row).
 */
export async function callIntegrationAction(action: string, params: Record<string, unknown>, integrationId?: string): Promise<{ ok: boolean; msg: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token || '';
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, params, integration_id: integrationId }),
    });
    const result = await res.json().catch(() => null);
    return { ok: Boolean(result?.ok), msg: result?.msg || `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, msg: e instanceof Error ? e.message : 'Request failed' };
  }
}
