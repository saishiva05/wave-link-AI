import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, User, Building, Phone, Globe, Mail, Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const RecruiterSettingsPage = () => {
  const { user, profile, recruiterId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [recruiterData, setRecruiterData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    if (recruiterId) {
      supabase
        .from("recruiters")
        .select("company_name, company_website, phone")
        .eq("recruiter_id", recruiterId)
        .single()
        .then(({ data }) => {
          if (data) {
            setRecruiterData(data);
            setCompanyName(data.company_name || "");
            setCompanyWebsite(data.company_website || "");
            if (data.phone && !phone) setPhone(data.phone);
          }
        });
    }
  }, [recruiterId]);

  const handleSave = async () => {
    if (!user || !recruiterId) return;
    setIsSaving(true);

    try {
      // Update users table
      const { error: userError } = await supabase
        .from("users")
        .update({ full_name: fullName, phone: phone || null })
        .eq("user_id", user.id);

      if (userError) throw userError;

      // Update recruiters table
      const { error: recruiterError } = await supabase
        .from("recruiters")
        .update({
          company_name: companyName || null,
          company_website: companyWebsite || null,
          phone: phone || null,
        })
        .eq("recruiter_id", recruiterId);

      if (recruiterError) throw recruiterError;

      queryClient.invalidateQueries({ queryKey: ["recruiter"] });
      toast({ title: "Settings saved", description: "Your profile has been updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">Manage your account and company information</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-card space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Personal Information</h2>
            <p className="text-sm text-muted-foreground">Update your profile details</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1.5">
              <Mail className="w-4 h-4 inline mr-1.5 text-neutral-400" />Email
            </label>
            <input type="email" value={profile?.email || ""} disabled
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1.5">
              <User className="w-4 h-4 inline mr-1.5 text-neutral-400" />Full Name
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1.5">
              <Phone className="w-4 h-4 inline mr-1.5 text-neutral-400" />Phone Number
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210"
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Company Section */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-card space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
            <Building className="w-5 h-5 text-success-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Company Information</h2>
            <p className="text-sm text-muted-foreground">Your organization details</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1.5">
              <Building className="w-4 h-4 inline mr-1.5 text-neutral-400" />Company Name
            </label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp"
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-1.5">
              <Globe className="w-4 h-4 inline mr-1.5 text-neutral-400" />Company Website
            </label>
            <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://www.example.com"
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex justify-end"
      >
        <Button variant="portal" size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
};

export default RecruiterSettingsPage;
