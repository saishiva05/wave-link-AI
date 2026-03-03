import { Briefcase, MapPin, Building, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface AdminJob {
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
  contract_type: string | null;
  work_type: string | null;
  salary_range: string | null;
  job_apply_url: string;
  scraped_at: string;
}

interface Props {
  jobs: AdminJob[];
}

const RecruiterAdminJobPostingsSection = ({ jobs }: Props) => {
  if (jobs.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground font-display">Admin Job Postings</h3>
          <Badge variant="secondary" className="text-xs">{jobs.length}</Badge>
        </div>
      </div>
      <div className="divide-y divide-border">
        {jobs.map((job) => (
          <div key={job.job_id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-muted/30 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{job.job_title}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Building className="w-3 h-3" />{job.company_name}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                {job.contract_type && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{job.contract_type}</Badge>}
                {job.work_type && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{job.work_type}</Badge>}
                {job.salary_range && <span>{job.salary_range}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(job.scraped_at), { addSuffix: true })}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.open(job.job_apply_url, "_blank")} className="shrink-0">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterAdminJobPostingsSection;
