import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Same pattern as flutterwave-verify: the checkout popup's client-side
// callback is never trusted on its own. This independently re-checks the
// transaction with Paystack's own server-side API (secret key, never
// exposed to the browser) before activating anything.

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
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) {
      return new Response(JSON.stringify({ ok: false, msg: "Paystack not configured (missing PAYSTACK_SECRET_KEY)" }), {
        status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const { org_id, plan, reference } = await req.json();
    if (!org_id || !plan || !reference) {
      return new Response(JSON.stringify({ ok: false, msg: "Missing org_id, plan, or reference" }), {
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

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const verifyData = await verifyRes.json();
    const tx = verifyData?.data;

    if (!verifyRes.ok || !verifyData.status || !tx) {
      return new Response(JSON.stringify({ ok: false, msg: "Paystack could not confirm this transaction." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tx.status !== "success") {
      return new Response(JSON.stringify({ ok: false, msg: `Transaction status is "${tx.status}", not successful.` }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if ((tx.currency || "").toUpperCase() !== "USD" || Number(tx.amount) < expectedUsd * 100) {
      return new Response(JSON.stringify({ ok: false, msg: "Paid amount/currency does not match the plan price." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tx.metadata?.org_id && tx.metadata.org_id !== org_id) {
      return new Response(JSON.stringify({ ok: false, msg: "Organization mismatch." }), {
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
      paystack_reference: reference,
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
