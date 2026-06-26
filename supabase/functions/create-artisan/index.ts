import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { email, password, full_name, phone, trade, company_name, siret, address, city, postal_code, logo_url, is_subscribed } = await req.json();

    if (!email || !password || !full_name || !phone || !trade) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user — also triggers handle_new_user which inserts a partial public.users row
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error("Échec création compte");

    const userId = authData.user.id;

    // UPDATE (not INSERT) public.users with the full profile data.
    // handle_new_user trigger already inserted the row; we just fill in the missing fields.
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({ full_name, phone, trade })
      .eq("id", userId);
    if (userError) throw userError;

    // Create company
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        user_id: userId,
        name: company_name || `${full_name} - ${trade}`,
        siret: siret || null,
        address: address || null,
        city: city || null,
        postal_code: postal_code || null,
        logo_url: logo_url || null,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // Create subscription
    const now = new Date();
    const periodEnd = new Date(now.getTime() + (is_subscribed ? 30 : 14) * 24 * 60 * 60 * 1000);

    await supabaseAdmin.from("subscriptions").insert({
      user_id: userId,
      plan: "pro",
      billing_cycle: "monthly",
      status: is_subscribed ? "active" : "trialing",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

    return new Response(JSON.stringify({ success: true, userId, email, password }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("create-artisan error:", err);
    return new Response(JSON.stringify({ error: err.message || "Erreur serveur" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
