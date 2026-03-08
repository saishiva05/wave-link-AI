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
import { User, Building, Lock, Users, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface RecruiterDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recruiter: any;
}

const RecruiterDetailModal = ({ open, onOpenChange, recruiter }: RecruiterDetailModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const user = recruiter?.users;

  useEffect(() => {
    if (recruiter && user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || recruiter.phone || "");
      setCompanyName(recruiter.company_name || "");
      setCompanyWebsite(recruiter.company_website || "");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [recruiter, user]);

  // Fetch candidates assigned to this recruiter
  const { data: assignedCandidates } = useQuery({
    queryKey: ["admin", "recruiter-candidates", recruiter?.recruiter_id],
    queryFn: async () => {
      if (!recruiter?.recruiter_id) return [];
      const { data } = await supabase
        .from("candidates")
        .select("candidate_id, users!candidates_user_id_fkey(full_name, email)")
        .eq("assigned_recruiter_id", recruiter.recruiter_id);
      return data || [];
    },
    enabled: open && !!recruiter?.recruiter_id,
  });

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
    if (!recruiter || !user) return;
    setSaving(true);
    try {
      const { error: userError } = await supabase
        .from("users")
        .update({ full_name: fullName, phone })
        .eq("user_id", recruiter.user_id);
      if (userError) throw userError;

      const { error: recruiterError } = await supabase
        .from("recruiters")
        .update({ company_name: companyName, company_website: companyWebsite, phone })
        .eq("recruiter_id", recruiter.recruiter_id);
      if (recruiterError) throw recruiterError;

      toast({ title: "Recruiter updated successfully" });
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
        body: { action: "update-password", userId: recruiter.user_id, password: newPassword },
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

  const handleReassignCandidate = async (candidateId: string, newRecruiterId: string) => {
    try {
      const { error } = await supabase
        .from("candidates")
        .update({ assigned_recruiter_id: newRecruiterId })
        .eq("candidate_id", candidateId);
      if (error) throw error;
      toast({ title: "Candidate reassigned successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (!recruiter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            Recruiter Details
          </DialogTitle>
          <DialogDescription>View and edit recruiter information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled className="opacity-60" />
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
                <Building className="w-4 h-4" /> Company Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Website</Label>
                  <Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              <div><span className="text-muted-foreground">Jobs Scraped:</span> <span className="font-semibold text-foreground">{recruiter.total_jobs_scraped}</span></div>
              <div><span className="text-muted-foreground">Candidates Managed:</span> <span className="font-semibold text-foreground">{recruiter.total_candidates_managed}</span></div>
              <div><span className="text-muted-foreground">Created:</span> <span className="text-foreground">{format(new Date(recruiter.created_at), "MMM d, yyyy")}</span></div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Change Recruiter Password
              </h4>
              <p className="text-xs text-muted-foreground mb-4">Set a new password for this recruiter's account.</p>
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

          <TabsContent value="candidates" className="space-y-4 mt-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Assigned Candidates ({assignedCandidates?.length || 0})
            </h4>
            {assignedCandidates && assignedCandidates.length > 0 ? (
              <div className="space-y-3">
                {assignedCandidates.map((c: any) => (
                  <div key={c.candidate_id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{(c.users as any)?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{(c.users as any)?.email || ""}</p>
                    </div>
                    <Select onValueChange={(val) => handleReassignCandidate(c.candidate_id, val)}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Reassign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allRecruiters?.filter((r: any) => r.recruiter_id !== recruiter.recruiter_id).map((r: any) => (
                          <SelectItem key={r.recruiter_id} value={r.recruiter_id}>
                            {(r.users as any)?.full_name || "Unknown"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">No candidates assigned to this recruiter.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RecruiterDetailModal;
