import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface ApplicationStatusModalProps {
  application: any | null;
  onClose: () => void;
}

const statusOptions: { value: ApplicationStatus; label: string; color: string; description: string }[] = [
  { value: "pending", label: "Pending", color: "bg-warning-100 text-warning-700 border-warning-200", description: "Application is waiting for review" },
  { value: "submitted", label: "Submitted", color: "bg-info-100 text-info-700 border-info-200", description: "Application has been submitted" },
  { value: "interview_scheduled", label: "Interview Scheduled", color: "bg-primary-100 text-primary-700 border-primary-200", description: "Candidate has an interview lined up" },
  { value: "interviewed", label: "Interviewed", color: "bg-primary-100 text-primary-700 border-primary-200", description: "Candidate has completed interview" },
  { value: "offer_received", label: "Offer Received", color: "bg-success-100 text-success-700 border-success-200", description: "Candidate received a job offer" },
  { value: "hired", label: "Hired", color: "bg-success-200 text-success-800 border-success-300", description: "Candidate has been hired" },
  { value: "rejected", label: "Rejected", color: "bg-error-100 text-error-700 border-error-200", description: "Application was rejected" },
  { value: "declined", label: "Declined", color: "bg-error-100 text-error-700 border-error-200", description: "Candidate declined the offer" },
];

const ApplicationStatusModal = ({ application, onClose }: ApplicationStatusModalProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!application) return null;

  const currentStatus = application.application_status;

  const handleUpdate = async () => {
    if (!selectedStatus) return;
    setIsUpdating(true);
    try {
      const updateData: any = { application_status: selectedStatus };
      if (notes.trim()) updateData.recruiter_notes = notes.trim();

      const { error } = await supabase
        .from("job_applications")
        .update(updateData)
        .eq("application_id", application.application_id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application status changed to ${statusOptions.find(s => s.value === selectedStatus)?.label}`,
      });

      queryClient.invalidateQueries({ queryKey: ["recruiter"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={!!application} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold font-display">Update Application Status</DialogTitle>
          <DialogDescription>
            {application.scraped_jobs?.job_title} — {application.candidates?.users?.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  (selectedStatus || currentStatus) === opt.value
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/30",
                  currentStatus === opt.value && !selectedStatus && "opacity-60"
                )}
              >
                <span className={cn("inline-block text-xs font-bold px-2.5 py-1 rounded-full border", opt.color)}>
                  {opt.label}
                </span>
                <span className="text-xs text-muted-foreground flex-1">{opt.description}</span>
                {(selectedStatus === opt.value || (!selectedStatus && currentStatus === opt.value)) && (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider mb-1.5 block">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              className="w-full h-20 px-3 py-2 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              variant="portal"
              disabled={!selectedStatus || selectedStatus === currentStatus || isUpdating}
              onClick={handleUpdate}
            >
              {isUpdating ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationStatusModal;
