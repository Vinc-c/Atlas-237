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

async function sendWhatsapp(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const to = params.to;
  const message = params.message;
  if (!to || !message) return { ok: false, msg: "Missing to or message" };
  const res = await fetch(`https://graph.facebook.com/v20.0/${config.phone_number_id}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.api_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: String(message) } }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, msg: res.ok ? `Sent (id ${body?.messages?.[0]?.id || "?"})` : (body?.error?.message || `WhatsApp HTTP ${res.status}`) };
}

async function hubspotUpsertContact(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const email = params.email;
  if (!email) return { ok: false, msg: "Missing email" };
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ properties: { email, firstname: params.firstname || "", lastname: params.lastname || "" } }),
  });
  const body = await res.json().catch(() => null);
  const alreadyExists = res.status === 409;
  return { ok: res.ok || alreadyExists, msg: alreadyExists ? "Contact already exists in HubSpot" : (res.ok ? "Contact created" : (body?.message || `HubSpot HTTP ${res.status}`)) };
}

async function freshdeskCreateTicket(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const subject = params.subject;
  const description = params.description;
  const email = params.email;
  if (!subject || !description || !email) return { ok: false, msg: "Missing subject, description or email" };
  const res = await fetch(`https://${config.domain}/api/v2/tickets`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${config.api_key}:X`)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ subject, description, email, priority: 1, status: 2 }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, msg: res.ok ? `Ticket #${body?.id} created` : (body?.description || body?.message || `Freshdesk HTTP ${res.status}`) };
}

async function mollieCreatePayment(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const amount = params.amount;
  const description = params.description;
  if (!amount || !description) return { ok: false, msg: "Missing amount or description" };
  const res = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: { currency: String(params.currency || "EUR"), value: Number(amount).toFixed(2) },
      description,
      redirectUrl: params.redirect_url || "https://example.com/return",
    }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, msg: res.ok ? `Payment link: ${body?._links?.checkout?.href}` : (body?.detail || `Mollie HTTP ${res.status}`) };
}

async function cinetpayCreatePayment(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const amount = params.amount;
  if (!amount) return { ok: false, msg: "Missing amount" };
  const res = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: config.api_key,
      site_id: config.site_id,
      transaction_id: `wf-${Date.now()}`,
      amount: Number(amount),
      currency: params.currency || "XOF",
      description: params.description || "Atlas payment",
      notify_url: params.notify_url || "https://example.com/notify",
      return_url: params.return_url || "https://example.com/return",
      channels: "ALL",
    }),
  });
  const body = await res.json().catch(() => null);
  return { ok: body?.code === "201", msg: body?.code === "201" ? `Payment link: ${body?.data?.payment_url}` : (body?.message || `CinetPay HTTP ${res.status}`) };
}

async function waveCreateCheckout(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const amount = params.amount;
  if (!amount) return { ok: false, msg: "Missing amount" };
  const res = await fetch("https://api.wave.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: String(amount),
      currency: params.currency || "XOF",
      client_reference: params.client_reference || `wf-${Date.now()}`,
      error_url: params.error_url || "https://example.com/error",
      success_url: params.success_url || "https://example.com/success",
    }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, msg: res.ok ? `Checkout link: ${body?.wave_launch_url}` : (body?.message || `Wave HTTP ${res.status}`) };
}

async function chapaInitialize(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const amount = params.amount;
  const email = params.email;
  if (!amount || !email) return { ok: false, msg: "Missing amount or email" };
  const tx_ref = `wf-${Date.now()}`;
  const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.secret_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: String(amount),
      currency: params.currency || "ETB",
      email,
      first_name: params.first_name || "",
      last_name: params.last_name || "",
      tx_ref,
      return_url: params.return_url || "https://example.com/return",
    }),
  });
  const body = await res.json().catch(() => null);
  return { ok: body?.status === "success", msg: body?.status === "success" ? `Checkout link: ${body?.data?.checkout_url}` : (body?.message || `Chapa HTTP ${res.status}`) };
}

async function campayCollect(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const amount = params.amount;
  const phone = params.phone_number;
  if (!amount || !phone) return { ok: false, msg: "Missing amount or phone_number" };
  const tokenRes = await fetch("https://www.campay.net/api/token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: config.app_username, password: config.app_password }),
  });
  const tokenBody = await tokenRes.json().catch(() => null);
  if (!tokenRes.ok || !tokenBody?.token) return { ok: false, msg: tokenBody?.detail || "CamPay authentication failed" };
  const res = await fetch("https://www.campay.net/api/collect/", {
    method: "POST",
    headers: { Authorization: `Token ${tokenBody.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: String(amount), from: phone, description: params.description || "Atlas payment", external_reference: `wf-${Date.now()}` }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, msg: res.ok ? `Collection initiated (ref ${body?.reference})` : (body?.message || `CamPay HTTP ${res.status}`) };
}

async function shopifyCreateCustomer(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const email = params.email;
  if (!email) return { ok: false, msg: "Missing email" };
  const res = await fetch(`https://${config.shop_domain}/admin/api/2024-01/customers.json`, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": config.access_token, "Content-Type": "application/json" },
    body: JSON.stringify({ customer: { email, first_name: params.first_name || "", last_name: params.last_name || "" } }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, msg: res.ok ? `Customer #${body?.customer?.id} created` : (JSON.stringify(body?.errors) || `Shopify HTTP ${res.status}`) };
}

async function woocommerceCreateCustomer(config: Record<string, string>, params: Record<string, unknown>): Promise<ActionResult> {
  const email = params.email;
  if (!email) return { ok: false, msg: "Missing email" };
  const baseUrl = (config.shop_url || "").replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/wp-json/wc/v3/customers`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${config.consumer_key}:${config.consumer_secret}`)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, first_name: params.first_name || "", last_name: params.last_name || "" }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, msg: res.ok ? `Customer #${body?.id} created` : (body?.message || `WooCommerce HTTP ${res.status}`) };
}

const ACTIONS: Record<string, { provider: string; run: (config: Record<string, string>, params: Record<string, unknown>) => Promise<ActionResult> }> = {
  send_telegram: { provider: "telegram", run: sendTelegram },
  send_sms: { provider: "twilio", run: sendSms },
  mailchimp_subscribe: { provider: "mailchimp", run: mailchimpSubscribe },
  send_whatsapp: { provider: "whatsapp", run: sendWhatsapp },
  hubspot_upsert_contact: { provider: "hubspot", run: hubspotUpsertContact },
  freshdesk_create_ticket: { provider: "freshdesk", run: freshdeskCreateTicket },
  mollie_create_payment: { provider: "mollie", run: mollieCreatePayment },
  cinetpay_create_payment: { provider: "cinetpay", run: cinetpayCreatePayment },
  wave_create_checkout: { provider: "wave", run: waveCreateCheckout },
  chapa_initialize: { provider: "chapa", run: chapaInitialize },
  campay_collect: { provider: "campay", run: campayCollect },
  shopify_create_customer: { provider: "shopify", run: shopifyCreateCustomer },
  woocommerce_create_customer: { provider: "woocommerce", run: woocommerceCreateCustomer },
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
