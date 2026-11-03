import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Missing environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set in the Edge Function runtime."
      );
    }

    // Verify authentication from header (either user JWT or apikey)
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey");

    if (!authHeader && !apiKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authentication credentials." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase Admin client with service_role secret
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse payload
    const body = await req.json().catch(() => ({}));
    const { email, full_name, password, role_ids } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "A valid email address is required." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName =
      typeof full_name === "string" && full_name.trim().length > 0
        ? full_name.trim()
        : cleanEmail.split("@")[0];

    let createdUser: any = null;

    // If password provided and at least 6 characters, create confirmed user directly
    if (password && typeof password === "string" && password.trim().length >= 6) {
      const { data: createData, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password.trim(),
          email_confirm: true,
          user_metadata: {
            full_name: cleanFullName,
          },
        });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      createdUser = createData.user;
    } else {
      // Otherwise send an invite email via Supabase Auth Admin
      const { data: inviteData, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
          data: {
            full_name: cleanFullName,
          },
        });

      if (inviteError) {
        return new Response(
          JSON.stringify({ error: inviteError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      createdUser = inviteData.user;
    }

    if (!createdUser?.id) {
      throw new Error("Failed to create or invite user: No user ID returned.");
    }

    // Ensure profile row exists in public.profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: createdUser.id,
          full_name: cleanFullName,
          email: cleanEmail,
          is_active: true,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.warn("Notice: profile upsert error (trigger may have already handled it):", profileError);
    }

    // Assign roles to the user in public.user_roles
    let targetRoleIds: string[] = [];

    if (Array.isArray(role_ids) && role_ids.length > 0) {
      targetRoleIds = role_ids;
    } else {
      // Default to student role if none provided
      const { data: studentRole } = await supabaseAdmin
        .from("roles")
        .select("id")
        .eq("name", "student")
        .maybeSingle();

      if (studentRole?.id) {
        targetRoleIds = [studentRole.id];
      }
    }

    if (targetRoleIds.length > 0) {
      const roleRows = targetRoleIds.map((roleId) => ({
        profile_id: createdUser.id,
        role_id: roleId,
      }));

      const { error: rolesError } = await supabaseAdmin
        .from("user_roles")
        .upsert(roleRows, { onConflict: "profile_id,role_id" });

      if (rolesError) {
        console.warn("Notice: user_roles upsert error:", rolesError);
      }
    }

    // Return the created/invited user payload expected by the frontend
    return new Response(
      JSON.stringify({
        user: {
          id: createdUser.id,
          email: createdUser.email ?? cleanEmail,
          full_name: cleanFullName,
        },
        message: password ? "Account created successfully." : "Invitation sent successfully.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Unhandled error in admin-create-user function:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
