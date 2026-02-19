import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search, FileText, Brain, Users, BarChart3,
  Zap, Target, Clock, CheckCircle2, ArrowRight, Star,
  Globe, Sparkles, GraduationCap, Rocket, ShieldCheck,
  TrendingUp, HeartHandshake, Eye, MessageSquare, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import type { Easing } from "framer-motion";
import wavelynkLogo from "@/assets/wavelynk-logo.png";

const easeOut: Easing = [0, 0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: easeOut }
  })
};

const stats = [
  { value: "10x", label: "Faster Job Placement", icon: Zap },
  { value: "95%", label: "Resume-to-Job Match", icon: Target },
  { value: "500+", label: "Jobs Found Daily", icon: Globe },
  { value: "Zero", label: "Effort From You", icon: Clock },
];

const features = [
  {
    icon: Search,
    title: "We Find Jobs For You",
    description: "Our AI scans LinkedIn, JSearch, and top job boards 24/7 — finding roles that match your skills, experience, and career goals automatically.",
  },
  {
    icon: Brain,
    title: "AI-Optimized Resumes",
    description: "Your CV gets tailored for every job application. Our ATS matching engine ensures your resume beats filters and lands on recruiter desks.",
  },
  {
    icon: FileText,
    title: "One CV, Unlimited Versions",
    description: "Upload your resume once. We create optimized versions for each application — highlighting the right skills for every role.",
  },
  {
    icon: Eye,
    title: "Track Everything in Real-Time",
    description: "See exactly where each application stands — submitted, reviewed, interview scheduled, offer received. No more guessing.",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Recruiter Support",
    description: "You're assigned a real recruiter who works on your behalf — sourcing jobs, submitting applications, and advocating for you.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Message your recruiter anytime. Get updates, ask questions, and stay informed throughout your entire job search journey.",
  },
];

const howItWorks = [
  { step: "01", title: "Sign Up & Upload CV", description: "Create your profile and upload your resume. That's all you need to do — we handle the rest.", icon: GraduationCap },
  { step: "02", title: "AI Finds Your Dream Jobs", description: "Our AI agents scrape hundreds of job platforms daily and match you with roles that fit your profile perfectly.", icon: Search },
  { step: "03", title: "We Apply On Your Behalf", description: "Your dedicated recruiter submits tailored applications with AI-optimized resumes — so you never miss an opportunity.", icon: Rocket },
  { step: "04", title: "You Get Hired", description: "Track every application in real-time, attend interviews with confidence, and land your dream job.", icon: Sparkles },
];

const testimonials = [
  { name: "Ankit S.", role: "Software Engineer — Hired in 3 weeks", quote: "I was struggling with applications for months. Wave Lynk AI found me the perfect role and my recruiter handled everything. I just showed up to interviews!", rating: 5 },
  { name: "Maria L.", role: "Data Analyst — Landed $95K offer", quote: "The ATS-optimized resume was a game changer. I went from zero callbacks to 5 interview calls in one week.", rating: 5 },
  { name: "David C.", role: "UX Designer — 4 offers in 2 weeks", quote: "I could track every application in real-time. The transparency and recruiter support gave me so much confidence.", rating: 5 },
];

const whyUs = [
  { icon: Zap, title: "100% Free For Students", description: "You pay nothing. Our recruiters work on your behalf at zero cost to you." },
  { icon: ShieldCheck, title: "Only Legit, Full-Time Roles", description: "No contract gigs. No C2C. Only direct, full-time positions with real companies." },
  { icon: TrendingUp, title: "AI + Human Expertise", description: "AI finds the jobs. Real recruiters submit and follow up. The best of both worlds." },
  { icon: Target, title: "Personalized Job Matching", description: "Not random applications. Every job is matched to your skills, location, and career goals." },
];
const faqs = [
  { q: "Is Wave Lynk AI really free for students?", a: "Yes, 100% free. You never pay anything. Our service is funded by the companies and recruiters who use our platform to find talent like you." },
  { q: "How does the AI find jobs for me?", a: "Our AI agents scan hundreds of job boards including LinkedIn and JSearch 24/7. They match listings to your skills, experience, location preferences, and career goals — so you only see relevant opportunities." },
  { q: "Do I need to apply to jobs myself?", a: "No! That's the best part. Your assigned recruiter handles all applications on your behalf. They submit tailored, ATS-optimized resumes for each role. You just focus on preparing for interviews." },
  { q: "What kind of jobs will I be matched with?", a: "Only legitimate, full-time positions with real companies. No contract gigs, no C2C, no staffing agencies. Direct-hire roles that align with your career path and qualifications." },
  { q: "How long does it take to get hired?", a: "It varies by field and experience, but most students start receiving interview calls within 1–2 weeks of signing up. Some have landed offers in as little as 3 weeks." },
  { q: "Can I track my applications?", a: "Absolutely. Your candidate dashboard shows every application in real-time — submitted, under review, interview scheduled, offer received. Full transparency at every stage." },
  { q: "What makes Wave Lynk different from other job platforms?", a: "We combine AI technology with real human recruiters. While other platforms just list jobs, we actively apply on your behalf with optimized resumes and follow up with employers. It's like having a personal career agent." },
  { q: "Is my data safe?", a: "Yes. We use enterprise-grade encryption and never share your personal information with third parties without your consent. Your resume and data are only used to match you with jobs." },
];

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={fadeUp}
          custom={i * 0.5}
          className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors duration-300"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-6 text-left gap-4"
          >
            <span className="font-display font-semibold text-foreground">{faq.q}</span>
            <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1.5 shadow-sm">
              <img src={wavelynkLogo} alt="WaveLynk" className="h-8 w-auto object-contain" />
            </div>
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">Wave Lynk AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#why-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why Us</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Success Stories</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="font-semibold"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36">
          <motion.div
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Built for Students & Job Seekers</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              Stop Applying.{" "}
              <span className="text-primary">Start Getting Hired.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Upload your resume once. Our AI finds the best jobs, optimizes your CV for each role, 
              and a dedicated recruiter applies on your behalf. You just show up for interviews.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/login")} className="text-base px-8 h-14 font-semibold shadow-lg hover:shadow-xl transition-all">
                Get Started — It's Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }} className="text-base px-8 h-14 font-semibold">
                See How It Works
              </Button>
            </motion.div>

            <motion.p variants={fadeUp} custom={4} className="mt-4 text-sm text-muted-foreground">
              No credit card required • 100% free for candidates • Your dream job is waiting
            </motion.p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <div className="font-display text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Simple as 1-2-3-4
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              From Resume Upload to Job Offer
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We do the heavy lifting. You focus on acing your interviews.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="relative text-center group"
              >
                <div className="relative mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              What You Get
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Entire Job Search, Handled
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No more endless scrolling, no more tailoring resumes, no more guessing. We take care of everything.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-default"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Why Wave Lynk AI
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Students Trust Us
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Success Stories
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Students Who Landed Their Dream Jobs
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              FAQs
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
              Everything you need to know before getting started.
            </motion.p>
          </motion.div>

          <FAQAccordion />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary to-secondary/90 p-12 md:p-16 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div variants={fadeUp} custom={0} className="relative z-10">
              <GraduationCap className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Your Dream Job Is One Click Away
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-4 max-w-xl mx-auto">
                Join hundreds of students who stopped struggling with job applications and started getting hired — with the power of AI and real recruiter support.
              </p>
              <p className="text-primary-foreground/60 text-sm mb-8">
                It's completely free. No hidden costs. No commitments.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 h-14 font-semibold shadow-lg"
              >
                Get Started For Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white rounded-lg p-1.5 shadow-sm">
                  <img src={wavelynkLogo} alt="WaveLynk" className="h-8 w-auto object-contain" />
                </div>
                <span className="font-display text-lg font-bold text-foreground">Wave Lynk AI</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                WaveLynk IT Consulting & Services — helping students and job seekers land their dream careers 
                with AI-powered job matching and dedicated recruiter support. 100% free for candidates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#why-us" className="hover:text-foreground transition-colors">Why Us</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/login")} className="hover:text-foreground transition-colors">Sign In</button></li>
                <li><a href="mailto:support@wavelynk.ai" className="hover:text-foreground transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WaveLynk IT Consulting & Services. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by AI • Built for Students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
