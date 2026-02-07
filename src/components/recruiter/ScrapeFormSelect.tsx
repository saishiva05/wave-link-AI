import { useState, useRef, useEffect } from "react";
import { LucideIcon, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrapeFormSelectProps {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  helper?: string;
  optional?: boolean;
}

const ScrapeFormSelect = ({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  options,
  helper,
  optional,
}: ScrapeFormSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
        {label}
        {optional && (
          <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Optional</span>
        )}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full h-12 flex items-center gap-2 px-3.5 text-base rounded-lg border bg-card transition-all text-left",
            open ? "border-primary ring-2 ring-primary/20" : "border-border",
            value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <Icon className="w-5 h-5 text-neutral-500 shrink-0" />
          <span className="flex-1 truncate">{selectedLabel || placeholder}</span>
          <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform shrink-0", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-elevated overflow-hidden animate-scale-in">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-primary-50 transition-colors text-left",
                  value === opt.value && "bg-primary-50 text-primary-700"
                )}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {helper && <p className="mt-1.5 text-xs text-neutral-500">{helper}</p>}
    </div>
  );
};

export default ScrapeFormSelect;
