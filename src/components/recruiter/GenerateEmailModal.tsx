import { useState, useEffect } from "react";
import { X, Mail, Loader2, Copy, Check, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ScrapedJob } from "@/data/mockScrapedJobs";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface GenerateEmailModalProps {
  job: ScrapedJob | null;
  onClose: () => void;
}

const GenerateEmailModal = ({ job, onClose }: GenerateEmailModalProps) => {
  const { recruiterId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [existingEmails, setExistingEmails] = useState<any[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (job && recruiterId) {
      setLoadingExisting(true);
      supabase
        .from("generated_emails")
        .select("*")
        .eq("job_id", job.id)
        .eq("recruiter_id", recruiterId)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setExistingEmails(data || []);
          setLoadingExisting(false);
        });
    }
  }, [job, recruiterId]);

  if (!job) return null;

  const handleGenerate = async () => {
    setLoading(true);
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

      const startTime = Date.now();
      const res = await fetch(
        "https://n8n.srv1340079.hstgr.cloud/webhook/101289f7-0ec4-4eb1-bcf0-a0f1d7cacec2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Webhook request failed");
      const responseTime = Date.now() - startTime;

      let data = await res.json();
      if (Array.isArray(data) && data[0]?.text) {
        data = data[0].text;
      }
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch { /* keep as is */ }
      }

      const subject = data.subject || data.subject_line || data.email_subject || "Generated Subject";
      const body = data.body || data.email_body || data.message || data.email_message || "Generated email body";

      // Save to database
      const { data: savedEmail, error } = await supabase
        .from("generated_emails")
        .insert({
          job_id: job.id,
          recruiter_id: recruiterId!,
          subject,
          body,
          webhook_response: data,
          webhook_response_time_ms: responseTime,
        })
        .select()
        .single();

      if (error) throw error;

      setExistingEmails(prev => [savedEmail, ...prev]);
      queryClient.invalidateQueries({ queryKey: ["recruiter", "job-generated-emails"] });
      toast({ title: "Email Generated & Saved!", description: "Your email is ready to copy." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate email", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!", description: "Copied to clipboard" });
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
                <h2 className="text-lg font-bold text-secondary-900 font-display">
                  {existingEmails.length > 0 ? "Generated Emails" : "Generate Email"}
                </h2>
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
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {loadingExisting ? (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading emails...</p>
            </div>
          ) : (
            <>
              {/* Existing emails */}
              {existingEmails.map((email) => (
                <div key={email.email_id} className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`, email.email_id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      {copiedField === email.email_id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === email.email_id ? "Copied!" : "Copy All"}
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-secondary-700 uppercase tracking-wider">Subject</label>
                      <button
                        onClick={() => handleCopy(email.subject, `sub-${email.email_id}`)}
                        className="text-[11px] text-orange-600 hover:text-orange-700"
                      >
                        {copiedField === `sub-${email.email_id}` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm font-medium text-secondary-900">
                      {email.subject}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-secondary-700 uppercase tracking-wider">Body</label>
                      <button
                        onClick={() => handleCopy(email.body, `body-${email.email_id}`)}
                        className="text-[11px] text-orange-600 hover:text-orange-700"
                      >
                        {copiedField === `body-${email.email_id}` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="bg-card border border-border rounded-lg px-3 py-3 text-sm text-secondary-800 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                      {email.body}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state or generate prompt */}
              {existingEmails.length === 0 && !loading && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-2">AI Email Generator</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                    Generate a professional outreach email based on the job details using AI.
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">Generating your email...</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">This may take a few seconds</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between">
          <Button
            onClick={handleGenerate}
            disabled={loading}
            variant="portal"
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {existingEmails.length > 0 ? "Generate Another" : "Generate Email"}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default GenerateEmailModal;
