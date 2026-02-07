import { Shield, ShieldCheck } from "lucide-react";
import LoginLayout from "@/components/LoginLayout";
import LoginForm from "@/components/LoginForm";

const AdminLogin = () => {
  return (
    <LoginLayout
      heading="Admin Portal"
      description="Secure access for platform administrators. Manage recruiters, monitor analytics, and oversee system operations."
      features={[
        "Create and manage recruiter accounts",
        "System-wide analytics dashboard",
        "Platform configuration and settings",
      ]}
      icon={Shield}
      gradient="bg-gradient-to-b from-secondary-900 to-secondary-800"
    >
      <LoginForm
        role="admin"
        heading="Admin Sign In"
        subheading="Enter your credentials to access the admin portal"
        placeholder="admin@wavelynk.ai"
        buttonText="Sign In to Admin Portal"
        buttonVariant="portal"
        notice={{
          type: "warning",
          icon: <ShieldCheck className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />,
          text: "This is a secure admin area. All access attempts are logged and monitored.",
        }}
      />
    </LoginLayout>
  );
};

export default AdminLogin;
