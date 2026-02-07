import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import RecruiterLogin from "./pages/RecruiterLogin";
import CandidateLogin from "./pages/CandidateLogin";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRecruiters from "./pages/AdminRecruiters";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import AdminSettings from "./pages/AdminSettings";
import AdminSupport from "./pages/AdminSupport";
import RecruiterLayout from "./components/recruiter/RecruiterLayout";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterScrapeJobs from "./pages/RecruiterScrapeJobs";
import RecruiterScrapedJobs from "./pages/RecruiterScrapedJobs";
import RecruiterCVManagement from "./pages/RecruiterCVManagement";
import RecruiterCandidates from "./pages/RecruiterCandidates";
import RecruiterApplications from "./pages/RecruiterApplications";
import RecruiterSettingsPage from "./pages/RecruiterSettingsPage";
import RecruiterSupportPage from "./pages/RecruiterSupportPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/:role/forgot-password" element={<ForgotPassword />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="recruiters" element={<AdminRecruiters />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="activity-logs" element={<AdminActivityLogs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="support" element={<AdminSupport />} />
          </Route>

          {/* Recruiter Dashboard Routes */}
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="scrape-jobs" element={<RecruiterScrapeJobs />} />
            <Route path="scraped-jobs" element={<RecruiterScrapedJobs />} />
            <Route path="cv-management" element={<RecruiterCVManagement />} />
            <Route path="candidates" element={<RecruiterCandidates />} />
            <Route path="applications" element={<RecruiterApplications />} />
            <Route path="settings" element={<RecruiterSettingsPage />} />
            <Route path="support" element={<RecruiterSupportPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
