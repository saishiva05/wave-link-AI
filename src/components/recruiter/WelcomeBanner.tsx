import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const DISMISS_KEY = "recruiter-welcome-dismissed";

const WelcomeBanner = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");
  const navigate = useNavigate();
  const { fullName } = useAuth();

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 md:p-10 text-primary-foreground"
      style={{ background: "linear-gradient(135deg, hsl(174, 72%, 33%), hsl(174, 65%, 42%))" }}
    >
      {/* Wave pattern bg */}
      <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
        <svg width="320" height="200" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,120 Q80,60 160,120 T320,120 V200 H0 Z" fill="white" />
          <path d="M0,160 Q80,100 160,160 T320,160 V200 H0 Z" fill="white" opacity="0.5" />
        </svg>
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 max-w-xl">
        <Sparkles className="w-8 h-8 mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold font-display mb-3">
          Welcome back, {fullName?.split(" ")[0] || "there"}!
        </h2>
        <p className="text-base md:text-lg text-white/90 mb-6 leading-relaxed">
          You're making great progress. Here's what's happening with your recruitment efforts.
        </p>
        <Button
          onClick={() => navigate("/recruiter/scrape-jobs")}
          className="bg-white text-primary-700 hover:bg-white/90 font-semibold"
          size="lg"
        >
          Start Finding Jobs
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeBanner;
