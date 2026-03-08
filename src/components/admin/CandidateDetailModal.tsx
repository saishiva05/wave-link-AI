import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Lock, Save, Loader2, MapPin, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface CandidateDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: any;
}

const CandidateDetailModal = ({ open, onOpenChange, candidate }: CandidateDetailModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const user = candidate?.users;

  useEffect(() => {
    if (candidate && user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setJobTitle(candidate.current_job_title || "");
      setLocation(candidate.current_location || "");
      setExperienceYears(candidate.experience_years?.toString() || "");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [candidate, user]);

  // Fetch all recruiters for reassignment
  const { data: allRecruiters } = useQuery({
    queryKey: ["admin", "all-recruiters-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("recruiters")
        .select("recruiter_id, users!recruiters_user_id_fkey(full_name)");
      return data || [];
    },
    enabled: open,
  });

  const handleSaveProfile = async () => {
    if (!candidate || !user) return;
    setSaving(true);
    try {
      const { error: userError } = await supabase
        .from("users")
        .update({ full_name: fullName, phone })
        .eq("user_id", candidate.user_id);
      if (userError) throw userError;

      const { error: candidateError } = await supabase
        .from("candidates")
        .update({
          current_job_title: jobTitle || null,
          current_location: location || null,
          experience_years: experienceYears ? parseInt(experienceYears) : null,
        })
        .eq("candidate_id", candidate.candidate_id);
      if (candidateError) throw candidateError;

      toast({ title: "Candidate updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.functions.invoke("create-user", {
        body: { action: "update-password", userId: candidate.user_id, password: newPassword },
      });
      if (error) throw error;
      toast({ title: "Password changed successfully" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to change password", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleReassignRecruiter = async (newRecruiterId: string) => {
    try {
      const { error } = await supabase
        .from("candidates")
        .update({ assigned_recruiter_id: newRecruiterId })
        .eq("candidate_id", candidate.candidate_id);
      if (error) throw error;
      toast({ title: "Recruiter reassigned successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (!candidate) return null;

  const recruiterName = (candidate.recruiters as any)?.users?.full_name || "Unassigned";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <GraduationCap className="w-5 h-5 text-primary" />
            Candidate Details
          </DialogTitle>
          <DialogDescription>View and edit candidate information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="opacity-60" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Badge variant={user?.is_active ? "default" : "secondary"} className="mt-1">
                  {user?.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Professional Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Job Title</Label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Assigned Recruiter
              </h4>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">Currently: <span className="text-primary font-medium">{recruiterName}</span></p>
                <Select onValueChange={handleReassignRecruiter}>
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <SelectValue placeholder="Reassign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allRecruiters?.map((r: any) => (
                      <SelectItem key={r.recruiter_id} value={r.recruiter_id}>
                        {(r.users as any)?.full_name || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground border-t border-border pt-4">
              Created: {format(new Date(candidate.created_at), "MMM d, yyyy")}
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Change Candidate Password
              </h4>
              <p className="text-xs text-muted-foreground mb-4">Set a new password for this candidate's account.</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                </div>
                <Button onClick={handleChangePassword} disabled={changingPassword} variant="destructive" className="w-full">
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  Change Password
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailModal;
