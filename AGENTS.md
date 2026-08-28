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

## AskAtlas AI assistant (functional)
- `src/lib/askAtlas.ts` is a shared business-question engine that answers in natural language
  by querying live Supabase data (counts/aggregates). Intent keywords cover: contacts, leads
  (hot/new), deals (open/at-risk), revenue/payments, invoices (unpaid), tickets, tasks
  (overdue), meetings, AI tasks, employees, and an overview/summary fallback.
- It returns `{ text, route? }` so answers can deep-link to the relevant module page.
- Used in two places: `AskAtlasPage` (full chat UI with clickable suggestions + "View" link)
  and `DashboardPage` AI command bar (inline reply panel).
- No external LLM/API key required — it reads the org's own Supabase tables.

## Data layer
All CRUD goes through Supabase via `src/components/ListPage.tsx` (generic table editor)
and individual pages. Tables expected: contacts, companies, leads, deals, pipelines,
activities, products, quotes, orders, invoices, payments, campaigns, tickets, ai_agents,
ai_tasks, approvals, workflows, ai_memory, knowledge_documents, integrations, api_keys,
webhooks, notifications, audit_logs, profiles, organizations. SQL migrations are at
`supabase/migrations/` (latest: `20260808180000_005_fix_signup_and_subscriptions.sql`).

## Billing / PSP registry / Trial enforcement
- Plans: Starter $19, Growth $49, Pro $119, Enterprise custom (per user/month).
- `src/lib/psp.ts` is the single PSP registry — currently Flutterwave (card/bank),
  PayUnit (mobile money: MTN, Orange, Express Union, YUP), Paystack (card/bank/
  mobile money). `getAvailablePsps()` only returns a PSP once its
  `checkAvailable()` proves real configuration; `BillingPage`/`PspCheckoutModal`
  render exactly that filtered list, never a hardcoded one.
- **"No payment method is currently available" is expected, not a bug, until
  real PSP credentials are set** — see `.env.example` for the exact variable
  names and where each one goes (Cloudflare Pages `VITE_*` client vars vs.
  Supabase Edge Function secrets for everything else, secret keys included).
  Client-side `checkAvailable()`: Flutterwave/Paystack check their `VITE_*`
  public key is present in the built bundle. PayUnit has no public key at all,
  so it pings `payunit-initialize` with `{ check: true }` and trusts only a
  live server confirmation.
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

## Logo
- `src/components/Logo.tsx` — simple CRM logo (stacked card + "A" mark), replaces
  the old Sparkles icon everywhere (AppLayout sidebar, AuthPage, LandingPage header/footer).

## Legal pages
- `src/pages/LegalPage.tsx` serves `/legal/:page` for 19 real pages (privacy, terms,
  cookies, about, security, contact, careers, pricing, docs, status, community, blog,
  gdpr, pledge, sales-cloud, service-cloud, agentforce, data-360, tableau).
- Bilingual EN/FR, scroll-reveal animations.

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


