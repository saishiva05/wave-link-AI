import { Building, MapPin, Calendar, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CandidateApplication } from "@/hooks/useCandidateDashboard";
import { formatDistanceToNow } from "date-fns";

interface RecentApplicationsListProps {
  applications: CandidateApplication[];
  onViewDetails: (app: CandidateApplication) => void;
  onViewAll: () => void;
}

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-warning-100", text: "text-warning-700", label: "Pending" },
  submitted: { bg: "bg-info-100", text: "text-info-700", label: "In Review" },
  interview_scheduled: { bg: "bg-primary-100", text: "text-primary-700", label: "Interview" },
  interviewed: { bg: "bg-primary-100", text: "text-primary-700", label: "Interviewed" },
  offer_received: { bg: "bg-success-100", text: "text-success-700", label: "Offer" },
  hired: { bg: "bg-success-100", text: "text-success-700", label: "Hired" },
  rejected: { bg: "bg-error-100", text: "text-error-700", label: "Rejected" },
  declined: { bg: "bg-neutral-200", text: "text-neutral-700", label: "Declined" },
};

const RecentApplicationsList = ({ applications, onViewDetails, onViewAll }: RecentApplicationsListProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-900 font-display">Recent Applications</h3>
        <button onClick={onViewAll} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          View All Applications <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {applications.length === 0 ? (
          <div className="py-16 text-center">
            <Building className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-neutral-700">No applications yet</h4>
            <p className="text-sm text-neutral-600 mt-1 max-w-sm mx-auto">Your recruiter hasn't submitted any applications on your behalf yet.</p>
          </div>
        ) : (
          applications.map((app, i) => {
            const badge = statusBadge[app.application_status] || statusBadge.pending;
            return (
              <div
                key={app.application_id}
                onClick={() => onViewDetails(app)}
                className={cn("flex gap-5 p-6 hover:bg-neutral-50 cursor-pointer transition-colors", i < applications.length - 1 && "border-b border-border")}
              >
                {/* Company Icon */}
                <div className="w-16 h-16 rounded-lg border border-border bg-card flex items-center justify-center shrink-0">
                  <Building className="w-8 h-8 text-neutral-400" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-secondary-900 hover:text-primary transition-colors truncate">{app.job_title}</h4>
                  <p className="text-sm font-medium text-primary-600 flex items-center gap-1.5 mt-1">
                    <Building className="w-3.5 h-3.5" /> {app.company_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-600">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-neutral-500" /> {app.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-neutral-500" /> Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-neutral-500" /> {app.contract_type}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-neutral-500" /> CV: {app.cv_file_name}</span>
                    {app.updated_cv_file_name && (
                      <span className="flex items-center gap-1 text-teal-600 font-medium">✨ Optimized: {app.updated_cv_file_name}</span>
                    )}
                    <span className="text-muted-foreground">by {app.recruiter_name}</span>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium", badge.bg, badge.text)}>{badge.label}</span>
                  <button className="text-xs font-medium text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors flex items-center gap-1 mt-auto">
                    View Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentApplicationsList;
