import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ExportFilters {
  recruiterId: string;
  search: string;
  platform: string;
  contractType: string[];
  workMode: string;
  dateRange: string;
  applicantsRange: string;
}

function escapeCsvField(field: string): string {
  if (!field) return "";
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export async function exportJobsToCSV(filters: ExportFilters): Promise<{ success: boolean; count: number }> {
  let query = supabase
    .from("scraped_jobs")
    .select("*")
    .eq("recruiter_id", filters.recruiterId);

  if (filters.search) {
    query = query.or(
      `job_title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
    );
  }
  if (filters.platform) {
    query = query.eq("platform_type", filters.platform);
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
  if (filters.applicantsRange) {
    if (filters.applicantsRange === "none") {
      query = query.is("applications_count", null);
    } else if (filters.applicantsRange === "has_applicants") {
      query = query.not("applications_count", "is", null);
    }
  }

  query = query.order("scraped_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) return { success: false, count: 0 };

  const headers = [
    "Job Title",
    "Company",
    "Location",
    "Platform",
    "Contract Type",
    "Work Type",
    "Experience Level",
    "Salary Range",
    "Applicants",
    "Published Date",
    "Added Date",
    "Status",
    "Apply URL",
  ];

  const rows = data.map((job) => [
    escapeCsvField(job.job_title),
    escapeCsvField(job.company_name),
    escapeCsvField(job.location),
    job.platform_type === "linkedin" ? "WaveLynk Max" : "WaveLynk Pro",
    escapeCsvField(job.contract_type || "—"),
    escapeCsvField(job.work_type || "—"),
    escapeCsvField(job.experience_level || "—"),
    escapeCsvField(job.salary_range || "—"),
    escapeCsvField(job.applications_count || "—"),
    job.published_date || "—",
    job.scraped_at ? format(new Date(job.scraped_at), "yyyy-MM-dd HH:mm") : "—",
    job.is_active ? "Active" : "Inactive",
    escapeCsvField(job.job_apply_url),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wavelynk-jobs-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, count: data.length };
}
