import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Mail, MessageSquare, ChevronDown, ChevronUp, BookOpen, Zap, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Job Scraping",
    icon: Zap,
    items: [
      { q: "How does job scraping work?", a: "Enter your search criteria (job title, location, platform) and click 'Scrape Jobs'. Our system connects to LinkedIn or JSearch APIs to find matching job postings and saves them to your database automatically." },
      { q: "How many jobs can I scrape at once?", a: "Each scraping session can return up to 50 jobs depending on the platform and search criteria. You can run multiple sessions with different filters." },
      { q: "Why are some jobs missing salary information?", a: "Not all job postings include salary data. This depends on what the employer has disclosed on the original platform." },
    ],
  },
  {
    category: "CV Management",
    icon: FileText,
    items: [
      { q: "What file formats are supported for CV uploads?", a: "We support PDF and DOCX file formats. The maximum file size is 10MB per document." },
      { q: "How does the AI CV update work?", a: "The AI analyzes the candidate's original CV along with the target job description and creates an optimized version that better matches the job requirements while preserving the candidate's actual experience." },
      { q: "What is a 'primary' CV?", a: "Each candidate can have one primary CV marked as their default resume. This is the CV that will be suggested first when running ATS analysis or submitting applications." },
    ],
  },
  {
    category: "ATS Analysis",
    icon: Shield,
    items: [
      { q: "How is the ATS score calculated?", a: "The ATS score is based on keyword matching, skills alignment, experience relevance, and formatting compatibility with common Applicant Tracking Systems. A score above 70% is considered a strong match." },
      { q: "Why must I update the CV before running ATS?", a: "The ATS analysis works best on AI-optimized CVs that are already tailored to the specific job. This sequential workflow ensures the most accurate matching results." },
      { q: "Can I run ATS analysis for multiple candidates on the same job?", a: "Yes! Each job can have multiple ATS analyses — one per candidate. Results are grouped by candidate in the expanded job view." },
    ],
  },
  {
    category: "General",
    icon: BookOpen,
    items: [
      { q: "How do I add a new candidate?", a: "Go to the Candidates page and click 'Add Candidate'. Fill in their details including name, email, and a temporary password. The candidate will receive login credentials for their own portal." },
      { q: "Can candidates see their applications?", a: "Yes. Candidates have their own portal where they can view submitted applications, track statuses, and access their CVs." },
      { q: "How do I contact support?", a: "You can reach us at support@wavelynk.ai or use the contact form below. Our team typically responds within 24 hours." },
    ],
  },
];

const RecruiterSupportPage = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Help & Support</h1>
        <p className="text-base text-muted-foreground mt-1">Find answers to common questions or reach out to our team</p>
      </motion.div>

      {/* Contact Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <a href="mailto:support@wavelynk.ai"
          className="flex items-center gap-4 p-6 bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-secondary-900">Email Support</h3>
            <p className="text-sm text-muted-foreground">support@wavelynk.ai</p>
            <p className="text-xs text-muted-foreground mt-1">Typically responds within 24 hours</p>
          </div>
        </a>
        <div className="flex items-center gap-4 p-6 bg-card border border-border rounded-xl shadow-card">
          <div className="w-12 h-12 rounded-full bg-info-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-info-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-secondary-900">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Coming soon</p>
            <p className="text-xs text-muted-foreground mt-1">Real-time assistance from our team</p>
          </div>
        </div>
      </motion.div>

      {/* FAQs */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-bold text-secondary-900 font-display">Frequently Asked Questions</h2>
        {faqs.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.category} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 border-b border-border">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-secondary-900">{section.category}</h3>
              </div>
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = openItems.has(key);
                return (
                  <div key={key} className={cn(i < section.items.length - 1 && "border-b border-border")}>
                    <button onClick={() => toggle(key)}
                      className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-sm font-medium text-secondary-900 pr-4">{item.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default RecruiterSupportPage;
