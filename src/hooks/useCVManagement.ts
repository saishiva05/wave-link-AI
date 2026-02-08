import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

// Mock data for UI development
const mockCandidates: CandidateOption[] = [
  { candidate_id: "c1", user_id: "u1", full_name: "John Smith", email: "john@email.com", cv_count: 3 },
  { candidate_id: "c2", user_id: "u2", full_name: "Jane Doe", email: "jane@email.com", cv_count: 2 },
  { candidate_id: "c3", user_id: "u3", full_name: "Mike Chen", email: "mike@email.com", cv_count: 1 },
  { candidate_id: "c4", user_id: "u4", full_name: "Sarah Kim", email: "sarah@email.com", cv_count: 4 },
  { candidate_id: "c5", user_id: "u5", full_name: "Alex Johnson", email: "alex@email.com", cv_count: 0 },
];

const mockJobs: JobOption[] = [
  { job_id: "j1", job_title: "Senior React Developer", company_name: "TechCorp", location: "San Francisco, CA" },
  { job_id: "j2", job_title: "Full Stack Engineer", company_name: "StartupXYZ", location: "Remote" },
  { job_id: "j3", job_title: "Frontend Architect", company_name: "BigCo", location: "New York, NY" },
  { job_id: "j4", job_title: "UI/UX Developer", company_name: "DesignHub", location: "London, UK" },
  { job_id: "j5", job_title: "Software Engineer II", company_name: "CloudBase", location: "Austin, TX" },
];

const mockCVs: CVFile[] = [
  { cv_id: "cv1", candidate_id: "c1", recruiter_id: "r1", file_name: "john_smith_resume_v2.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 1258000, is_primary: true, uploaded_at: "2026-02-03T10:00:00Z", last_used_for_ats_at: "2026-02-06T14:30:00Z", candidate_name: "John Smith", candidate_email: "john@email.com", ats_usage_count: 3 },
  { cv_id: "cv2", candidate_id: "c1", recruiter_id: "r1", file_name: "john_smith_resume.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 980000, is_primary: false, uploaded_at: "2026-01-20T08:00:00Z", last_used_for_ats_at: "2026-01-25T11:00:00Z", candidate_name: "John Smith", candidate_email: "john@email.com", ats_usage_count: 1 },
  { cv_id: "cv3", candidate_id: "c1", recruiter_id: "r1", file_name: "john_smith_cover_letter.docx", file_url: "#", file_type: "docx", file_size_bytes: 540000, is_primary: false, uploaded_at: "2026-01-10T12:00:00Z", last_used_for_ats_at: null, candidate_name: "John Smith", candidate_email: "john@email.com", ats_usage_count: 0 },
  { cv_id: "cv4", candidate_id: "c2", recruiter_id: "r1", file_name: "jane_doe_cv.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 1500000, is_primary: true, uploaded_at: "2026-02-01T09:00:00Z", last_used_for_ats_at: "2026-02-05T16:00:00Z", candidate_name: "Jane Doe", candidate_email: "jane@email.com", ats_usage_count: 5 },
  { cv_id: "cv5", candidate_id: "c2", recruiter_id: "r1", file_name: "jane_doe_cv_old.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 1100000, is_primary: false, uploaded_at: "2026-01-05T14:00:00Z", last_used_for_ats_at: null, candidate_name: "Jane Doe", candidate_email: "jane@email.com", ats_usage_count: 0 },
  { cv_id: "cv6", candidate_id: "c3", recruiter_id: "r1", file_name: "mike_chen_resume.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 890000, is_primary: true, uploaded_at: "2026-02-05T16:00:00Z", last_used_for_ats_at: "2026-02-06T09:00:00Z", candidate_name: "Mike Chen", candidate_email: "mike@email.com", ats_usage_count: 2 },
  { cv_id: "cv7", candidate_id: "c4", recruiter_id: "r1", file_name: "sarah_kim_resume.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 1300000, is_primary: true, uploaded_at: "2026-02-07T08:00:00Z", last_used_for_ats_at: null, candidate_name: "Sarah Kim", candidate_email: "sarah@email.com", ats_usage_count: 0 },
  { cv_id: "cv8", candidate_id: "c4", recruiter_id: "r1", file_name: "sarah_kim_portfolio.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 4200000, is_primary: false, uploaded_at: "2026-02-01T11:00:00Z", last_used_for_ats_at: "2026-02-04T10:00:00Z", candidate_name: "Sarah Kim", candidate_email: "sarah@email.com", ats_usage_count: 1 },
  { cv_id: "cv9", candidate_id: "c4", recruiter_id: "r1", file_name: "sarah_kim_cover.docx", file_url: "#", file_type: "docx", file_size_bytes: 420000, is_primary: false, uploaded_at: "2026-01-25T13:00:00Z", last_used_for_ats_at: null, candidate_name: "Sarah Kim", candidate_email: "sarah@email.com", ats_usage_count: 0 },
  { cv_id: "cv10", candidate_id: "c4", recruiter_id: "r1", file_name: "sarah_kim_old_cv.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 1000000, is_primary: false, uploaded_at: "2025-12-10T10:00:00Z", last_used_for_ats_at: null, candidate_name: "Sarah Kim", candidate_email: "sarah@email.com", ats_usage_count: 0 },
];

export type ViewMode = "grid" | "list";
export type DateFilter = "" | "today" | "7d" | "30d" | "month" | "lastmonth";
export type PrimaryFilter = "" | "primary" | "non-primary";

export function useCVManagement() {
  const { toast } = useToast();

  // Data
  const [cvs] = useState<CVFile[]>(mockCVs);
  const [candidates] = useState<CandidateOption[]>(mockCandidates);
  const [jobs] = useState<JobOption[]>(mockJobs);
  const [isLoading] = useState(false);

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
    const totalCVs = cvs.length;
    const candidatesWithCVs = new Set(cvs.map((cv) => cv.candidate_id)).size;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const uploadedThisWeek = cvs.filter((cv) => new Date(cv.uploaded_at) >= weekAgo).length;
    const totalBytes = cvs.reduce((sum, cv) => sum + (cv.file_size_bytes || 0), 0);
    const storageMB = Math.round(totalBytes / (1024 * 1024) * 10) / 10;
    const storageGB = 10; // Plan limit
    const storagePercent = Math.round((storageMB / (storageGB * 1024)) * 10000) / 100;
    return { totalCVs, candidatesWithCVs, uploadedThisWeek, storageMB, storageGB, storagePercent };
  }, [cvs]);

  // Filtered CVs
  const filteredCVs = useMemo(() => {
    let result = [...cvs];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (cv) =>
          cv.candidate_name.toLowerCase().includes(q) ||
          cv.file_name.toLowerCase().includes(q) ||
          (cv.file_type && cv.file_type.toLowerCase().includes(q))
      );
    }

    if (candidateFilter) {
      result = result.filter((cv) => cv.candidate_id === candidateFilter);
    }

    if (fileTypeFilter) {
      result = result.filter((cv) => cv.file_type === fileTypeFilter);
    }

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

    if (primaryFilter === "primary") {
      result = result.filter((cv) => cv.is_primary);
    } else if (primaryFilter === "non-primary") {
      result = result.filter((cv) => !cv.is_primary);
    }

    // Sort by upload date desc
    result.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    return result;
  }, [cvs, search, candidateFilter, fileTypeFilter, dateFilter, primaryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCVs.length / perPage);
  const paginatedCVs = filteredCVs.slice((page - 1) * perPage, page * perPage);

  // Active filters
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (candidateFilter) {
    const c = candidates.find((c) => c.candidate_id === candidateFilter);
    activeFilters.push({ label: `Candidate: ${c?.full_name || candidateFilter}`, onRemove: () => { setCandidateFilter(""); setPage(1); } });
  }
  if (fileTypeFilter) {
    activeFilters.push({ label: `Type: ${fileTypeFilter.toUpperCase()}`, onRemove: () => { setFileTypeFilter(""); setPage(1); } });
  }
  if (dateFilter) {
    const labels: Record<string, string> = { today: "Today", "7d": "Last 7 Days", "30d": "Last 30 Days", month: "This Month", lastmonth: "Last Month" };
    activeFilters.push({ label: `Date: ${labels[dateFilter]}`, onRemove: () => { setDateFilter(""); setPage(1); } });
  }
  if (primaryFilter) {
    activeFilters.push({ label: primaryFilter === "primary" ? "Primary CVs Only" : "Non-Primary CVs", onRemove: () => { setPrimaryFilter(""); setPage(1); } });
  }

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setCandidateFilter("");
    setFileTypeFilter("");
    setDateFilter("");
    setPrimaryFilter("");
    setPage(1);
  }, []);

  // Selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === paginatedCVs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedCVs.map((cv) => cv.cv_id)));
    }
  }, [selectedIds.size, paginatedCVs]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Actions
  const handleDelete = useCallback(async (cvId: string) => {
    toast({ title: "CV Deleted", description: "The CV has been removed successfully." });
  }, [toast]);

  const handleSetPrimary = useCallback(async (cvId: string) => {
    toast({ title: "Primary CV Updated", description: "The primary CV has been updated." });
  }, [toast]);

  const handleDownload = useCallback((cv: CVFile) => {
    toast({ title: "Downloading...", description: `Downloading ${cv.file_name}` });
  }, [toast]);

  return {
    // Data
    cvs: paginatedCVs,
    allFilteredCVs: filteredCVs,
    candidates,
    jobs,
    isLoading,
    stats,

    // Filters
    search, setSearch,
    candidateFilter, setCandidateFilter,
    fileTypeFilter, setFileTypeFilter,
    dateFilter, setDateFilter,
    primaryFilter, setPrimaryFilter,
    activeFilters,
    clearAllFilters,

    // View & pagination
    viewMode, setViewMode,
    page, setPage,
    perPage, setPerPage,
    totalPages,

    // Selection
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,

    // Actions
    handleDelete,
    handleSetPrimary,
    handleDownload,
  };
}
