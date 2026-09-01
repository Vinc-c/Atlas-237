import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url, secret, event, data } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ ok: false, msg: "Missing webhook URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // `data` carries the real event payload (e.g. the contact/deal/invoice
    // that changed) for real CRM-triggered deliveries — see triggerWebhooks()
    // in src/lib/webhooks.ts. The "Test" button on the Webhooks page calls
    // this same function with no `data`, which is why the synthetic
    // `{ test: true }` default below must stay — it's what makes that
    // button's payload recognizable as a test ping to the receiving app.
    const payload = {
      event: event || "test.ping",
      timestamp: new Date().toISOString(),
      data: data ?? { test: true },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Atlas-Signature": secret || "",
      },
      body: JSON.stringify(payload),
    });

    return new Response(JSON.stringify({ ok: res.ok, status: res.status, msg: `${res.status} ${res.statusText}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
