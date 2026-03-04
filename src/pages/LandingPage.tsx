import { motion, AnimatePresence, useScroll, useSpring, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Search, FileText, Brain, Users, BarChart3,
  Zap, Target, Clock, CheckCircle2, ArrowRight, Star,
  Globe, Sparkles, GraduationCap, Rocket, ShieldCheck,
  TrendingUp, HeartHandshake, Eye, MessageSquare, ChevronDown,
  Menu, X, Briefcase, Code, Award, Shield, Layers,
  DollarSign, Crown, Gem, Instagram
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import type { Easing } from "framer-motion";
import wavelynkLogo from "@/assets/wavelynk-logo.png";

const easeOut: Easing = [0, 0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: easeOut }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: easeOut }
  })
};

const AnimatedCounter = ({ target, suffix = "" }: { target: string; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const numericTarget = parseInt(target.replace(/\D/g, ""));

  useEffect(() => {
    if (!isInView || isNaN(numericTarget)) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(numericTarget / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, numericTarget]);

  if (isNaN(numericTarget)) return <span ref={ref}>{target}</span>;
  return <span ref={ref}>{count}{suffix}</span>;
};

const stats = [
  { value: "1400", suffix: "+", label: "Candidates Placed" },
  { value: "212", suffix: "", label: "Partner Companies" },
  { value: "1450", suffix: "+", label: "Active Recruiters" },
  { value: "60", suffix: "", label: "< 60 min Avg Response" },
];

const features = [
  { icon: Search, title: "AI Job Discovery", description: "Our AI scans LinkedIn, JSearch, and top job boards 24/7 — finding roles that match your skills and career goals." },
  { icon: Brain, title: "ATS Resume Optimization", description: "Your CV gets tailored for every application. Our matching engine ensures your resume beats filters." },
  { icon: FileText, title: "One CV, Unlimited Versions", description: "Upload once. We create optimized versions for each application — highlighting the right skills." },
  { icon: Eye, title: "Real-Time Tracking", description: "See exactly where each application stands — submitted, reviewed, interview scheduled, offer received." },
  { icon: HeartHandshake, title: "Dedicated Recruiter", description: "A real recruiter works on your behalf — sourcing jobs, submitting applications, and advocating for you." },
  { icon: MessageSquare, title: "Direct Communication", description: "Message your recruiter anytime. Get updates, ask questions, and stay informed throughout your journey." },
  { icon: Shield, title: "Data Security", description: "Enterprise-grade encryption. Your personal information is never shared without consent." },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Detailed insights into your job search performance, application success rates, and market trends." },
];

const howItWorks = [
  { step: "01", title: "Sign Up & Upload CV", description: "Create your profile and upload your resume. That's all you need to do.", icon: GraduationCap },
  { step: "02", title: "AI Finds Dream Jobs", description: "Our AI scrapes hundreds of job platforms daily, matching you with perfect roles.", icon: Search },
  { step: "03", title: "We Apply For You", description: "Your recruiter submits tailored applications with AI-optimized resumes.", icon: Rocket },
  { step: "04", title: "You Get Hired", description: "Track applications in real-time, attend interviews, land your dream job.", icon: Award },
];

const competitiveStats = [
  { value: "10", suffix: "x", label: "Faster than manual applications. Our AI + recruiter combo outpaces solo job hunting." },
  { value: "3.4", suffix: "x", label: "Higher interview callback rate with ATS-optimized resumes vs generic submissions." },
  { value: "24/7", suffix: "", label: "Our AI agents never sleep. Jobs are found, matched, and queued around the clock." },
];

const weaponFeatures = [
  { icon: Search, title: "Profile Optimization", description: "AI-enhanced profiles that stand out" },
  { icon: Target, title: "Resume Targeting", description: "Tailored CVs for every application" },
  { icon: Briefcase, title: "Auto-Apply", description: "We submit on your behalf automatically" },
  { icon: TrendingUp, title: "Job Matching", description: "AI-powered role matching algorithms" },
  { icon: Code, title: "ATS Bypass", description: "Beat automated filters every time" },
];

const faqs = [
  { q: "Is Wave Lynk AI really free for students?", a: "Yes, 100% free. Our service is funded by the companies and recruiters who use our platform to find talent like you." },
  { q: "How does the AI find jobs for me?", a: "Our AI agents scan hundreds of job boards including LinkedIn and JSearch 24/7. They match listings to your skills, experience, and career goals." },
  { q: "Do I need to apply to jobs myself?", a: "No! Your assigned recruiter handles all applications on your behalf with ATS-optimized resumes." },
  { q: "What kind of jobs will I be matched with?", a: "Only legitimate, full-time positions with real companies. No contract gigs, no C2C, no staffing agencies." },
  { q: "How long does it take to get hired?", a: "Most students start receiving interview calls within 1–2 weeks. Some have landed offers in as little as 3 weeks." },
  { q: "Can I track my applications?", a: "Absolutely. Your dashboard shows every application in real-time — submitted, under review, interview scheduled, offer received." },
  { q: "What makes Wave Lynk different?", a: "We combine AI technology with real human recruiters. We actively apply on your behalf with optimized resumes and follow up with employers." },
  { q: "Is my data safe?", a: "Yes. Enterprise-grade encryption. Your resume and data are only used to match you with jobs." },
];

const pricingPlans = [
  {
    name: "Monthly Plan",
    upfront: "$149",
    postPlacement: "20%",
    postPlacementLabel: "Of Annual CTC",
    icon: DollarSign,
    featured: false,
  },
  {
    name: "Yearly Plan",
    upfront: "$1,499",
    postPlacement: "$0",
    postPlacementLabel: "Zero Post Placement Fee",
    badge: "Limited Slots",
    icon: Crown,
    featured: true,
  },
  {
    name: "6 Months Plan",
    upfront: "$899",
    postPlacement: "12%",
    postPlacementLabel: "Of Annual CTC",
    icon: Gem,
    featured: false,
  },
];

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={fadeUp}
          custom={i * 0.5}
          className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300 group"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 md:p-6 text-left gap-4"
          >
            <span className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{faq.q}</span>
            <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
            </motion.div>
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
                <p className="px-5 md:px-6 pb-5 md:pb-6 text-muted-foreground leading-relaxed">{faq.a}</p>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#features", label: "Features" },
    { href: "#why-us", label: "Why Us" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Scroll Progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 z-[60] origin-left bg-primary" style={{ scaleX }} />

      {/* Navigation — fixed, glass effect on scroll */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-lg border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-18 flex items-center justify-between">
          {/* Logo — transparent PNG, no white box */}
          <motion.a href="/" className="flex items-center gap-2.5 shrink-0" whileHover={{ scale: 1.02 }}>
            <img src={wavelynkLogo} alt="WaveLynk" className="h-9 md:h-10 w-auto object-contain" />
            <span className="font-display text-base md:text-lg font-bold text-foreground tracking-tight hidden sm:inline">
              Wave Lynk <span className="text-primary">AI</span>
            </span>
          </motion.a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-3/4" />
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-foreground" />
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="font-semibold shadow-md hover:shadow-lg transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-9 px-5"
            >
              Sign In
            </Button>
            <button
              className="lg:hidden p-2 rounded-lg text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-lg px-3 py-2.5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full pointer-events-none opacity-60"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 65%)", top: "-20%", left: "-10%", filter: "blur(80px)" }}
            animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.15, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-40"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 65%)", top: "20%", right: "-15%", filter: "blur(60px)" }}
            animate={{ x: [0, -60, 30, 0], y: [0, 50, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`, backgroundSize: '80px 80px' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 w-full">
          <motion.div initial="hidden" animate="visible" className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-10 border border-primary/30 bg-primary/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI-Powered Recruitment Intelligence</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[0.95] mb-8 tracking-tight text-foreground">
              The Unfair{" "}
              <br className="hidden md:block" />
              Career{" "}
              <span className="relative inline-block">
                <motion.span
                  className="text-transparent bg-clip-text italic"
                  style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))", backgroundSize: "300% 100%" }}
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  Advantage.
                </motion.span>
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 0.8, ease: easeOut }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              AI-powered job matching, ATS-optimized resumes, and dedicated recruiter support.{" "}
              <span className="text-foreground font-semibold">One platform. Complete career acceleration.</span>
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} className="relative group">
                <motion.div
                  className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "hsl(var(--primary) / 0.3)", filter: "blur(12px)" }}
                />
                <Button size="lg" onClick={() => navigate("/login")} className="relative text-base px-10 h-14 font-bold shadow-xl rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" size="lg" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-base px-10 h-14 font-bold rounded-xl border-border text-foreground hover:bg-accent bg-transparent">
                  See How It Works
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeUp} custom={4} className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
              {[{ icon: CheckCircle2, text: "No credit card" }, { icon: CheckCircle2, text: "100% free for students" }, { icon: CheckCircle2, text: "Instant access" }].map((item, i) => (
                <motion.span key={item.text} className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 + i * 0.15 }}>
                  <item.icon className="w-4 h-4 text-primary" /> {item.text}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.15 }}
                whileHover={{ y: -6, borderColor: "hsl(var(--primary) / 0.4)" }}
                className="text-center p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300"
              >
                <div className="font-display text-3xl lg:text-4xl font-black text-foreground">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-muted-foreground mt-2 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section id="features" className="py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">WHAT WE DO</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Everything you need.{" "}
              <br className="hidden md:block" />
              <span className="text-muted-foreground">Nothing you don't.</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful tools designed to eliminate the grind of job searching. Focus on what matters — your career.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6 }}
                className="group p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">HOW IT WORKS</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              You Don't Have to Fight in the{" "}
              <br className="hidden md:block" />
              <span className="italic text-primary">IT Hunger Games.</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The platform's smarter competitors already use. Stop applying blindly.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="relative group"
              >
                <div className="p-6 rounded-2xl border border-border bg-card backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-primary font-display font-bold text-sm">{item.step}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COMPETITIVE ADVANTAGE ═══════════ */}
      <section id="why-us" className="py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              If You're Competing Against a{" "}
              <br className="hidden md:block" />
              <span className="italic text-primary">Dynamic, Tangent Candidate...</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              ...you'll need AI on your side too.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            {competitiveStats.map((stat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="font-display text-5xl md:text-6xl font-black text-primary mb-3">
                  {typeof stat.value === "string" && stat.value.includes("/") ? stat.value : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center">
            <p className="text-foreground/60 text-xl font-display font-semibold mb-6 italic">
              The question isn't who's more qualified.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" onClick={() => navigate("/login")} className="px-10 h-14 font-bold rounded-xl shadow-xl bg-primary text-primary-foreground hover:bg-primary/90">
                Sign In & Get Your Advantage <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FULLY WEAPONIZED ═══════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Your Career,{" "}
              <span className="text-primary italic">Fully Weaponized.</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {weaponFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6 }}
                className="p-5 rounded-2xl border border-border bg-card/50 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-all">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground mb-1">{feature.title}</h3>
                <p className="text-muted-foreground text-xs">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ NETWORK CTA ═══════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center border border-primary/20 bg-gradient-to-br from-secondary to-secondary/80"
          >
            <motion.div
              className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
            />

            <motion.div variants={fadeUp} custom={0} className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                The Network That Compounds{" "}
                <br className="hidden md:block" />
                Like <span className="text-primary">Capital.</span>
              </h2>
              <p className="text-primary-foreground/60 text-lg mb-4 max-w-xl mx-auto">
                Every application builds momentum. Every connection compounds. Join the career network that works harder the longer you're in it.
              </p>
              <p className="text-primary-foreground/40 text-sm mb-8">Free forever for candidates. No hidden costs.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" onClick={() => navigate("/login")} className="px-10 h-14 font-bold rounded-xl shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign In & Join Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ PRICING SECTION ═══════════ */}
      <section id="pricing" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">INVEST IN MOMENTUM</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Pricing{" "}
              <span className="text-primary italic">Plans</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the plan that fits your career timeline. All plans include AI-powered job matching and dedicated recruiter support.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -8 }}
                className={`relative p-8 rounded-3xl border transition-all duration-500 ${
                  plan.featured
                    ? "border-primary/50 bg-card shadow-glow scale-105 z-10 ring-1 ring-primary/20"
                    : "border-border bg-card/50"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                    ⚡ {plan.badge}
                  </div>
                )}

                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <plan.icon className={`w-7 h-7 ${plan.featured ? "text-primary" : "text-primary/70"}`} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">{plan.name}</h3>

                  <div className="mb-6">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Upfront Fee</p>
                    <p className="font-display text-4xl md:text-5xl font-black text-foreground">{plan.upfront}</p>
                  </div>

                  <div className="w-full h-px bg-border my-6" />

                  <div className="mb-8">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Post Placement Fee</p>
                    <p className={`font-display text-3xl md:text-4xl font-black ${plan.featured ? "text-primary" : "text-foreground"}`}>
                      {plan.postPlacement}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">{plan.postPlacementLabel}</p>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => navigate("/login")}
                    className={`w-full h-12 font-bold rounded-xl ${
                      plan.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                        : "bg-accent text-accent-foreground hover:bg-accent/80 border border-border"
                    }`}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center text-muted-foreground text-sm mt-10"
          >
            💡 Students can use the platform 100% free. Pricing applies to recruiter & enterprise partnerships.
          </motion.p>
        </div>
      </section>

      {/* ═══════════ FAQ SECTION ═══════════ */}
      <section id="faq" className="py-28 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              FAQ —{" "}
              <span className="italic text-primary">Objections, Destroyed.</span>
            </motion.h2>
          </motion.div>
          <FAQAccordion />
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/30"
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div variants={fadeUp} custom={0} className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                Your background is not a limitation.{" "}
                <br className="hidden md:block" />
                It's a weapon —{" "}
                <span className="text-primary italic">if sharpened.</span>
              </h2>
              <p className="text-muted-foreground text-sm mb-10">Join the platform that sharpens careers, not just resumes.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" onClick={() => navigate("/login")} className="px-12 h-14 font-bold rounded-xl shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-lg">
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={wavelynkLogo} alt="WaveLynk" className="h-10 w-auto object-contain" />
                <div>
                  <span className="font-display text-lg font-bold text-foreground">Wave Lynk <span className="text-primary">AI</span></span>
                  <p className="text-xs text-muted-foreground">AI-Powered Career Platform</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                WaveLynk IT Consulting & Services — helping students and job seekers land their dream careers with AI-powered job matching and dedicated recruiter support.
              </p>
              <div className="flex items-center gap-4 mt-6 text-muted-foreground text-sm flex-wrap">
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> wavelynk.org</span>
                <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-primary" /> contact@wavelynk.org</span>
                <a
                  href="https://www.instagram.com/Wavelynk_AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Instagram className="w-4 h-4 text-primary" /> @Wavelynk_AI
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-5">Platform</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#why-us" className="hover:text-primary transition-colors">Why Us</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-5">Get Started</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/login")} className="hover:text-primary transition-colors">Sign In</button></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="mailto:contact@wavelynk.org" className="hover:text-primary transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WaveLynk IT Consulting & Services Pvt Ltd. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Powered by AI • Built for Careers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
