import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  role: "admin" | "recruiter" | "candidate";
  heading: string;
  subheading: string;
  placeholder: string;
  buttonText: string;
  buttonVariant: "portal" | "portal-secondary" | "portal-info";
  notice: {
    type: "warning" | "info" | "success";
    icon: React.ReactNode;
    text: string;
  };
  helpText?: string;
}

const LoginForm = ({
  role,
  heading,
  subheading,
  placeholder,
  buttonText,
  buttonVariant,
  notice,
  helpText,
}: LoginFormProps) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeForm, setShakeForm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all required fields.");
      triggerShake();
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError, role: userRole } = await signIn(email, password);

      if (signInError) {
        setError(signInError);
        triggerShake();
        setIsLoading(false);
        return;
      }

      // Check if the user's role matches the login page they're on
      if (userRole && userRole !== role) {
        setError(`This account is registered as a ${userRole}. Please use the ${userRole} login page.`);
        triggerShake();
        setIsLoading(false);
        return;
      }

      // Redirect based on role
      const redirectMap = {
        admin: "/admin/dashboard",
        recruiter: "/recruiter/dashboard",
        candidate: "/candidate/dashboard",
      };

      navigate(redirectMap[userRole || role]);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 300);
  };

  return (
    <div className={shakeForm ? "animate-shake" : ""}>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-8"
      >
        ← Back to portal selection
      </Link>

      <h1 className="font-display text-3xl font-semibold text-secondary-900 mb-2">
        {heading}
      </h1>
      <p className="text-muted-foreground mb-10">{subheading}</p>

      {error && (
        <div className="notice-error flex items-start gap-3 mb-6 p-4 rounded-lg">
          <XCircle className="w-5 h-5 text-error-500 shrink-0 mt-0.5" />
          <span className="text-sm flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-neutral-500 hover:text-neutral-700"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor={`${role}-email`} className="block text-sm font-medium text-neutral-700 mb-2">
            Email Address <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              id={`${role}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor={`${role}-password`} className="block text-sm font-medium text-neutral-700 mb-2">
            Password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              id={`${role}-password`}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-12 pl-11 pr-12 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            to={`/${role}/forgot-password`}
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant={buttonVariant}
          size="lg"
          className="w-full group"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              {buttonText}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      {/* Notice */}
      <div className={`notice-${notice.type} mt-6 flex items-start gap-3`}>
        {notice.icon}
        <span className="text-sm">{notice.text}</span>
      </div>

      {helpText && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default LoginForm;
