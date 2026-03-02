import { X, Building, MapPin, Briefcase, Monitor, Award, Calendar, FileText, Download, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CandidateApplication } from "@/hooks/useCandidateDashboard";
import { format } from "date-fns";

interface ApplicationDetailsModalProps {
  application: CandidateApplication | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  "Application Submitted": "border-info-500",
  "In Review": "border-info-500",
  "Interview Scheduled": "border-primary",
  "Interview Completed": "border-primary",
  "Offer Received": "border-success-500",
  "Hired": "border-success-500",
  "Rejected": "border-error-500",
};

const statusTextColors: Record<string, string> = {
  "Application Submitted": "text-info-600",
  "In Review": "text-info-600",
  "Interview Scheduled": "text-primary-600",
  "Interview Completed": "text-primary-600",
  "Offer Received": "text-success-600",
  "Hired": "text-success-600",
  "Rejected": "text-error-600",
};

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-warning-100", text: "text-warning-700", label: "Pending" },
  submitted: { bg: "bg-info-100", text: "text-info-700", label: "In Review" },
  interview_scheduled: { bg: "bg-primary-100", text: "text-primary-700", label: "Interview Scheduled" },
  interviewed: { bg: "bg-primary-100", text: "text-primary-700", label: "Interviewed" },
  offer_received: { bg: "bg-success-100", text: "text-success-700", label: "Offer Received" },
  hired: { bg: "bg-success-100", text: "text-success-700", label: "Hired" },
  rejected: { bg: "bg-error-100", text: "text-error-700", label: "Rejected" },
  declined: { bg: "bg-neutral-200", text: "text-neutral-700", label: "Declined" },
};

const ApplicationDetailsModal = ({ application, onClose }: ApplicationDetailsModalProps) => {
  if (!application) return null;

  const badge = statusBadge[application.application_status] || statusBadge.pending;
  const isPdf = application.cv_file_name.endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-[900px] w-full animate-scale-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-8 border-b border-border bg-gradient-to-b from-neutral-50 to-card relative">
          <span className={cn("absolute top-6 right-16 px-4 py-1.5 rounded-full text-sm font-semibold", badge.bg, badge.text)}>{badge.label}</span>
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 rounded-xl border-2 border-border bg-card flex items-center justify-center shadow-xs mb-4">
            <Building className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">{application.job_title}</h2>
          <p className="text-base font-medium text-primary-600 flex items-center gap-1.5 mt-2"><Building className="w-4 h-4" /> {application.company_name}</p>
          <div className="flex flex-wrap gap-5 mt-4 text-sm text-neutral-700">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-neutral-500" /> {application.location}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-neutral-500" /> {application.contract_type}</span>
            <span className="flex items-center gap-1.5"><Monitor className="w-4 h-4 text-neutral-500" /> {application.work_type}</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-neutral-500" /> {application.experience_level}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1">
          {/* Timeline */}
          <h3 className="text-lg font-semibold text-secondary-900 font-display mb-5">Application Timeline</h3>
          <div className="border-l-2 border-neutral-300 pl-6 mb-8 space-y-6">
            {application.timeline.map((item, i) => {
              const dotColor = statusColors[item.status] || "border-neutral-400";
              const textColor = statusTextColors[item.status] || "text-neutral-600";
              return (
                <div key={i} className="relative">
                  <div className={cn("absolute -left-[31px] w-4 h-4 rounded-full bg-card border-[3px]", dotColor, i === 0 && "animate-pulse")} />
                  <div className="bg-neutral-50 border border-border rounded-lg p-4">
                    <p className={cn("text-sm font-semibold", textColor)}>{item.status}</p>
                    <p className="text-xs text-neutral-600 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {format(new Date(item.date), "MMM d, yyyy 'at' h:mm a")}</p>
                    {item.notes && <p className="text-sm text-neutral-700 mt-2">{item.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Job Description */}
          <h3 className="text-lg font-semibold text-secondary-900 font-display mb-4">Job Description</h3>
          <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line mb-8 max-w-[700px]">{application.job_description}</div>

          {/* Resume Submitted */}
          <h3 className="text-lg font-semibold text-secondary-900 font-display mb-4">Resume Submitted</h3>
          <div className="bg-neutral-50 border border-border rounded-lg p-5 flex items-center gap-4 mb-4">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", isPdf ? "bg-error-50" : "bg-info-50")}>
              <FileText className={cn("w-7 h-7", isPdf ? "text-error-500" : "text-info-500")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-secondary-900 truncate">{application.cv_file_name}</p>
              <p className="text-xs text-neutral-600 mt-0.5">Original CV</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary hover:bg-primary-100 transition-colors" title="Preview">
                <Eye className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary hover:bg-primary-100 transition-colors" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Updated/Optimized CV */}
          {application.updated_cv_file_name && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-teal-100">
                <FileText className="w-7 h-7 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-secondary-900 truncate">{application.updated_cv_file_name}</p>
                <p className="text-xs text-teal-700 font-medium mt-0.5">✨ Optimized Resume (Used for Application)</p>
              </div>
              {application.updated_cv_file_url && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => window.open(application.updated_cv_file_url!, "_blank")}
                    className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-200 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={application.updated_cv_file_url!}
                    download={application.updated_cv_file_name}
                    className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-200 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
          {!application.updated_cv_file_name && <div className="mb-8" />}

          {/* Recruiter Info */}
          <div className="bg-neutral-50 border border-border rounded-lg p-4 flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {application.recruiter_name?.charAt(0) || "R"}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Applied by Recruiter</p>
              <p className="text-sm font-semibold text-secondary-900">{application.recruiter_name}</p>
            </div>
          </div>

          {/* Original Posting */}
          <h3 className="text-lg font-semibold text-secondary-900 font-display mb-4">Original Job Posting</h3>
          <Button variant="outline" onClick={() => window.open(application.job_apply_url, "_blank")}>
            <ExternalLink className="w-4 h-4" /> View on {application.platform_type === "linkedin" ? "LinkedIn" : "JSearch"}
          </Button>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border bg-neutral-50 flex items-center justify-between">
          <p className="text-sm text-neutral-600">Applied on {format(new Date(application.applied_at), "MMM d, yyyy")}</p>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
