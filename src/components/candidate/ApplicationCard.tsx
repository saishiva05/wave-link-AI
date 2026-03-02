import { Building, MapPin, Calendar, FileText, Briefcase, ArrowRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CandidateApplication } from "@/hooks/useCandidateDashboard";
import { formatDistanceToNow } from "date-fns";

interface ApplicationCardProps {
  application: CandidateApplication;
  onViewDetails: () => void;
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

const ApplicationCard = ({ application, onViewDetails }: ApplicationCardProps) => {
  const badge = statusBadge[application.application_status] || statusBadge.pending;

  return (
    <div
      onClick={onViewDetails}
      className="bg-card border border-border rounded-xl p-6 shadow-xs hover:shadow-card hover:-translate-y-0.5 hover:border-primary-300 transition-all duration-200 cursor-pointer flex flex-col min-h-[320px]"
    >
      {/* Company Logo */}
      <div className="w-16 h-16 rounded-lg border border-border bg-card flex items-center justify-center mx-auto mb-4">
        <Building className="w-8 h-8 text-neutral-400" />
      </div>

      {/* Job Title */}
      <h4 className="text-base font-semibold text-secondary-900 text-center line-clamp-2 leading-6 mb-2">{application.job_title}</h4>
      <p className="text-sm font-medium text-primary-600 text-center flex items-center justify-center gap-1.5 mb-4">
        <Building className="w-3.5 h-3.5" /> {application.company_name}
      </p>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-neutral-700">
        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-neutral-500" /> {application.location}</span>
        <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-neutral-500" /> {application.contract_type}</span>
        <span className="flex items-center gap-1.5 col-span-2"><Calendar className="w-3.5 h-3.5 text-neutral-500" /> Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}</span>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-4">
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", badge.bg, badge.text)}>{badge.label}</span>
      </div>

      {/* CV & Recruiter */}
      <div className="space-y-1.5 mt-auto mb-3">
        <p className="text-xs text-neutral-600 flex items-center gap-1 truncate">
          <FileText className="w-3 h-3 text-neutral-500 shrink-0" /> CV: {application.cv_file_name}
        </p>
        {application.updated_cv_file_name && (
          <p className="text-xs text-teal-600 font-medium flex items-center gap-1 truncate">
            ✨ Optimized: {application.updated_cv_file_name}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">Applied by: {application.recruiter_name}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors">
          View Details <ArrowRight className="w-3 h-3" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-neutral-500 hover:bg-neutral-100 transition-colors" title="Download CV">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;
