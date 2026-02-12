import { useState } from "react";
import { X, Mail, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ScrapedJob } from "@/data/mockScrapedJobs";

interface GenerateEmailModalProps {
  job: ScrapedJob | null;
  onClose: () => void;
}

const GenerateEmailModal = ({ job, onClose }: GenerateEmailModalProps) => {
  const { recruiterId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState<{ subject: string; body: string } | null>(null);
  const [copiedField, setCopiedField] = useState<"subject" | "body" | "all" | null>(null);

  if (!job) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setEmailData(null);
    try {
      const payload = {
        job_id: job.id,
        job_title: job.job_title,
        company_name: job.company_name,
        location: job.location,
        job_description: job.job_description,
        salary_range: job.salary_range,
        experience_level: job.experience_level,
        contract_type: job.contract_type,
        job_apply_url: job.job_apply_url,
        recruiter_id: recruiterId,
      };

      const res = await fetch(
        "https://n8n.srv1340079.hstgr.cloud/webhook/101289f7-0ec4-4eb1-bcf0-a0f1d7cacec2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Webhook request failed");

      let data = await res.json();
      // Handle nested array format [{ text: { ... } }]
      if (Array.isArray(data) && data[0]?.text) {
        data = data[0].text;
      }
      // Handle if it's a string
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch { /* keep as is */ }
      }

      const subject = data.subject || data.subject_line || data.email_subject || "Generated Subject";
      const body = data.body || data.email_body || data.message || data.email_message || "Generated email body";

      setEmailData({ subject, body });
      toast({ title: "Email Generated!", description: "Your email is ready to copy." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate email", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (field: "subject" | "body" | "all") => {
    const text =
      field === "subject"
        ? emailData?.subject || ""
        : field === "body"
        ? emailData?.body || ""
        : `Subject: ${emailData?.subject}\n\n${emailData?.body}`;

    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!", description: `${field === "all" ? "Full email" : field === "subject" ? "Subject" : "Body"} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border shrink-0 bg-gradient-to-r from-orange-50/80 to-amber-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary-900 font-display">Generate Email</h2>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {job.job_title} at {job.company_name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {!emailData && !loading && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">AI Email Generator</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                Generate a professional outreach email based on the job details using AI.
              </p>
              <Button onClick={handleGenerate} variant="portal" size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0">
                <Sparkles className="w-4 h-4" /> Generate Email
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-14">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Generating your email...</p>
              <p className="text-xs text-muted-foreground/60 mt-1">This may take a few seconds</p>
            </div>
          )}

          {emailData && (
            <div className="space-y-5">
              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider">Subject Line</label>
                  <button
                    onClick={() => handleCopy("subject")}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {copiedField === "subject" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === "subject" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-medium text-secondary-900">
                  {emailData.subject}
                </div>
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider">Email Body</label>
                  <button
                    onClick={() => handleCopy("body")}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {copiedField === "body" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === "body" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-muted/50 border border-border rounded-xl px-4 py-4 text-sm text-secondary-800 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                  {emailData.body}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between">
          {emailData ? (
            <>
              <Button onClick={handleGenerate} variant="outline" size="sm" disabled={loading}>
                <Sparkles className="w-3.5 h-3.5" /> Regenerate
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleCopy("all")}
                  variant="portal"
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0"
                >
                  {copiedField === "all" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === "all" ? "Copied!" : "Copy All"}
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
              </div>
            </>
          ) : (
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateEmailModal;
