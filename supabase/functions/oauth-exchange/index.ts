import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Each provider's token endpoint + the env var names holding its OAuth app
// credentials. Client IDs are also exposed to the frontend (VITE_*, not
// secret); client secrets live ONLY here, as Edge Function secrets — set
// them with `supabase secrets set <PROVIDER>_CLIENT_SECRET=...` or via the
// Supabase Dashboard → Edge Functions → Secrets. Until both are set for a
// given provider, this function returns a clear "not configured" error
// instead of a confusing token-exchange failure.
//
// `authStyle: 'basic'` — a handful of providers (PayPal, Notion) require the
// client_id/client_secret pair to travel as an HTTP Basic Authorization
// header instead of body fields; sending them in the body instead either
// gets silently ignored or rejected outright, so this is not optional.
// `bodyFormat: 'json'` — Notion's token endpoint additionally expects a
// JSON body rather than the otherwise-universal form-urlencoded one.
//
// This registry must stay in sync with the client-side `OAUTH_CLIENT_IDS` /
// `authUrls` maps in src/pages/IntegrationPages.tsx — every provider that
// can start an OAuth authorize redirect there must have an entry here, or
// the flow completes the provider's real consent screen and then fails on
// this end with "Unknown OAuth provider". (Trello is the one exception: it
// uses the legacy implicit token flow — the token comes back in the URL
// fragment, never as a `code` — so it never reaches this function at all.)
const PROVIDERS: Record<string, { tokenUrl: string; clientIdEnv: string; clientSecretEnv: string; authStyle?: "basic"; bodyFormat?: "json" }> = {
  gmail: { tokenUrl: "https://oauth2.googleapis.com/token", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  google_meet: { tokenUrl: "https://oauth2.googleapis.com/token", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  google_calendar: { tokenUrl: "https://oauth2.googleapis.com/token", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  google_ads: { tokenUrl: "https://oauth2.googleapis.com/token", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  google_drive: { tokenUrl: "https://oauth2.googleapis.com/token", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  slack: { tokenUrl: "https://slack.com/api/oauth.v2.access", clientIdEnv: "SLACK_CLIENT_ID", clientSecretEnv: "SLACK_CLIENT_SECRET" },
  zoom: { tokenUrl: "https://zoom.us/oauth/token", clientIdEnv: "ZOOM_CLIENT_ID", clientSecretEnv: "ZOOM_CLIENT_SECRET" },
  outlook: { tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token", clientIdEnv: "MICROSOFT_CLIENT_ID", clientSecretEnv: "MICROSOFT_CLIENT_SECRET" },
  microsoft_teams: { tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token", clientIdEnv: "MICROSOFT_CLIENT_ID", clientSecretEnv: "MICROSOFT_CLIENT_SECRET" },
  quickbooks: { tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", clientIdEnv: "QUICKBOOKS_CLIENT_ID", clientSecretEnv: "QUICKBOOKS_CLIENT_SECRET" },
  xero: { tokenUrl: "https://identity.xero.com/connect/token", clientIdEnv: "XERO_CLIENT_ID", clientSecretEnv: "XERO_CLIENT_SECRET" },
  paypal: { tokenUrl: "https://api-m.paypal.com/v1/oauth2/token", clientIdEnv: "PAYPAL_CLIENT_ID", clientSecretEnv: "PAYPAL_CLIENT_SECRET", authStyle: "basic" },
  gocardless: { tokenUrl: "https://connect.gocardless.com/oauth/access_token", clientIdEnv: "GOCARDLESS_CLIENT_ID", clientSecretEnv: "GOCARDLESS_CLIENT_SECRET" },
  revolut_business: { tokenUrl: "https://b2b.revolut.com/api/1.0/auth/token", clientIdEnv: "REVOLUT_CLIENT_ID", clientSecretEnv: "REVOLUT_CLIENT_SECRET" },
  intercom: { tokenUrl: "https://api.intercom.io/auth/eagle/token", clientIdEnv: "INTERCOM_CLIENT_ID", clientSecretEnv: "INTERCOM_CLIENT_SECRET" },
  facebook_messenger: { tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token", clientIdEnv: "FACEBOOK_CLIENT_ID", clientSecretEnv: "FACEBOOK_CLIENT_SECRET" },
  instagram_dm: { tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token", clientIdEnv: "FACEBOOK_CLIENT_ID", clientSecretEnv: "FACEBOOK_CLIENT_SECRET" },
  meta_ads: { tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token", clientIdEnv: "FACEBOOK_CLIENT_ID", clientSecretEnv: "FACEBOOK_CLIENT_SECRET" },
  linkedin_ads: { tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken", clientIdEnv: "LINKEDIN_CLIENT_ID", clientSecretEnv: "LINKEDIN_CLIENT_SECRET" },
  dropbox: { tokenUrl: "https://api.dropboxapi.com/oauth2/token", clientIdEnv: "DROPBOX_CLIENT_ID", clientSecretEnv: "DROPBOX_CLIENT_SECRET" },
  docusign: { tokenUrl: "https://account.docusign.com/oauth/token", clientIdEnv: "DOCUSIGN_CLIENT_ID", clientSecretEnv: "DOCUSIGN_CLIENT_SECRET" },
  notion: { tokenUrl: "https://api.notion.com/v1/oauth/token", clientIdEnv: "NOTION_CLIENT_ID", clientSecretEnv: "NOTION_CLIENT_SECRET", authStyle: "basic", bodyFormat: "json" },
  asana: { tokenUrl: "https://app.asana.com/-/oauth_token", clientIdEnv: "ASANA_CLIENT_ID", clientSecretEnv: "ASANA_CLIENT_SECRET" },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ ok: false, msg: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { provider, code, redirect_uri } = await req.json();
    const cfg = PROVIDERS[provider];
    if (!cfg) {
      return new Response(JSON.stringify({ ok: false, msg: `Unknown OAuth provider: ${provider}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get(cfg.clientIdEnv);
    const clientSecret = Deno.env.get(cfg.clientSecretEnv);
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({
        ok: false,
        msg: `${provider} is not configured yet. An admin needs to set ${cfg.clientIdEnv} and ${cfg.clientSecretEnv} as Edge Function secrets.`,
      }), { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Basic-auth providers (PayPal, Notion) send credentials as a header,
    // not body fields — including them in the body too is at best ignored
    // and at worst a rejected request, so this branch omits them there.
    const params: Record<string, string> = cfg.authStyle === "basic"
      ? { grant_type: "authorization_code", code, redirect_uri }
      : { grant_type: "authorization_code", code, redirect_uri, client_id: clientId, client_secret: clientSecret };

    const headers: Record<string, string> = { Accept: "application/json" };
    if (cfg.authStyle === "basic") {
      headers["Authorization"] = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    }

    let body: string;
    if (cfg.bodyFormat === "json") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(params);
    } else {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      body = new URLSearchParams(params).toString();
    }

    const tokenRes = await fetch(cfg.tokenUrl, { method: "POST", headers, body });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      return new Response(JSON.stringify({ ok: false, msg: tokenData.error_description || tokenData.error || "Token exchange failed" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the caller's org_id (integrations are scoped per-tenant).
    const { data: profile, error: profileErr } = await supabaseClient
      .from("profiles").select("org_id").eq("id", userData.user.id).single();
    if (profileErr || !profile?.org_id) {
      return new Response(JSON.stringify({ ok: false, msg: "No organization found for this user" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persist the connection. Tokens are stored server-side in `config`;
    // RLS on `integrations` already restricts this to the caller's org.
    const { error: dbErr } = await supabaseClient.from("integrations").upsert({
      org_id: profile.org_id,
      provider,
      category: "oauth",
      status: "connected",
      connected_at: new Date().toISOString(),
      config: {
        auth_type: "oauth",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token ?? null,
        expires_in: tokenData.expires_in ?? null,
        token_type: tokenData.token_type ?? "Bearer",
      },
    }, { onConflict: "org_id,provider" });

    if (dbErr) {
      return new Response(JSON.stringify({ ok: false, msg: dbErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
