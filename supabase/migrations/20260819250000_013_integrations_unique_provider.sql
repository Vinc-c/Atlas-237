-- A tenant should only have one connection per provider (Gmail, Slack, etc.).
-- Required for the oauth-exchange edge function's upsert(onConflict:
-- 'org_id,provider') to work, and prevents duplicate connections.
CREATE UNIQUE INDEX IF NOT EXISTS uq_integrations_org_provider
  ON public.integrations(org_id, provider) WHERE org_id IS NOT NULL;
