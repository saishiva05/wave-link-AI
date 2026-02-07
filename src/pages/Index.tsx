import { Shield, Briefcase, User } from "lucide-react";
import { motion } from "framer-motion";
import PortalCard from "@/components/PortalCard";
import WavePattern from "@/components/WavePattern";
import wavelynkLogo from "@/assets/wavelynk-logo.jpeg";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-20 flex items-center justify-center bg-card shadow-card sticky top-0 z-50">
        <div className="flex flex-col items-center">
          <img src={wavelynkLogo} alt="Wave Lynk AI" className="w-36 md:w-44" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden" style={{ background: "var(--gradient-bg)" }}>
        {/* Wave Pattern Background */}
        <div className="absolute inset-0 text-primary pointer-events-none">
          <WavePattern className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-16 py-12 md:py-16">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <p className="text-sm tracking-widest text-primary font-medium uppercase mb-3">
              AI-Powered Recruitment Intelligence
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              Welcome to Wave Lynk AI
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose your portal to continue
            </p>
          </motion.div>

          {/* Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <PortalCard
              icon={Shield}
              title="Admin Portal"
              description="Manage the platform, create recruiter accounts, and monitor system-wide analytics."
              badge="Restricted Access"
              buttonText="Admin Login"
              buttonVariant="portal-secondary"
              href="/admin/login"
              index={0}
            />
            <PortalCard
              icon={Briefcase}
              title="Recruiter Portal"
              description="Source top talent, scrape jobs from multiple platforms, and manage candidate applications with AI assistance."
              features={[
                "AI-Powered Job Scraping",
                "ATS Resume Matching",
                "Candidate Management",
              ]}
              buttonText="Recruiter Login"
              buttonVariant="portal"
              href="/recruiter/login"
              featured
              index={1}
            />
            <PortalCard
              icon={User}
              title="Candidate Portal"
              description="Track your job applications, view application status, and see opportunities your recruiter has submitted on your behalf."
              infoNote="You'll receive login credentials from your assigned recruiter."
              buttonText="Candidate Login"
              buttonVariant="portal-secondary"
              href="/candidate/login"
              index={2}
            />
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-neutral-500 mt-12"
          >
            Need help? Contact your administrator or support team.
          </motion.p>
        </div>
      </main>
    </div>
  );
};

export default Index;
