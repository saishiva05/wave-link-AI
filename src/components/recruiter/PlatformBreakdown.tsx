import { TrendingUp } from "lucide-react";
import { useRecruiterPlatformBreakdown } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";
import wavelynkLogo from "@/assets/wavelynk-logo-unified.png";

const PlatformBreakdown = () => {
  const { data, isLoading } = useRecruiterPlatformBreakdown();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground font-display">Jobs by Engine</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const linkedin = data?.linkedin || { count: 0, percent: 0, recent: 0 };
  const jsearch = data?.jsearch || { count: 0, percent: 0, recent: 0 };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground font-display">Jobs by Engine</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WaveLynk Max Card */}
        <div className="relative overflow-hidden rounded-xl p-8 text-primary-foreground bg-gradient-to-br from-primary to-primary-700">
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none"><path d="M0,120 Q50,80 100,120 T200,120 V200 H0 Z" fill="white" /><path d="M0,150 Q50,110 100,150 T200,150 V200 H0 Z" fill="white" opacity="0.5" /></svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <img src={wavelynkLogo} alt="WaveLynk Max" className="w-10 h-10 object-contain brightness-0 invert" />
              <span className="text-lg font-semibold">WaveLynk Max</span>
            </div>
            <p className="text-5xl font-bold font-display mb-1">{linkedin.count.toLocaleString()}</p>
            <p className="text-white/80 text-base mb-6">jobs found</p>
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">{linkedin.percent}% of total</span>
            <div className="mt-6 pt-5 border-t border-white/20 flex items-center gap-2 text-sm text-white/90">
              <TrendingUp className="w-4 h-4" /><span>+{linkedin.recent} jobs in last 7 days</span>
            </div>
          </div>
        </div>

        {/* WaveLynk Pro Card */}
        <div className="relative overflow-hidden rounded-xl p-8 text-secondary-foreground bg-gradient-to-br from-secondary to-secondary-800">
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none"><path d="M0,120 Q50,80 100,120 T200,120 V200 H0 Z" fill="white" /><path d="M0,150 Q50,110 100,150 T200,150 V200 H0 Z" fill="white" opacity="0.5" /></svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <img src={wavelynkIcon} alt="WaveLynk Pro" className="w-8 h-8 object-contain brightness-0 invert" />
              <span className="text-lg font-semibold text-white">WaveLynk Pro</span>
            </div>
            <p className="text-5xl font-bold font-display text-white mb-1">{jsearch.count.toLocaleString()}</p>
            <p className="text-white/80 text-base mb-6">jobs found</p>
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">{jsearch.percent}% of total</span>
            <div className="mt-6 pt-5 border-t border-white/20 flex items-center gap-2 text-sm text-white/90">
              <TrendingUp className="w-4 h-4" /><span>+{jsearch.recent} jobs in last 7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformBreakdown;
