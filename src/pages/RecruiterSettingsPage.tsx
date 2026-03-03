import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Building, Phone, Globe, Mail, Save, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const RecruiterSettingsPage = () => {
  const { user, profile, recruiterId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || null);
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
            setCompanyName(data.company_name || "");
            setCompanyWebsite(data.company_website || "");
            if (data.phone && !phone) setPhone(data.phone);
          }
        });
    }
  }, [recruiterId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, or WebP image", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const url = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("users").update({ avatar_url: url }).eq("user_id", user.id);
      setAvatarUrl(url);
      toast({ title: "Profile photo updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "R";

  const handleSave = async () => {
    if (!user || !recruiterId) return;
    setIsSaving(true);
    try {
      const { error: userError } = await supabase
        .from("users")
        .update({ full_name: fullName, phone: phone || null })
        .eq("user_id", user.id);
      if (userError) throw userError;
      const { error: recruiterError } = await supabase
        .from("recruiters")
        .update({ company_name: companyName || null, company_website: companyWebsite || null, phone: phone || null })
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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">Settings</h1>
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
            <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
            <p className="text-sm text-muted-foreground">Update your profile details</p>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold border-2 border-border">
                {initials}
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Profile Photo</p>
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2MB.</p>
            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:underline mt-1">
              {uploading ? "Uploading..." : "Change photo"}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Mail className="w-4 h-4 inline mr-1.5 text-muted-foreground" />Email
            </label>
            <input type="email" value={profile?.email || ""} disabled
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <User className="w-4 h-4 inline mr-1.5 text-muted-foreground" />Full Name
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Phone className="w-4 h-4 inline mr-1.5 text-muted-foreground" />Phone Number
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210"
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
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
            <h2 className="text-lg font-semibold text-foreground">Company Information</h2>
            <p className="text-sm text-muted-foreground">Your organization details</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Building className="w-4 h-4 inline mr-1.5 text-muted-foreground" />Company Name
            </label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp"
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Globe className="w-4 h-4 inline mr-1.5 text-muted-foreground" />Company Website
            </label>
            <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://www.example.com"
              className="w-full h-11 px-4 text-sm rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex justify-end">
        <Button variant="portal" size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
};

export default RecruiterSettingsPage;
