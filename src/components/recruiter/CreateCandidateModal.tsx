import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Mail, User, Phone, MapPin, Briefcase, Lock, Hash, Wrench } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateCandidateModal = ({ open, onClose }: Props) => {
  const { toast } = useToast();
  const { recruiterId } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFullName(""); setEmail(""); setPassword(""); setPhone("");
    setJobTitle(""); setLocation(""); setExperience(""); setSkills("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Validation Error", description: "Name, email, and password are required.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("create-user", {
        body: {
          email: email.trim(),
          full_name: fullName.trim(),
          password,
          role: "candidate",
          phone: phone.trim() || undefined,
          current_job_title: jobTitle.trim() || undefined,
          current_location: location.trim() || undefined,
          experience_years: experience ? parseInt(experience) : undefined,
          skills: skills.trim() ? skills.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);

      queryClient.invalidateQueries({ queryKey: ["recruiter", "candidates"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "candidate-options"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "stats"] });
      toast({ title: "Candidate Created", description: `${fullName} has been added successfully. They can log in with their email and password.` });
      resetForm();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create candidate", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Add New Candidate
          </DialogTitle>
          <DialogDescription>
            Create a candidate account. They'll be able to log in and view their applications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Required Fields */}
          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1">
              <User className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />Full Name <span className="text-error-500">*</span>
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1">
              <Mail className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />Email <span className="text-error-500">*</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1">
              <Lock className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />Password <span className="text-error-500">*</span>
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6}
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>

          {/* Optional Fields */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Optional Information</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-1">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />Phone
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765..."
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-1">
                <Hash className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />Experience (years)
              </label>
              <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="3" min={0} max={50}
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1">
              <Briefcase className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />Current Job Title
            </label>
            <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer"
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />Location
            </label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hyderabad, India"
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1">
              <Wrench className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />Skills
            </label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Python, SQL (comma-separated)"
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { resetForm(); onClose(); }} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="portal" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isSubmitting ? "Creating..." : "Create Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCandidateModal;
