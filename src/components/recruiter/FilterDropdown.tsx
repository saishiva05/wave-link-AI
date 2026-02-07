import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterDropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string | string[];
  options: { value: string; label: string }[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
}

const FilterDropdown = ({ label, icon, value, options, onChange, multi }: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = multi
    ? Array.isArray(value) && value.length > 0 && !(value.length === 1 && value[0] === "")
    : typeof value === "string" && value !== "";

  const displayText = () => {
    if (multi && Array.isArray(value) && value.length > 0 && !(value.length === 1 && value[0] === "")) {
      return `${value.length} selected`;
    }
    if (!multi && typeof value === "string" && value) {
      return options.find((o) => o.value === value)?.label || label;
    }
    return label;
  };

  const handleSelect = (optValue: string) => {
    if (multi) {
      const arr = Array.isArray(value) ? [...value] : [];
      if (optValue === "") {
        onChange([]);
        return;
      }
      const filtered = arr.filter((v) => v !== "");
      if (filtered.includes(optValue)) {
        onChange(filtered.filter((v) => v !== optValue));
      } else {
        onChange([...filtered, optValue]);
      }
    } else {
      onChange(optValue);
      setOpen(false);
    }
  };

  const isSelected = (optValue: string) => {
    if (multi && Array.isArray(value)) return value.includes(optValue);
    return value === optValue;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 h-11 px-3.5 rounded-lg border text-sm font-medium transition-all whitespace-nowrap",
          isActive
            ? "border-primary bg-primary-50 text-primary-700"
            : "border-border bg-card text-neutral-600 hover:bg-muted"
        )}
      >
        {icon}
        <span>{displayText()}</span>
        <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-52 bg-card border border-border rounded-lg shadow-elevated overflow-hidden animate-scale-in">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50 transition-colors",
                  isSelected(opt.value) && "bg-primary-50 text-primary-700"
                )}
              >
                {multi && (
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                    isSelected(opt.value) ? "bg-primary border-primary" : "border-neutral-300"
                  )}>
                    {isSelected(opt.value) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                )}
                <span className="flex-1">{opt.label}</span>
                {!multi && isSelected(opt.value) && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
