import { useNavigate } from "react-router-dom";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PortalCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  features?: string[];
  infoNote?: string;
  buttonText: string;
  buttonVariant: "portal" | "portal-secondary" | "portal-info";
  href: string;
  featured?: boolean;
  index: number;
}

const PortalCard = ({
  icon: Icon,
  title,
  description,
  badge,
  features,
  infoNote,
  buttonText,
  buttonVariant,
  href,
  featured = false,
  index,
}: PortalCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
      className={`${featured ? "portal-card-featured" : "portal-card"} flex flex-col items-center text-center`}
    >
      <div className="icon-circle">
        <Icon className="w-7 h-7 text-primary" strokeWidth={1.8} />
      </div>

      <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
        {title}
      </h2>

      <p className="text-muted-foreground leading-relaxed mb-8 max-w-[280px]">
        {description}
      </p>

      {badge && (
        <span className="inline-block mb-6 px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
          {badge}
        </span>
      )}

      {features && (
        <ul className="w-full text-left space-y-3 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 text-success-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {infoNote && (
        <div className="notice-info w-full text-left mb-6 flex items-start gap-2">
          <svg className="w-4 h-4 text-info-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{infoNote}</span>
        </div>
      )}

      <div className="mt-auto w-full">
        <Button
          variant={buttonVariant}
          size="lg"
          className="w-full group"
          onClick={() => navigate(href)}
        >
          {buttonText}
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PortalCard;
