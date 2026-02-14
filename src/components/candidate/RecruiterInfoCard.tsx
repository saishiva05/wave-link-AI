import { Briefcase, Mail, Send, Award, Info, Phone, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { RecruiterInfo } from "@/hooks/useCandidateDashboard";

interface RecruiterInfoCardProps {
  recruiter: RecruiterInfo;
}

const RecruiterInfoCard = ({ recruiter }: RecruiterInfoCardProps) => {
  const navigate = useNavigate();
  const initials = recruiter.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      <h3 className="text-xl font-semibold text-secondary-900 font-display mb-6">Your Recruiter</h3>
      <div className="bg-card border border-border rounded-xl p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0 border-4 border-card shadow-card">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-semibold text-secondary-900">{recruiter.name}</h4>
            <p className="text-sm text-neutral-600 flex items-center gap-1.5 mt-1">
              <Briefcase className="w-3.5 h-3.5" /> Recruiter at {recruiter.company}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {recruiter.email && (
                <span className="flex items-center gap-1.5 text-sm text-neutral-700">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" /> {recruiter.email}
                </span>
              )}
              {recruiter.phone && (
                <span className="flex items-center gap-1.5 text-sm text-neutral-700">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" /> {recruiter.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-neutral-700">
                <Send className="w-3.5 h-3.5 text-primary" /> {recruiter.total_applications} applications submitted
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <Button variant="portal" size="sm" onClick={() => navigate("/candidate/messages")}>
                <MessageSquare className="w-4 h-4" /> Send Message
              </Button>
              {recruiter.email && (
                <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${recruiter.email}`)}>
                  <Mail className="w-4 h-4" /> Email {recruiter.name.split(" ")[0]}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 bg-info-50 border-l-4 border-info-500 rounded-r-md p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />
          <p className="text-sm text-info-700">Your recruiter manages your job applications, uploads CVs, and coordinates interviews on your behalf. Feel free to message them anytime!</p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterInfoCard;
