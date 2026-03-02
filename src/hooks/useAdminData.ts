import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [recruiters, candidates, jobs, activeJobs] = await Promise.all([
        supabase.from("recruiters").select("recruiter_id", { count: "exact", head: true }),
        supabase.from("candidates").select("candidate_id", { count: "exact", head: true }),
        supabase.from("scraped_jobs").select("job_id", { count: "exact", head: true }),
        supabase.from("job_applications").select("application_id", { count: "exact", head: true }),
      ]);

      // Counts this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const monthStr = startOfMonth.toISOString();

      const [recruitersThisMonth, candidatesThisWeek, jobsToday] = await Promise.all([
        supabase.from("recruiters").select("recruiter_id", { count: "exact", head: true }).gte("created_at", monthStr),
        supabase.from("candidates").select("candidate_id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from("scraped_jobs").select("job_id", { count: "exact", head: true }).gte("scraped_at", new Date().toISOString().split("T")[0]),
      ]);

      return {
        totalRecruiters: recruiters.count || 0,
        totalCandidates: candidates.count || 0,
        totalJobs: jobs.count || 0,
        totalApplications: activeJobs.count || 0,
        recruitersThisMonth: recruitersThisMonth.count || 0,
        candidatesThisWeek: candidatesThisWeek.count || 0,
        jobsToday: jobsToday.count || 0,
      };
    },
  });
}

export function useAdminRecruiters(page: number, perPage: number, search?: string) {
  return useQuery({
    queryKey: ["admin", "recruiters", page, perPage, search],
    queryFn: async () => {
      let query = supabase
        .from("recruiters")
        .select(`
          recruiter_id,
          company_name,
          company_website,
          phone,
          total_jobs_scraped,
          total_candidates_managed,
          created_at,
          user_id,
          users!recruiters_user_id_fkey (
            user_id,
            full_name,
            email,
            is_active,
            phone
          )
        `, { count: "exact" });

      if (search) {
        query = query.or(`users.full_name.ilike.%${search}%,users.email.ilike.%${search}%,company_name.ilike.%${search}%`);
      }

      query = query.order("created_at", { ascending: false });
      query = query.range((page - 1) * perPage, page * perPage - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { recruiters: data || [], total: count || 0 };
    },
  });
}

export function useAdminChartData(range: string) {
  return useQuery({
    queryKey: ["admin", "charts", range],
    queryFn: async () => {
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      switch (range) {
        case "7D": startDate = new Date(now.getTime() - 7 * 86400000); break;
        case "3M": startDate = new Date(now.getTime() - 90 * 86400000); break;
        case "1Y": startDate = new Date(now.getTime() - 365 * 86400000); break;
        default: startDate = new Date(now.getTime() - 30 * 86400000); break;
      }

      const [jobsData, platformData, topRecruitersData] = await Promise.all([
        // Jobs by date
        supabase
          .from("scraped_jobs")
          .select("scraped_at")
          .gte("scraped_at", startDate.toISOString())
          .order("scraped_at", { ascending: true }),
        // Jobs by platform
        supabase
          .from("scraped_jobs")
          .select("platform_type"),
        // Top recruiters
        supabase
          .from("recruiters")
          .select(`
            recruiter_id,
            total_jobs_scraped,
            users!recruiters_user_id_fkey (full_name)
          `)
          .order("total_jobs_scraped", { ascending: false })
          .limit(5),
      ]);

      // Aggregate jobs by date
      const jobsByDate: Record<string, number> = {};
      (jobsData.data || []).forEach((j) => {
        const date = new Date(j.scraped_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        jobsByDate[date] = (jobsByDate[date] || 0) + 1;
      });

      const jobsTrendData = Object.entries(jobsByDate).map(([date, jobs]) => ({ date, jobs }));

      // Platform counts
      const linkedin = (platformData.data || []).filter((j) => j.platform_type === "linkedin").length;
      const jsearch = (platformData.data || []).filter((j) => j.platform_type === "jsearch").length;

      // Top recruiters
      const topRecruiters = (topRecruitersData.data || []).map((r: any) => ({
        name: r.users?.full_name || "Unknown",
        jobs: r.total_jobs_scraped,
      }));

      return {
        jobsTrendData,
        platformData: { linkedin, jsearch, total: linkedin + jsearch },
        topRecruiters,
      };
    },
  });
}

export function useAdminRecruiterSessions() {
  return useQuery({
    queryKey: ["admin", "recruiter-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recruiter_sessions")
        .select(`
          session_id,
          recruiter_id,
          user_id,
          logged_in_at,
          logged_out_at,
          recruiters!recruiter_sessions_recruiter_id_fkey (
            users!recruiters_user_id_fkey (full_name, email)
          )
        `)
        .order("logged_in_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by recruiter for summary
      const byRecruiter: Record<string, {
        recruiter_id: string;
        name: string;
        email: string;
        sessions: { logged_in_at: string; logged_out_at: string | null; duration_minutes: number | null }[];
        total_minutes: number;
        last_active: string;
        is_online: boolean;
      }> = {};

      (data || []).forEach((s: any) => {
        const rid = s.recruiter_id;
        if (!byRecruiter[rid]) {
          byRecruiter[rid] = {
            recruiter_id: rid,
            name: s.recruiters?.users?.full_name || "Unknown",
            email: s.recruiters?.users?.email || "",
            sessions: [],
            total_minutes: 0,
            last_active: s.logged_in_at,
            is_online: false,
          };
        }

        const duration = s.logged_out_at
          ? Math.round((new Date(s.logged_out_at).getTime() - new Date(s.logged_in_at).getTime()) / 60000)
          : null;

        byRecruiter[rid].sessions.push({
          logged_in_at: s.logged_in_at,
          logged_out_at: s.logged_out_at,
          duration_minutes: duration,
        });

        if (duration !== null) {
          byRecruiter[rid].total_minutes += duration;
        }

        if (!s.logged_out_at) {
          byRecruiter[rid].is_online = true;
        }
      });

      return Object.values(byRecruiter).sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());
    },
  });
}
