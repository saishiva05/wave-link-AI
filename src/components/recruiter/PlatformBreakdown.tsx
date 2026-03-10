import { TrendingUp, Info } from "lucide-react";
import { useRecruiterPlatformBreakdown } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";
import wavelynkLogo from "@/assets/wavelynk-logo-unified.png";

const PlatformBreakdown = () => {
  const { data, isLoading } = useRecruiterPlatformBreakdown();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const linkedin = data?.linkedin || { count: 0, percent: 0, recent: 0 };
  const jsearch = data?.jsearch || { count: 0, percent: 0, recent: 0 };

  const engines = [
    {
      name: "WaveLynk Max",
      count: linkedin.count,
      percent: linkedin.percent,
      recent: linkedin.recent,
      gradient: "from-secondary to-secondary-700",
    },
    {
      name: "WaveLynk Pro",
      count: jsearch.count,
      percent: jsearch.percent,
      recent: jsearch.recent,
      gradient: "from-primary to-primary-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {engines.map((engine) => (
        <div
          key={engine.name}
          className={`relative overflow-hidden rounded-2xl p-7 text-primary-foreground bg-gradient-to-br ${engine.gradient}`}
        >
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg width="180" height="160" viewBox="0 0 200 200" fill="none">
              <path d="M0,120 Q50,80 100,120 T200,120 V200 H0 Z" fill="white" />
              <path d="M0,150 Q50,110 100,150 T200,150 V200 H0 Z" fill="white" opacity="0.5" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <img src={wavelynkLogo} alt={engine.name} className="w-9 h-9 object-contain brightness-0 invert" />
              <span className="text-base font-semibold text-white">{engine.name}</span>
            </div>
            <p className="text-4xl font-bold font-display text-white mb-1">{engine.count.toLocaleString()}</p>
            <p className="text-white/70 text-sm mb-5">jobs found</p>
            <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              {engine.percent}% of total
            </span>
            <div className="mt-5 pt-4 border-t border-white/20 flex items-center gap-2 text-xs text-white/80">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{engine.recent} jobs in last 7 days</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlatformBreakdown;
