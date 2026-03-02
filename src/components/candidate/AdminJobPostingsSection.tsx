import { MapPin, Briefcase, Monitor, ExternalLink, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface AdminJobPosting {
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
  contract_type: string | null;
  work_type: string | null;
  experience_level: string | null;
  salary_range: string | null;
  job_description: string;
  job_apply_url: string;
  scraped_at: string;
}

interface AdminJobPostingsSectionProps {
  jobs: AdminJobPosting[];
}

const AdminJobPostingsSection = ({ jobs }: AdminJobPostingsSectionProps) => {
  if (jobs.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 font-display">Job Postings</h3>
            <p className="text-sm text-muted-foreground">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted by the platform</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {jobs.map((job) => (
          <div key={job.job_id} className="p-5 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-secondary-900">{job.job_title}</h4>
                <p className="text-xs font-medium text-primary-600 flex items-center gap-1 mt-1">
                  <Building className="w-3 h-3" /> {job.company_name}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                  {job.contract_type && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.contract_type}</span>}
                  {job.work_type && <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {job.work_type}</span>}
                  {job.salary_range && <span className="text-emerald-600 font-semibold">{job.salary_range}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDistanceToNow(new Date(job.scraped_at), { addSuffix: true })}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 max-w-xl">{job.job_description}</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => window.open(job.job_apply_url, "_blank")}>
                <ExternalLink className="w-3.5 h-3.5" /> Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminJobPostingsSection;
