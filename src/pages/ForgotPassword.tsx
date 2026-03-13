import { useState, FormEvent } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Loader2, CheckCircle, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import WavePattern from "@/components/WavePattern";
import WaveLynkLogo from "@/components/WaveLynkLogo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = "email" | "otp" | "password" | "success";

const ForgotPassword = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginPath = role ? `/${role}/login` : "/";

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    const { error: resetError } = await resetPassword(email);
    setIsLoading(false);

    if (resetError) {
      setError(resetError);
    } else {
      setStep("otp");
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 8) {
      setError("Please enter the complete 8-digit code");
      return;
    }
    setIsLoading(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });

    setIsLoading(false);

    if (verifyError) {
      setError(verifyError.message);
    } else {
      setStep("password");
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
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
      setStep("success");
      toast({ title: "Password updated successfully!" });
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate(loginPath);
      }, 3000);
    }
  };

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

        {error && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {step === "email" && (
          <>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2 text-center">
              Reset Your Password
            </h1>
            <p className="text-muted-foreground text-center mb-10">
              Enter your email address and we'll send you a 6-digit verification code.
            </p>

            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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

              <Button type="submit" variant="portal" size="lg" className="w-full group" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending Code...</>
                ) : (
                  <>Send Verification Code <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" /></>
                )}
              </Button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2 text-center">
              Verify Your Identity
            </h1>
            <p className="text-muted-foreground text-center mb-2">
              We've sent a 6-digit code to
            </p>
            <p className="text-primary font-medium text-center mb-8">{email}</p>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" variant="portal" size="lg" className="w-full group" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                ) : (
                  <><KeyRound className="w-4 h-4" /> Verify Code</>
                )}
              </Button>

              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  await resetPassword(email);
                  setIsLoading(false);
                  toast({ title: "A new code has been sent to your email." });
                }}
                className="w-full text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Didn't receive the code? Resend
              </button>
            </form>
          </>
        )}

        {step === "password" && (
          <>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2 text-center">
              Set New Password
            </h1>
            <p className="text-muted-foreground text-center mb-10">
              Enter your new password below.
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
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

              <Button type="submit" variant="portal" size="lg" className="w-full group" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                ) : (
                  <>Update Password <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" /></>
                )}
              </Button>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              Password Updated!
            </h2>
            <p className="text-muted-foreground">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        )}

        {step !== "success" && (
          <div className="mt-8 text-center">
            <Link to={loginPath} className="text-sm text-primary hover:underline">
              ← Back to login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
