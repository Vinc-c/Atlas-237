import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
    const body = JSON.stringify(payload);

    // Security fix: previously sent the raw stored secret as the header
    // value on every delivery — meaning the secret itself crossed the wire
    // each time. Now sends an HMAC-SHA256 signature of the body instead
    // (same model as Stripe/GitHub webhooks): the receiving app recomputes
    // it with its own copy of the secret to verify authenticity, and the
    // secret itself is never transmitted.
    const signature = secret ? await hmacSha256Hex(secret, body) : "";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Atlas-Signature": signature,
      },
      body,
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
