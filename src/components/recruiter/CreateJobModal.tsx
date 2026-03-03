import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recruiterId: string;
  /** If provided (admin mode with recruiter list), show recruiter selector */
  recruiterOptions?: { recruiter_id: string; full_name: string }[];
  /** Admin posting mode - no recruiter needed, uses auth user_id to find a dummy recruiter or self */
  adminMode?: boolean;
}

const CreateJobModal = ({ open, onOpenChange, recruiterId, recruiterOptions, adminMode }: CreateJobModalProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(recruiterId);
  const [form, setForm] = useState({
    job_title: "",
    company_name: "",
    location: "",
    contract_type: "Full-time",
    work_type: "On-site",
    experience_level: "",
    salary_range: "",
    job_description: "",
    job_apply_url: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      let rid = recruiterId;
      
      if (adminMode) {
        // For admin mode, get the first recruiter or use a placeholder approach
        // Admin posts don't need a specific recruiter - find any recruiter to satisfy FK
        const { data: firstRecruiter } = await supabase
          .from("recruiters")
          .select("recruiter_id")
          .limit(1)
          .single();
        
        if (!firstRecruiter) {
          throw new Error("No recruiters exist yet. Please create a recruiter first.");
        }
        rid = firstRecruiter.recruiter_id;
      } else if (recruiterOptions && recruiterOptions.length > 0) {
        rid = selectedRecruiterId;
      }

      const isAdmin = !!adminMode || (!!recruiterOptions && recruiterOptions.length > 0);
      const { error } = await supabase.from("scraped_jobs").insert({
        recruiter_id: rid,
        job_title: form.job_title,
        company_name: form.company_name,
        location: form.location,
        contract_type: form.contract_type,
        work_type: form.work_type,
        experience_level: form.experience_level || null,
        salary_range: form.salary_range || null,
        job_description: form.job_description,
        job_apply_url: form.job_apply_url || "#",
        platform_type: "linkedin" as const,
        scrape_filters_used: { source: "manual" },
        is_admin_posting: isAdmin,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job posting created successfully!");
      queryClient.invalidateQueries({ queryKey: ["recruiter"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      onOpenChange(false);
      setForm({
        job_title: "", company_name: "", location: "", contract_type: "Full-time",
        work_type: "On-site", experience_level: "", salary_range: "", job_description: "", job_apply_url: "",
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create job posting");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.job_title || !form.company_name || !form.location || !form.job_description) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate();
  };

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-display">
                {adminMode ? "Post Job (Admin)" : "Add Job Posting"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {adminMode ? "This job will be visible to all recruiters and candidates" : "Manually add a job to the system"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Only show recruiter selector when recruiterOptions provided (not adminMode) */}
          {recruiterOptions && recruiterOptions.length > 0 && !adminMode && (
            <div className="space-y-2">
              <Label>Assign to Recruiter *</Label>
              <Select value={selectedRecruiterId} onValueChange={setSelectedRecruiterId}>
                <SelectTrigger><SelectValue placeholder="Select recruiter" /></SelectTrigger>
                <SelectContent>
                  {recruiterOptions.map((r) => (
                    <SelectItem key={r.recruiter_id} value={r.recruiter_id}>{r.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input value={form.job_title} onChange={(e) => updateField("job_title", e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input value={form.company_name} onChange={(e) => updateField("company_name", e.target.value)} placeholder="e.g. Google" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input value={form.location} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g. Bangalore, India" />
            </div>
            <div className="space-y-2">
              <Label>Apply URL</Label>
              <Input value={form.job_apply_url} onChange={(e) => updateField("job_apply_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Contract Type</Label>
              <Select value={form.contract_type} onValueChange={(v) => updateField("contract_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Full-time", "Part-time", "Contract", "Internship", "Temporary"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Mode</Label>
              <Select value={form.work_type} onValueChange={(v) => updateField("work_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["On-site", "Remote", "Hybrid"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Input value={form.experience_level} onChange={(e) => updateField("experience_level", e.target.value)} placeholder="e.g. Mid-Senior" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Salary Range</Label>
            <Input value={form.salary_range} onChange={(e) => updateField("salary_range", e.target.value)} placeholder="e.g. ₹12-18 LPA" />
          </div>

          <div className="space-y-2">
            <Label>Job Description *</Label>
            <Textarea value={form.job_description} onChange={(e) => updateField("job_description", e.target.value)} placeholder="Enter the full job description..." rows={5} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="portal" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {adminMode ? "Post Job" : "Create Job Posting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobModal;
