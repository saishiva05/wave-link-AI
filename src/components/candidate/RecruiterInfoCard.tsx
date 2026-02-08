import { Briefcase, Mail, Send, Award, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecruiterInfo } from "@/hooks/useCandidateDashboard";

interface RecruiterInfoCardProps {
  recruiter: RecruiterInfo;
}

const RecruiterInfoCard = ({ recruiter }: RecruiterInfoCardProps) => {
  const initials = recruiter.name.split(" ").map((w) => w[0]).join("").toUpperCase();

  return (
    <div>
      <h3 className="text-xl font-semibold text-secondary-900 font-display mb-6">Your Recruiter</h3>
      <div className="bg-card border border-border rounded-xl p-8 shadow-xs max-w-2xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0 border-4 border-card shadow-card">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-semibold text-secondary-900">{recruiter.name}</h4>
            <p className="text-sm text-neutral-600 flex items-center gap-1.5 mt-1">
              <Briefcase className="w-3.5 h-3.5" /> Senior Recruiter at {recruiter.company}
            </p>
            <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-neutral-700">
              <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-primary" /> {recruiter.total_applications} applications submitted</span>
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-success-500" /> 5+ years experience</span>
            </div>
            <Button variant="portal" size="sm" className="mt-5" onClick={() => window.open(`mailto:${recruiter.email}`)}>
              <Mail className="w-4 h-4" /> Contact {recruiter.name.split(" ")[0]}
            </Button>
          </div>
        </div>
        <div className="mt-6 bg-info-50 border-l-4 border-info-500 rounded-r-md p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />
          <p className="text-sm text-info-700">Have questions about your applications? Feel free to reach out anytime!</p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterInfoCard;
