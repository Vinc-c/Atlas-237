-- Links a workflow to the "AI Employee" (ai_agents row) responsible for it.
-- Previously ai_agents.usage_count never incremented anywhere in the app —
-- an AI Employee was a purely decorative record. Assigning a workflow to
-- one and bumping its usage_count each real, successful run (see
-- src/lib/workflows.ts executeAndLogWorkflow) makes that count genuine.
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES public.ai_agents(id) ON DELETE SET NULL;
