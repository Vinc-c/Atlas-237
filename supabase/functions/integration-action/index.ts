import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Real outbound calls to a small, deliberately-scoped set of connected
// marketplace apps. Everything else in the marketplace (Slack, Gmail,
// Shopify, HubSpot, the ~50 others) is still stored-credentials-only — see
// AGENTS.md "Marketplace apps" section. These four were picked because
// they're simple REST/HTTP APIs with no OAuth app registration required:
// the org just pastes a token/URL, and this function can call the real
// provider immediately.
//
// Auth model: uses the caller's own JWT (not the service role), so the
// `integrations` select below is naturally scoped to their org by RLS —
// same pattern as send-ticket-notification. This function only ever reads
// an integration row already saved by the org itself; it never writes.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ActionResult = { ok: boolean; msg: string };

async function sendTelegram(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const chat_id = params.chat_id;
  const message = params.message;
  if (!chat_id || !message) return { ok: false, msg: "Missing chat_id or message" };
  const res = await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text: message }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok && Boolean(body?.ok), msg: body?.description || `Telegram HTTP ${res.status}` };
}

async function sendSms(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const to = params.to;
  const message = params.message;
  if (!to || !message) return { ok: false, msg: "Missing to or message" };
  const sid = config.account_sid;
  const body = new URLSearchParams({ To: String(to), From: config.from_number, Body: String(message) });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${config.auth_token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const resBody = await res.json().catch(() => null);
  return { ok: res.ok, msg: resBody?.error_message || (res.ok ? `Sent (sid ${resBody?.sid})` : `Twilio HTTP ${res.status}`) };
}

async function mailchimpSubscribe(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const list_id = params.list_id;
  const email = params.email;
  if (!list_id || !email) return { ok: false, msg: "Missing list_id or email" };
  const key = config.api_key || "";
  const dc = key.split("-")[1];
  if (!dc) return { ok: false, msg: "Stored Mailchimp key is missing its datacenter suffix" };
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${list_id}/members`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`anystring:${key}`)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email_address: email, status: "subscribed" }),
  });
  const resBody = await res.json().catch(() => null);
  const alreadyMember = resBody?.title === "Member Exists";
  return { ok: res.ok || alreadyMember, msg: alreadyMember ? "Already subscribed" : (res.ok ? "Subscribed" : (resBody?.detail || `Mailchimp HTTP ${res.status}`)) };
}

async function callCustomApp(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const baseUrl = (config.base_url || "").replace(/\/$/, "");
  const path = typeof params.path === "string" ? params.path : "";
  const method = typeof params.method === "string" ? params.method.toUpperCase() : "POST";
  const url = baseUrl + path;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.auth_type === "bearer") headers["Authorization"] = `Bearer ${config.credential}`;
  else if (config.auth_type === "api_key_header") headers[config.header_name || "X-API-Key"] = config.credential;
  else if (config.auth_type === "basic") headers["Authorization"] = `Basic ${btoa(`${config.username}:${config.credential}`)}`;
  const res = await fetch(url, {
    method,
    headers,
    body: params.body ? JSON.stringify(params.body) : undefined,
  });
  const text = await res.text().catch(() => "");
  return { ok: res.ok, msg: res.ok ? `${res.status} OK` : `HTTP ${res.status}: ${text.slice(0, 200)}` };
}

const ACTIONS: Record<string, { provider: string; run: (config: Record<string, string>, params: Record<string, unknown>) => Promise<ActionResult> }> = {
  send_telegram: { provider: "telegram", run: sendTelegram },
  send_sms: { provider: "twilio", run: sendSms },
  mailchimp_subscribe: { provider: "mailchimp", run: mailchimpSubscribe },
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

    const { action, params, integration_id } = await req.json();
    if (!action) {
      return new Response(JSON.stringify({ ok: false, msg: "Missing action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // call_custom_app targets one specific saved Custom App by id (an org
    // can have several); the other actions target the single connected
    // integration row for that fixed provider.
    if (action === "call_custom_app") {
      if (!integration_id) {
        return new Response(JSON.stringify({ ok: false, msg: "Missing integration_id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: integ } = await supabaseClient.from("integrations").select("config").eq("id", integration_id).eq("status", "connected").maybeSingle();
      if (!integ) {
        return new Response(JSON.stringify({ ok: false, msg: "That custom app is not connected for this organization." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await callCustomApp(integ.config as Record<string, string>, params || {});
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const handler = ACTIONS[action];
    if (!handler) {
      return new Response(JSON.stringify({ ok: false, msg: `Unknown action: ${action}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: integ } = await supabaseClient.from("integrations").select("config").eq("provider", handler.provider).eq("status", "connected").maybeSingle();
    if (!integ) {
      return new Response(JSON.stringify({ ok: false, msg: `${handler.provider} is not connected for this organization.` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await handler.run(integ.config as Record<string, string>, params || {});
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
