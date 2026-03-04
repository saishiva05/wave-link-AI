// This file now exports only the ScrapedJob interface used across components.
// All mock data has been removed — data comes from Supabase.

export interface ScrapedJob {
  id: string;         // maps to job_id
  job_title: string;
  company_name: string;
  location: string;
  contract_type: string;
  work_type: string;
  experience_level: string;
  platform: string;  // maps to platform_type
  published_date: string;
  job_description: string;
  job_apply_url: string;
  salary_range?: string;
  is_active?: boolean;
  scraped_at?: string;
  applications_count?: number;
}

/** Map a database row to the ScrapedJob UI interface */
export function mapDbJob(row: any): ScrapedJob {
  return {
    id: row.job_id,
    job_title: row.job_title,
    company_name: row.company_name,
    location: row.location,
    contract_type: row.contract_type || "",
    work_type: row.work_type || "",
    experience_level: row.experience_level || "",
    platform: row.platform_type,
    published_date: row.published_date || row.scraped_at,
    job_description: row.job_description,
    job_apply_url: row.job_apply_url,
    salary_range: row.salary_range || undefined,
    is_active: row.is_active,
    scraped_at: row.scraped_at,
    applications_count: row.applications_count ?? 0,
  };
}
