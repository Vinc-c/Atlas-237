import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Real, live verification for the "Connect" flow on the Integrations page.
//
// The bug this closes: the frontend used to accept any string in an API
// key field and immediately mark the integration "connected" with zero
// verification — so e.g. a Google Gemini key pasted into the Anthropic
// (Claude) field was silently accepted. src/lib/integrationValidation.ts
// now rejects an obviously wrong *format* client-side first; this
// function goes a step further for the providers listed below and
// actually calls the provider's own API with the submitted credentials,
// so a key that's correctly formatted but wrong/expired/revoked is
// caught too. Only organization members may call this (auth required);
// it never writes to the database itself — the frontend still owns
// saving the integration row, and only does so after this returns ok.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type VerifyResult = { ok: boolean; message?: string };

async function verifyOpenAI(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${config.api_key}` },
  });
  if (res.status === 401) return { ok: false, message: "OpenAI rejected this key (401 Unauthorized)." };
  return { ok: res.ok, message: res.ok ? undefined : `OpenAI returned HTTP ${res.status}.` };
}

async function verifyAnthropic(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch("https://api.anthropic.com/v1/models", {
    headers: { "x-api-key": config.api_key, "anthropic-version": "2023-06-01" },
  });
  if (res.status === 401) return { ok: false, message: "Anthropic rejected this key (401 Unauthorized)." };
  return { ok: res.ok, message: res.ok ? undefined : `Anthropic returned HTTP ${res.status}.` };
}

async function verifyGemini(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(config.api_key)}`);
  if (res.status === 400 || res.status === 403) return { ok: false, message: "Google rejected this Gemini key." };
  return { ok: res.ok, message: res.ok ? undefined : `Gemini API returned HTTP ${res.status}.` };
}

async function verifyStripe(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Bearer ${config.secret_key}` },
  });
  if (res.status === 401) return { ok: false, message: "Stripe rejected this secret key." };
  return { ok: res.ok, message: res.ok ? undefined : `Stripe returned HTTP ${res.status}.` };
}

async function verifyTwilio(config: Record<string, string>): Promise<VerifyResult> {
  const sid = config.account_sid;
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
    headers: { Authorization: `Basic ${btoa(`${sid}:${config.auth_token}`)}` },
  });
  if (res.status === 401) return { ok: false, message: "Twilio rejected this Account SID / Auth Token pair." };
  return { ok: res.ok, message: res.ok ? undefined : `Twilio returned HTTP ${res.status}.` };
}

async function verifyShopify(config: Record<string, string>): Promise<VerifyResult> {
  const domain = (config.shop_domain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const res = await fetch(`https://${domain}/admin/api/2024-01/shop.json`, {
    headers: { "X-Shopify-Access-Token": config.access_token },
  });
  if (res.status === 401) return { ok: false, message: "Shopify rejected this access token for that store." };
  return { ok: res.ok, message: res.ok ? undefined : `Shopify returned HTTP ${res.status}.` };
}

async function verifyHubspot(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
    headers: { Authorization: `Bearer ${config.api_key}` },
  });
  if (res.status === 401) return { ok: false, message: "HubSpot rejected this token." };
  return { ok: res.ok, message: res.ok ? undefined : `HubSpot returned HTTP ${res.status}.` };
}

async function verifyMailchimp(config: Record<string, string>): Promise<VerifyResult> {
  const key = config.api_key || "";
  const dc = key.split("-")[1];
  if (!dc) return { ok: false, message: "Mailchimp key is missing its datacenter suffix (e.g. \"-us21\")." };
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/ping`, {
    headers: { Authorization: `Basic ${btoa(`anystring:${key}`)}` },
  });
  if (res.status === 401) return { ok: false, message: "Mailchimp rejected this key." };
  return { ok: res.ok, message: res.ok ? undefined : `Mailchimp returned HTTP ${res.status}.` };
}

async function verifyFlutterwave(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch("https://api.flutterwave.com/v3/balances", {
    headers: { Authorization: `Bearer ${config.secret_key}` },
  });
  if (res.status === 401) return { ok: false, message: "Flutterwave rejected this secret key." };
  return { ok: res.ok, message: res.ok ? undefined : `Flutterwave returned HTTP ${res.status}.` };
}

async function verifyPaystack(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch("https://api.paystack.co/balance", {
    headers: { Authorization: `Bearer ${config.secret_key}` },
  });
  if (res.status === 401) return { ok: false, message: "Paystack rejected this secret key." };
  return { ok: res.ok, message: res.ok ? undefined : `Paystack returned HTTP ${res.status}.` };
}

async function verifyCalendly(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch("https://api.calendly.com/users/me", {
    headers: { Authorization: `Bearer ${config.personal_access_token}` },
  });
  if (res.status === 401) return { ok: false, message: "Calendly rejected this personal access token." };
  return { ok: res.ok, message: res.ok ? undefined : `Calendly returned HTTP ${res.status}.` };
}

async function verifyTelegram(config: Record<string, string>): Promise<VerifyResult> {
  const res = await fetch(`https://api.telegram.org/bot${config.bot_token}/getMe`);
  const body = await res.json().catch(() => null);
  if (!body?.ok) return { ok: false, message: "Telegram rejected this bot token." };
  return { ok: true };
}

async function verifyFreshdesk(config: Record<string, string>): Promise<VerifyResult> {
  const domain = (config.domain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const res = await fetch(`https://${domain}/api/v2/tickets?per_page=1`, {
    headers: { Authorization: `Basic ${btoa(`${config.api_key}:X`)}` },
  });
  if (res.status === 401) return { ok: false, message: "Freshdesk rejected this API key for that domain." };
  return { ok: res.ok, message: res.ok ? undefined : `Freshdesk returned HTTP ${res.status}.` };
}

const VERIFIERS: Record<string, (config: Record<string, string>) => Promise<VerifyResult>> = {
  openai: verifyOpenAI,
  anthropic: verifyAnthropic,
  gemini: verifyGemini,
  stripe: verifyStripe,
  twilio: verifyTwilio,
  shopify: verifyShopify,
  hubspot: verifyHubspot,
  mailchimp: verifyMailchimp,
  flutterwave: verifyFlutterwave,
  paystack: verifyPaystack,
  calendly: verifyCalendly,
  telegram: verifyTelegram,
  freshdesk: verifyFreshdesk,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ ok: false, message: "Not authenticated." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { provider, config } = await req.json();
    if (!provider || typeof config !== "object" || config === null) {
      return new Response(JSON.stringify({ ok: false, message: "Missing provider or config." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verifier = VERIFIERS[provider];
    if (!verifier) {
      // No live check implemented for this provider yet — the caller
      // should fall back to format-only validation. This is not an
      // error; it's an honest "we can't verify this one live".
      return new Response(JSON.stringify({ ok: true, verified: false, message: "No live verification available for this provider; format check only." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await verifier(config);
    return new Response(JSON.stringify({ ok: result.ok, verified: true, message: result.message }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, message: err instanceof Error ? err.message : "Verification failed unexpectedly." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
