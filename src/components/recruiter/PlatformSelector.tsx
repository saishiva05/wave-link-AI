import { Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformSelectorProps {
  value: string;
  onChange: (value: "linkedin" | "jsearch") => void;
  error?: string;
}

const PlatformSelector = ({ value, onChange, error }: PlatformSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-3">
        Scraping Platform <span className="text-destructive">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* LinkedIn */}
        <button
          type="button"
          onClick={() => onChange("linkedin")}
          className={cn(
            "relative rounded-xl p-6 border-2 text-left transition-all duration-200 cursor-pointer group",
            value === "linkedin"
              ? "border-primary bg-primary-50 shadow-sm"
              : error
                ? "border-destructive bg-error-50"
                : "border-border hover:border-primary-400 hover:shadow-sm"
          )}
        >
          {/* Radio indicator */}
          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              value === "linkedin" ? "border-primary bg-primary" : "border-neutral-300"
            )}>
              {value === "linkedin" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            <span className="text-lg font-semibold text-secondary-900">LinkedIn</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Scrape professional job postings from LinkedIn's network
          </p>
          <span className="inline-block mt-3 text-[10px] font-semibold bg-success-50 text-success-700 px-2.5 py-1 rounded-full">
            Most Popular
          </span>
        </button>

        {/* JSearch */}
        <button
          type="button"
          onClick={() => onChange("jsearch")}
          className={cn(
            "relative rounded-xl p-6 border-2 text-left transition-all duration-200 cursor-pointer group",
            value === "jsearch"
              ? "border-primary bg-primary-50 shadow-sm"
              : error
                ? "border-destructive bg-error-50"
                : "border-border hover:border-primary-400 hover:shadow-sm"
          )}
        >
          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              value === "jsearch" ? "border-primary bg-primary" : "border-neutral-300"
            )}>
              {value === "jsearch" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <Search className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-lg font-semibold text-secondary-900">JSearch</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Access jobs from Google's job search aggregator
          </p>
          <span className="inline-block mt-3 text-[10px] font-semibold bg-info-50 text-info-700 px-2.5 py-1 rounded-full">
            Broader Coverage
          </span>
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
};

export default PlatformSelector;
