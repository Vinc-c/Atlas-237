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
const PROVIDERS: Record<string, { tokenUrl: string; clientIdEnv: string; clientSecretEnv: string; extraParams?: Record<string, string> }> = {
  gmail: { tokenUrl: "https://oauth2.googleapis.com/token", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  google_meet: { tokenUrl: "https://oauth2.googleapis.com/token", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  slack: { tokenUrl: "https://slack.com/api/oauth.v2.access", clientIdEnv: "SLACK_CLIENT_ID", clientSecretEnv: "SLACK_CLIENT_SECRET" },
  zoom: { tokenUrl: "https://zoom.us/oauth/token", clientIdEnv: "ZOOM_CLIENT_ID", clientSecretEnv: "ZOOM_CLIENT_SECRET" },
  outlook: { tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token", clientIdEnv: "MICROSOFT_CLIENT_ID", clientSecretEnv: "MICROSOFT_CLIENT_SECRET" },
  quickbooks: { tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", clientIdEnv: "QUICKBOOKS_CLIENT_ID", clientSecretEnv: "QUICKBOOKS_CLIENT_SECRET" },
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

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenRes = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body,
    });
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
