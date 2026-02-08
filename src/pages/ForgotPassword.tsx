import { useState, FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import WavePattern from "@/components/WavePattern";
import wavelynkLogo from "@/assets/wavelynk-logo.jpeg";
import { useAuth } from "@/hooks/useAuth";

const ForgotPassword = () => {
  const { role } = useParams<{ role: string }>();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    const { error: resetError } = await resetPassword(email);

    setIsLoading(false);
    if (resetError) {
      setError(resetError);
    } else {
      setIsSubmitted(true);
    }
  };

  const loginPath = role ? `/${role}/login` : "/";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-neutral-50 relative overflow-hidden">
      <div className="absolute inset-0 text-primary pointer-events-none">
        <WavePattern className="w-full h-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="form-container relative z-10"
      >
        <div className="flex justify-center mb-8">
          <img src={wavelynkLogo} alt="Wave Lynk AI" className="w-36" />
        </div>

        {!isSubmitted ? (
          <>
            <h1 className="font-display text-3xl font-semibold text-secondary-900 mb-2 text-center">
              Reset Your Password
            </h1>
            <p className="text-muted-foreground text-center mb-10">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {error && (
              <div className="notice-error flex items-start gap-3 mb-6 p-4 rounded-lg">
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="portal"
                size="lg"
                className="w-full group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Instructions
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-secondary-900 mb-3">
              Check Your Email
            </h2>
            <p className="text-muted-foreground mb-8">
              If an account exists with this email, you'll receive password reset instructions shortly.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to={loginPath} className="text-sm text-primary hover:underline">
            ← Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
