import { motion } from "framer-motion";
import { HelpCircle, Mail, MessageSquare, FileText } from "lucide-react";

const supportItems = [
  {
    icon: FileText,
    title: "Documentation",
    description: "Browse guides and tutorials for the Wave Lynk AI platform.",
    action: "View Docs",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team for immediate assistance.",
    action: "Start Chat",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us an email at support@wavelynk.ai and we'll get back to you.",
    action: "Send Email",
  },
];

const AdminSupport = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Help & Support</h1>
        <p className="text-base text-muted-foreground mt-1">Get help with the platform</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
      >
        {supportItems.map((item) => (
          <div
            key={item.title}
            className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-secondary-900 mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            <button className="text-sm text-primary font-medium hover:underline">
              {item.action} →
            </button>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6 shadow-card"
      >
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "How do I create a new recruiter account?", a: "Navigate to Recruiters page and click 'Create New Recruiter' button." },
            { q: "Can I deactivate a recruiter without deleting them?", a: "Yes, use the Actions menu on the recruiter table to toggle their status." },
            { q: "How do I view platform-wide analytics?", a: "Go to the Analytics section from the sidebar for detailed reports." },
          ].map((faq) => (
            <div key={faq.q} className="border-b border-border pb-3 last:border-0">
              <p className="text-sm font-medium text-secondary-900 mb-1">{faq.q}</p>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSupport;
