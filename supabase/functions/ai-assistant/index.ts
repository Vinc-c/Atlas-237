import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CallResult {
  ok: boolean;
  text?: string;
  msg?: string;
}

async function callAnthropic(apiKey: string, system: string, question: string): Promise<CallResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 400, system, messages: [{ role: "user", content: question }] }),
  });
  if (!res.ok) return { ok: false, msg: `Anthropic error: ${(await res.text()).slice(0, 200)}` };
  const data = await res.json();
  return { ok: true, text: data.content?.find((b: { type: string }) => b.type === "text")?.text || "" };
}

async function callOpenAI(apiKey: string, system: string, question: string): Promise<CallResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 400,
      messages: [{ role: "system", content: system }, { role: "user", content: question }],
    }),
  });
  if (!res.ok) return { ok: false, msg: `OpenAI error: ${(await res.text()).slice(0, 200)}` };
  const data = await res.json();
  return { ok: true, text: data.choices?.[0]?.message?.content || "" };
}

async function callGemini(apiKey: string, system: string, question: string): Promise<CallResult> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: question }] }],
      generationConfig: { maxOutputTokens: 400 },
    }),
  });
  if (!res.ok) return { ok: false, msg: `Gemini error: ${(await res.text()).slice(0, 200)}` };
  const data = await res.json();
  return { ok: true, text: data.candidates?.[0]?.content?.parts?.[0]?.text || "" };
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

    const { question, language } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ ok: false, msg: "Missing question" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseClient.from("profiles").select("org_id").eq("id", userData.user.id).single();
    const { data: org } = await supabaseClient.from("organizations").select("ai_provider").eq("id", profile?.org_id).single();
    const provider = org?.ai_provider || "platform_free";

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
    const system = `You are Atlas, the AI assistant embedded in Atlas CRM. Answer the user's question about their business concisely (2-4 sentences), grounded strictly in the CRM snapshot provided — never invent numbers. Reply in ${langName}. If the question is unrelated to the CRM data available, answer helpfully and briefly as a general CRM assistant.\n\n${context}`;

    let result: CallResult;

    if (provider === "platform_free") {
      const freeKey = Deno.env.get("GEMINI_API_KEY");
      if (!freeKey) {
        return new Response(JSON.stringify({ ok: false, msg: "AI assistant not configured (missing GEMINI_API_KEY)" }), {
          status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      result = await callGemini(freeKey, system, question);
    } else if (["openai", "anthropic", "gemini"].includes(provider)) {
      const { data: integration } = await supabaseClient
        .from("integrations").select("config").eq("org_id", profile?.org_id).eq("provider", provider).eq("status", "connected").maybeSingle();
      const byokKey = (integration?.config as { api_key?: string } | null)?.api_key;
      if (!byokKey) {
        return new Response(JSON.stringify({ ok: false, msg: `No ${provider} API key connected. Connect one in Integrations, or switch back to the free plan.` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      result = provider === "openai" ? await callOpenAI(byokKey, system, question)
        : provider === "anthropic" ? await callAnthropic(byokKey, system, question)
        : await callGemini(byokKey, system, question);
    } else {
      return new Response(JSON.stringify({ ok: false, msg: `Unknown AI provider: ${provider}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!result.ok) {
      return new Response(JSON.stringify({ ok: false, msg: result.msg }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, text: result.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
