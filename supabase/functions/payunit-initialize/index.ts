import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PAYUNIT_BASE_URL = "https://gateway.payunit.net";

// Subscriptions are priced in USD. PayUnit settles in XAF (its documented
// currency, matching its CFA-zone mobile money operators), so the USD
// price is converted to XAF at the real current exchange rate — fetched
// live from a free, keyless FX API — rather than a fixed/guessed peg.
const PLAN_PRICES_USD: Record<string, number> = {
  starter: 19,
  growth: 49,
  pro: 119,
};

async function convertUsdToXaf(usdAmount: number): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    const rate = data?.rates?.XAF;
    if (!rate || typeof rate !== "number") throw new Error("XAF rate unavailable");
    // XAF is zero-decimal — round to the nearest whole franc.
    return Math.round(usdAmount * rate);
  } catch {
    // Fallback only if the live FX API is unreachable — approximate peg,
    // clearly a degraded path, not the primary pricing mechanism.
    return Math.round(usdAmount * 600);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiUser = Deno.env.get("PAYUNIT_API_USER");
    const apiPassword = Deno.env.get("PAYUNIT_API_PASSWORD");
    const apiKey = Deno.env.get("PAYUNIT_API_KEY");
    const mode = Deno.env.get("PAYUNIT_MODE") || "test";
    if (!apiUser || !apiPassword || !apiKey) {
      return new Response(JSON.stringify({ ok: false, msg: "PayUnit not configured (missing PAYUNIT_API_USER / PAYUNIT_API_PASSWORD / PAYUNIT_API_KEY)" }), {
        status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const { plan, org_id, payment_country, return_url } = await req.json();
    const usdPrice = PLAN_PRICES_USD[plan];
    if (!usdPrice) {
      return new Response(JSON.stringify({ ok: false, msg: `Unknown or non-payable plan: ${plan}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const amount = await convertUsdToXaf(usdPrice);

    // Verify the caller actually belongs to org_id (org-scoped, mirrors the
    // same check used by other org-mutating edge functions in this app).
    const { data: profile } = await supabaseClient.from("profiles").select("org_id").eq("id", userData.user.id).single();
    if (!profile || profile.org_id !== org_id) {
      return new Response(JSON.stringify({ ok: false, msg: "You do not belong to this organization" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // transaction_id must avoid special characters (breaks Orange Money per PayUnit docs)
    const transactionId = `atlas${org_id.replace(/-/g, "").slice(0, 12)}${Date.now()}`;
    const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payunit-webhook`;

    const initRes = await fetch(`${PAYUNIT_BASE_URL}/api/gateway/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "mode": mode,
        "Authorization": `Basic ${btoa(`${apiUser}:${apiPassword}`)}`,
      },
      body: JSON.stringify({
        total_amount: amount,
        currency: "XAF",
        transaction_id: transactionId,
        return_url: return_url || `${Deno.env.get("SUPABASE_URL")}`,
        notify_url: notifyUrl,
        payment_country: payment_country || "CM",
      }),
    });

    const initData = await initRes.json();
    if (!initRes.ok || initData.status !== "SUCCESS") {
      return new Response(JSON.stringify({ ok: false, msg: initData.message || "PayUnit initialization failed" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The subscription's currency of record is always USD (consistent with
    // Flutterwave subscriptions and platform-wide MRR calculations, which
    // sum price_cents assuming USD) — only the actual charge rail differs.
    const { error: subErr } = await supabaseClient.from("subscriptions").upsert({
      org_id,
      plan,
      status: "pending",
      price_cents: usdPrice * 100,
      currency: "USD",
      billing_cycle: "monthly",
      payment_provider: "payunit",
      payunit_transaction_id: transactionId,
    }, { onConflict: "org_id" });
    if (subErr) {
      return new Response(JSON.stringify({ ok: false, msg: subErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, transaction_url: initData.data?.transaction_url, transaction_id: transactionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
