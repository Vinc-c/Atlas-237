# Atlas CRM — Repository Notes

## Stack
- React 18 + Vite 5 + Tailwind CSS 3 + lucide-react + @supabase/supabase-js
- Path alias `@/` -> `src/`
- Source of truth for the app is `src/` (the root-level `.jsx`/`.tsx` files like `App.jsx`, `CRMModules.jsx`, etc. are stale duplicates and are NOT imported by `src/main.tsx`).

## Build / Deploy
- `npm run build` -> static SPA in `dist/`
- Cloudflare Pages: build command `npm run build`, output dir `dist`.
- `public/_redirects` (SPA fallback `/* /index.html 200`) and `public/_headers` are copied into `dist/` by Vite automatically.
- Env vars `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` must be set at build time; `src/lib/supabase.ts` throws if missing (runtime check).

## Tailwind config gotcha (important)
`tailwind.config.js` must define the full color palettes used across the app:
`primary, ink, success, warning, error, accent, secondary` (each 50-900),
plus `boxShadow.card / card-hover / sidebar`, `keyframes`/`animation` for
`fade-in` and `slide-up`. `src/index.css` uses `@apply shadow-card`,
`@apply animate-fade-in` etc., which FAIL the build if those tokens are missing.
The custom `.sidebar-shadow` utility is defined in `index.css` (not a tailwind shadow token).

## Data layer
All CRUD goes through Supabase via `src/components/ListPage.tsx` (generic table editor)
and individual pages. Tables expected: contacts, companies, leads, deals, pipelines,
activities, products, quotes, orders, invoices, payments, campaigns, tickets, ai_agents,
ai_tasks, approvals, workflows, ai_memory, knowledge_documents, integrations, api_keys,
webhooks, notifications, audit_logs, profiles, organizations. SQL migrations are at repo root.
