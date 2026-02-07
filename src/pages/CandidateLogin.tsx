import { User, UserCheck } from "lucide-react";
import LoginLayout from "@/components/LoginLayout";
import LoginForm from "@/components/LoginForm";

const CandidateLogin = () => {
  return (
    <LoginLayout
      heading="Candidate Portal"
      description="Track your job applications and view opportunities submitted on your behalf by your assigned recruiter."
      features={[
        "View all your job applications",
        "Track application status in real-time",
        "Access submitted resumes and documents",
      ]}
      icon={User}
      gradient="bg-gradient-to-b from-info-600 to-info-700"
    >
      <LoginForm
        role="candidate"
        heading="Candidate Sign In"
        subheading="Access your application dashboard and track your job search progress"
        placeholder="yourname@email.com"
        buttonText="Sign In to Candidate Portal"
        buttonVariant="portal-info"
        notice={{
          type: "success",
          icon: <UserCheck className="w-5 h-5 text-success-600 shrink-0 mt-0.5" />,
          text: "Your login credentials were provided by your assigned recruiter. Check your email for login details or contact your recruiter for assistance.",
        }}
        helpText="Need help accessing your account? Contact your recruiter or email support@wavelynk.ai"
      />
    </LoginLayout>
  );
};

export default CandidateLogin;
