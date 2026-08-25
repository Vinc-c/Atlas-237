import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PAYUNIT_BASE_URL = "https://gateway.payunit.net";

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
      return new Response(JSON.stringify({ ok: false }), { status: 200, headers: corsHeaders });
    }

    // Use the service role here: PayUnit calls this endpoint directly (not
    // an authenticated Atlas user), so there's no user JWT to forward.
    // Security instead comes from NEVER trusting this request's body — we
    // always re-query PayUnit's own API for the authoritative status below.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let body: { transaction_id?: string; data?: { transaction_id?: string } } = {};
    try { body = await req.json(); } catch { /* some notify payloads may be form-encoded; ignore parse failure */ }
    const transactionId = body.transaction_id || body.data?.transaction_id;
    if (!transactionId) {
      return new Response(JSON.stringify({ ok: false, msg: "No transaction_id in notification" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusRes = await fetch(`${PAYUNIT_BASE_URL}/api/gateway/paymentstatus/${transactionId}`, {
      headers: {
        "x-api-key": apiKey,
        "mode": mode,
        "Authorization": `Basic ${btoa(`${apiUser}:${apiPassword}`)}`,
      },
    });
    const statusData = await statusRes.json();
    const txStatus: string = statusData?.data?.transaction_status || statusData?.transaction_status || "PENDING";

    if (txStatus === "SUCCESS") {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { data: sub } = await supabaseAdmin
        .from("subscriptions").select("org_id, plan").eq("payunit_transaction_id", transactionId).maybeSingle();

      if (sub) {
        await supabaseAdmin.from("subscriptions").update({
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        }).eq("payunit_transaction_id", transactionId);

        await supabaseAdmin.from("organizations").update({ plan: sub.plan }).eq("id", sub.org_id);
      }
    } else if (["FAILED", "CANCELLED"].includes(txStatus)) {
      await supabaseAdmin.from("subscriptions").update({ status: "expired" }).eq("payunit_transaction_id", transactionId);
    }

    // Always 200 to PayUnit's notifier regardless of internal outcome —
    // this endpoint's job is to acknowledge receipt, not report our state.
    return new Response(JSON.stringify({ ok: true, status: txStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
