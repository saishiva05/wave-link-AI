import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CVFile {
  cv_id: string;
  candidate_id: string;
  recruiter_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  is_primary: boolean;
  uploaded_at: string;
  last_used_for_ats_at: string | null;
  candidate_name: string;
  candidate_email: string;
  ats_usage_count: number;
}

export interface UpdatedCVFile {
  updated_cv_id: string;
  cv_id: string;
  job_id: string;
  candidate_id: string;
  recruiter_id: string;
  original_file_name: string;
  updated_file_name: string;
  updated_file_url: string;
  updated_file_size_bytes: number | null;
  created_at: string;
  candidate_name: string;
  job_title: string;
  company_name: string;
}

export interface CandidateGroup {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  originalCVs: CVFile[];
  updatedCVs: UpdatedCVFile[];
}

export interface CandidateOption {
  candidate_id: string;
  user_id: string;
  full_name: string;
  email: string;
  cv_count: number;
}

export interface JobOption {
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
}

export type ViewMode = "grid" | "list";
export type DateFilter = "" | "today" | "7d" | "30d" | "month" | "lastmonth";
export type PrimaryFilter = "" | "primary" | "non-primary";

export function useCVManagement() {
  const { toast } = useToast();
  const { recruiterId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch CVs from Supabase
  const { data: rawCVs = [], isLoading: cvsLoading } = useQuery({
    queryKey: ["recruiter", "cvs", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cvs")
        .select(`*, candidates!cvs_candidate_id_fkey ( candidate_id, users!candidates_user_id_fkey ( full_name, email ) )`)
        .eq("recruiter_id", recruiterId!)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;

      const cvIds = (data || []).map((cv) => cv.cv_id);
      let atsUsage: Record<string, number> = {};
      if (cvIds.length > 0) {
        const { data: atsData } = await supabase.from("ats_analyses").select("cv_id").in("cv_id", cvIds);
        (atsData || []).forEach((a) => { atsUsage[a.cv_id] = (atsUsage[a.cv_id] || 0) + 1; });
      }

      return (data || []).map((cv: any): CVFile => ({
        cv_id: cv.cv_id,
        candidate_id: cv.candidate_id,
        recruiter_id: cv.recruiter_id,
        file_name: cv.file_name,
        file_url: cv.file_url,
        file_type: cv.file_type,
        file_size_bytes: cv.file_size_bytes,
        is_primary: cv.is_primary,
        uploaded_at: cv.uploaded_at,
        last_used_for_ats_at: cv.last_used_for_ats_at,
        candidate_name: cv.candidates?.users?.full_name || "Unknown",
        candidate_email: cv.candidates?.users?.email || "",
        ats_usage_count: atsUsage[cv.cv_id] || 0,
      }));
    },
  });

  // Fetch updated CVs
  const { data: rawUpdatedCVs = [], isLoading: updatedCVsLoading } = useQuery({
    queryKey: ["recruiter", "updated-cvs", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("updated_cvs")
        .select(`*, candidates!updated_cvs_candidate_id_fkey ( users!candidates_user_id_fkey ( full_name ) ), scraped_jobs!updated_cvs_job_id_fkey ( job_title, company_name )`)
        .eq("recruiter_id", recruiterId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data || []).map((ucv: any): UpdatedCVFile => ({
        updated_cv_id: ucv.updated_cv_id,
        cv_id: ucv.cv_id,
        job_id: ucv.job_id,
        candidate_id: ucv.candidate_id,
        recruiter_id: ucv.recruiter_id,
        original_file_name: ucv.original_file_name,
        updated_file_name: ucv.updated_file_name,
        updated_file_url: ucv.updated_file_url,
        updated_file_size_bytes: ucv.updated_file_size_bytes,
        created_at: ucv.created_at,
        candidate_name: ucv.candidates?.users?.full_name || "Unknown",
        job_title: ucv.scraped_jobs?.job_title || "Unknown Job",
        company_name: ucv.scraped_jobs?.company_name || "",
      }));
    },
  });

  // Fetch candidates
  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ["recruiter", "candidate-options", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(`candidate_id, user_id, users!candidates_user_id_fkey ( full_name, email )`)
        .eq("assigned_recruiter_id", recruiterId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const candidateIds = (data || []).map((c) => c.candidate_id);
      let cvCounts: Record<string, number> = {};
      if (candidateIds.length > 0) {
        const { data: cvData } = await supabase.from("cvs").select("candidate_id").in("candidate_id", candidateIds);
        (cvData || []).forEach((cv) => { cvCounts[cv.candidate_id] = (cvCounts[cv.candidate_id] || 0) + 1; });
      }

      return (data || []).map((c: any): CandidateOption => ({
        candidate_id: c.candidate_id,
        user_id: c.user_id,
        full_name: c.users?.full_name || "Unknown",
        email: c.users?.email || "",
        cv_count: cvCounts[c.candidate_id] || 0,
      }));
    },
  });

  // Fetch jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ["recruiter", "job-options", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_jobs")
        .select("job_id, job_title, company_name, location")
        .eq("recruiter_id", recruiterId!)
        .order("scraped_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((j): JobOption => ({
        job_id: j.job_id,
        job_title: j.job_title,
        company_name: j.company_name,
        location: j.location,
      }));
    },
  });

  const isLoading = cvsLoading || candidatesLoading || updatedCVsLoading;

  // Filters
  const [search, setSearch] = useState("");
  const [candidateFilter, setCandidateFilter] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("");
  const [primaryFilter, setPrimaryFilter] = useState<PrimaryFilter>("");

  // View & pagination
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Stats
  const stats = useMemo(() => {
    const totalCVs = rawCVs.length;
    const totalUpdatedCVs = rawUpdatedCVs.length;
    const candidatesWithCVs = new Set(rawCVs.map((cv) => cv.candidate_id)).size;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const uploadedThisWeek = rawCVs.filter((cv) => new Date(cv.uploaded_at) >= weekAgo).length;
    const totalBytes = rawCVs.reduce((sum, cv) => sum + (cv.file_size_bytes || 0), 0);
    const storageMB = Math.round(totalBytes / (1024 * 1024) * 10) / 10;
    const storageGB = 10;
    const storagePercent = Math.round((storageMB / (storageGB * 1024)) * 10000) / 100;
    return { totalCVs, totalUpdatedCVs, candidatesWithCVs, uploadedThisWeek, storageMB, storageGB, storagePercent };
  }, [rawCVs, rawUpdatedCVs]);

  // Filtered CVs
  const filteredCVs = useMemo(() => {
    let result = [...rawCVs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((cv) =>
        cv.candidate_name.toLowerCase().includes(q) || cv.file_name.toLowerCase().includes(q) || (cv.file_type && cv.file_type.toLowerCase().includes(q))
      );
    }
    if (candidateFilter) result = result.filter((cv) => cv.candidate_id === candidateFilter);
    if (fileTypeFilter) result = result.filter((cv) => cv.file_type === fileTypeFilter);
    if (dateFilter) {
      const now = new Date();
      result = result.filter((cv) => {
        const d = new Date(cv.uploaded_at);
        if (dateFilter === "today") return d.toDateString() === now.toDateString();
        if (dateFilter === "7d") return now.getTime() - d.getTime() <= 7 * 86400000;
        if (dateFilter === "30d") return now.getTime() - d.getTime() <= 30 * 86400000;
        if (dateFilter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (dateFilter === "lastmonth") {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return d >= lastMonth && d < thisMonth;
        }
        return true;
      });
    }
    if (primaryFilter === "primary") result = result.filter((cv) => cv.is_primary);
    else if (primaryFilter === "non-primary") result = result.filter((cv) => !cv.is_primary);
    result.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
    return result;
  }, [rawCVs, search, candidateFilter, fileTypeFilter, dateFilter, primaryFilter]);

  // Candidate-grouped data
  const candidateGroups = useMemo((): CandidateGroup[] => {
    const candidateIds = new Set<string>();
    filteredCVs.forEach((cv) => candidateIds.add(cv.candidate_id));

    // Also include candidates that have updated CVs matching filter
    let filteredUpdated = [...rawUpdatedCVs];
    if (candidateFilter) filteredUpdated = filteredUpdated.filter((u) => u.candidate_id === candidateFilter);
    if (search) {
      const q = search.toLowerCase();
      filteredUpdated = filteredUpdated.filter((u) =>
        u.candidate_name.toLowerCase().includes(q) || u.original_file_name.toLowerCase().includes(q) || u.updated_file_name.toLowerCase().includes(q)
      );
    }
    filteredUpdated.forEach((u) => candidateIds.add(u.candidate_id));

    const groups: CandidateGroup[] = [];
    candidateIds.forEach((cid) => {
      const cvs = filteredCVs.filter((cv) => cv.candidate_id === cid);
      const ucvs = filteredUpdated.filter((u) => u.candidate_id === cid);
      const name = cvs[0]?.candidate_name || ucvs[0]?.candidate_name || "Unknown";
      const email = cvs[0]?.candidate_email || "";
      groups.push({
        candidate_id: cid,
        candidate_name: name,
        candidate_email: email,
        originalCVs: cvs,
        updatedCVs: ucvs,
      });
    });

    groups.sort((a, b) => a.candidate_name.localeCompare(b.candidate_name));
    return groups;
  }, [filteredCVs, rawUpdatedCVs, candidateFilter, search]);

  // Pagination
  const totalPages = Math.ceil(filteredCVs.length / perPage);
  const paginatedCVs = filteredCVs.slice((page - 1) * perPage, page * perPage);

  // Active filters
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (candidateFilter) {
    const c = candidates.find((c) => c.candidate_id === candidateFilter);
    activeFilters.push({ label: `Candidate: ${c?.full_name || candidateFilter}`, onRemove: () => { setCandidateFilter(""); setPage(1); } });
  }
  if (fileTypeFilter) activeFilters.push({ label: `Type: ${fileTypeFilter.toUpperCase()}`, onRemove: () => { setFileTypeFilter(""); setPage(1); } });
  if (dateFilter) {
    const labels: Record<string, string> = { today: "Today", "7d": "Last 7 Days", "30d": "Last 30 Days", month: "This Month", lastmonth: "Last Month" };
    activeFilters.push({ label: `Date: ${labels[dateFilter]}`, onRemove: () => { setDateFilter(""); setPage(1); } });
  }
  if (primaryFilter) activeFilters.push({ label: primaryFilter === "primary" ? "Primary CVs Only" : "Non-Primary CVs", onRemove: () => { setPrimaryFilter(""); setPage(1); } });

  const clearAllFilters = useCallback(() => {
    setSearch(""); setCandidateFilter(""); setFileTypeFilter(""); setDateFilter(""); setPrimaryFilter(""); setPage(1);
  }, []);

  // Selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === paginatedCVs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginatedCVs.map((cv) => cv.cv_id)));
  }, [selectedIds.size, paginatedCVs]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Delete CV mutation
  const deleteMutation = useMutation({
    mutationFn: async (cvId: string) => {
      const cv = rawCVs.find((c) => c.cv_id === cvId);
      if (cv?.file_url) {
        const urlParts = cv.file_url.split("/cvs-bucket/");
        if (urlParts[1]) {
          await supabase.storage.from("cvs-bucket").remove([urlParts[1]]);
        }
      }
      const { error } = await supabase.from("cvs").delete().eq("cv_id", cvId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "cvs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "candidate-options"] });
      toast({ title: "CV Deleted", description: "The CV has been removed successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to delete CV", variant: "destructive" });
    },
  });

  // Set primary CV mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (cvId: string) => {
      const { error } = await supabase.from("cvs").update({ is_primary: true }).eq("cv_id", cvId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "cvs"] });
      toast({ title: "Primary CV Updated", description: "The primary CV has been updated." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update primary CV", variant: "destructive" });
    },
  });

  const handleDelete = useCallback(async (cvId: string) => { deleteMutation.mutate(cvId); }, [deleteMutation]);
  const handleSetPrimary = useCallback(async (cvId: string) => { setPrimaryMutation.mutate(cvId); }, [setPrimaryMutation]);

  const handleDownload = useCallback(async (cv: CVFile) => {
    try {
      const urlParts = cv.file_url.split("/cvs-bucket/");
      if (urlParts[1]) {
        const { data, error } = await supabase.storage.from("cvs-bucket").download(urlParts[1]);
        if (error) throw error;
        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = cv.file_name;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        window.open(cv.file_url, "_blank");
      }
    } catch {
      toast({ title: "Download failed", description: "Could not download the file.", variant: "destructive" });
    }
  }, [toast]);

  const handleDownloadUpdated = useCallback((url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.target = "_blank";
    a.click();
  }, []);

  return {
    cvs: paginatedCVs, allFilteredCVs: filteredCVs, candidates, jobs, isLoading, stats,
    rawUpdatedCVs, candidateGroups,
    search, setSearch, candidateFilter, setCandidateFilter, fileTypeFilter, setFileTypeFilter,
    dateFilter, setDateFilter, primaryFilter, setPrimaryFilter, activeFilters, clearAllFilters,
    viewMode, setViewMode, page, setPage, perPage, setPerPage, totalPages,
    selectedIds, toggleSelect, selectAll, clearSelection,
    handleDelete, handleSetPrimary, handleDownload, handleDownloadUpdated,
  };
}
