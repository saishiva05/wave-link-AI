import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateUserRequest {
  action?: "create" | "update-password" | "delete-user";
  email?: string;
  full_name?: string;
  password?: string;
  role?: "admin" | "recruiter" | "candidate";
  phone?: string;
  company_name?: string;
  company_website?: string;
  assigned_recruiter_id?: string;
  current_job_title?: string;
  current_location?: string;
  experience_years?: number;
  skills?: string[];
  // For password update / delete
  userId?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id);

    const callerRoleList = callerRoles?.map((r) => r.role) || [];
    const isAdmin = callerRoleList.includes("admin");
    const isRecruiter = callerRoleList.includes("recruiter");

    const body: CreateUserRequest = await req.json();

    // Handle delete user action
    if (body.action === "delete-user") {
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Only admins can delete users" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      if (!body.userId) {
        return new Response(
          JSON.stringify({ error: "userId is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Prevent self-deletion
      if (body.userId === callerUser.id) {
        return new Response(
          JSON.stringify({ error: "Cannot delete your own account" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Determine the user's role
      const { data: targetRoles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", body.userId);
      const targetRoleList = targetRoles?.map((r) => r.role) || [];

      // If candidate, delete CVs from storage first
      if (targetRoleList.includes("candidate")) {
        const { data: candidateData } = await adminClient
          .from("candidates")
          .select("candidate_id")
          .eq("user_id", body.userId)
          .single();

        if (candidateData) {
          const candidateId = candidateData.candidate_id;

          // Get all CVs for this candidate to delete from storage
          const { data: cvs } = await adminClient
            .from("cvs")
            .select("cv_id, file_url")
            .eq("candidate_id", candidateId);

          if (cvs && cvs.length > 0) {
            // Delete CV files from storage
            const cvPaths = cvs.map((cv) => {
              const url = cv.file_url;
              const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/cvs-bucket\/(.+)/);
              return match ? match[1] : null;
            }).filter(Boolean) as string[];

            if (cvPaths.length > 0) {
              await adminClient.storage.from("cvs-bucket").remove(cvPaths);
            }

            // Delete updated CVs from storage
            const cvIds = cvs.map((cv) => cv.cv_id);
            const { data: updatedCvs } = await adminClient
              .from("updated_cvs")
              .select("updated_file_url")
              .eq("candidate_id", candidateId);

            if (updatedCvs && updatedCvs.length > 0) {
              const updatedPaths = updatedCvs.map((ucv) => {
                const url = ucv.updated_file_url;
                const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/Update%20cv's\/(.+)/);
                return match ? decodeURIComponent(match[1]) : null;
              }).filter(Boolean) as string[];

              if (updatedPaths.length > 0) {
                await adminClient.storage.from("Update cv's").remove(updatedPaths);
              }
            }

            // Delete ATS analyses for this candidate's CVs
            for (const cvId of cvIds) {
              await adminClient.from("ats_analyses").delete().eq("cv_id", cvId);
            }

            // Delete updated_cvs records
            await adminClient.from("updated_cvs").delete().eq("candidate_id", candidateId);

            // Delete CVs records
            await adminClient.from("cvs").delete().eq("candidate_id", candidateId);
          }

          // Delete job applications
          await adminClient.from("job_applications").delete().eq("candidate_id", candidateId);

          // Delete messages
          await adminClient.from("messages").delete().eq("candidate_id", candidateId);

          // Delete candidate record
          await adminClient.from("candidates").delete().eq("candidate_id", candidateId);
        }
      }

      // If recruiter, handle recruiter-specific cleanup
      if (targetRoleList.includes("recruiter")) {
        const { data: recruiterData } = await adminClient
          .from("recruiters")
          .select("recruiter_id")
          .eq("user_id", body.userId)
          .single();

        if (recruiterData) {
          const recruiterId = recruiterData.recruiter_id;

          // Delete recruiter sessions
          await adminClient.from("recruiter_sessions").delete().eq("recruiter_id", recruiterId);

          // Delete generated emails
          await adminClient.from("generated_emails").delete().eq("recruiter_id", recruiterId);

          // Delete ATS analyses
          await adminClient.from("ats_analyses").delete().eq("recruiter_id", recruiterId);

          // Delete updated CVs
          await adminClient.from("updated_cvs").delete().eq("recruiter_id", recruiterId);

          // Delete job applications
          await adminClient.from("job_applications").delete().eq("recruiter_id", recruiterId);

          // Delete CVs
          await adminClient.from("cvs").delete().eq("recruiter_id", recruiterId);

          // Delete scraped jobs
          await adminClient.from("scraped_jobs").delete().eq("recruiter_id", recruiterId);

          // Delete recruiter record
          await adminClient.from("recruiters").delete().eq("recruiter_id", recruiterId);
        }
      }

      // Delete user roles
      await adminClient.from("user_roles").delete().eq("user_id", body.userId);

      // Delete user profile
      await adminClient.from("users").delete().eq("user_id", body.userId);

      // Delete auth user
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(body.userId);
      if (deleteAuthError) {
        return new Response(JSON.stringify({ error: deleteAuthError.message }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: "User deleted successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle password update action
    if (body.action === "update-password") {
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Only admins can change user passwords" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      if (!body.userId || !body.password) {
        return new Response(
          JSON.stringify({ error: "userId and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      const { error: updateError } = await adminClient.auth.admin.updateUserById(body.userId, {
        password: body.password,
      });
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      return new Response(
        JSON.stringify({ success: true, message: "Password updated successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Default: create user flow
    if (!body.email || !body.full_name || !body.password || !body.role) {
      return new Response(
        JSON.stringify({ error: "email, full_name, password, and role are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if ((body.role === "recruiter" || body.role === "admin") && !isAdmin) {
      return new Response(
        JSON.stringify({ error: `Only admins can create ${body.role} accounts` }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (body.role === "candidate" && !isAdmin && !isRecruiter) {
      return new Response(
        JSON.stringify({ error: "Only admins or recruiters can create candidate accounts" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    const { error: userError } = await adminClient.from("users").insert({
      user_id: newUserId,
      email: body.email,
      full_name: body.full_name,
      phone: body.phone || null,
    });

    if (userError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: `Failed to create user profile: ${userError.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

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
