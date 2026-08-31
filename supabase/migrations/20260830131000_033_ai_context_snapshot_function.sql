-- ============================================================
-- 033: Collapse the 11 separate round-trips ai-assistant made to build
-- its CRM context (contacts count, leads count, hot leads count, deals
-- count, open deals count, invoices count, unpaid invoices count,
-- tickets count, open tickets count, revenue sum, knowledge docs) into
-- one single query. Each of those was a separate HTTP round-trip to
-- PostgREST from the edge function before Gemini was even called —
-- network latency compounds per request, and this was a large share of
-- "Ask Atlas" feeling slow, on top of the AI provider's own response
-- time.
--
-- SECURITY INVOKER (the default — not changed here) is essential: this
-- runs with the CALLER's own RLS policies applied, exactly as the 11
-- separate .select() calls did before. It is not a privilege escalation
-- path — an org can only ever see its own counts, same as before.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_ai_context_snapshot(target_org_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'contacts_count', (SELECT count(*) FROM public.contacts WHERE org_id = target_org_id),
    'leads_count', (SELECT count(*) FROM public.leads WHERE org_id = target_org_id),
    'hot_leads_count', (SELECT count(*) FROM public.leads WHERE org_id = target_org_id AND temperature = 'hot' AND status != 'converted'),
    'deals_count', (SELECT count(*) FROM public.deals WHERE org_id = target_org_id),
    'open_deals_count', (SELECT count(*) FROM public.deals WHERE org_id = target_org_id AND status = 'open'),
    'invoices_count', (SELECT count(*) FROM public.invoices WHERE org_id = target_org_id),
    'unpaid_invoices_count', (SELECT count(*) FROM public.invoices WHERE org_id = target_org_id AND payment_status != 'paid'),
    'tickets_count', (SELECT count(*) FROM public.tickets WHERE org_id = target_org_id),
    'open_tickets_count', (SELECT count(*) FROM public.tickets WHERE org_id = target_org_id AND status = 'open'),
    'total_revenue', (SELECT COALESCE(sum(amount), 0) FROM public.payments WHERE org_id = target_org_id AND status = 'completed'),
    'knowledge_docs', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('title', title, 'category', category, 'description', description)), '[]'::jsonb)
      FROM (
        SELECT title, category, description FROM public.knowledge_documents
        WHERE org_id = target_org_id ORDER BY created_at DESC LIMIT 20
      ) kd
    )
  );
$$;

COMMENT ON FUNCTION public.get_ai_context_snapshot IS
  'Single-query replacement for the 11 separate counts/queries ai-assistant used to build its CRM context. SECURITY INVOKER (default): runs under the caller''s own RLS, scoped to their org exactly as before.';

GRANT EXECUTE ON FUNCTION public.get_ai_context_snapshot(uuid) TO authenticated;
