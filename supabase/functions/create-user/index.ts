import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  full_name: string;
  password: string;
  role: "admin" | "recruiter" | "candidate";
  phone?: string;
  company_name?: string;
  company_website?: string;
  // For candidates
  assigned_recruiter_id?: string;
  current_job_title?: string;
  current_location?: string;
  experience_years?: number;
  skills?: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the calling user is an admin or recruiter
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with the caller's token to check their role
    const callerClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: callerUser },
    } = await callerClient.auth.getUser();

    if (!callerUser) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Admin client with service role for privileged operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check caller role
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id);

    const callerRoleList = callerRoles?.map((r) => r.role) || [];
    const isAdmin = callerRoleList.includes("admin");
    const isRecruiter = callerRoleList.includes("recruiter");

    const body: CreateUserRequest = await req.json();

    // Only admins can create admins or recruiters
    if ((body.role === "recruiter" || body.role === "admin") && !isAdmin) {
      return new Response(
        JSON.stringify({ error: `Only admins can create ${body.role} accounts` }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Only admins and recruiters can create candidates
    if (body.role === "candidate" && !isAdmin && !isRecruiter) {
      return new Response(
        JSON.stringify({ error: "Only admins or recruiters can create candidate accounts" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: body.full_name },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const newUserId = authData.user.id;

    // 2. Insert into users table
    const { error: userError } = await adminClient.from("users").insert({
      user_id: newUserId,
      email: body.email,
      full_name: body.full_name,
      phone: body.phone || null,
    });

    if (userError) {
      // Cleanup: delete auth user
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: `Failed to create user profile: ${userError.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 3. Insert role
    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: newUserId,
      role: body.role,
    });

    if (roleError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: `Failed to assign role: ${roleError.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 4. Create role-specific record
    if (body.role === "recruiter") {
      const { error: recruiterError } = await adminClient.from("recruiters").insert({
        user_id: newUserId,
        created_by_admin_id: callerUser.id,
        company_name: body.company_name || null,
        company_website: body.company_website || null,
        phone: body.phone || null,
      });

      if (recruiterError) {
        await adminClient.auth.admin.deleteUser(newUserId);
        return new Response(
          JSON.stringify({ error: `Failed to create recruiter record: ${recruiterError.message}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else if (body.role === "candidate") {
      // Get the recruiter_id for the current user if they're a recruiter
      let assignedRecruiterId = body.assigned_recruiter_id;
      if (!assignedRecruiterId && isRecruiter) {
        const { data: recruiterData } = await adminClient
          .from("recruiters")
          .select("recruiter_id")
          .eq("user_id", callerUser.id)
          .single();
        assignedRecruiterId = recruiterData?.recruiter_id;
      }

      if (!assignedRecruiterId) {
        await adminClient.auth.admin.deleteUser(newUserId);
        return new Response(
          JSON.stringify({ error: "assigned_recruiter_id is required for candidates" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get created_by_recruiter_id
      let createdByRecruiterId = assignedRecruiterId;
      if (isRecruiter) {
        const { data: rd } = await adminClient
          .from("recruiters")
          .select("recruiter_id")
          .eq("user_id", callerUser.id)
          .single();
        if (rd) createdByRecruiterId = rd.recruiter_id;
      }

      const { error: candidateError } = await adminClient.from("candidates").insert({
        user_id: newUserId,
        assigned_recruiter_id: assignedRecruiterId,
        created_by_recruiter_id: createdByRecruiterId,
        current_job_title: body.current_job_title || null,
        current_location: body.current_location || null,
        experience_years: body.experience_years || null,
        skills: body.skills || null,
        phone: body.phone || null,
      });

      if (candidateError) {
        await adminClient.auth.admin.deleteUser(newUserId);
        return new Response(
          JSON.stringify({ error: `Failed to create candidate record: ${candidateError.message}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUserId,
        email: body.email,
        role: body.role,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("Error in create-user:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
