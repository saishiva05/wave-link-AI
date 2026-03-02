import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useRecruiterStats() {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "stats", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const [jobs, candidates, applications, ats] = await Promise.all([
        supabase.from("scraped_jobs").select("job_id", { count: "exact", head: true }).eq("recruiter_id", recruiterId!),
        supabase.from("candidates").select("candidate_id", { count: "exact", head: true }).eq("assigned_recruiter_id", recruiterId!),
        supabase.from("job_applications").select("application_id", { count: "exact", head: true }).eq("recruiter_id", recruiterId!),
        supabase.from("ats_analyses").select("ats_score", { count: "exact" }).eq("recruiter_id", recruiterId!),
      ]);

      const atsData = ats.data || [];
      const highScoreCount = atsData.filter((a) => a.ats_score > 70).length;
      const successRate = atsData.length > 0 ? Math.round((highScoreCount / atsData.length) * 100) : 0;

      return {
        totalJobs: jobs.count || 0,
        totalCandidates: candidates.count || 0,
        totalApplications: applications.count || 0,
        totalATS: ats.count || 0,
        atsSuccessRate: successRate,
      };
    },
  });
}

export function useRecruiterPlatformBreakdown() {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "platform-breakdown", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data } = await supabase
        .from("scraped_jobs")
        .select("platform_type, scraped_at")
        .eq("recruiter_id", recruiterId!);

      const jobs = data || [];
      const linkedin = jobs.filter((j) => j.platform_type === "linkedin");
      const jsearch = jobs.filter((j) => j.platform_type === "jsearch");
      const total = jobs.length;

      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const linkedinRecent = linkedin.filter((j) => new Date(j.scraped_at) >= weekAgo).length;
      const jsearchRecent = jsearch.filter((j) => new Date(j.scraped_at) >= weekAgo).length;

      return {
        linkedin: { count: linkedin.length, percent: total > 0 ? Math.round((linkedin.length / total) * 100) : 0, recent: linkedinRecent },
        jsearch: { count: jsearch.length, percent: total > 0 ? Math.round((jsearch.length / total) * 100) : 0, recent: jsearchRecent },
        total,
      };
    },
  });
}

export function useRecruiterChartData(range: string) {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "charts", recruiterId, range],
    enabled: !!recruiterId,
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      switch (range) {
        case "7D": startDate = new Date(now.getTime() - 7 * 86400000); break;
        case "3M": startDate = new Date(now.getTime() - 90 * 86400000); break;
        case "6M": startDate = new Date(now.getTime() - 180 * 86400000); break;
        case "1Y": startDate = new Date(now.getTime() - 365 * 86400000); break;
        default: startDate = new Date(now.getTime() - 30 * 86400000); break;
      }

      const [jobsData, appsData, topJobsData] = await Promise.all([
        supabase.from("scraped_jobs").select("scraped_at").eq("recruiter_id", recruiterId!).gte("scraped_at", startDate.toISOString()).order("scraped_at"),
        supabase.from("job_applications").select("application_status").eq("recruiter_id", recruiterId!),
        supabase.from("job_applications").select(`job_id, scraped_jobs!job_applications_job_id_fkey (job_title, company_name)`).eq("recruiter_id", recruiterId!),
      ]);

      // Jobs trend
      const jobsByDate: Record<string, number> = {};
      (jobsData.data || []).forEach((j) => {
        const date = new Date(j.scraped_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        jobsByDate[date] = (jobsByDate[date] || 0) + 1;
      });
      const jobsTrendData = Object.entries(jobsByDate).map(([date, jobs]) => ({ date, jobs }));

      // Application status breakdown
      const statusCounts: Record<string, number> = {};
      (appsData.data || []).forEach((a) => {
        statusCounts[a.application_status] = (statusCounts[a.application_status] || 0) + 1;
      });

      const statusColors: Record<string, string> = {
        pending: "hsl(38, 92%, 50%)",
        submitted: "hsl(210, 70%, 50%)",
        interview_scheduled: "hsl(174, 72%, 33%)",
        interviewed: "hsl(174, 65%, 42%)",
        offer_received: "hsl(142, 71%, 45%)",
        hired: "hsl(142, 60%, 38%)",
        rejected: "hsl(0, 84%, 60%)",
        declined: "hsl(0, 65%, 50%)",
      };

      const statusLabels: Record<string, string> = {
        pending: "Pending",
        submitted: "Submitted",
        interview_scheduled: "Interview",
        interviewed: "Interviewed",
        offer_received: "Offer",
        hired: "Hired",
        rejected: "Rejected",
        declined: "Declined",
      };

      const applicationStatusData = Object.entries(statusCounts).map(([status, value]) => ({
        name: statusLabels[status] || status,
        value,
        color: statusColors[status] || "hsl(215, 10%, 55%)",
      }));

      // Top jobs by applications
      const jobCounts: Record<string, { title: string; company: string; count: number }> = {};
      (topJobsData.data || []).forEach((a: any) => {
        const jobId = a.job_id;
        if (!jobCounts[jobId]) {
          jobCounts[jobId] = {
            title: a.scraped_jobs?.job_title || "Unknown",
            company: a.scraped_jobs?.company_name || "Unknown",
            count: 0,
          };
        }
        jobCounts[jobId].count++;
      });

      const topJobs = Object.values(jobCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((j) => ({ title: j.title, company: j.company, applications: j.count }));

      return { jobsTrendData, applicationStatusData, topJobs };
    },
  });
}

export function useRecruiterActivity() {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "activity", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const [recentJobs, recentApps, recentATS, recentCVs] = await Promise.all([
        supabase.from("scraped_jobs").select("job_id, job_title, platform_type, scraped_at").eq("recruiter_id", recruiterId!).order("scraped_at", { ascending: false }).limit(5),
        supabase.from("job_applications").select(`application_id, applied_at, scraped_jobs!job_applications_job_id_fkey (job_title, company_name), candidates!job_applications_candidate_id_fkey (users!candidates_user_id_fkey (full_name))`).eq("recruiter_id", recruiterId!).order("applied_at", { ascending: false }).limit(5),
        supabase.from("ats_analyses").select(`analysis_id, ats_score, analyzed_at, scraped_jobs!ats_analyses_job_id_fkey (job_title, company_name), cvs!ats_analyses_cv_id_fkey (candidates!cvs_candidate_id_fkey (users!candidates_user_id_fkey (full_name)))`).eq("recruiter_id", recruiterId!).order("analyzed_at", { ascending: false }).limit(5),
        supabase.from("cvs").select(`cv_id, file_name, uploaded_at, candidates!cvs_candidate_id_fkey (users!candidates_user_id_fkey (full_name))`).eq("recruiter_id", recruiterId!).order("uploaded_at", { ascending: false }).limit(5),
      ]);

      type ActivityItem = {
        id: string;
        type: "scrape" | "application" | "ats" | "cv";
        title: string;
        meta: string[];
        badge?: { text: string; variant: "success" | "warning" | "info" };
        time: string;
        timestamp: number;
      };

      const activities: ActivityItem[] = [];

      (recentJobs.data || []).forEach((j) => {
        activities.push({
          id: `scrape-${j.job_id}`,
          type: "scrape",
          title: `Job scraped: ${j.job_title}`,
          meta: [new Date(j.scraped_at).toLocaleDateString(), j.platform_type === "linkedin" ? "LinkedIn" : "JSearch"],
          time: j.scraped_at,
          timestamp: new Date(j.scraped_at).getTime(),
        });
      });

      (recentApps.data || []).forEach((a: any) => {
        activities.push({
          id: `app-${a.application_id}`,
          type: "application",
          title: `Application submitted for ${a.candidates?.users?.full_name || "Unknown"} - ${a.scraped_jobs?.job_title || "Unknown"} at ${a.scraped_jobs?.company_name || "Unknown"}`,
          meta: [new Date(a.applied_at).toLocaleDateString()],
          time: a.applied_at,
          timestamp: new Date(a.applied_at).getTime(),
        });
      });

      (recentATS.data || []).forEach((a: any) => {
        const score = a.ats_score;
        activities.push({
          id: `ats-${a.analysis_id}`,
          type: "ats",
          title: `ATS analysis: ${a.scraped_jobs?.job_title || "Unknown"} at ${a.scraped_jobs?.company_name || "Unknown"}`,
          meta: [new Date(a.analyzed_at).toLocaleDateString(), `Score: ${score}%`, `Candidate: ${a.cvs?.candidates?.users?.full_name || "Unknown"}`],
          badge: score >= 70 ? { text: "High Match", variant: "success" as const } : score >= 50 ? { text: "Medium Match", variant: "warning" as const } : { text: "Low Match", variant: "info" as const },
          time: a.analyzed_at,
          timestamp: new Date(a.analyzed_at).getTime(),
        });
      });

      (recentCVs.data || []).forEach((c: any) => {
        activities.push({
          id: `cv-${c.cv_id}`,
          type: "cv",
          title: `CV uploaded for ${c.candidates?.users?.full_name || "Unknown"}`,
          meta: [new Date(c.uploaded_at).toLocaleDateString(), `File: ${c.file_name}`],
          time: c.uploaded_at,
          timestamp: new Date(c.uploaded_at).getTime(),
        });
      });

      activities.sort((a, b) => b.timestamp - a.timestamp);
      return activities;
    },
  });
}

export function useScrapedJobs(recruiterId: string | null, filters: {
  search: string;
  platform: string;
  contractType: string[];
  workMode: string;
  dateRange: string;
  sortField: string;
  sortDir: "asc" | "desc";
  page: number;
  perPage: number;
}) {
  return useQuery({
    queryKey: ["recruiter", "scraped-jobs", recruiterId, filters],
    enabled: !!recruiterId,
    queryFn: async () => {
      let query = supabase
        .from("scraped_jobs")
        .select("*", { count: "exact" })
        .eq("recruiter_id", recruiterId!);

      if (filters.search) {
        query = query.or(`job_title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }
      if (filters.platform) {
        query = query.eq("platform_type", filters.platform as "linkedin" | "jsearch");
      }
      if (filters.contractType.length > 0) {
        query = query.in("contract_type", filters.contractType);
      }
      if (filters.workMode) {
        query = query.eq("work_type", filters.workMode);
      }
      if (filters.dateRange) {
        const now = new Date();
        let startDate: Date;
        if (filters.dateRange === "today") startDate = new Date(now.toISOString().split("T")[0]);
        else if (filters.dateRange === "7d") startDate = new Date(now.getTime() - 7 * 86400000);
        else if (filters.dateRange === "30d") startDate = new Date(now.getTime() - 30 * 86400000);
        else startDate = new Date(0);
        query = query.gte("scraped_at", startDate.toISOString());
      }

      const ascending = filters.sortDir === "asc";
      if (filters.sortField === "published_date") {
        query = query.order("published_date", { ascending, nullsFirst: false });
      } else {
        query = query.order(filters.sortField as any, { ascending });
      }

      query = query.range((filters.page - 1) * filters.perPage, filters.page * filters.perPage - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { jobs: data || [], total: count || 0 };
    },
  });
}

export function useRecruiterCandidates() {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "candidates", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          candidate_id,
          user_id,
          current_job_title,
          current_location,
          experience_years,
          skills,
          phone,
          created_at,
          users!candidates_user_id_fkey (
            full_name,
            email,
            is_active
          )
        `)
        .eq("assigned_recruiter_id", recruiterId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useRecruiterApplications() {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "applications", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          scraped_jobs!job_applications_job_id_fkey (
            job_title,
            company_name,
            location,
            contract_type,
            work_type,
            platform_type,
            job_apply_url
          ),
          candidates!job_applications_candidate_id_fkey (
            users!candidates_user_id_fkey (
              full_name,
              email
            )
          ),
          cvs!job_applications_cv_id_fkey (
            file_name,
            file_url
          )
        `)
        .eq("recruiter_id", recruiterId!)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useRecruiterCVs() {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "cvs", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cvs")
        .select(`
          *,
          candidates!cvs_candidate_id_fkey (
            candidate_id,
            users!candidates_user_id_fkey (
              full_name,
              email
            )
          )
        `)
        .eq("recruiter_id", recruiterId!)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      // Get ATS usage counts
      const cvIds = (data || []).map((cv) => cv.cv_id);
      let atsUsage: Record<string, number> = {};
      if (cvIds.length > 0) {
        const { data: atsData } = await supabase
          .from("ats_analyses")
          .select("cv_id")
          .in("cv_id", cvIds);
        (atsData || []).forEach((a) => {
          atsUsage[a.cv_id] = (atsUsage[a.cv_id] || 0) + 1;
        });
      }

      return (data || []).map((cv: any) => ({
        ...cv,
        candidate_name: cv.candidates?.users?.full_name || "Unknown",
        candidate_email: cv.candidates?.users?.email || "",
        ats_usage_count: atsUsage[cv.cv_id] || 0,
      }));
    },
  });
}

export function useJobATSAnalyses(jobIds: string[]) {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "job-ats-analyses", recruiterId, jobIds],
    enabled: !!recruiterId && jobIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ats_analyses")
        .select(`
          analysis_id,
          job_id,
          cv_id,
          ats_score,
          analysis_result,
          analyzed_at,
          cvs!ats_analyses_cv_id_fkey (
            file_name,
            candidates!cvs_candidate_id_fkey (
              users!candidates_user_id_fkey (
                full_name
              )
            )
          )
        `)
        .eq("recruiter_id", recruiterId!)
        .in("job_id", jobIds)
        .order("analyzed_at", { ascending: false });

      if (error) throw error;

      // Group by job_id - keep ALL analyses per job (multiple candidates)
      const byJob: Record<string, any[]> = {};
      (data || []).forEach((a: any) => {
        if (!byJob[a.job_id]) byJob[a.job_id] = [];
        byJob[a.job_id].push({
          analysis_id: a.analysis_id,
          job_id: a.job_id,
          cv_id: a.cv_id,
          ats_score: a.ats_score,
          analysis_result: a.analysis_result,
          analyzed_at: a.analyzed_at,
          candidate_name: a.cvs?.candidates?.users?.full_name || "Unknown",
          cv_file_name: a.cvs?.file_name || "Unknown",
        });
      });

      return byJob;
    },
  });
}

export function useJobUpdatedCVs(jobIds: string[]) {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "job-updated-cvs", recruiterId, jobIds],
    enabled: !!recruiterId && jobIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("updated_cvs")
        .select(`
          updated_cv_id,
          job_id,
          cv_id,
          candidate_id,
          original_file_name,
          updated_file_name,
          updated_file_url,
          updated_file_size_bytes,
          created_at,
          candidates!updated_cvs_candidate_id_fkey (
            users!candidates_user_id_fkey (
              full_name
            )
          )
        `)
        .eq("recruiter_id", recruiterId!)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by job_id - multiple updated CVs per job (different candidates)
      const byJob: Record<string, any[]> = {};
      (data || []).forEach((ucv: any) => {
        if (!byJob[ucv.job_id]) byJob[ucv.job_id] = [];
        byJob[ucv.job_id].push({
          ...ucv,
          candidate_name: ucv.candidates?.users?.full_name || "Unknown",
        });
      });

      return byJob;
    },
  });
}

export function useJobGeneratedEmails(jobIds: string[]) {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "job-generated-emails", recruiterId, jobIds],
    enabled: !!recruiterId && jobIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_emails")
        .select("email_id, job_id, subject, body, created_at")
        .eq("recruiter_id", recruiterId!)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by job_id
      const byJob: Record<string, any[]> = {};
      (data || []).forEach((e: any) => {
        if (!byJob[e.job_id]) byJob[e.job_id] = [];
        byJob[e.job_id].push(e);
      });

      return byJob;
    },
  });
}

export function useJobApplicationsMap(jobIds: string[]) {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "job-applications-map", recruiterId, jobIds],
    enabled: !!recruiterId && jobIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          application_id,
          job_id,
          candidate_id,
          cv_id,
          application_status,
          applied_at,
          candidates!job_applications_candidate_id_fkey (
            users!candidates_user_id_fkey (
              full_name
            )
          )
        `)
        .eq("recruiter_id", recruiterId!)
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false });

      if (error) throw error;

      const byJob: Record<string, any[]> = {};
      (data || []).forEach((a: any) => {
        if (!byJob[a.job_id]) byJob[a.job_id] = [];
        byJob[a.job_id].push({
          ...a,
          candidate_name: a.candidates?.users?.full_name || "Unknown",
        });
      });
      return byJob;
    },
  });
}

export function useScrapeHistory() {
  const { recruiterId } = useAuth();

  return useQuery({
    queryKey: ["recruiter", "scrape-history", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_jobs")
        .select("job_id, job_title, platform_type, location, scraped_at, scrape_filters_used")
        .eq("recruiter_id", recruiterId!)
        .order("scraped_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Group by scrape session (same timestamp within 1 minute)
      const sessions: { platform: string; jobTitle: string; location: string; jobCount: number; time: string }[] = [];
      const grouped: Record<string, any[]> = {};

      (data || []).forEach((job) => {
        // Round to nearest minute for grouping
        const key = new Date(job.scraped_at).toISOString().slice(0, 16);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(job);
      });

      Object.values(grouped).forEach((jobs) => {
        const first = jobs[0];
        sessions.push({
          platform: first.platform_type,
          jobTitle: (first.scrape_filters_used as any)?.["Job Title"] || first.job_title,
          location: (first.scrape_filters_used as any)?.["Job Location"] || first.location,
          jobCount: jobs.length,
          time: first.scraped_at,
        });
      });

      return sessions.slice(0, 10);
    },
  });
}
