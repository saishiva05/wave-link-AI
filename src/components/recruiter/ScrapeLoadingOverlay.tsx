import { Loader2 } from "lucide-react";

interface ScrapeLoadingOverlayProps {
  isLoading: boolean;
  platform: string;
}

const ScrapeLoadingOverlay = ({ isLoading, platform }: ScrapeLoadingOverlayProps) => {
  if (!isLoading) return null;

  const platformName = platform === "linkedin" ? "LinkedIn" : "JSearch";

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
      {/* Subtle wave background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="hsl(174, 72%, 33%)" d="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,218.7C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z">
            <animate attributeName="d" dur="8s" repeatCount="indefinite"
              values="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,218.7C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z;
                      M0,192L48,213.3C96,235,192,277,288,266.7C384,256,480,192,576,181.3C672,171,768,213,864,224C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L0,320Z;
                      M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,218.7C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z"
            />
          </path>
        </svg>
      </div>

      <Loader2 className="w-16 h-16 text-primary animate-spin" />
      <h3 className="text-xl font-bold text-secondary-900 font-display mt-6">
        Scraping jobs from {platformName}...
      </h3>
      <p className="text-base text-muted-foreground mt-2">
        This may take 10–30 seconds
      </p>
      <div className="flex gap-1 mt-4">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};

export default ScrapeLoadingOverlay;
