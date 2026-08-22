import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(JSON.stringify({ ok: false, msg: "AI assistant not configured (missing ANTHROPIC_API_KEY)" }), {
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

    const { question, language } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ ok: false, msg: "Missing question" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [contacts, leads, hotLeads, deals, openDeals, invoices, unpaidInvoices, tickets, openTickets, payments] = await Promise.all([
      supabaseClient.from("contacts").select("*", { count: "exact", head: true }),
      supabaseClient.from("leads").select("*", { count: "exact", head: true }),
      supabaseClient.from("leads").select("*", { count: "exact", head: true }).eq("temperature", "hot").neq("status", "converted"),
      supabaseClient.from("deals").select("*", { count: "exact", head: true }),
      supabaseClient.from("deals").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabaseClient.from("invoices").select("*", { count: "exact", head: true }),
      supabaseClient.from("invoices").select("*", { count: "exact", head: true }).neq("payment_status", "paid"),
      supabaseClient.from("tickets").select("*", { count: "exact", head: true }),
      supabaseClient.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabaseClient.from("payments").select("amount").eq("status", "completed"),
    ]);

    const totalRevenue = (payments.data || []).reduce((sum: number, p: { amount: number }) => sum + (Number(p.amount) || 0), 0);

    const context = `Live CRM snapshot for this user's organization (use these real numbers, do not invent data):
- Contacts: ${contacts.count ?? 0}
- Leads: ${leads.count ?? 0} total, ${hotLeads.count ?? 0} hot/unconverted
- Deals: ${deals.count ?? 0} total, ${openDeals.count ?? 0} open
- Invoices: ${invoices.count ?? 0} total, ${unpaidInvoices.count ?? 0} unpaid
- Tickets: ${tickets.count ?? 0} total, ${openTickets.count ?? 0} open
- Collected revenue: ${totalRevenue}`;

    const langName = language === "fr" ? "French" : language === "es" ? "Spanish" : language === "pt" ? "Portuguese" : language === "ar" ? "Arabic" : "English";

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: `You are Atlas, the AI assistant embedded in Atlas CRM. Answer the user's question about their business concisely (2-4 sentences), grounded strictly in the CRM snapshot provided — never invent numbers. Reply in ${langName}. If the question is unrelated to the CRM data available, answer helpfully and briefly as a general CRM assistant.\n\n${context}`,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return new Response(JSON.stringify({ ok: false, msg: `AI provider error: ${errText.slice(0, 200)}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await anthropicRes.json();
    const text = result.content?.find((b: { type: string }) => b.type === "text")?.text || "";

    return new Response(JSON.stringify({ ok: true, text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
