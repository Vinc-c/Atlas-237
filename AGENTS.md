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

## Billing / Flutterwave / Trial enforcement
- Plans: Starter $19, Growth $49, Pro $119, Enterprise custom (per user/month).
- `src/lib/flutterwave.ts` — inline Flutterwave Checkout, `checkSubscriptionAccess(orgId)`
  via Supabase RPC `org_subscription_status`, `recordSubscription()` to upsert
  `subscriptions` table + update `organizations.plan`.
- `src/components/Paywall.tsx` wraps all protected routes; blocks access when trial
  expired and no active subscription. The user CANNOT bypass — the Paywall renders
  before any app content.
- `BillingPage` (in SystemPages.tsx) uses Flutterwave checkout to upgrade plans.
- Env vars: `VITE_FLW_PUBLIC_KEY` and `VITE_FLW_SECRET_KEY` (see `.env.example`).
- DB: `subscriptions` table + `org_subscription_status(check_org_id)` RPC function
  added by migration `005`. RLS enabled.

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

