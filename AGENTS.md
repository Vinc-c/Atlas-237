# Atlas CRM — Repository Notes

## Stack
- React 18 + Vite 5 + Tailwind CSS 3 + lucide-react + @supabase/supabase-js
- Path alias `@/` -> `src/`
- Source of truth for the app is `src/` (the root-level `.jsx`/`.tsx` files like `App.jsx`, `CRMModules.jsx`, etc. are stale duplicates and are NOT imported by `src/main.tsx`).

## Build / Deploy
- `npm run build` -> static SPA in `dist/`
- Cloudflare Pages: build command `npm run build`, output dir `dist`.
- `public/_redirects` (SPA fallback `/* /index.html 200`) and `public/_headers` are copied into `dist/` by Vite automatically.
- Env vars `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` should be set in Cloudflare for live auth/data. `src/lib/supabase.ts` now uses safe placeholder fallbacks (no longer throws), so the landing/auth pages render even without env vars. Use the exported `isSupabaseConfigured` flag to gate real backend calls.
- **Pushing to GitHub deploys NONE of the Supabase-side pieces automatically**
  — this has been the root cause of several "I fixed it but it still doesn't
  work" reports. Two separate, manual deploy steps are required after
  pulling any change under `supabase/`:
  - `supabase/migrations/*.sql` → `supabase db push` (or paste into the
    Dashboard SQL Editor). A migration file existing in the repo has zero
    effect on the live database until this runs.
  - `supabase/functions/*/index.ts` → `supabase functions deploy` (all of
    them) or `supabase functions deploy <name>` (one). Cloudflare Pages
    only rebuilds the frontend — it has no idea Edge Functions exist. A
    live project can easily be running edge function code from weeks
    earlier than what's in the repo/frontend, silently. When debugging any
    "the fix didn't work" report that touches an edge function, deploying
    it (again) is the first thing to rule out, before assuming the fix
    itself was wrong.
- All 11 edge functions confirmed live and up to date as of this note
  (deployed directly via the Supabase MCP connector, since this environment
  has no network path to supabase.co for a CLI-based deploy — see
  `search_mcp_registry`/`suggest_connectors` if you don't have it connected).
  Two functions — `flutterwave-verify` and `paystack-verify` — had NEVER
  been deployed at all before this: any real Flutterwave/Paystack checkout
  would complete on the frontend, redirect back, and then 404 trying to
  verify the payment and activate the subscription. Both are deployed now.
- `supabase/config.toml` sets `verify_jwt = false` for `payunit-webhook`
  specifically (every other function keeps the default `true`). PayUnit's
  own servers call this endpoint directly to report a payment's outcome —
  they can never send a Supabase user JWT, so with the platform default
  (`verify_jwt = true`) every real webhook notification was rejected with
  401 by the gateway before the function code ever ran, silently. The
  function's own logic never trusts the webhook body regardless (it
  re-queries PayUnit's status API using the org's own server secrets before
  activating anything), so disabling the platform-level JWT check here
  doesn't weaken that. If you ever regenerate `config.toml`, keep this
  entry — a `supabase functions deploy` without it silently resets
  `payunit-webhook` back to `verify_jwt = true` and reintroduces the bug.
- `src/lib/payunit.ts`'s `isPayunitConfigured()` — the "is PayUnit even
  available" ping — used to send NO Authorization header at all, which
  also gets rejected 401 by the `verify_jwt = true` gateway check on
  `payunit-initialize` (this one correctly keeps verify_jwt = true; it's a
  normal user-facing endpoint) before the function's own `{check: true}`
  branch ever runs. From the frontend this looked identical to "PayUnit
  isn't configured" even when the server secrets were set correctly — the
  exact bug reported. Fixed by sending the project's anon key as
  `Authorization: Bearer <anon key>` (a legitimate signed JWT, sufficient
  for this public availability check — no user session needed).

## Tailwind config gotcha (important)
`tailwind.config.js` must define the full color palettes used across the app:
`primary, ink, success, warning, error, accent, secondary` (each 50-900),
plus `boxShadow.card / card-hover / sidebar`, `keyframes`/`animation` for
`fade-in` and `slide-up`. `src/index.css` uses `@apply shadow-card`,
`@apply animate-fade-in` etc., which FAIL the build if those tokens are missing.
The custom `.sidebar-shadow` utility is defined in `index.css` (not a tailwind shadow token).

## Fonts
- Glacial Indifference is self-hosted in `public/fonts/` (Regular + Bold `.woff`).
- `@font-face` rules live at the top of `src/index.css` and reference `/fonts/*.woff` (absolute, served from Cloudflare origin).
- `index.html` preloads both woff files. The font is applied globally via `html`/`body`/headings in `index.css` and the `glacial` family in `tailwind.config.js`.

## AuthPage (responsive + real)
- Split-screen: full brand panel (cloud-blue, logo, tagline, dashboard illustration,
  social proof) on `lg+`; condensed gradient brand banner on mobile/tablet (`lg:hidden`).
- Form panel centered with `max-w-md`, paddings scale by breakpoint (`px-5` mobile → `lg:px-16`).
- Password field has a show/hide toggle (Eye / EyeOff) inside the input.
- Google SSO uses the real multicolor Google "G" SVG (inline `GoogleIcon`), not a fake badge.
- All strings go through i18n (`auth.or`, `auth.continueGoogle`, `auth.terms`, `auth.confirmEmail`,
  `auth.notConfigured`, `auth.brandTagline`, `auth.brandSub`, `auth.socialProof`) — 5 languages.
- `isSupabaseConfigured` guard shows a clear message if env vars are missing (helps Cloudflare debugging).
- Signup handles email-confirmation flow: if no session returned, shows "check your inbox" message
  and switches to login mode instead of blindly navigating to /app.
- OAuth has its own loading state (`oauthLoading`) with a spinner.
- Inputs use proper `autoComplete` attributes (email, current-password, new-password, given-name…).

## AskAtlas AI assistant (functional, two-tier)
- `src/lib/askAtlas.ts` first tries the org's real configured AI (see
  "Choose your AI" in Settings / `organizations.ai_provider` and the
  `ai-assistant` edge function below); if that can't even be reached
  (no session, network failure), it falls back to a deterministic
  keyword-matched business-question engine that answers in natural
  language by querying live Supabase data (counts/aggregates). Intent
  keywords cover: contacts, leads (hot/new), deals (open/at-risk),
  revenue/payments, invoices (unpaid), tickets, tasks (overdue), meetings,
  AI tasks, employees, and an overview/summary fallback. No external LLM
  key is required for this fallback tier — it reads the org's own tables.
- If the real AI call IS reached but fails for a real reason (missing/bad
  API key, the provider rejecting it, etc.), that reason is shown directly
  to the user (prefixed "⚠️ AI unavailable: ..."), NOT silently swallowed
  into a fallback keyword answer. This used to silently fall back on any
  failure at all — meaning an org that connected and selected their own
  OpenAI/Anthropic/Gemini key, but got the config wrong, would keep
  getting what looked like normal working answers with zero indication
  they were never actually AI-generated. Keep this distinction if you
  touch `tryRealAI()` again: null = genuinely unreachable (fall back
  silently), an error message = reached but failed (show it).
- `supabase/functions/ai-assistant` is the real backend: reads
  `organizations.ai_provider` (`platform_free` by default, using the
  platform's own `GEMINI_API_KEY` server secret; or `openai`/`anthropic`/
  `gemini` once the org both (1) connects their own key for that provider
  in Marketplace AND (2) selects it in Settings > "Choose your AI" — step 1
  alone does nothing, `ai_provider` still has to be flipped in step 2),
  fetches a live CRM snapshot (contacts/leads/deals/invoices/tickets/
  revenue counts) plus the org's 20 most recent Knowledge Base entries
  (title/category/description — metadata only, no file content) as
  grounding context, and calls the selected provider.
- Gemini model name: Google periodically retires older model IDs outright
  (gemini-2.0-flash was fully shut down 2026-06-01, breaking a hardcoded
  call to it with a hard 404 the moment it happened). `callGemini()` tries
  `GEMINI_MODEL_CANDIDATES` in order (currently `gemini-3.6-flash` first)
  and only advances to the next one on a 404/"no longer available"
  response — any other failure (bad key, quota, content policy) surfaces
  immediately rather than retrying pointlessly. When Google deprecates the
  first entry again, update the list rather than going back to a single
  hardcoded model string — that's what caused this bug in the first place.
- It returns `{ text, route? }` (fallback tier only) so answers can
  deep-link to the relevant module page.
- Used in two places: `AskAtlasPage` (full chat UI with clickable
  suggestions + "View" link) and `DashboardPage` AI command bar (inline
  reply panel).

## Data layer
All CRUD goes through Supabase via `src/components/ListPage.tsx` (generic table editor)
and individual pages. Tables expected: contacts, companies, leads, deals, pipelines,
activities, products, quotes, orders, invoices, payments, campaigns, tickets, ai_agents,
ai_tasks, approvals, workflows, ai_memory, knowledge_documents, integrations, api_keys,
webhooks, notifications, audit_logs, profiles, organizations. SQL migrations are at
`supabase/migrations/` (latest: `20260828140000_028_add_contacts_company_text_column.sql`).
- Whenever you add or edit a `ListPage` `formFields` array, or a direct
  `supabase.from(table).insert({...})` / `.update({...})` call anywhere else,
  double-check every key against the table's real columns in
  `supabase/migrations/`. A field/column-name mismatch fails silently at
  runtime (Postgres rejects the whole write with "column X does not exist")
  and is easy to miss in review since TypeScript can't catch it — the two
  real bugs fixed for this reason so far: contacts' `company` field had no
  matching column (migration 028), and TeamPages inserted `profile_id` into
  `team_members`, which only has `user_id` (profiles.id IS auth.users.id in
  this schema, so passing a profile id as user_id is correct once renamed).
  A related but distinct failure mode: a column existing with the right
  name but the WRONG TYPE — `contacts.tags` is a real Postgres array
  (`text[]`), but its form field was typed as plain `'text'`, so any value
  typed into it got sent to Postgres as a bare string, which fails with
  "malformed array literal" (Postgres tries to parse the string itself as
  array syntax). `FormField` now has a proper `'tags'` type
  (`ListPage.tsx`) that renders a comma-separated text input and
  converts to/from a real array on save/edit — use it for any other
  `text[]` column exposed in a form, don't reuse plain `'text'`.
- Campaigns (`campaigns` table, `MarketingPage`) and Knowledge Base
  (`knowledge_documents` table, `KnowledgeBasePage`) are intentionally
  metadata-only trackers right now — recording a campaign's budget/subject/
  content or a document's title/file_path, with no button claiming to
  actually send an email or upload a file to storage. That's an honest,
  accurate scope (no fake "Sent"/"Uploaded" state) — but the Knowledge Base
  empty-state copy used to say "Upload documents to train your AI
  employees," which was a real false claim: no upload/parsing ever
  happened, and `ai-assistant` never read `knowledge_documents` at all, so
  nothing added there had any effect on Ask Atlas. Fixed both ends: the
  copy now accurately says these are reference notes whose titles/
  descriptions Ask Atlas can see (not full file contents, no parsing), and
  `ai-assistant`'s context now genuinely includes the org's 20 most recent
  Knowledge Base entries (title/category/description) so that claim is
  true. Actual file upload/parsing into full-text/embeddings would still
  be new functionality, not a bug fix — don't reintroduce upload-sounding
  copy without building that first.

## Data-layer bug-hunting tool
There's no CI check for form-field/column-name drift (the exact bug class
above), so when doing a broader integrity pass, re-derive the column map
from `supabase/migrations/*.sql` (CREATE TABLE + later ALTER TABLE ADD/DROP
COLUMN) and diff it against every `key: '...'` in a ListPage `formFields`
array and every literal key in a direct `.insert({...})`/`.update({...})`
call. Skip keys inside a nested object (most raw `.insert()` calls
correctly nest provider-specific fields inside a jsonb column like `config`
or `permissions` — those are not top-level columns and will show as false
positives in a naive flat-key diff). Also worth periodically re-running:
every `.rpc('name', {...})` call vs. the real function signature in
migrations (param names must match exactly), and every `t('key', lang)`
call vs. the keys actually defined in `src/lib/i18n.ts` — a missing i18n
key doesn't error, `t()` just returns the raw key string, so it silently
renders as e.g. "list.value" instead of "Value"/"Valeur" in the UI (found
and fixed one instance of this: AI Memory page's Value column/field).

## Plan gating (must match the landing page's pricing matrix exactly)
`src/lib/plans.ts` (`PLAN_FEATURES`) is the single source of truth for what
each plan unlocks — every boolean/cap there must have a real enforcement
point somewhere in the app, and every restriction the landing page's
pricing comparison matrix (`src/pages/LandingPage.tsx`, `matrixGroups`)
advertises must have a matching flag here. They drifted once already:
the matrix promised "Devis & facturation"/"Tickets clients" (Growth+),
"Base de connaissances" (Pro+), and "Automations / workflows" (Growth+)
were plan-gated, but nothing in the code enforced any of the four — any
Starter org had full access regardless. Fixed by adding `quotesInvoicing`,
`tickets`, `knowledgeBase`, `workflowAutomation` flags and gating
QuotesPage/InvoicesPage (BusinessPages.tsx), SupportPage/tickets
(BusinessPages.tsx), KnowledgeBasePage, and AIWorkflowsPage (AIPages.tsx)
with `usePlanAccess().hasFeature(...)` + the shared `<UpgradeGate>`
component — the same pattern already used for `customDashboards`/
`advancedAnalytics` (AnalyticsPages.tsx), `apiAccess`/`webhooks`
(IntegrationPages.tsx API Keys & Webhooks tab), `customBranding`/`ssoSaml`
(SystemPages.tsx Settings tabs), and `customRoles`/`maxUsers`
(TeamPages.tsx). If you add a new plan-gated feature, use this same
pattern rather than inventing a new one, and update the matrix and
`PLAN_FEATURES` together — never one without the other.
- That UI-level gate (`UpgradeGate`) only hides pages in React — it never
  stopped a Starter-plan org (with a perfectly valid, active subscription)
  from calling the Supabase API directly to create quotes/tickets/
  knowledge-base entries/workflows anyway. Migration 029 closes that at the
  RLS layer: `org_plan_has_feature(org_id, feature)` mirrors the same
  `PLAN_FEATURES` booleans in SQL, applied as RESTRICTIVE INSERT/UPDATE
  policies on every gated table. Keep both in sync by hand — nothing
  enforces it automatically, and a real plan restriction needs both the
  UI gate (so it's not confusing) and the RLS gate (so it's not fake).

## Migration/DB drift — verified against production directly
As of the latest session, all migrations through `033` and all 11 Edge
Functions were confirmed to actually match this repo by querying the live
project directly (Supabase MCP connector: `list_migrations`,
`list_edge_functions`, `execute_sql` against `information_schema` and
`supabase_migrations.schema_migrations`) — not assumed from the repo
alone. Two migrations (`032_fix_subscriptions_upsert_conflict`,
`033_ai_context_snapshot_function`) had been applied straight to
production (by a session with direct DB/MCP access) before ever being
committed as files — reconstructed from `schema_migrations` and added
to the repo after the fact so the two don't drift apart again. If you
have DB/MCP access and apply a migration directly, still commit the
matching `.sql` file in the same session — the live database being
ahead of the repo is exactly the kind of gap that made several bugs in
this project hard to diagnose (fixes that were "real" in the database
but invisible to anyone reading the code).

## Billing / PSP registry / Trial enforcement
- Plans: Starter $19, Growth $49, Pro $119, Enterprise $219 — flat monthly
  price per organization (not per seat; `maxUsers` in `src/lib/plans.ts`
  caps seats per plan, it doesn't multiply the price). All amounts are
  defined in USD in exactly 5 places that must stay in sync: `src/lib/
  plans.ts` (PLAN_PRICES, feature gating), `src/lib/flutterwave.ts`,
  `src/lib/paystack.ts`, `supabase/functions/payunit-initialize`, and
  `supabase/functions/paddle-verify` (PLAN_PRICES_USD in each). The
  platform's own currency is always USD; each PSP converts from there —
  Flutterwave and Paystack charge the USD amount directly (their own
  checkout UI shows it in the customer's local currency), PayUnit converts
  USD → XAF itself server-side using a live exchange rate fetched from
  open.er-api.com (never a hardcoded/guessed peg), Paddle charges against
  pre-created USD Price objects (see below) and handles its own
  local-currency display and Merchant-of-Record tax/VAT. The frontend
  never performs its own currency conversion.
- `src/lib/psp.ts` is the single PSP registry — Flutterwave (card/bank),
  PayUnit (mobile money: MTN, Orange, Express Union, YUP), Paystack (card/bank/
  mobile money), and Paddle (card/PayPal/Apple Pay, global, Merchant of
  Record). `getAvailablePsps()` only returns a PSP once its
  `checkAvailable()` proves real configuration; `BillingPage`/`PspCheckoutModal`
  render exactly that filtered list, never a hardcoded one.
- **"No payment method is currently available" is expected, not a bug, until
  real PSP credentials are set** — see `.env.example` for the exact variable
  names and where each one goes (Cloudflare Pages `VITE_*` client vars vs.
  Supabase Edge Function secrets for everything else, secret keys included).
  Client-side `checkAvailable()`: Flutterwave/Paystack/Paddle check their
  `VITE_*` public/client token is present in the built bundle (Paddle
  additionally requires all 4 `VITE_PADDLE_PRICE_*` Price IDs to be set —
  it won't show as "available" with only some of them, since a checkout for
  a plan with no Price ID would silently do nothing). PayUnit has no public
  key at all, so it pings `payunit-initialize` with `{ check: true }` and
  trusts only a live server confirmation.
- `src/lib/paddle.ts` — Paddle Billing overlay checkout (`Paddle.Checkout.open`),
  `confirmPaddlePayment()` calls `supabase/functions/paddle-verify`
  (deployed live via Supabase MCP) which re-verifies the transaction against
  Paddle's own API before activating anything — same trust model as the
  other three PSPs (never trust the client-side "checkout.completed" event
  alone). Unlike the others, Paddle checkouts reference pre-created Price
  objects (one per plan) rather than a raw amount — those must be created
  once in the Paddle dashboard (Catalog → Prices) before Paddle can appear
  as a payment option; `paddle_transaction_id` column added to
  `subscriptions` via migration `034`.
- `src/lib/flutterwave.ts` — inline Flutterwave Checkout, `checkSubscriptionAccess(orgId)`
  via Supabase RPC `org_subscription_status`, `recordSubscription()` to upsert
  `subscriptions` table + update `organizations.plan`.
- `src/components/Paywall.tsx` wraps all protected routes; blocks access when trial
  expired and no active subscription. The user CANNOT bypass — the Paywall renders
  before any app content.
- `BillingPage` (in SystemPages.tsx) uses the PSP registry above to upgrade plans.
- DB: `subscriptions` table + `org_subscription_status(check_org_id)` RPC function
  added by migration `005`. RLS enabled and further locked down by migrations
  `024_billing_rls_enforcement` and `025_lock_down_billing_writes`.

## OAuth app integrations (real connections, not decorative icons)
- `supabase/functions/oauth-exchange` is the single server-side token-exchange
  function for every OAuth-based app in `IntegrationPages.tsx`. Its `PROVIDERS`
  registry must list every provider whose `authUrls[...]` entry exists
  client-side — as of this note that's 20 providers (Google family, Slack,
  Zoom, Microsoft family, QuickBooks, Xero, PayPal, GoCardless, Revolut
  Business, Intercom, Facebook family, LinkedIn Ads, Dropbox, DocuSign,
  Notion, Asana). Adding a new "Connect" button to `OAUTH_CLIENT_IDS` /
  `authUrls` without also adding it here reproduces the exact bug that was
  just fixed: the user completes the provider's real consent screen and then
  hits "Unknown OAuth provider" back on `/auth/callback`.
- Most providers are standard OAuth2 (client_id + client_secret in a
  form-urlencoded body). PayPal and Notion are NOT — both require HTTP Basic
  auth instead (`authStyle: 'basic'` in the registry); Notion additionally
  wants a JSON body (`bodyFormat: 'json'`). Get this wrong and the exchange
  is silently rejected by the provider even with correct credentials.
- Known gap: Trello uses the legacy implicit/token flow (`response_type=token`,
  token returned in the URL fragment, not a `code`) — it never reaches
  `oauth-exchange` and `OAuthCallbackPage` currently only reads the query
  string, so a Trello connection attempt ends in "Invalid authorization
  response." Needs its own fragment-reading branch in `OAuthCallbackPage`
  (and a decision on how/where to persist the token) before Trello is real.
  **Fixed** — `OAuthCallbackPage` now branches on `provider === 'trello'`,
  reads the token from `window.location.hash`, and upserts it into
  `integrations` directly from the client (safe: RLS scopes the write to
  the caller's own `org_id`, same guarantee `oauth-exchange` gives
  server-side for every other provider).
- Every provider needs both its own `VITE_<X>_CLIENT_ID` (client-side,
  Cloudflare) and `<X>_CLIENT_SECRET` (server-side, Supabase Edge Function
  secret) registered in the provider's own developer console first — see
  `.env.example` for the exact names.

## Logo
- `src/components/Logo.tsx` — simple CRM logo (stacked card + "A" mark), replaces
  the old Sparkles icon everywhere (AppLayout sidebar, AuthPage, LandingPage header/footer).

## Legal pages
- `src/pages/LegalPage.tsx` serves `/legal/:page` for 20 real pages (privacy, terms,
  cookies, about, security, contact, careers, pricing, docs, status, community, blog,
  gdpr, refund, pledge, sales-cloud, service-cloud, agentforce, data-360, tableau).
  `refund` (Refund Policy) added Sep 2026 — was missing entirely; content is grounded
  in the real 14-day trial and real PSP list (Flutterwave/Paystack/PayUnit/Paddle),
  not generic boilerplate.
- Bilingual EN/FR, scroll-reveal animations.
- Footer (`LandingPage.tsx`) has real social links (TikTok, Facebook, Instagram,
  LinkedIn, YouTube — actual liafrik/liyah accounts, not placeholder `#` hrefs) plus
  the Refund Policy link alongside Privacy/Terms/Cookies/GDPR.

## Landing page (bilingual + animations)
- `src/pages/LandingPage.tsx` is fully bilingual EN/FR via `useAuth().language`.
- Language toggle (Globe icon) in the header switches FR↔EN.
- Scroll-reveal animations via `src/lib/useScrollReveal.ts` (IntersectionObserver).
- Tailwind keyframes: `fade-in-up`, `pulse-slow`, `float`, `shimmer` (see tailwind.config.js).
- CSS: `.reveal` / `.reveal.is-visible` classes in `src/index.css`.

## i18n
- `src/lib/i18n.ts` — `t(key, lang)` with 5 languages (en, fr, es, pt, ar).
- `AuthContext` provides `language` and `setLanguage`.
- `src/lib/i18n-countries.ts` — full country list (195, ISO 3166-1), currencies (50+,
  ISO 4217), timezones, `formatMoney()`, `suggestCurrency()`, `getCountryName()`.
- AuthPage signup includes country/currency/timezone/sales_code selectors (international onboarding).

## Super Admin (platform-level)
- Access via `/super-admin/*` routes (separate `SuperAdminLayout`, NOT inside Paywall).
- `AuthContext.isSuperAdmin` — checked via `is_super_admin()` RPC on login, with email fallback.
- 3 founder emails seeded: `vincentnogue@yahoo.com`, `vincentnogue2@gmail.com`, `webdxb1@gmail.com`.
- Min-2 active super admins rule enforced (UI + DB constraint logic).
- Founders protected: typed "CONFIRM" required for removal.
- All super admin actions logged to `platform_audit_log` (immutable) via `log_platform_action()`.
- `super_admins` table + `is_super_admin()`, `count_active_super_admins()`, `link_super_admin()` RPCs.
- Pages: Dashboard (platform_stats view), Users & Tenants, Subscriptions, Analytics,
  Employee KPIs, Sales Codes, Permissions (RBAC), Audit Log.
- Super Admin nav section appears in tenant AppLayout sidebar only when `isSuperAdmin`.

## RBAC (single engine, platform + tenant scope)
- `src/lib/rbac.ts` — `MODULES`, `ACTIONS`, `fetchRoles()`, `createRole()`, `deleteRole()`,
  `setRolePermissions()`, `checkPermission()` (backend via `rbac_check()` RPC), `usePermission()` hook.
- DB tables: `rbac_roles` (org_id NULL = platform), `rbac_permissions`, `rbac_user_roles`.
- `rbac_check(user_id, module, action, org_id)` SQL function — authoritative backend enforcement.
- Default roles auto-seeded per new org via trigger: Owner (full), Admin (most), Member (basic).
- Tenant admins create custom roles in Settings → Roles & Permissions tab.
- Super Admins manage platform roles in `/super-admin/permissions`.

## Sales Codes (commercial tracking)
- `sales_codes` table: unique code → salesperson, max_uses, uses_count.
- `sales_code_conversions` table: tracks signups + plan subscriptions per code.
- Signup with sales code → `handle_new_user()` increments uses + logs conversion.
- `handle_new_user()` also calls `seed_demo_data()` for every new org, which
  inserts sample CRM records (contacts, deals, tickets, campaigns, workflow
  definitions, etc.) so a new user isn't staring at an empty app. As of
  migration `027` this sample data no longer includes anything that claims
  a real external connection or credential exists — earlier it inserted
  Gmail/Stripe as `status: 'connected'`, an "active" Production API key
  with no real secret, and an "active" webhook to `example.com`, all of
  which were fake and misleading. If you add new columns/tables to
  `seed_demo_data`, keep that boundary: illustrative CRM records are fine,
  anything implying a real connected account or live credential is not.
- Super Admin generates codes in `/super-admin/sales-codes`.

## Branding (conditional on plan)
- Atlas CRM logo ONLY on landing page (marketing site).
- Dashboards show: custom org logo (if `branding_enabled` + `logo_url`) OR neutral placeholder
  (first letter of org name) — NEVER the Atlas logo.
- Custom logo upload available on Growth/Pro/Enterprise plans (Settings → Branding tab).
- Starter plan: neutral placeholder, upgrade CTA.
- `Organization.logo_url`, `Organization.branding_enabled` fields (migration 006).
- Logo upload via Supabase Storage `branding` bucket (data URL fallback if bucket missing).

## Settings page (tabbed)
- Tabs: Account (org info, country, currency, timezone), Profile, Branding, Roles & Permissions, Security.
- `refreshOrg()` in AuthContext reloads org after settings save.

## Bilingualism (FR/EN) — completed audit
All user-facing pages now support FR/EN via `t(key, language)` from `@/lib/i18n`
or inline `lang === 'fr' ? '...' : '...'` ternaries. Key files verified:
- LandingPage: cloudProducts, industries, reports, matrixGroups (comparison
  matrix) all use `{ fr, en }` objects accessed via `[lang]`.
- AuthPage: highlights array, dashboard illustration labels, OAuth error
  message all bilingual.
- SuperAdminPages: entire section bilingual (dashboard cards, users/tenants
  table, subscriptions, analytics, employee KPIs, sales codes, permissions
  RBAC, audit log). `SuperAdminsList` uses bilingual founder confirm prompt.
- SystemPages: notifications, audit log, branding tab, settings tabs bilingual.
- AppLayout: super admin nav section bilingual; collapse toggle hidden on
  mobile (lg:flex).
- DashboardPage: removed fake hardcoded '12%' trend — StatCards now show
  real data only, no fabricated metrics.
- IntegrationPages: already had 53 `lang === 'fr'` checks; config field
  labels (API Key, Secret Key, etc.) are technical terms, left in English.

## Responsive design — mobile drawer
- AppLayout sidebar is now a fixed drawer on mobile (`fixed lg:static`,
  `-translate-x-full lg:translate-x-0`), toggled by a hamburger button
  in the header (`lg:hidden`). Overlay closes on click outside or nav.
- Collapse toggle button hidden on mobile (`hidden lg:flex`).
- Main content padding responsive: `p-4 sm:p-6`.
- Header padding responsive: `px-4 sm:px-6`.
- No "Coming Soon" elements or non-functional buttons remain (verified
  via grep for `coming soon`, `bientôt`, empty `onClick`, `href="#"`).

## Pricing matrix ↔ real feature gates (kept in sync — verify both ways when editing either)
- `src/lib/plans.ts` `PLAN_FEATURES` is the single source of truth for what a
  plan actually unlocks; `src/pages/LandingPage.tsx`'s `matrixGroups` is the
  public-facing description of the same thing. Every row on that matrix must
  correspond to a real `hasFeature()` gate somewhere, and every real gate
  that differentiates plans should have a row — checked both directions in
  Aug 2026: Audit Log had zero plan gating despite being sold as Growth+
  (fixed: `auditLog` feature added, `AuditLogPage` now gated); "Predictive
  analytics" was sold as Pro+ but `advancedAnalytics` granted it at Growth
  (fixed: now Pro+ in code, matching Pro's own "Analyses IA" marketing
  copy); "Workflows personnalisés" was sold as a Pro+ exclusive with no
  code behind it — Growth/Pro/Enterprise all share one Workflows page, so
  the row was removed rather than gating something fictitious; two real
  gates (`customBranding` Growth+, `customDashboards` Pro+) were invisible
  on the pricing page and are now listed. If you change `PLAN_FEATURES`,
  check whether `matrixGroups` needs the same change, and vice versa.

## Webhooks now actually fire on real CRM events (Aug 2026)
- Previously `webhooks` (API & Webhooks page) only supported a manual "Test"
  ping — the event checkboxes on webhook creation (`contact.created`,
  `deal.won`, `invoice.paid`, etc.) were pure UI with nothing behind them.
- `src/lib/webhooks.ts` is now the single source of truth for `WEBHOOK_EVENTS`
  and owns `triggerWebhooks(event, data)`, which looks up the org's active
  webhooks subscribed to `event` and POSTs to each via the `test-webhook`
  edge function (fire-and-forget — a slow/down customer endpoint must never
  block the CRM action). `IntegrationPages.tsx` imports the list instead of
  keeping its own copy.
- Real trigger sites: `src/components/ListPage.tsx` — the generic
  insert/update/delete used by Contacts, Leads, Deals, Invoices, Activities,
  Payments — fires `${entity}.created/.updated/.deleted` plus the specific
  ones detectable from the payload (`lead.converted` when status→converted,
  `deal.won`/`deal.lost` on status change, `invoice.paid` on
  payment_status→paid, `payment.received` on payment insert). `invoice.overdue`
  is NOT wired — it's time-based and this app has no scheduler/cron, so
  nothing can fire it without one; don't claim it works.
- `test-webhook` edge function (needs redeploying — see Build/Deploy section
  above) now accepts a real `data` payload instead of always sending
  `{test:true}`, and returns a numeric `status` for the caller to persist.
  Backward compatible: the "Test" button still calls it with no `data`.

## Workflows now actually execute (Aug 2026)
- `src/pages/AIPages.tsx` `AIWorkflowsPage` was pure CRUD before this — you
  could create a "workflow" with a trigger type and it did nothing; `actions`
  and `workflow_runs` existed as columns/tables with zero UI ever writing to
  them, and `run_count` was permanently stuck at 0.
- `src/lib/workflows.ts` defines the real (small, deliberately non-fake)
  action vocabulary — `create_task`, `create_notification`, `trigger_webhook`
  — and `runWorkflow`/`executeAndLogWorkflow` actually perform them against
  `tasks`/`notifications`/the real webhook path above, then persist a real
  `workflow_runs` row and increment `run_count`.
- The rebuilt `AIWorkflowsPage` has an action editor (add/remove actions,
  per-type fields) and a "Run now" button showing per-step real results.
  Only the manual trigger actually runs a workflow today — `trigger_type`
  values `schedule`/`event`/`webhook` are stored but nothing executes them
  automatically (no scheduler in this app); the UI says so explicitly next
  to the trigger picker. Don't silently drop that caveat if you touch this
  page — a workflow claiming to be "on a schedule" that never runs is
  exactly the kind of fake the Aug 2026 pass was fixing.

## Marketplace apps — what's real vs. stored-only (updated Sep 2026 — 13 providers now real)
- `AVAILABLE_APPS` in `IntegrationPages.tsx` lists ~70 providers. Genuinely
  consumed by the platform:
  - `openai`/`anthropic`/`gemini` (Ask Atlas), `flutterwave`/`paystack`/
    `payunit` (real checkout — separate code path from the marketplace,
    see PSP section above).
  - 13 more, all callable as real Workflow actions via the
    `integration-action` edge function (deployed through the Supabase
    MCP connector — no CLI access from this sandbox, see Build/Deploy):
    `telegram` (send message), `twilio` (send SMS), `whatsapp` (send
    message via Cloud API), `mailchimp` (add subscriber), `hubspot`
    (upsert contact), `freshdesk` (create ticket), `shopify` /
    `woocommerce` (create customer), `mollie` / `cinetpay` / `wave` /
    `chapa` / `campay` (create a real payment/checkout, returns a real
    checkout URL in the run result) — plus the generic `call_custom_app`
    for any org-registered "Custom App" (arbitrary authenticated REST
    call to whatever `base_url` they saved).
  - All 13's action types, provider mapping, and per-action input fields
    are defined once in `src/lib/workflows.ts`
    (`WORKFLOW_ACTION_PROVIDER`, `WORKFLOW_PARAM_FIELDS`) — the
    `AIWorkflowsPage` action editor renders fields generically from that
    schema instead of one hardcoded block per provider. Adding a 14th
    non-OAuth provider means: add a `run()` fn + `ACTIONS` entry in the
    edge function, redeploy, add one line each to `WORKFLOW_ACTION_TYPES`
    / `WORKFLOW_ACTION_PROVIDER` / `WORKFLOW_PARAM_FIELDS` — no new UI
    code needed.
  - 13 others (`LIVE_VERIFIABLE_PROVIDERS` in `integrationValidation.ts`)
    get a real live credential check on connect and via the Connected
    Apps page's "Test" button, but aren't callable from a workflow yet.
  - Every remaining provider — ~45, all `authType: 'oauth'`: Slack, Gmail,
    Google Drive/Calendar/Ads, Notion, Asana, Trello, Zendesk, Intercom,
    Xero, QuickBooks, PayPal, Zoom, Dropbox, DocuSign, Meta/LinkedIn Ads,
    Microsoft Teams/Outlook, and the rest — is stored-credentials-only.
- **The OAuth boundary is hard, not a matter of effort**: those ~45
  providers each need a registered OAuth app (Client ID + Secret) on the
  provider's own developer console — that's the org's own setup, tied to
  their brand/domain/consent screen, and cannot be created or faked by
  Atlas on their behalf. Do not mark one "connected" or build a workflow
  action for it without those real credentials existing. If the person
  wants more of these live, the actual unblocking step is registering the
  OAuth app themselves (see the Google walkthrough already given for
  Sign-in with Google as the template) and supplying the Client ID/Secret
  — then `oauth-exchange` (already built) handles the token exchange.
- A few non-OAuth providers were deliberately left out of this batch
  because their stored config is incomplete for a correct real call —
  don't silently "fake" these by guessing at missing fields:
  - `mpesa`: Safaricom STK push needs a `passkey` in addition to the
    stored `consumer_key`/`consumer_secret`/`shortcode` — add that
    config field first.
  - `orange_money`: needs a merchant key beyond `client_id`/`client_secret`.
  - `mtn_momo`: MTN's flow needs a subscription-generated API key
    alongside the stored `subscription_key`/`api_user`.
  - `zapier`/`make`/`n8n`/`pipedream`: these platforms are meant to be
    triggered via a webhook URL (already real — see the Webhooks section
    above) or need a specific scenario/workflow ID that isn't in the
    stored config; their "connect with API key" flow here doesn't map to
    a single well-defined action.
- New edge functions and edits to existing ones need the same deploy step
  (see Build/Deploy above) — this session deployed via the Supabase MCP
  connector once it was connected; do the same rather than shipping
  undeployed function code that can't be verified.

## Discoverability: quick actions, not just Workflows (Sep 2026)
- Building the 13 real integration actions above only fixed half the gap:
  a person had no natural way to *use* them without first learning to
  build a Workflow with hardcoded, non-record-specific values. Workflows
  aren't bound to a specific contact/invoice — an action's params are
  whatever the person typed when building it, so "send this contact a
  WhatsApp" wasn't really possible there.
- Added `src/lib/integrations.ts`: `useConnectedProviders()` (shared hook,
  used by both AIWorkflowsPage and the quick actions below) and
  `callIntegrationAction()` (the actual fetch to the edge function,
  previously duplicated inside workflows.ts — now the one place both
  Workflows and quick actions call from).
- Added `rowActions?: (row: T) => ReactNode` to `ListPage` — a per-row
  extension point rendered before Edit/Delete. Two real consumers:
  - `QuickMessageButton` (`src/components/QuickMessageButton.tsx`) on
    Contacts and Leads rows — opens a small modal to send that specific
    contact a real WhatsApp or SMS message. Only renders if the contact
    has a phone number AND at least one of whatsapp/twilio is connected.
  - `QuickPaymentLinkButton` (`src/components/QuickPaymentLinkButton.tsx`)
    on Invoices rows — generates a real payment link/checkout session
    (Mollie/CinetPay/Wave/Chapa/CamPay) for that invoice's amount. Only
    renders if at least one of those gateways is connected.
- This is the pattern to follow for future integration-backed features:
  a real action needs a real, discoverable place to trigger it bound to
  the actual record it acts on — not just an entry in a generic Workflow
  builder. When adding a new integration-action provider, ask whether it
  also needs a `rowActions` quick-action on the relevant list page (a
  messaging provider → Contacts/Leads; a payment gateway → Invoices/
  Deals; a support-desk provider → Tickets), not just a Workflow action.

## Security review (Sep 2026) — via Supabase security advisors
- Ran `get_advisors(type: security)` and fixed the two real, safe issues:
  `get_ai_context_snapshot` had a mutable search_path (now pinned to
  `public`), and `auto_provision_liafrik_admin` (a trigger-only function,
  `AFTER INSERT ON auth.users`) had unnecessary EXECUTE grants to
  authenticated/anon/PUBLIC — revoked with zero functional impact, since
  triggers fire regardless of role grants. See migration `037`.
- The remaining ~15 "SECURITY DEFINER callable by authenticated" warnings
  (admin_extend_org_access, admin_set_org_plan, admin_set_org_access_until,
  rbac_check, org_subscription_status, user_org_id, etc.) are the advisor's
  generic caution against a pattern this app uses deliberately and by
  design — see the existing note further up this file: these ARE meant to
  be called directly via `supabase.rpc()` by signed-in users, and every
  sensitive one already gates itself internally (`is_super_admin()`,
  `is_platform_exempt()`, ownership checks) rather than relying on the
  grant alone. Don't mass-revoke these — it would break real, working
  features (billing status checks, RBAC, super admin tools). Re-run the
  advisor after any new admin_*/rbac_*-style function to confirm it has
  its own internal check, not to "fix" the warning by revoking access it
  actually needs.
- `auth_leaked_password_protection` is disabled — this is an Auth setting
  toggled in the Supabase dashboard (Authentication → Policies), same
  category as the Google OAuth provider toggle: no MCP/API tool exposes it,
  so it needs a manual one-click enable by the project owner. Recommended,
  not yet done.
- Webhook delivery signing was fixed (see Webhooks section above): the
  `X-Atlas-Signature` header used to carry the raw stored secret in
  plaintext on every delivery; it's now an HMAC-SHA256 signature of the
  payload, computed with the secret but never transmitting it — same model
  Stripe/GitHub use. Deployed live; `docs` legal page text updated to match.
- `public/_headers` (Cloudflare Pages security headers + CSP) already had a
  solid baseline (HSTS, X-Frame-Options, nosniff, a real CSP) from an
  earlier session, but its CSP only allow-listed Flutterwave's domains —
  adding Paystack (`js.paystack.co`) and Paddle (`cdn.paddle.com`) as real
  PSPs without updating script-src/connect-src/frame-src would have
  silently broken both checkouts in the browser (CSP violations aren't
  visible unless you check the console). Fixed alongside adding those PSPs.
  PayUnit needed no CSP change — it's a full-page redirect, not an inline
  script, so CSP doesn't govern it.
- No `dangerouslySetInnerHTML` anywhere in `src/` — checked directly, the
  most common React XSS vector isn't present. CSRF risk is structurally
  low for this app's architecture: the Supabase JS client stores its
  session in localStorage and sends the JWT as an explicit `Authorization`
  header per request, not an auto-attached cookie, so a malicious
  cross-origin page can't ride a logged-in user's session the way classic
  cookie-based CSRF works. `script-src` still includes `'unsafe-inline'`
  (needed by the current build/PSP scripts) which does weaken CSP's XSS
  mitigation somewhat — a known, deliberate trade-off, not something to
  strip without testing every page first.

## Real production domain (Sep 2026)
- Confirmed: `https://atlas.liafrik.com` (custom domain), also reachable at
  the Cloudflare default `https://atlas-237.pages.dev`. `index.html`'s
  canonical link + `og:url`, and `public/robots.txt`/`sitemap.xml`, now
  point at the real custom domain — search engines and social shares
  should treat that one as canonical, not the `.pages.dev` fallback.
- Paddle's 4 real Price IDs (from the org's actual Paddle dashboard) are
  now set as defaults in `src/lib/paddle.ts` alongside the client token —
  Paddle is fully configured and will appear as a payment option with no
  further setup needed.
- Legal Notice page now has the real company registration: LiAfrik (SPC
  FZC), Dubai, UAE, license number 4425201.01 — no more placeholder text.

## Performance advisor findings (Sep 2026) — reviewed, deferred, not launch-blocking
- Ran `get_advisors(type: performance)`. Findings are all standard
  at-scale Postgres hygiene, not correctness bugs — nothing here returns
  wrong data or breaks a feature:
  - ~40 unindexed foreign keys (INFO) — fine at current data volumes;
    worth adding indexes once tables like `deals`/`invoices`/`tickets`
    grow into the tens of thousands of rows per org.
  - ~25 RLS policies re-evaluate `auth.<fn>()` per row instead of once
    per query (WARN — `auth_rls_initplan`) — the fix is wrapping calls as
    `(select auth.uid())` instead of `auth.uid()` inside each policy.
    Real perf win at scale, zero behavior change, but touches ~15 tables'
    worth of existing RLS policies — do this as its own careful,
    tested pass, not blindly mid-launch-prep. Same for the handful of
    "multiple permissive policies" (WARN) on tables like `rbac_permissions`,
    `super_admins`, `teams` — consolidating is a real optimization but
    each one needs its own read of the two policies being merged.
  - A dozen "unused index" (INFO) entries — likely just haven't been
    exercised yet in production traffic, not necessarily dead weight;
    don't drop these based on a brand-new project's index-usage stats.
- Recommendation: revisit this list after the first real cohort of paying
  orgs is on the platform and query volume is real — that's when these
  numbers (and which policies/indexes actually matter) become meaningful,
  rather than optimizing against near-empty tables now.

## Real bug fixed: stale plan after payment (Sep 2026)
- `organization` in AuthContext is fetched once (login) and only refreshed
  via the `refreshOrg()` context function — which was wired to the Settings
  tabs' own save callbacks (Account/Branding/Security/AI Provider) but
  NEVER called after a payment, and never on BillingPage mount.
- Real-world effect: a customer completes a real, successful payment
  (any PSP) — `organizations.plan` updates correctly server-side — but
  their own browser session keeps the pre-payment `organization` object.
  BillingPage's `currentPlan` re-derives from `organization?.plan` on every
  mount, so revisiting/reloading Billing after paying showed the OLD plan
  as "current" again, with EVERY plan (including the one just paid for)
  rendered as payable — a customer could click "Pay" and get charged again
  for the plan they already have. Worse: `usePlanAccess()` (used for every
  feature gate across the app) reads the same stale `organization`, so
  newly-unlocked features wouldn't appear until a full logout/login either.
- Fixed in `BillingPage` (SystemPages.tsx): calls `refreshOrg()` (a) once
  on mount, so an out-of-band plan change (a Super Admin extension, a
  payment completed in another tab) is picked up instead of trusting a
  possibly-stale cached `organization`, and (b) right after a successful
  `payWithPsp()` result and right after a successful PayUnit
  redirect-return confirmation — replacing the old `setCurrentPlan(plan.key)`
  local-only patch, which fixed this page's display but left the shared
  `organization` (and therefore every plan-gated feature) stale.
- If a similar "just did X, but the UI/gates still show the old state"
  report comes up elsewhere, check whether that flow calls `refreshOrg()`
  after a server-side mutation to `organizations` — this bug class can
  recur anywhere a plan/org field changes outside the currently-open page.

## Current-plan renewal (Sep 2026) — the disabled button had no path to renew
- Follow-up to the "stale plan" fix above: once that was fixed, the
  current plan's card correctly showed as current — but its button was
  fully `disabled`, so a customer wanting to renew/extend their existing
  plan (pay for another period) had no way to do it from this page at all.
- Fixed: `pay()` no longer blocks `plan.key === currentPlan` — paying for
  your own current plan again is a legitimate renewal, not a mistake to
  prevent. The button stays active for the current plan too, labeled
  "Continue with this plan" (others say "Pay"); a separate small "Current
  plan" badge next to the plan name (not tied to the button's disabled
  state) is what actually communicates which plan they're on. The button
  is now only disabled for real blockers: no PSP configured, or the
  signed-in profile lacks billing permission (`canManageBilling`).

## Real bug fixed: CSP blocked Paddle's own checkout assets (Sep 2026)
- Confirmed via the person's browser console/network tab: Paddle's own
  stylesheet (`cdn.paddle.com/paddle/v2/assets/css/paddle.css`) was
  blocked by `style-src` (only had `'self' 'unsafe-inline'`, no Paddle
  domain), and Paddle's bundled ProfitWell analytics script
  (`public.profitwell.com`) was blocked by `script-src`. Fixed in
  `public/_headers`: added `cdn.paddle.com` to `style-src`+`font-src`,
  and `public.profitwell.com` to `script-src`+`connect-src`.
- A separate real issue was also visible: a 400 from
  `checkout-service.paddle.com/.../transaction-checkout` — an actual
  server-side rejection of the checkout request, not a CSP block. Domain
  approval in Paddle was already confirmed done at the time this was
  seen; still under investigation — check the Price IDs' environment
  matches the client token's (live vs sandbox) and the exact response
  body next time this surfaces, since the browser console only showed the
  status code, not the response content.
- Lesson for next time a third-party checkout/embed is added: check the
  browser console immediately after wiring it up, not just after a bug
  report — CSP silently blocks sub-resources a script loads internally
  (its own CSS, its own analytics/tracking scripts), which developer docs
  for the embedded service rarely enumerate exhaustively.

## Paddle checkout 400 — root cause found (Sep 2026)
- After fixing the CSP block (previous entry), the checkout still failed
  with a 400 whose real response body (confirmed by the person via
  DevTools Network tab) was:
  `{"errors":[{"status":400,"code":"validation","details":"transaction_default_checkout_url_not_set"}]}`
- Root cause: a Paddle **account setting**, not a code bug — Paddle
  requires a "Default payment link" / default checkout URL configured
  under Checkout → Checkout Settings in the Paddle dashboard before it
  will process any transaction via the overlay checkout. This is
  independent of domain approval (already done) and independent of the
  CSP fix (also needed, but not sufficient on its own).
- No code change possible here — this can only be set in Paddle's own
  dashboard by the account owner. If Paddle checkout still fails after
  this is set, get the response body the same way (Network tab → click
  the red transaction-checkout row → Response tab) rather than guessing.
