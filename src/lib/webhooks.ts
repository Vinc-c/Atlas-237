import { supabase } from '@/lib/supabase';

/**
 * The full set of CRM events a webhook can subscribe to (shown as checkboxes
 * in the "New webhook" modal on the API & Webhooks page). This is the single
 * source of truth — both the webhook creation UI and every real trigger site
 * below import from here, so a new event only has to be added in one place.
 */
export const WEBHOOK_EVENTS = [
  'contact.created', 'contact.updated', 'contact.deleted',
  'lead.created', 'lead.updated', 'lead.converted',
  'deal.created', 'deal.updated', 'deal.won', 'deal.lost',
  'invoice.created', 'invoice.paid', 'invoice.overdue',
  'payment.received', 'activity.created',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/**
 * Fires every one of the org's active webhooks subscribed to `event`, with
 * `data` as the payload. Reuses the `test-webhook` edge function so the
 * actual HTTP delivery (signing header, CORS-safe server-side fetch) lives
 * in exactly one place — the "Test" button on the Webhooks page is just this
 * same delivery path with a synthetic `test.ping` event and no real data.
 *
 * Fire-and-forget by design: a slow or failing customer endpoint must never
 * block the CRM action that triggered it (same pattern as ListPage's
 * `notifyNewTicket`). Callers should not `await` this in a way that blocks
 * the UI — call it and move on.
 */
export async function triggerWebhooks(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
  try {
    const { data: hooks } = await supabase
      .from('webhooks')
      .select('id, url, secret')
      .eq('active', true)
      .contains('events', [event]);
    if (!hooks || hooks.length === 0) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token || '';

    await Promise.all(hooks.map(async (wh: { id: string; url: string; secret: string | null }) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ url: wh.url, secret: wh.secret, event, data }),
        });
        const result: { ok?: boolean; status?: number } | null = await res.json().catch(() => null);
        await supabase.from('webhooks').update({
          last_triggered_at: new Date().toISOString(),
          last_response_code: result?.status ?? null,
        }).eq('id', wh.id);
      } catch {
        // one customer endpoint failing must never affect the others or the caller
      }
    }));
  } catch {
    // webhooks are a best-effort side-channel — never let a lookup failure surface to the caller
  }
}
