import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, Mail, MessageSquare, FileText, Briefcase, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import { cn } from "@/lib/utils";

const faqs = [
  {
    icon: Briefcase, category: "Applications",
    items: [
      { q: "How do I track my application status?", a: "Go to the 'My Applications' page from the sidebar. Each application shows its current status (Pending, In Review, Interview Scheduled, etc.). Click on any application to see the full timeline and details." },
      { q: "What do the different application statuses mean?", a: "Pending: Your application has been submitted and is awaiting review. In Review: The employer is reviewing your application. Interview Scheduled: An interview has been arranged. Interviewed: The interview has been completed. Offer Received: You've received a job offer. Hired: Congratulations, you've been hired! Rejected: Unfortunately, the application was not successful. Declined: You chose to decline the opportunity." },
      { q: "Can I apply to jobs myself?", a: "No, your recruiter handles all job applications on your behalf. They will match you with suitable positions based on your profile and CV. You can always message your recruiter if you find a role you're interested in." },
    ],
  },
  {
    icon: FileText, category: "CVs & Documents",
    items: [
      { q: "How do I update my CV?", a: "Contact your assigned recruiter to upload a new version of your CV. You can view and download all your uploaded CVs from the 'My CVs' page." },
      { q: "What is a 'Primary CV'?", a: "Your primary CV is the main resume your recruiter uses when applying to jobs on your behalf. It's marked with a star badge on the CVs page." },
      { q: "Can I download my CVs?", a: "Yes! Visit the 'My CVs' page and click the Download button on any CV to save it to your device." },
    ],
  },
  {
    icon: MessageSquare, category: "Communication",
    items: [
      { q: "How do I contact my recruiter?", a: "You can send messages directly from the 'Messages' page in the sidebar. You can also click the 'Contact' button on the dashboard or your recruiter's profile card." },
      { q: "Will I be notified about updates?", a: "Yes, you'll see notifications in the bell icon at the top of the page whenever there are status updates on your applications." },
    ],
  },
  {
    icon: Shield, category: "Account & Privacy",
    items: [
      { q: "Is my data secure?", a: "Absolutely. All your personal data, CVs, and application details are encrypted and stored securely. Only you and your assigned recruiter can access your information." },
      { q: "How do I change my password?", a: "You can reset your password from the login page using the 'Forgot Password' link. A reset email will be sent to your registered email address." },
    ],
  },
];

const CandidateSupport = () => {
  const navigate = useNavigate();
  const { recruiter } = useCandidateDashboard();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <button onClick={() => navigate("/candidate/dashboard")} className="text-neutral-500 hover:text-primary transition-colors">Dashboard</button>
          <span className="text-neutral-300">/</span>
          <span className="text-secondary-900 font-semibold">Help & Support</span>
        </nav>
        <h1 className="text-2xl md:text-4xl font-bold text-secondary-900 font-display">Help & Support</h1>
        <p className="text-base text-muted-foreground mt-1">Find answers to common questions or reach out for help</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-secondary-900">Message Your Recruiter</h4>
            <p className="text-sm text-neutral-600 mt-0.5">Send a direct message to {recruiter.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/candidate/messages")}>
            Message
          </Button>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-info-50 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-info-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-secondary-900">Email Support</h4>
            <p className="text-sm text-neutral-600 mt-0.5">Reach our support team via email</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.open("mailto:support@wavelynk.ai")}>
            Email
          </Button>
        </div>
      </motion.div>

      {/* FAQs */}
      {faqs.map((section, si) => (
        <motion.div key={section.category} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + si * 0.05 }}>
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-neutral-50 flex items-center gap-3">
              <section.icon className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-secondary-900">{section.category}</h3>
            </div>
            <div className="divide-y divide-border">
              {section.items.map((faq, fi) => {
                const key = `${si}-${fi}`;
                const isOpen = openItems[key];
                return (
                  <button key={key} onClick={() => toggle(key)} className="w-full text-left px-6 py-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-secondary-900">{faq.q}</p>
                      <ChevronDown className={cn("w-4 h-4 text-neutral-500 shrink-0 transition-transform", isOpen && "rotate-180")} />
                    </div>
                    {isOpen && (
                      <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{faq.a}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CandidateSupport;
