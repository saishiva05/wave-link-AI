import { useState, useMemo } from "react";

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

const mockApplications: CandidateApplication[] = [
  {
    application_id: "a1", job_id: "j1", job_title: "Senior Frontend Developer", company_name: "TechCorp Inc.",
    location: "Hyderabad, India", contract_type: "Full-time", work_type: "Hybrid", experience_level: "Senior",
    job_description: "We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining our web applications using React, TypeScript, and modern frontend technologies.\n\nRequirements:\n- 5+ years of frontend development experience\n- Strong proficiency in React and TypeScript\n- Experience with state management (Redux, Zustand)\n- Knowledge of modern CSS frameworks\n- Experience with testing frameworks",
    job_apply_url: "https://linkedin.com/jobs/123", application_status: "interview_scheduled", applied_at: "2026-01-28T10:00:00Z", status_updated_at: "2026-02-03T14:00:00Z",
    cv_file_name: "john_smith_resume_v2.pdf", cv_id: "cv1", recruiter_notes: "Interview scheduled for Feb 15 at 2:00 PM", platform_type: "linkedin",
    timeline: [
      { status: "Interview Scheduled", date: "2026-02-03T14:00:00Z", notes: "Interview scheduled for Feb 15 at 2:00 PM" },
      { status: "In Review", date: "2026-02-01T09:00:00Z" },
      { status: "Application Submitted", date: "2026-01-28T10:00:00Z" },
    ],
  },
  {
    application_id: "a2", job_id: "j2", job_title: "Full Stack Engineer", company_name: "StartupXYZ",
    location: "Remote", contract_type: "Full-time", work_type: "Remote", experience_level: "Mid-Senior",
    job_description: "Join our fast-paced startup as a Full Stack Engineer...",
    job_apply_url: "https://jsearch.com/jobs/456", application_status: "submitted", applied_at: "2026-02-01T08:00:00Z", status_updated_at: "2026-02-01T08:00:00Z",
    cv_file_name: "john_smith_resume_v2.pdf", cv_id: "cv1", recruiter_notes: null, platform_type: "jsearch",
    timeline: [{ status: "Application Submitted", date: "2026-02-01T08:00:00Z" }],
  },
  {
    application_id: "a3", job_id: "j3", job_title: "React Developer", company_name: "BigCo Solutions",
    location: "Bangalore, India", contract_type: "Full-time", work_type: "On-site", experience_level: "Senior",
    job_description: "BigCo Solutions is hiring a React Developer...",
    job_apply_url: "https://linkedin.com/jobs/789", application_status: "offer_received", applied_at: "2026-01-15T12:00:00Z", status_updated_at: "2026-02-08T10:00:00Z",
    cv_file_name: "john_smith_resume.pdf", cv_id: "cv2", recruiter_notes: "Offer: ₹25 LPA", platform_type: "linkedin",
    timeline: [
      { status: "Offer Received", date: "2026-02-08T10:00:00Z", notes: "Offer: ₹25 LPA" },
      { status: "Interview Completed", date: "2026-02-05T16:00:00Z" },
      { status: "Interview Scheduled", date: "2026-02-01T09:00:00Z", notes: "Technical round on Feb 5" },
      { status: "In Review", date: "2026-01-20T11:00:00Z" },
      { status: "Application Submitted", date: "2026-01-15T12:00:00Z" },
    ],
  },
  {
    application_id: "a4", job_id: "j4", job_title: "UI/UX Developer", company_name: "DesignHub",
    location: "London, UK", contract_type: "Contract", work_type: "Remote", experience_level: "Mid",
    job_description: "DesignHub is seeking a UI/UX Developer...",
    job_apply_url: "https://jsearch.com/jobs/101", application_status: "rejected", applied_at: "2026-01-10T14:00:00Z", status_updated_at: "2026-01-25T09:00:00Z",
    cv_file_name: "john_smith_resume_v2.pdf", cv_id: "cv1", recruiter_notes: "Position filled internally", platform_type: "jsearch",
    timeline: [
      { status: "Rejected", date: "2026-01-25T09:00:00Z", notes: "Position filled internally" },
      { status: "In Review", date: "2026-01-15T10:00:00Z" },
      { status: "Application Submitted", date: "2026-01-10T14:00:00Z" },
    ],
  },
  {
    application_id: "a5", job_id: "j5", job_title: "Software Engineer II", company_name: "CloudBase",
    location: "Austin, TX", contract_type: "Full-time", work_type: "Hybrid", experience_level: "Mid",
    job_description: "CloudBase is looking for a Software Engineer II...",
    job_apply_url: "https://linkedin.com/jobs/202", application_status: "pending", applied_at: "2026-02-06T09:00:00Z", status_updated_at: "2026-02-06T09:00:00Z",
    cv_file_name: "john_smith_resume_v2.pdf", cv_id: "cv1", recruiter_notes: null, platform_type: "linkedin",
    timeline: [{ status: "Application Submitted", date: "2026-02-06T09:00:00Z" }],
  },
  {
    application_id: "a6", job_id: "j6", job_title: "Frontend Architect", company_name: "MegaTech",
    location: "San Francisco, CA", contract_type: "Full-time", work_type: "On-site", experience_level: "Lead",
    job_description: "MegaTech is looking for a Frontend Architect...",
    job_apply_url: "https://linkedin.com/jobs/303", application_status: "interviewed", applied_at: "2026-01-20T10:00:00Z", status_updated_at: "2026-02-04T15:00:00Z",
    cv_file_name: "john_smith_resume.pdf", cv_id: "cv2", recruiter_notes: "Went well, waiting for feedback", platform_type: "linkedin",
    timeline: [
      { status: "Interview Completed", date: "2026-02-04T15:00:00Z", notes: "Went well, waiting for feedback" },
      { status: "Interview Scheduled", date: "2026-01-28T09:00:00Z" },
      { status: "In Review", date: "2026-01-22T11:00:00Z" },
      { status: "Application Submitted", date: "2026-01-20T10:00:00Z" },
    ],
  },
  {
    application_id: "a7", job_id: "j7", job_title: "TypeScript Developer", company_name: "DevStudio",
    location: "Remote", contract_type: "Part-time", work_type: "Remote", experience_level: "Mid",
    job_description: "DevStudio needs a TypeScript Developer...",
    job_apply_url: "https://jsearch.com/jobs/404", application_status: "hired", applied_at: "2025-12-15T10:00:00Z", status_updated_at: "2026-02-01T10:00:00Z",
    cv_file_name: "john_smith_resume_v2.pdf", cv_id: "cv1", recruiter_notes: "Start date: March 1", platform_type: "jsearch",
    timeline: [
      { status: "Hired", date: "2026-02-01T10:00:00Z", notes: "Start date: March 1" },
      { status: "Offer Received", date: "2026-01-25T14:00:00Z" },
      { status: "Interview Completed", date: "2026-01-18T16:00:00Z" },
      { status: "Interview Scheduled", date: "2026-01-10T09:00:00Z" },
      { status: "In Review", date: "2025-12-20T11:00:00Z" },
      { status: "Application Submitted", date: "2025-12-15T10:00:00Z" },
    ],
  },
  {
    application_id: "a8", job_id: "j8", job_title: "Node.js Backend Developer", company_name: "APIFirst",
    location: "Pune, India", contract_type: "Full-time", work_type: "Hybrid", experience_level: "Senior",
    job_description: "APIFirst is hiring a Node.js Backend Developer...",
    job_apply_url: "https://linkedin.com/jobs/505", application_status: "pending", applied_at: "2026-02-07T16:00:00Z", status_updated_at: "2026-02-07T16:00:00Z",
    cv_file_name: "john_smith_resume_v2.pdf", cv_id: "cv1", recruiter_notes: null, platform_type: "linkedin",
    timeline: [{ status: "Application Submitted", date: "2026-02-07T16:00:00Z" }],
  },
];

const mockCVs: CandidateCV[] = [
  { cv_id: "cv1", file_name: "john_smith_resume_v2.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 1258000, is_primary: true, uploaded_at: "2026-02-03T10:00:00Z" },
  { cv_id: "cv2", file_name: "john_smith_resume.pdf", file_url: "#", file_type: "pdf", file_size_bytes: 980000, is_primary: false, uploaded_at: "2026-01-20T08:00:00Z" },
  { cv_id: "cv3", file_name: "john_smith_cover_letter.docx", file_url: "#", file_type: "docx", file_size_bytes: 540000, is_primary: false, uploaded_at: "2026-01-10T12:00:00Z" },
];

const mockRecruiter: RecruiterInfo = {
  name: "Sarah Johnson",
  email: "sarah@wavelynk.ai",
  company: "Wave Lynk AI",
  phone: "+1 (555) 123-4567",
  total_applications: 45,
};

const mockNotifications: CandidateNotification[] = [
  { id: "n1", type: "status_update", title: "Application status updated", message: "Your application for React Developer at BigCo Solutions received an offer!", time: "2026-02-08T10:00:00Z", read: false },
  { id: "n2", type: "interview", title: "Interview scheduled", message: "Interview for Senior Frontend Developer at TechCorp on Feb 15, 2026 at 2:00 PM", time: "2026-02-03T14:00:00Z", read: false },
  { id: "n3", type: "new_application", title: "New application submitted", message: "Your recruiter applied for Node.js Backend Developer at APIFirst", time: "2026-02-07T16:00:00Z", read: true },
  { id: "n4", type: "status_update", title: "Application rejected", message: "Your application for UI/UX Developer at DesignHub was not selected", time: "2026-01-25T09:00:00Z", read: true },
];

export type StatusFilter = "" | "pending" | "submitted" | "rejected" | "interview_scheduled" | "interviewed" | "offer_received" | "hired" | "declined";
export type DateFilterType = "" | "7d" | "30d" | "month" | "3months";
export type AppViewMode = "list" | "grid";

export function useCandidateDashboard() {
  const [applications] = useState(mockApplications);
  const [cvs] = useState(mockCVs);
  const [recruiter] = useState(mockRecruiter);
  const [notifications, setNotifications] = useState(mockNotifications);

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
    const pending = applications.filter((a) => ["pending", "submitted"].includes(a.application_status)).length;
    const inReview = applications.filter((a) => ["submitted"].includes(a.application_status)).length;
    const interviews = applications.filter((a) => ["interview_scheduled", "interviewed"].includes(a.application_status)).length;
    const offers = applications.filter((a) => ["offer_received", "hired"].includes(a.application_status)).length;
    const rejected = applications.filter((a) => a.application_status === "rejected").length;
    return { total: applications.length, pending, inReview, interviews, offers, rejected };
  }, [applications]);

  const chartData = useMemo(() => [
    { name: "Pending", value: stats.pending, color: "hsl(var(--warning-500))" },
    { name: "In Review", value: stats.inReview, color: "hsl(var(--info-500))" },
    { name: "Interviews", value: stats.interviews, color: "hsl(var(--primary))" },
    { name: "Offers & Hired", value: stats.offers, color: "hsl(var(--success-500))" },
    { name: "Rejected", value: stats.rejected, color: "hsl(var(--error-500))" },
  ], [stats]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];
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
  }, [applications, search, statusFilter, typeFilter, locationFilter, dateFilter]);

  const totalPages = Math.ceil(filteredApplications.length / perPage);
  const paginatedApplications = filteredApplications.slice((page - 1) * perPage, page * perPage);
  const recentApplications = applications.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()).slice(0, 5);

  const uniqueLocations = [...new Set(applications.map((a) => a.location))];

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (statusFilter) activeFilters.push({ label: `Status: ${statusFilter.replace("_", " ")}`, onRemove: () => setStatusFilter("") });
  if (typeFilter) activeFilters.push({ label: `Type: ${typeFilter}`, onRemove: () => setTypeFilter("") });
  if (locationFilter) activeFilters.push({ label: `Location: ${locationFilter}`, onRemove: () => setLocationFilter("") });
  if (dateFilter) {
    const labels: Record<string, string> = { "7d": "Last 7 Days", "30d": "Last 30 Days", month: "This Month", "3months": "Last 3 Months" };
    activeFilters.push({ label: `Date: ${labels[dateFilter]}`, onRemove: () => setDateFilter("") });
  }

  const clearAllFilters = () => { setSearch(""); setStatusFilter(""); setTypeFilter(""); setLocationFilter(""); setDateFilter(""); setPage(1); };
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    applications: paginatedApplications, allFilteredApplications: filteredApplications, recentApplications,
    cvs, recruiter, notifications, unreadCount, markAllRead, stats, chartData,
    search, setSearch, statusFilter, setStatusFilter, dateFilter, setDateFilter,
    typeFilter, setTypeFilter, locationFilter, setLocationFilter, uniqueLocations,
    viewMode, setViewMode, page, setPage, totalPages, perPage,
    activeFilters, clearAllFilters,
  };
}
