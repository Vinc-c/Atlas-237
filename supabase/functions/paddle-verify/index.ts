import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Same pattern as flutterwave-verify/paystack-verify: the checkout overlay's
// client-side "checkout.completed" event is never trusted on its own. This
// independently re-checks the transaction with Paddle's own server-side API
// (secret API key, never exposed to the browser) before activating anything.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PLAN_PRICES_USD: Record<string, number> = {
  starter: 19,
  growth: 49,
  pro: 119,
  enterprise: 219,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("PADDLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, msg: "Paddle not configured (missing PADDLE_API_KEY)" }), {
        status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiBase = Deno.env.get("PADDLE_ENVIRONMENT") === "sandbox"
      ? "https://sandbox-api.paddle.com"
      : "https://api.paddle.com";

    const authHeader = req.headers.get("Authorization") || "";
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ ok: false, msg: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { org_id, plan, transaction_id } = await req.json();
    if (!org_id || !plan || !transaction_id) {
      return new Response(JSON.stringify({ ok: false, msg: "Missing org_id, plan, or transaction_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const expectedUsd = PLAN_PRICES_USD[plan];
    if (!expectedUsd) {
      return new Response(JSON.stringify({ ok: false, msg: "Unknown plan" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await authClient.from("profiles").select("org_id").eq("id", userData.user.id).maybeSingle();
    if (!profile || profile.org_id !== org_id) {
      return new Response(JSON.stringify({ ok: false, msg: "Not a member of this organization" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verifyRes = await fetch(`${apiBase}/transactions/${encodeURIComponent(transaction_id)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const verifyData = await verifyRes.json();
    const tx = verifyData?.data;

    if (!verifyRes.ok || !tx) {
      return new Response(JSON.stringify({ ok: false, msg: "Paddle could not confirm this transaction." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tx.status !== "completed" && tx.status !== "paid") {
      return new Response(JSON.stringify({ ok: false, msg: `Transaction status is "${tx.status}", not completed.` }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tx.custom_data?.org_id && tx.custom_data.org_id !== org_id) {
      return new Response(JSON.stringify({ ok: false, msg: "Organization mismatch." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const paidUsd = Number(tx.details?.totals?.grand_total || 0) / 100;
    const paidCurrency = (tx.currency_code || "").toUpperCase();
    if (paidCurrency !== "USD" || paidUsd < expectedUsd) {
      return new Response(JSON.stringify({ ok: false, msg: "Paid amount/currency does not match the plan price." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error: subError } = await adminClient.from("subscriptions").upsert({
      org_id,
      plan,
      status: "active",
      price_cents: expectedUsd * 100,
      currency: "USD",
      billing_cycle: "monthly",
      payment_provider: "paddle",
      paddle_transaction_id: transaction_id,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    }, { onConflict: "org_id" });
    if (subError) {
      return new Response(JSON.stringify({ ok: false, msg: subError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: orgError } = await adminClient.from("organizations").update({ plan }).eq("id", org_id);
    if (orgError) {
      return new Response(JSON.stringify({ ok: false, msg: orgError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
