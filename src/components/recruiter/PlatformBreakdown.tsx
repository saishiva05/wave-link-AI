import { TrendingUp } from "lucide-react";
import { useRecruiterPlatformBreakdown } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";

const PlatformBreakdown = () => {
  const { data, isLoading } = useRecruiterPlatformBreakdown();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-secondary-900 font-display">Jobs by Platform</h2>
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
      <h2 className="text-xl font-bold text-secondary-900 font-display">Jobs by Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn Card */}
        <div className="relative overflow-hidden rounded-xl p-8 text-primary-foreground" style={{ background: "linear-gradient(135deg, #0A66C2, #004182)" }}>
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none"><path d="M0,120 Q50,80 100,120 T200,120 V200 H0 Z" fill="white" /><path d="M0,150 Q50,110 100,150 T200,150 V200 H0 Z" fill="white" opacity="0.5" /></svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
              <span className="text-lg font-semibold">LinkedIn</span>
            </div>
            <p className="text-5xl font-bold font-display mb-1">{linkedin.count.toLocaleString()}</p>
            <p className="text-white/80 text-base mb-6">jobs found</p>
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">{linkedin.percent}% of total</span>
            <div className="mt-6 pt-5 border-t border-white/20 flex items-center gap-2 text-sm text-white/90">
              <TrendingUp className="w-4 h-4" /><span>+{linkedin.recent} jobs in last 7 days</span>
            </div>
          </div>
        </div>

        {/* JSearch Card */}
        <div className="relative overflow-hidden rounded-xl p-8 text-secondary-foreground" style={{ background: "linear-gradient(135deg, hsl(215, 60%, 18%), hsl(215, 55%, 25%))" }}>
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none"><path d="M0,120 Q50,80 100,120 T200,120 V200 H0 Z" fill="white" /><path d="M0,150 Q50,110 100,150 T200,150 V200 H0 Z" fill="white" opacity="0.5" /></svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <span className="text-lg font-semibold text-white">JSearch</span>
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
