import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import WavePattern from "@/components/WavePattern";
import WaveLynkLogo from "@/components/WaveLynkLogo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check for recovery session from the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    const accessToken = hashParams.get("access_token");

    if (type === "recovery" && accessToken) {
      setIsValidSession(true);
      setChecking(false);
    } else {
      // Also check if there's already an active session (user clicked the link and got auto-logged in)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsValidSession(true);
        }
        setChecking(false);
      });
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setIsLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setIsSuccess(true);
      toast({ title: "Password updated successfully!" });
      // Sign out and redirect to login after a delay
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login");
      }, 3000);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
      <div className="absolute inset-0 text-primary pointer-events-none">
        <WavePattern className="w-full h-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="form-container relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <WaveLynkLogo size="lg" />
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            Wave<span className="text-primary">Lynk</span> AI
          </span>
        </div>

        {!isValidSession ? (
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-foreground mb-3">
              Invalid or Expired Link
            </h1>
            <p className="text-muted-foreground mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button onClick={() => navigate("/login")} variant="portal">
              Back to Login
            </Button>
          </div>
        ) : isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              Password Updated!
            </h2>
            <p className="text-muted-foreground">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2 text-center">
              Set New Password
            </h1>
            <p className="text-muted-foreground text-center mb-10">
              Enter your new password below.
            </p>

            {error && (
              <div className="flex items-start gap-3 mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-2">
                  New Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-12 pl-11 pr-11 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    required
                    minLength={6}
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
                    Updating...
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
