import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Lock, Copy, CheckCircle, GraduationCap, MapPin, Briefcase, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CreateCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let password = "WaveC";
  for (let i = 0; i < 6; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  return password + "!";
};

const CreateCandidateModal = ({ open, onOpenChange }: CreateCandidateModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", recruiterId: "", jobTitle: "", location: "",
  });
  const [recruiters, setRecruiters] = useState<{ recruiter_id: string; name: string }[]>([]);
  const [tempPassword] = useState(generateTempPassword);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      supabase
        .from("recruiters")
        .select("recruiter_id, users!recruiters_user_id_fkey(full_name)")
        .then(({ data }) => {
          setRecruiters(
            (data || []).map((r: any) => ({
              recruiter_id: r.recruiter_id,
              name: r.users?.full_name || "Unknown",
            }))
          );
        });
    }
  }, [open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) errs.fullName = "Full name required (min 2 chars)";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Valid email required";
    if (!formData.recruiterId) errs.recruiterId = "Please assign a recruiter";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: formData.email.trim(),
          password: tempPassword,
          full_name: formData.fullName.trim(),
          role: "candidate",
          assigned_recruiter_id: formData.recruiterId,
          phone: formData.phone.trim() || null,
          current_job_title: formData.jobTitle.trim() || null,
          current_location: formData.location.trim() || null,
        },
      });
      if (error) throw error;
      if (response?.error) throw new Error(response.error);
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast({ title: "Candidate created successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create candidate", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ fullName: "", email: "", phone: "", recruiterId: "", jobTitle: "", location: "" });
    setErrors({});
    setSuccess(false);
    setLoading(false);
    onOpenChange(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 rounded-2xl">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <h2 className="text-xl font-bold text-secondary-900 mb-2 font-display">Candidate Account Created!</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {formData.fullName}'s account has been created and assigned to a recruiter.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>Close</Button>
              <Button variant="portal" onClick={() => { setSuccess(false); setFormData({ fullName: "", email: "", phone: "", recruiterId: "", jobTitle: "", location: "" }); }}>
                Create Another
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-info-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-info-500" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-secondary-900 font-display">Create Candidate Account</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Assign this candidate to a recruiter</p>
                </div>
              </div>
            </DialogHeader>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">Full Name <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input placeholder="Jane Doe" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)}
                    className={cn("pl-10", errors.fullName && "border-destructive focus-visible:ring-destructive")} disabled={loading} />
                </div>
                {errors.fullName && <p className="text-xs text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> {errors.fullName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">Email Address <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input type="email" placeholder="jane.doe@email.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)}
                    className={cn("pl-10", errors.email && "border-destructive focus-visible:ring-destructive")} disabled={loading} />
                </div>
                {errors.email && <p className="text-xs text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">Assign to Recruiter <span className="text-destructive">*</span></Label>
                <Select value={formData.recruiterId} onValueChange={(val) => updateField("recruiterId", val)} disabled={loading}>
                  <SelectTrigger className={cn(errors.recruiterId && "border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Select a recruiter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recruiters.map((r) => (
                      <SelectItem key={r.recruiter_id} value={r.recruiter_id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.recruiterId && <p className="text-xs text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> {errors.recruiterId}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-neutral-700">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input type="tel" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="pl-10" disabled={loading} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-neutral-700">Job Title</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input placeholder="Software Engineer" value={formData.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} className="pl-10" disabled={loading} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input placeholder="New York, NY" value={formData.location} onChange={(e) => updateField("location", e.target.value)} className="pl-10" disabled={loading} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">Temporary Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input value={tempPassword} readOnly className="pl-10 pr-10 bg-muted font-mono text-sm" />
                  <button type="button" onClick={handleCopy} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary transition-colors">
                    {copied ? <CheckCircle className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
              <Button variant="portal" onClick={handleSubmit} disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>) : (<><GraduationCap className="w-4 h-4" /> Create Candidate</>)}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateCandidateModal;
