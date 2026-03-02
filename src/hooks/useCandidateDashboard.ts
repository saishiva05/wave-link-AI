import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CandidateApplication {
  application_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
  contract_type: string;
  work_type: string;
  experience_level: string;
  job_description: string;
  job_apply_url: string;
  application_status: "pending" | "submitted" | "rejected" | "interview_scheduled" | "interviewed" | "offer_received" | "hired" | "declined";
  applied_at: string;
  status_updated_at: string;
  cv_file_name: string;
  cv_id: string;
  recruiter_notes: string | null;
  platform_type: string;
  recruiter_name: string;
  updated_cv_file_name: string | null;
  updated_cv_file_url: string | null;
  timeline: { status: string; date: string; notes?: string }[];
}

export interface CandidateCV {
  cv_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  is_primary: boolean;
  uploaded_at: string;
}

export interface RecruiterInfo {
  name: string;
  email: string;
  company: string;
  phone: string;
  total_applications: number;
}

export interface CandidateNotification {
  id: string;
  type: "status_update" | "new_application" | "interview";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export type StatusFilter = "" | "pending" | "submitted" | "rejected" | "interview_scheduled" | "interviewed" | "offer_received" | "hired" | "declined";
export type DateFilterType = "" | "7d" | "30d" | "month" | "3months";
export type AppViewMode = "list" | "grid";

export function useCandidateDashboard() {
  const { candidateId } = useAuth();

  // Fetch applications from Supabase
  const { data: rawApplications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["candidate", "applications", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          scraped_jobs!job_applications_job_id_fkey (
            job_title, company_name, location, contract_type, work_type,
            experience_level, job_description, job_apply_url, platform_type
          ),
          cvs!job_applications_cv_id_fkey (
            file_name, cv_id
          ),
          recruiters!job_applications_recruiter_id_fkey (
            users!recruiters_user_id_fkey (full_name)
          )
        `)
        .eq("candidate_id", candidateId!)
        .order("applied_at", { ascending: false });

      // Fetch updated CVs for this candidate's applications
      const jobIds = (data || []).map((a: any) => a.job_id);
      const cvIds = (data || []).map((a: any) => a.cv_id);
      let updatedCVsMap: Record<string, any> = {};
      if (jobIds.length > 0 && cvIds.length > 0) {
        const { data: ucvData } = await supabase
          .from("updated_cvs")
          .select("cv_id, job_id, updated_file_name, updated_file_url")
          .eq("candidate_id", candidateId!)
          .in("job_id", jobIds);
        (ucvData || []).forEach((ucv: any) => {
          updatedCVsMap[`${ucv.job_id}-${ucv.cv_id}`] = ucv;
        });
      }

      if (error) throw error;

      return (data || []).map((a: any): CandidateApplication => {
        const statusLabels: Record<string, string> = {
          pending: "Pending", submitted: "Application Submitted", rejected: "Rejected",
          interview_scheduled: "Interview Scheduled", interviewed: "Interview Completed",
          offer_received: "Offer Received", hired: "Hired", declined: "Declined",
        };

        // Build simple timeline from status
        const timeline: { status: string; date: string; notes?: string }[] = [
          { status: statusLabels[a.application_status] || a.application_status, date: a.status_updated_at, notes: a.recruiter_notes || undefined },
        ];
        if (a.application_status !== "pending" && a.application_status !== "submitted") {
          timeline.push({ status: "Application Submitted", date: a.applied_at });
        }

        const ucvKey = `${a.job_id}-${a.cv_id}`;
        const updatedCV = updatedCVsMap[ucvKey] || null;

        return {
          application_id: a.application_id,
          job_id: a.job_id,
          job_title: a.scraped_jobs?.job_title || "Unknown",
          company_name: a.scraped_jobs?.company_name || "Unknown",
          location: a.scraped_jobs?.location || "",
          contract_type: a.scraped_jobs?.contract_type || "",
          work_type: a.scraped_jobs?.work_type || "",
          experience_level: a.scraped_jobs?.experience_level || "",
          job_description: a.scraped_jobs?.job_description || "",
          job_apply_url: a.scraped_jobs?.job_apply_url || "",
          application_status: a.application_status,
          applied_at: a.applied_at,
          status_updated_at: a.status_updated_at,
          cv_file_name: a.cvs?.file_name || "",
          cv_id: a.cvs?.cv_id || a.cv_id,
          recruiter_notes: a.recruiter_notes,
          platform_type: a.scraped_jobs?.platform_type || "",
          recruiter_name: (a as any).recruiters?.users?.full_name || "Unknown",
          updated_cv_file_name: updatedCV?.updated_file_name || null,
          updated_cv_file_url: updatedCV?.updated_file_url || null,
          timeline,
        };
      });
    },
  });

  // Fetch CVs
  const { data: cvs = [] } = useQuery({
    queryKey: ["candidate", "cvs", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cvs")
        .select("cv_id, file_name, file_url, file_type, file_size_bytes, is_primary, uploaded_at")
        .eq("candidate_id", candidateId!)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((cv: any): CandidateCV => ({
        cv_id: cv.cv_id,
        file_name: cv.file_name,
        file_url: cv.file_url,
        file_type: cv.file_type || "",
        file_size_bytes: cv.file_size_bytes || 0,
        is_primary: cv.is_primary,
        uploaded_at: cv.uploaded_at,
      }));
    },
  });

  // Fetch admin-posted jobs visible to all candidates
  const { data: adminJobPostings = [] } = useQuery({
    queryKey: ["candidate", "admin-job-postings"],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_jobs")
        .select("job_id, job_title, company_name, location, contract_type, work_type, experience_level, salary_range, job_description, job_apply_url, platform_type, scraped_at")
        .eq("is_admin_posting", true)
        .eq("is_active", true)
        .order("scraped_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch assigned recruiter info
  const { data: recruiter } = useQuery({
    queryKey: ["candidate", "recruiter", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data: candData } = await supabase
        .from("candidates")
        .select("assigned_recruiter_id")
        .eq("candidate_id", candidateId!)
        .single();

      if (!candData) return { name: "Unknown", email: "", company: "", phone: "", total_applications: 0 };

      const { data: recData } = await supabase
        .from("recruiters")
        .select("company_name, phone, user_id")
        .eq("recruiter_id", candData.assigned_recruiter_id)
        .single();

      let recruiterUser: any = null;
      if (recData?.user_id) {
        const { data: uData } = await supabase.from("users").select("full_name, email").eq("user_id", recData.user_id).single();
        recruiterUser = uData;
      }

      // Count applications for this candidate
      const { count } = await supabase
        .from("job_applications")
        .select("application_id", { count: "exact", head: true })
        .eq("candidate_id", candidateId!);

      return {
        name: recruiterUser?.full_name || "Unknown",
        email: recruiterUser?.email || "",
        company: recData?.company_name || "",
        phone: recData?.phone || "",
        total_applications: count || 0,
      } as RecruiterInfo;
    },
  });

  const recruiterInfo: RecruiterInfo = recruiter || { name: "Unknown", email: "", company: "", phone: "", total_applications: 0 };

  // Notifications derived from recent status changes
  const notifications = useMemo((): CandidateNotification[] => {
    return rawApplications.slice(0, 5).map((a) => {
      const type: CandidateNotification["type"] =
        a.application_status.includes("interview") ? "interview" :
        a.application_status === "pending" || a.application_status === "submitted" ? "new_application" : "status_update";

      return {
        id: a.application_id,
        type,
        title: type === "interview" ? "Interview scheduled" : type === "new_application" ? "New application submitted" : "Application status updated",
        message: `${a.job_title} at ${a.company_name} — ${a.application_status.replace(/_/g, " ")}`,
        time: a.status_updated_at,
        read: true,
      };
    });
  }, [rawApplications]);

  const [notifState, setNotifState] = useState<Record<string, boolean>>({});
  const unreadCount = notifications.filter((n) => !n.read && !notifState[n.id]).length;
  const markAllRead = () => {
    const map: Record<string, boolean> = {};
    notifications.forEach((n) => { map[n.id] = true; });
    setNotifState(map);
  };

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [viewMode, setViewMode] = useState<AppViewMode>("list");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Stats
  const stats = useMemo(() => {
    const pending = rawApplications.filter((a) => ["pending", "submitted"].includes(a.application_status)).length;
    const inReview = rawApplications.filter((a) => a.application_status === "submitted").length;
    const interviews = rawApplications.filter((a) => ["interview_scheduled", "interviewed"].includes(a.application_status)).length;
    const offers = rawApplications.filter((a) => ["offer_received", "hired"].includes(a.application_status)).length;
    const rejected = rawApplications.filter((a) => a.application_status === "rejected").length;
    return { total: rawApplications.length, pending, inReview, interviews, offers, rejected };
  }, [rawApplications]);

  const chartData = useMemo(() => [
    { name: "Pending", value: stats.pending, color: "hsl(var(--warning-500))" },
    { name: "In Review", value: stats.inReview, color: "hsl(var(--info-500))" },
    { name: "Interviews", value: stats.interviews, color: "hsl(var(--primary))" },
    { name: "Offers & Hired", value: stats.offers, color: "hsl(var(--success-500))" },
    { name: "Rejected", value: stats.rejected, color: "hsl(var(--error-500))" },
  ], [stats]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    let result = [...rawApplications];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.job_title.toLowerCase().includes(q) || a.company_name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter((a) => a.application_status === statusFilter);
    if (typeFilter) result = result.filter((a) => a.contract_type === typeFilter);
    if (locationFilter) result = result.filter((a) => a.location === locationFilter);
    if (dateFilter) {
      const now = new Date();
      result = result.filter((a) => {
        const d = new Date(a.applied_at);
        if (dateFilter === "7d") return now.getTime() - d.getTime() <= 7 * 86400000;
        if (dateFilter === "30d") return now.getTime() - d.getTime() <= 30 * 86400000;
        if (dateFilter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (dateFilter === "3months") return now.getTime() - d.getTime() <= 90 * 86400000;
        return true;
      });
    }
    result.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
    return result;
  }, [rawApplications, search, statusFilter, typeFilter, locationFilter, dateFilter]);

  const totalPages = Math.ceil(filteredApplications.length / perPage);
  const paginatedApplications = filteredApplications.slice((page - 1) * perPage, page * perPage);
  const recentApplications = [...rawApplications].sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()).slice(0, 5);
  const uniqueLocations = [...new Set(rawApplications.map((a) => a.location))].filter(Boolean);

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (statusFilter) activeFilters.push({ label: `Status: ${statusFilter.replace("_", " ")}`, onRemove: () => setStatusFilter("") });
  if (typeFilter) activeFilters.push({ label: `Type: ${typeFilter}`, onRemove: () => setTypeFilter("") });
  if (locationFilter) activeFilters.push({ label: `Location: ${locationFilter}`, onRemove: () => setLocationFilter("") });
  if (dateFilter) {
    const labels: Record<string, string> = { "7d": "Last 7 Days", "30d": "Last 30 Days", month: "This Month", "3months": "Last 3 Months" };
    activeFilters.push({ label: `Date: ${labels[dateFilter]}`, onRemove: () => setDateFilter("") });
  }

  const clearAllFilters = () => { setSearch(""); setStatusFilter(""); setTypeFilter(""); setLocationFilter(""); setDateFilter(""); setPage(1); };

  return {
    applications: paginatedApplications, allFilteredApplications: filteredApplications, recentApplications,
    cvs, recruiter: recruiterInfo, notifications, unreadCount, markAllRead, stats, chartData,
    adminJobPostings,
    search, setSearch, statusFilter, setStatusFilter, dateFilter, setDateFilter,
    typeFilter, setTypeFilter, locationFilter, setLocationFilter, uniqueLocations,
    viewMode, setViewMode, page, setPage, totalPages, perPage,
    activeFilters, clearAllFilters, isLoading: appsLoading,
  };
}
