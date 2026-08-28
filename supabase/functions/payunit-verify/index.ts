import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PAYUNIT_BASE_URL = "https://gateway.payunit.net";

async function checkStatusAndActivate(authClient: ReturnType<typeof createClient>, adminClient: ReturnType<typeof createClient>, transactionId: string): Promise<{ ok: boolean; status?: string; msg?: string }> {
  const apiUser = Deno.env.get("PAYUNIT_API_USER");
  const apiPassword = Deno.env.get("PAYUNIT_API_PASSWORD");
  const apiKey = Deno.env.get("PAYUNIT_API_KEY");
  const mode = Deno.env.get("PAYUNIT_MODE") || "test";
  if (!apiUser || !apiPassword || !apiKey) {
    return { ok: false, msg: "PayUnit not configured" };
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

  // Confirm the caller actually belongs to the org this transaction was
  // opened for, using the pending subscription row created at checkout
  // time (before hand-off to PayUnit's hosted page) — never trust an
  // org_id the client could supply directly.
  const { data: sub } = await authClient
    .from("subscriptions").select("org_id, plan").eq("payunit_transaction_id", transactionId).maybeSingle();
  if (!sub) {
    return { ok: false, msg: "No pending transaction found for this id." };
  }
  if (txStatus === "SUCCESS") {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Writes use the service role — regular authenticated users no
    // longer have direct write access to subscriptions/organizations.plan
    // (see migration 025); only a verified payment reaching this point
    // may activate a plan.
    await adminClient.from("subscriptions").update({
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    }).eq("payunit_transaction_id", transactionId);

    await adminClient.from("organizations").update({ plan: sub.plan }).eq("id", sub.org_id);
  } else if (["FAILED", "CANCELLED"].includes(txStatus)) {
    await adminClient.from("subscriptions").update({ status: "expired" }).eq("payunit_transaction_id", transactionId);
  }

  return { ok: true, status: txStatus };
}

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

    const { transaction_id } = await req.json();
    if (!transaction_id) {
      return new Response(JSON.stringify({ ok: false, msg: "Missing transaction_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const result = await checkStatusAndActivate(supabaseClient, adminClient, transaction_id);
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
