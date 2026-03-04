import { Briefcase, Info } from "lucide-react";
import LoginLayout from "@/components/LoginLayout";
import LoginForm from "@/components/LoginForm";

const RecruiterLogin = () => {
  return (
    <LoginLayout
      heading="Recruiter Portal"
      description="Access your recruitment dashboard. Find jobs, manage candidates, and leverage AI-powered matching."
      features={[
        "Discover jobs from LinkedIn and JSearch",
        "AI-powered ATS resume matching",
        "Manage candidates and track applications",
      ]}
      icon={Briefcase}
      gradient="bg-gradient-to-b from-primary-600 to-primary-700"
    >
      <LoginForm
        role="recruiter"
        heading="Recruiter Sign In"
        subheading="Welcome back! Sign in to access your recruitment tools"
        placeholder="recruiter@company.com"
        buttonText="Sign In to Recruiter Portal"
        buttonVariant="portal"
        notice={{
          type: "info",
          icon: <Info className="w-5 h-5 text-info-600 shrink-0 mt-0.5" />,
          text: "Your account was created by a Wave Lynk AI administrator. Contact your admin if you need assistance.",
        }}
        helpText="Don't have access yet? Request an account from your organization's admin."
      />
    </LoginLayout>
  );
};

export default RecruiterLogin;
