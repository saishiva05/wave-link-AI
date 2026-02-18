import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import wavelynkLogo from "@/assets/wavelynk-logo.png";

interface LoginLayoutProps {
  children: ReactNode;
  heading: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  gradient: string;
}

const LoginLayout = ({
  children,
  heading,
  description,
  features,
  icon: Icon,
  gradient,
}: LoginLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Branding Section */}
      <div className={`${gradient} lg:w-[40%] lg:fixed lg:inset-y-0 lg:left-0 flex flex-col justify-between p-8 lg:p-16`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          <div className="inline-block bg-white rounded-2xl p-4 shadow-lg mb-8 lg:mb-12">
            <img
              src={wavelynkLogo}
              alt="WaveLynk IT Consulting & Services"
              className="h-14 lg:h-16 w-auto object-contain"
            />
          </div>
          <h1 className="font-display text-2xl lg:text-4xl font-bold text-primary-foreground mb-4">
            {heading}
          </h1>
          <p className="text-primary-foreground/70 text-base lg:text-lg leading-relaxed mb-8 lg:mb-12 max-w-md">
            {description}
          </p>

          <ul className="hidden lg:flex flex-col gap-5">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-primary-foreground/80">
                <svg className="w-5 h-5 text-primary-foreground/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm lg:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Decorative icon */}
        <div className="hidden lg:block absolute bottom-12 right-12 opacity-[0.08]">
          <Icon className="w-48 h-48 text-primary-foreground" strokeWidth={0.5} />
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 lg:ml-[40%] min-h-screen flex items-center justify-center px-6 py-12 lg:px-16 bg-background wave-pattern-bg">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="form-container"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginLayout;
