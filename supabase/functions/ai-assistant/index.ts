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

// Google periodically retires older Gemini model IDs (e.g. gemini-2.0-flash
// was fully shut down on 2026-06-01), which breaks a hardcoded single model
// name with a hard 404 the moment it happens — exactly what generated the
// bug report this list fixes. Try a short list of candidates, newest
// currently-stable first, and only move to the next one on a 404 "model not
// found/no longer available" response (any other failure — bad key, quota,
// content policy — is a real error and should surface immediately, not
// trigger a pointless retry loop against models that would fail the same
// way). Google's own guidance is to keep the model name out of hardcoded
// app logic entirely for this exact reason; this list is the pragmatic
// version of that for a single edge function. When Google deprecates the
// first entry, move it to the end (or drop it) rather than deleting this
// fallback structure — the same failure mode will recur on whatever is
// hardcoded next otherwise.
const GEMINI_MODEL_CANDIDATES = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-flash-latest"];

async function callGemini(apiKey: string, system: string, question: string): Promise<CallResult> {
  let lastErr = "";
  for (const model of GEMINI_MODEL_CANDIDATES) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 400 },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, text: data.candidates?.[0]?.content?.parts?.[0]?.text || "" };
    }
    const bodyText = await res.text();
    const isRetirableModelError = res.status === 404 || /no longer available|not found/i.test(bodyText);
    lastErr = `Gemini error: ${bodyText.slice(0, 200)}`;
    if (!isRetirableModelError) return { ok: false, msg: lastErr };
    // else: this specific model was retired/renamed — try the next candidate
  }
  return { ok: false, msg: lastErr };
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

    // Single round-trip replacing the 11 separate .select() calls this
    // used to make (one per count/metric) before ever calling the AI
    // provider — each was a separate HTTP request to PostgREST, and that
    // was a real, measurable share of "Ask Atlas" feeling slow. Runs
    // under the caller's own RLS via supabaseClient (the SQL function is
    // SECURITY INVOKER, not the service role), so it can only ever see
    // this org's own data, exactly as the 11 calls did before.
    const { data: snapshot } = await supabaseClient.rpc("get_ai_context_snapshot", { target_org_id: profile?.org_id });
    const totalRevenue = Number(snapshot?.total_revenue) || 0;
    const docs = (snapshot?.knowledge_docs || []) as { title: string; category: string | null; description: string | null }[];
    const knowledgeSection = docs.length
      ? `\n\nKnowledge Base entries on file (titles/descriptions only — no full file text is available, so don't claim to quote or fully summarize their contents):\n${docs.map(d => `- "${d.title}"${d.category ? ` [${d.category}]` : ''}${d.description ? `: ${d.description}` : ''}`).join('\n')}`
      : '';
    const context = `Live CRM snapshot for this user's organization (use these real numbers, do not invent data):
- Contacts: ${snapshot?.contacts_count ?? 0}
- Leads: ${snapshot?.leads_count ?? 0} total, ${snapshot?.hot_leads_count ?? 0} hot/unconverted
- Deals: ${snapshot?.deals_count ?? 0} total, ${snapshot?.open_deals_count ?? 0} open
- Invoices: ${snapshot?.invoices_count ?? 0} total, ${snapshot?.unpaid_invoices_count ?? 0} unpaid
- Tickets: ${snapshot?.tickets_count ?? 0} total, ${snapshot?.open_tickets_count ?? 0} open
- Collected revenue: ${totalRevenue}${knowledgeSection}`;

    const langName = language === "fr" ? "French" : language === "es" ? "Spanish" : language === "pt" ? "Portuguese" : language === "ar" ? "Arabic" : "English";
    const system = `You are Atlas, the AI assistant embedded in Atlas CRM. Answer the user's question about their business concisely (2-4 sentences), grounded strictly in the CRM snapshot and Knowledge Base entries provided — never invent numbers or claim to know document contents beyond what's given. Reply in ${langName}. If the question is unrelated to the CRM data available, answer helpfully and briefly as a general CRM assistant.\n\n${context}`;

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
