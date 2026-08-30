-- 033: single-query AI context snapshot.
--
-- ai-assistant's context-building step ran 11 separate queries
-- (contacts/leads/hot-leads/deals/open-deals/invoices/unpaid-invoices/
-- tickets/open-tickets/payments/knowledge_documents) via Promise.all. This
-- function replaces all of them with one round trip. SECURITY INVOKER
-- (the default — intentionally not SECURITY DEFINER) so it still runs
-- under the caller's own RLS, scoped to their org exactly as the original
-- queries were.
--
-- NOTE: this migration was applied directly to production (via the
-- Supabase MCP connector) before this file was committed — reconstructed
-- here from `supabase_migrations.schema_migrations` so the repo and the
-- live database stay in sync. CREATE OR REPLACE is idempotent by nature.
--
-- As of this note, ai-assistant/index.ts has NOT yet been updated to call
-- this function — it still does the 11 queries inline. Wiring it up would
-- be a real efficiency improvement (1 round trip instead of 11) but is a
-- separate, deliberate change, not implied by this migration alone.
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
