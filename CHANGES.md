# Changes — audit + fixes + new flow

## Bugs fixed (the app would not have built/worked as-shipped)

1. **`package.json` was missing two dependencies actually imported by the code**:
   `react-router-dom` and `@supabase/supabase-js`. Every page imports one or
   both. `npm install && npm run build` would have failed on a fresh clone.
   Added both.

2. **Two generations of the app were mixed in the same repo.** The root held
   a first draft (`App.jsx`, `mockData.js`, `Navbar.jsx`, `Sidebar.jsx`,
   `CRMModules.jsx`, etc.) that stored everything in `localStorage` and even
   imported a `./views/` folder that doesn't exist in the repo (i.e. it
   couldn't have run either). `index.html` actually loads `/src/main.tsx`, so
   the real app is the TypeScript one under `src/`, wired to Supabase. Moved
   the dead first draft out of the build tree so it can't shadow or confuse
   the real app.

3. **Edit/Delete buttons were invisible on every list page** (Contacts,
   Companies, Leads, Deals, Activities, Pipelines...). The row had
   `opacity-0 group-hover:opacity-100` but the `<tr>` never had the
   `group` class, so `group-hover` never fired — the buttons existed but
   could never be seen or clicked. Fixed.

4. `.env.example` was missing, so nobody could tell what environment
   variables the app needs (`src/lib/supabase.ts` throws immediately without
   them). Added it, plus typed `ImportMetaEnv` so TypeScript checks it.

## What was already real (kept as-is)

Everything under `src/` was already a genuine, working CRUD app on top of a
real Postgres schema (30+ tables, RLS policies scoped by `org_id`, real
Supabase Auth, multi-language, multi-tenant). No mock data in the current
app — `mockData.js` belonged only to the dead first draft above.

## New: the Salesforce-defining flows that were missing

The database schema was already built for these (columns like
`leads.converted_contact_id`, `pipeline_stages.color/probability`) but no UI
used them.

- **Lead Conversion** (`src/components/ConvertLeadModal.tsx`) — the flow
  Salesforce is built around: a Lead becomes an Account (Company), a
  Contact, and optionally an Opportunity (Deal) in one action, and the Lead
  is stamped `converted`. Wired to the Leads list via a new row action.
- **Opportunity Kanban board** (`src/components/DealsKanban.tsx`) — Deals
  grouped by pipeline stage, drag-and-drop to move a deal between stages
  (updates `stage_id` and `probability` for real), quick-add per column,
  per-stage totals. This is now the default view on the Deals page, with a
  Kanban/List toggle.

## Honest note on "exact Salesforce"

I didn't try to pixel-clone salesforce.com's actual interface — that's
proprietary Lightning Design System UI/branding, and copying it isn't
something I'll do. What I built instead is the same **underlying flow**
Salesforce is known for (Lead → Convert → Account/Contact/Opportunity,
stage-based pipeline board), which is standard CRM architecture, in this
app's own design system.

## Still worth doing next (not done here)

- Record detail pages with related lists (click a Contact → see its Deals,
  Activities, Companies) — currently everything is list + modal only.
- Global search across objects.
- Real-time updates (Supabase Realtime) instead of manual reload.
- Row-level "assigned to me" filters on list views.
