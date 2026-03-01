import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Search, FileText, Brain, Users, BarChart3,
  Zap, Target, Clock, CheckCircle2, ArrowRight, Star,
  Globe, Sparkles, GraduationCap, Rocket, ShieldCheck,
  TrendingUp, HeartHandshake, Eye, MessageSquare, ChevronDown,
  Play, Menu, X
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

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: easeOut }
  })
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: easeOut }
  })
};

// Animated counter component
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

// Floating particles
const FloatingParticle = ({ delay, size, x, y, duration }: { delay: number; size: number; x: string; y: string; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20 pointer-events-none"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const stats = [
  { value: "10", suffix: "x", label: "Faster Job Placement", icon: Zap },
  { value: "95", suffix: "%", label: "Resume-to-Job Match", icon: Target },
  { value: "500", suffix: "+", label: "Jobs Found Daily", icon: Globe },
  { value: "Zero", suffix: "", label: "Effort From You", icon: Clock },
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
          className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300 group"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-6 text-left gap-4"
          >
            <span className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{faq.q}</span>
            <motion.div
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
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
                <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

// Glowing orb background component
const GlowingOrbs = () => (
  <>
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
        top: "-10%",
        left: "-10%",
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
        bottom: "-15%",
        right: "-5%",
      }}
      animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
  </>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const heroRef = useRef<HTMLDivElement>(null);

  // Smooth scroll progress bar
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#features", label: "Features" },
    { href: "#why-us", label: "Why Us" },
    { href: "#testimonials", label: "Success Stories" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="bg-white rounded-xl p-2 shadow-md border border-border/30">
              <img src={wavelynkLogo} alt="WaveLynk" className="h-12 w-auto object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold text-foreground tracking-tight">Wave Lynk AI</span>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AI-Powered Career Platform</p>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="font-semibold hidden sm:inline-flex border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-6 py-4 space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-sm font-medium text-muted-foreground hover:text-primary py-2"
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

      {/* Hero Section with Video Background */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-[0.06] dark:opacity-[0.04]"
            poster=""
          >
            <source src="https://cdn.pixabay.com/video/2020/08/09/46674-449627613_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Animated particles */}
        <FloatingParticle delay={0} size={8} x="10%" y="20%" duration={6} />
        <FloatingParticle delay={1} size={6} x="80%" y="15%" duration={7} />
        <FloatingParticle delay={2} size={10} x="60%" y="70%" duration={8} />
        <FloatingParticle delay={3} size={5} x="20%" y="80%" duration={5} />
        <FloatingParticle delay={0.5} size={7} x="90%" y="50%" duration={9} />
        <FloatingParticle delay={1.5} size={12} x="40%" y="30%" duration={7} />
        <FloatingParticle delay={2.5} size={4} x="70%" y="85%" duration={6} />

        <GlowingOrbs />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 md:pt-20 md:pb-36 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-10 backdrop-blur-sm">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <GraduationCap className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-semibold text-primary">Built for Students & Job Seekers</span>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] mb-8 tracking-tight">
              Stop Applying.{" "}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70">
                  Start Getting Hired.
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-primary to-primary/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8, ease: easeOut }}
                />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Upload your resume once. Our AI finds the best jobs, optimizes your CV for each role, 
              and a dedicated recruiter applies on your behalf. <span className="text-foreground font-medium">You just show up for interviews.</span>
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" onClick={() => navigate("/login")} className="text-base px-10 h-16 font-bold shadow-xl hover:shadow-2xl transition-all rounded-2xl text-lg">
                  Get Started — It's Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }} className="text-base px-10 h-16 font-bold rounded-2xl text-lg border-2 hover:bg-primary/5">
                  <Play className="mr-2 w-5 h-5" /> See How It Works
                </Button>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> 100% free</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Instant access</span>
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center p-8 rounded-3xl bg-card/60 backdrop-blur-lg border border-border/50 hover:border-primary/40 hover:shadow-xl transition-all duration-500 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="font-display text-4xl lg:text-5xl font-black text-foreground">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-2 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,60 C360,120 720,0 1440,60 L1440,120 L0,120 Z" fill="hsl(var(--muted) / 0.3)" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-muted/30 relative overflow-hidden">
        <GlowingOrbs />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Simple as 1-2-3-4</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              From Resume Upload to{" "}
              <span className="text-primary">Job Offer</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              We do the heavy lifting. You focus on acing your interviews.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
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
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 border border-primary/20 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                >
                  <item.icon className="w-10 h-10 text-primary" />
                  <span className="absolute -top-3 -right-3 w-9 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                    {item.step}
                  </span>
                </motion.div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20" />
                )}
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">What You Get</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Your Entire Job Search,{" "}
              <span className="text-primary">Handled</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              No more endless scrolling, no more tailoring resumes, no more guessing. We take care of everything.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group p-8 lg:p-10 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                {/* Card glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300"
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-32 bg-muted/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Why Wave Lynk AI</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Why Students{" "}
              <span className="text-primary">Trust Us</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={i % 2 === 0 ? slideInLeft : slideInRight}
                custom={i}
                whileHover={{ scale: 1.02 }}
                className="flex gap-6 p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all"
                >
                  <item.icon className="w-7 h-7 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 relative overflow-hidden">
        <GlowingOrbs />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-semibold text-primary">Success Stories</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Students Who Landed Their{" "}
              <span className="text-primary">Dream Jobs</span>
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
                whileHover={{ y: -8 }}
                className="p-8 lg:p-10 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 relative group"
              >
                <div className="absolute top-6 right-6 text-6xl font-serif text-primary/10 group-hover:text-primary/20 transition-colors">"</div>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + j * 0.1 }}
                    >
                      <Star className="w-5 h-5 text-primary fill-primary" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-foreground mb-8 leading-relaxed text-lg italic relative z-10">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div variants={scaleIn} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">FAQs</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked{" "}
              <span className="text-primary">Questions</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
              Everything you need to know before getting started.
            </motion.p>
          </motion.div>

          <FAQAccordion />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative overflow-hidden rounded-[2rem] p-12 md:p-20 text-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--secondary) / 0.9))",
            }}
          >
            {/* Animated background elements */}
            <motion.div
              className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)" }}
              animate={{ scale: [1.2, 0.9, 1.2], x: [0, -15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <motion.div variants={fadeUp} custom={0} className="relative z-10">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <GraduationCap className="w-16 h-16 text-primary mx-auto mb-8" />
              </motion.div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                Your Dream Job Is{" "}
                <span className="text-primary">One Click Away</span>
              </h2>
              <p className="text-primary-foreground/80 text-lg md:text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of students who stopped struggling with job applications and started getting hired — with the power of AI and real recruiter support.
              </p>
              <p className="text-primary-foreground/50 text-sm mb-10">
                It's completely free. No hidden costs. No commitments.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 h-16 font-bold shadow-2xl rounded-2xl"
                >
                  Get Started For Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white rounded-xl p-2 shadow-md border border-border/30">
                  <img src={wavelynkLogo} alt="WaveLynk" className="h-12 w-auto object-contain" />
                </div>
                <div>
                  <span className="font-display text-xl font-bold text-foreground">Wave Lynk AI</span>
                  <p className="text-xs text-muted-foreground">AI-Powered Career Platform</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                WaveLynk IT Consulting & Services — helping students and job seekers land their dream careers 
                with AI-powered job matching and dedicated recruiter support. 100% free for candidates.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-5">Platform</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#why-us" className="hover:text-primary transition-colors">Why Us</a></li>
                <li><a href="#testimonials" className="hover:text-primary transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-5">Get Started</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/login")} className="hover:text-primary transition-colors">Sign In</button></li>
                <li><a href="mailto:support@wavelynk.ai" className="hover:text-primary transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WaveLynk IT Consulting & Services. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Powered by AI • Built for Students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
