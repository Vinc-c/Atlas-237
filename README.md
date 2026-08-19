# Atlas-237

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-pgcwubqg)

Atlas CRM — AI Business Management Platform (React + Vite + Tailwind + Supabase).

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

Create a `.env` (see `env.example`) with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## Deploy to Cloudflare Pages

The app is a static SPA. The `public/_redirects` (SPA fallback `/* -> /index.html 200`)
and `public/_headers` (security headers + asset caching) are copied into the build output.

**Build command:** `npm run build`
**Build output directory:** `dist`

In the Cloudflare Pages dashboard set the environment variables
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` so they are inlined at build time.

### CLI (wrangler)

```bash
npm i -g wrangler
npm run build
wrangler pages deploy dist --project-name atlas-crm
```

