import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { Building, MapPin, Calendar, FileText, Users, Edit3, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusStyles: Record<string, string> = {
  pending: "bg-warning-100 text-warning-700 border-warning-200",
  submitted: "bg-info-100 text-info-700 border-info-200",
  interview_scheduled: "bg-primary-100 text-primary-700 border-primary-200",
  interviewed: "bg-primary-100 text-primary-700 border-primary-200",
  offer_received: "bg-success-100 text-success-700 border-success-200",
  hired: "bg-success-200 text-success-800 border-success-300",
  rejected: "bg-error-100 text-error-700 border-error-200",
  declined: "bg-error-100 text-error-700 border-error-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending", submitted: "Submitted", interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed", offer_received: "Offer Received", hired: "Hired",
  rejected: "Rejected", declined: "Declined",
};

interface ApplicationDateGroupProps {
  label: string;
  items: any[];
  isCollapsed: boolean;
  onToggle: () => void;
  onEditApp: (app: any) => void;
}

const ApplicationDateGroup = ({ label, items, isCollapsed, onToggle, onEditApp }: ApplicationDateGroupProps) => {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-3 mb-3 w-full text-left group"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
        <h3 className="text-sm font-bold text-secondary-700 uppercase tracking-wider">{label}</h3>
        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
          {items.length}
        </span>
        <div className="flex-1 h-px bg-border" />
      </button>

      {!isCollapsed && (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {items.map((a: any, i: number) => (
            <div key={a.application_id} className={cn("flex items-center gap-4 px-6 py-5 hover:bg-muted/30 transition-colors", i < items.length - 1 && "border-b border-border")}>
              <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                <Building className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-secondary-900 truncate">{a.scraped_jobs?.job_title || "Unknown Job"}</p>
                <p className="text-xs text-primary-600 font-medium mt-0.5">{a.scraped_jobs?.company_name || "Unknown"}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.scraped_jobs?.location || "—"}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {formatDistanceToNow(new Date(a.applied_at), { addSuffix: true })}</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{a.cvs?.file_name || "—"}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />{a.candidates?.users?.full_name || "Unknown"}
                  </span>
                  {a.recruiter_notes && (
                    <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">
                      Note: {a.recruiter_notes}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 space-y-2 flex flex-col items-end">
                <span className={cn("inline-block text-xs font-bold px-2.5 py-1 rounded-full border", statusStyles[a.application_status] || "bg-muted text-muted-foreground border-border")}>
                  {statusLabels[a.application_status] || a.application_status}
                </span>
                <p className="text-xs text-muted-foreground">{format(new Date(a.applied_at), "MMM d, yyyy")}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-primary hover:text-primary"
                  onClick={() => onEditApp(a)}
                >
                  <Edit3 className="w-3 h-3 mr-1" /> Update Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationDateGroup;
