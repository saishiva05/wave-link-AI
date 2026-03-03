import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Briefcase, Award, Save, Loader2, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CandidateProfile = () => {
  const navigate = useNavigate();
  const { user, fullName, email, profile } = useAuth();
  const { recruiter, stats } = useCandidateDashboard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  const { data: candidateData } = useQuery({
    queryKey: ["candidate", "profile-details", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("candidates")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    full_name: fullName || "",
    phone: "",
    current_job_title: "",
    current_location: "",
  });

  // Sync form when data loads
  useState(() => {
    if (candidateData) {
      setForm((prev) => ({
        ...prev,
        phone: candidateData.phone || "",
        current_job_title: candidateData.current_job_title || "",
        current_location: candidateData.current_location || "",
      }));
    }
  });

  // Sync avatar from profile
  useState(() => {
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
  });

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

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error: userError } = await supabase
        .from("users")
        .update({ full_name: form.full_name, phone: form.phone || null })
        .eq("user_id", user!.id);
      if (userError) throw userError;
      if (candidateData) {
        const { error: candError } = await supabase
          .from("candidates")
          .update({
            phone: form.phone || null,
            current_job_title: form.current_job_title || null,
            current_location: form.current_location || null,
          })
          .eq("candidate_id", candidateData.candidate_id);
        if (candError) throw candError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      toast({ title: "Profile updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const initials = fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "C";

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <button onClick={() => navigate("/candidate/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">Dashboard</button>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-semibold">My Profile</span>
        </nav>
        <h1 className="text-2xl md:text-4xl font-bold text-foreground font-display">My Profile</h1>
        <p className="text-base text-muted-foreground mt-1">View and manage your profile information</p>
      </motion.div>

      {/* Profile Card with Avatar Upload */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary to-primary-600 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="relative group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-card shadow-card" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold border-4 border-card shadow-card">
                    {initials}
                  </div>
                )}
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
              </div>
            </div>
          </div>

          <div className="pt-14 px-8 pb-8">
            <h2 className="text-xl font-bold text-foreground">{fullName || "Candidate"}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" /> {email}
            </p>
            <p className="text-xs text-primary hover:underline cursor-pointer mt-1" onClick={() => fileInputRef.current?.click()}>
              {uploading ? "Uploading..." : "Change profile photo"}
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-sm text-foreground bg-primary-50 px-3 py-1.5 rounded-full">
                <Briefcase className="w-3.5 h-3.5 text-primary" /> {stats.total} Applications
              </span>
              <span className="flex items-center gap-1.5 text-sm text-foreground bg-success-50 px-3 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5 text-success-500" /> {stats.interviews} Interviews
              </span>
              <span className="flex items-center gap-1.5 text-sm text-foreground bg-info-50 px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5 text-info-500" /> Managed by {recruiter.name}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Form */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card border border-border rounded-xl p-8 shadow-xs">
          <h3 className="text-lg font-semibold text-foreground font-display mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
              <Input value={email || ""} disabled className="bg-muted cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Current Job Title</Label>
              <Input value={form.current_job_title} onChange={(e) => setForm({ ...form, current_job_title: e.target.value })} placeholder="e.g. Software Engineer" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</Label>
              <Input value={form.current_location} onChange={(e) => setForm({ ...form, current_location: e.target.value })} placeholder="e.g. New York, NY" />
            </div>
          </div>
          <Button className="mt-6" onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Recruiter Info */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="bg-card border border-border rounded-xl p-8 shadow-xs">
          <h3 className="text-lg font-semibold text-foreground font-display mb-4">Assigned Recruiter</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
              {recruiter.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{recruiter.name}</p>
              <p className="text-sm text-muted-foreground">{recruiter.company}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" /> {recruiter.email}</p>
              {recruiter.phone && <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5"><Phone className="w-3.5 h-3.5" /> {recruiter.phone}</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateProfile;
