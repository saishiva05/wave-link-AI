import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search, FileText, Brain, Users, BarChart3, Shield,
  Zap, Target, Clock, CheckCircle2, ArrowRight, Star,
  Briefcase, Globe, Sparkles, ChevronRight, Mail
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
  { value: "10x", label: "Faster Hiring", icon: Zap },
  { value: "95%", label: "ATS Match Rate", icon: Target },
  { value: "500+", label: "Jobs Scraped Daily", icon: Globe },
  { value: "24/7", label: "AI-Powered Support", icon: Clock },
];

const features = [
  {
    icon: Search,
    title: "AI Job Scraping",
    description: "Automatically scrape and aggregate job listings from LinkedIn, JSearch, and more — all in one dashboard.",
  },
  {
    icon: Brain,
    title: "ATS Resume Matching",
    description: "Our AI analyzes candidate CVs against job descriptions and provides detailed ATS compatibility scores.",
  },
  {
    icon: FileText,
    title: "Smart CV Management",
    description: "Upload, organize, and optimize candidate resumes. AI-powered suggestions to improve match rates.",
  },
  {
    icon: Users,
    title: "Candidate Pipeline",
    description: "Track candidates through every stage — from application to offer. Full visibility for recruiters and candidates.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Platform-wide insights on hiring trends, application success rates, and recruiter performance.",
  },
  {
    icon: Mail,
    title: "AI Email Generation",
    description: "Generate personalized outreach emails tailored to specific job postings and candidate profiles.",
  },
];

const howItWorks = [
  { step: "01", title: "Scrape Jobs", description: "AI agents scan multiple job platforms and aggregate relevant listings based on your criteria.", icon: Search },
  { step: "02", title: "Match Candidates", description: "Upload CVs and let our ATS matcher score candidates against job requirements instantly.", icon: Target },
  { step: "03", title: "Apply & Track", description: "Submit applications and track every stage from submission to offer in real-time.", icon: CheckCircle2 },
  { step: "04", title: "Hire Smarter", description: "Use analytics and AI insights to optimize your recruitment strategy and close faster.", icon: Sparkles },
];

const testimonials = [
  { name: "Sarah M.", role: "Senior Recruiter", quote: "Wave Lynk AI cut our time-to-hire by 60%. The ATS matching is incredibly accurate.", rating: 5 },
  { name: "James K.", role: "Hiring Manager", quote: "The job scraping feature alone saves us hours every day. Game-changing platform.", rating: 5 },
  { name: "Priya R.", role: "Candidate", quote: "I could track every application in real-time. The transparency gave me so much confidence.", rating: 5 },
];

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
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#portals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Portals</a>
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
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="font-semibold hidden sm:inline-flex"
            >
              Get Started
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
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Recruitment Intelligence</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              Hire Smarter with{" "}
              <span className="text-primary">AI-Driven</span>{" "}
              Recruitment
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Wave Lynk AI combines intelligent job scraping, ATS resume matching, and candidate tracking 
              to streamline your entire recruitment pipeline — from sourcing to hiring.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/login")} className="text-base px-8 h-14 font-semibold shadow-lg hover:shadow-xl transition-all">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }} className="text-base px-8 h-14 font-semibold">
                See How It Works
              </Button>
            </motion.div>
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

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Platform Features
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Recruit Smarter
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete suite of AI-powered tools designed for modern recruiters and candidates.
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

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              From Sourcing to Hiring in 4 Steps
            </motion.h2>
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

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Testimonials
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Recruiters & Candidates
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

      {/* Portal Access */}
      <section id="portals" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Access Portals
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Portal
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three dedicated experiences tailored for every role in the recruitment process.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Admin", description: "Platform management, analytics, and user administration.", href: "/admin/login", color: "from-secondary to-secondary/80" },
              { icon: Briefcase, title: "Recruiter", description: "Job scraping, ATS matching, candidate management, and AI tools.", href: "/recruiter/login", featured: true, color: "from-primary to-primary/80" },
              { icon: Users, title: "Candidate", description: "Application tracking, CV management, and real-time status updates.", href: "/candidate/login", color: "from-accent-foreground to-accent-foreground/80" },
            ].map((portal, i) => (
              <motion.div
                key={portal.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                onClick={() => navigate(portal.href)}
                className={`group relative p-8 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  portal.featured
                    ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                {portal.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                    Most Popular
                  </span>
                )}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center mb-6 mx-auto`}>
                  <portal.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground text-center mb-2">{portal.title} Portal</h3>
                <p className="text-muted-foreground text-center text-sm mb-6">{portal.description}</p>
                <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                  Sign In <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
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
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Recruitment?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Join Wave Lynk AI today and experience the future of intelligent hiring.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 h-14 font-semibold shadow-lg"
              >
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
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
                WaveLynk IT Consulting & Services — AI-powered recruitment intelligence platform 
                helping recruiters hire smarter and candidates land their dream jobs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Access</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/admin/login")} className="hover:text-foreground transition-colors">Admin Portal</button></li>
                <li><button onClick={() => navigate("/recruiter/login")} className="hover:text-foreground transition-colors">Recruiter Portal</button></li>
                <li><button onClick={() => navigate("/candidate/login")} className="hover:text-foreground transition-colors">Candidate Portal</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WaveLynk IT Consulting & Services. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by AI • Built for Recruiters
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
