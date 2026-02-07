import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Building,
  Phone,
  Lock,
  Copy,
  CheckCircle,
  UserPlus,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateRecruiterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let password = "WaveL";
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + "!";
};

const CreateRecruiterModal = ({ open, onOpenChange }: CreateRecruiterModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
  });
  const [sendInvite, setSendInvite] = useState(true);
  const [tempPassword] = useState(generateTempPassword);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) errs.fullName = "Full name is required (min 2 chars)";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Valid email is required";
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
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  const handleClose = () => {
    setFormData({ fullName: "", email: "", company: "", phone: "" });
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
            <h2 className="text-xl font-bold text-secondary-900 mb-2 font-display">
              Recruiter Account Created!
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {formData.fullName}'s account has been created successfully.
              {sendInvite && ` An invitation email has been sent to ${formData.email}`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="portal"
                onClick={() => {
                  setSuccess(false);
                  setFormData({ fullName: "", email: "", company: "", phone: "" });
                }}
              >
                Create Another
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle className="text-xl font-bold text-secondary-900 font-display">
                Create New Recruiter Account
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    placeholder="John Smith"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className={cn("pl-10", errors.fullName && "border-destructive focus-visible:ring-destructive")}
                    disabled={loading}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    type="email"
                    placeholder="john.smith@company.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={cn("pl-10", errors.email && "border-destructive focus-visible:ring-destructive")}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">This will be used for login and sending invitation</p>
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">Company Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    placeholder="TechCorp Inc."
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Send Invite Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="sendInvite"
                  checked={sendInvite}
                  onCheckedChange={(val) => setSendInvite(val === true)}
                  disabled={loading}
                />
                <div>
                  <Label htmlFor="sendInvite" className="text-sm text-neutral-700 cursor-pointer">
                    Send login credentials via email
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The recruiter will receive their login details and a link to set their password.
                  </p>
                </div>
              </div>

              {/* Temp Password */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-neutral-700">Temporary Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    value={tempPassword}
                    readOnly
                    className="pl-10 pr-10 bg-muted font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary transition-colors"
                    title="Copy password"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This password will be sent to the recruiter. They can change it after first login.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <Button variant="ghost" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="portal" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Recruiter Account
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateRecruiterModal;
