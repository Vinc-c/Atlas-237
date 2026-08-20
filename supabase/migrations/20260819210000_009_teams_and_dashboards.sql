-- ============================================================
-- 009: Teams & Custom Dashboards
--
-- These tables were present in an earlier draft of the "006" migration
-- but are absent from the version actually used going forward (which
-- fixed a blocking bug: super_admins.user_id was NOT NULL with a seed
-- INSERT that never provided it, which would have failed at apply
-- time). Re-added here standalone since TeamsPage and DashboardsPage
-- in the frontend depend on them.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  lead_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_teams_org_id ON public.teams(org_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read teams" ON public.teams;
CREATE POLICY "org members read teams" ON public.teams FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "org admins manage teams" ON public.teams;
CREATE POLICY "org admins manage teams" ON public.teams FOR ALL
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin')));
DROP POLICY IF EXISTS "org members read team_members" ON public.team_members;
CREATE POLICY "org members read team_members" ON public.team_members FOR SELECT
  USING (team_id IN (SELECT id FROM public.teams WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid())));
DROP POLICY IF EXISTS "org admins manage team_members" ON public.team_members;
CREATE POLICY "org admins manage team_members" ON public.team_members FOR ALL
  USING (team_id IN (SELECT id FROM public.teams WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))));

-- Custom dashboards (per-org saved dashboards)
CREATE TABLE IF NOT EXISTS public.dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboards_org_id ON public.dashboards(org_id);

ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read dashboards" ON public.dashboards;
CREATE POLICY "org members read dashboards" ON public.dashboards FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "org members create dashboards" ON public.dashboards;
CREATE POLICY "org members create dashboards" ON public.dashboards FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "org members update dashboards" ON public.dashboards;
CREATE POLICY "org members update dashboards" ON public.dashboards FOR UPDATE
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "org members delete dashboards" ON public.dashboards;
CREATE POLICY "org members delete dashboards" ON public.dashboards FOR DELETE
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
