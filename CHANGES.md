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

## Cloudflare Pages — what was missing, and exact setup

I can't run `npm install`/`npm run build` in this environment (no network
access to the npm registry from here), so I did a careful manual review
instead of a live build — see "Honest status" below.

**Was missing, now added:**
- `public/_redirects` containing `/*  /index.html  200`. Without this,
  Cloudflare Pages serves your `dist/` as static files with no server-side
  routing — refreshing on `/app/deals`, or sharing a direct link, returns a
  404 because there's no physical `deals` folder. This file tells Cloudflare
  to always serve `index.html` and let React Router handle the route
  client-side. This is the #1 thing that breaks React Router apps on static
  hosts if forgotten.

**Cloudflare Pages project settings (set these in the dashboard, not in code):**
| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (repo root) |
| Environment variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

The Supabase variables **must** be set as Cloudflare Pages environment
variables (Settings → Environment variables, for both Production and
Preview) because Vite bakes `VITE_*` vars into the JS bundle at build time —
they are not read at runtime. If they're missing, the build itself will
fail at `src/lib/supabase.ts`'s `throw new Error('Missing Supabase
environment variables')`.

Also add your Cloudflare Pages domain (and `http://localhost:3000` for
local dev) to Supabase → Authentication → URL Configuration → Redirect
URLs, or the login/signup/reset-password redirects will fail.

**Also fixed while checking this:** the signup flow used to always redirect
to `/app` after `signUp()`. If your Supabase project has "Confirm email"
enabled (the default for new projects), `signUp()` returns no session until
the user clicks the confirmation link — the old code would silently bounce
the user back to `/auth` with no explanation. It now checks for a session
and shows a "check your inbox" message when confirmation is pending. Also
added explicit `redirectTo` on signup/password-reset so those email links
point at your actual deployed domain instead of Supabase's default.

## Honest status — what I verified vs. what I couldn't

- **Verified by reading the code line by line**: all imports resolve to
  real files/packages, the Supabase queries match the actual table/column
  names in the migrations, RLS policies allow the inserts the new Convert
  Lead / Kanban flows perform, and TypeScript types line up.
- **Not verified**: I could not run `npm install` or `npm run build` here —
  this sandbox has no network access to the npm registry. So this hasn't
  been compiled or run in a browser by me. Before you rely on it, run
  locally:
  ```
  npm install
  cp .env.example .env   # fill in your Supabase project's URL + anon key
  npm run dev
  ```
  and click through signup → dashboard → leads → convert → deals kanban
  once. If `npm run build` or `tsc` surfaces an error, paste it here and
  I'll fix it directly — that's a five-minute fix, not a rewrite.

## Landing page & Auth page — current state

Both are real, custom-built pages (not placeholders): gradient hero,
pricing table with a feature-comparison grid, and a proper
login/signup/forgot-password form wired to real Supabase Auth (not mocked).
They're in French by default and reasonably polished, but I did not do a
dedicated visual/UX pass on them — if "pro" means matching a specific
reference design or brand, tell me which one and I'll rework them
specifically, since "professional" is a judgment call I don't want to
silently make for you.

## Still worth doing next (not done here)

- Record detail pages with related lists (click a Contact → see its Deals,
  Activities, Companies) — currently everything is list + modal only.
- Global search across objects.
- Real-time updates (Supabase Realtime) instead of manual reload.
- Row-level "assigned to me" filters on list views.
