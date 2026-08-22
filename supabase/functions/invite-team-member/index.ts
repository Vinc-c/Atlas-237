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
    // Verify the CALLER is authenticated and is an owner/admin of the org
    // they're inviting into — the service-role client below can bypass RLS,
    // so this check is the only thing stopping any authenticated user from
    // inviting themselves into any organization.
    const authHeader = req.headers.get("Authorization") || "";
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: callerData, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !callerData.user) {
      return new Response(JSON.stringify({ ok: false, msg: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, org_id, role, first_name, last_name, redirect_to } = await req.json();
    if (!email || !org_id || !role) {
      return new Response(JSON.stringify({ ok: false, msg: "Missing email, org_id or role" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile, error: profileErr } = await callerClient
      .from("profiles").select("org_id, role").eq("id", callerData.user.id).single();
    if (profileErr || !callerProfile || callerProfile.org_id !== org_id || !["owner", "admin"].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ ok: false, msg: "Only owners/admins can invite members to their own organization" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // inviteUserByEmail creates a real, individual auth account for this
    // person and emails them a link. Clicking it lets THEM set their own
    // password — no shared or admin-assigned password. The metadata below
    // is read by the handle_new_user() trigger to attach them to the
    // inviting organization instead of creating a brand new one.
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        invite_org_id: org_id,
        invite_role: role,
        first_name: first_name || "",
        last_name: last_name || "",
      },
      redirectTo: redirect_to || undefined,
    });

    if (error) {
      return new Response(JSON.stringify({ ok: false, msg: error.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, user_id: data.user?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
