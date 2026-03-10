import { TrendingUp } from "lucide-react";
import { useRecruiterPlatformBreakdown } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";
import wavelynkLogo from "@/assets/wavelynk-logo-unified.png";

const PlatformBreakdown = () => {
  const { data, isLoading } = useRecruiterPlatformBreakdown();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  const linkedin = data?.linkedin || { count: 0, percent: 0, recent: 0 };
  const jsearch = data?.jsearch || { count: 0, percent: 0, recent: 0 };

  const engines = [
    { name: "WaveLynk Max", count: linkedin.count, percent: linkedin.percent, recent: linkedin.recent },
    { name: "WaveLynk Pro", count: jsearch.count, percent: jsearch.percent, recent: jsearch.recent },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {engines.map((engine) => (
        <div
          key={engine.name}
          className="relative overflow-hidden rounded-2xl p-6 bg-card border border-border"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <img src={wavelynkLogo} alt={engine.name} className="w-7 h-7 object-contain opacity-60" />
              <span className="text-xs font-semibold text-muted-foreground">{engine.name}</span>
            </div>
            <p className="text-3xl font-bold font-display text-foreground mb-0.5">{engine.count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mb-4">jobs found</p>
            <div className="flex items-center gap-3">
              <span className="inline-block bg-primary/10 text-primary text-[10px] font-semibold px-2.5 py-1 rounded-full">
                {engine.percent}% of total
              </span>
              <span className="flex items-center gap-1 text-[10px] text-success-600">
                <TrendingUp className="w-3 h-3" /> +{engine.recent} this week
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlatformBreakdown;