import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Sparkles,
  Target,
  BarChart3,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const FEATURES = [
  { icon: Sparkles, text: "AI-powered resume tailoring" },
  { icon: Target, text: "Smart job matching with 95% accuracy" },
  { icon: BarChart3, text: "Real-time application analytics" },
  { icon: Shield, text: "Auto-apply with human-in-the-loop" },
];

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login, signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await signup(email, password, fullName);
        toast({ title: "Welcome to JobCopilot", description: "Your account has been created." });
      } else {
        await login(email, password);
        toast({ title: "Welcome back" });
      }
      setLocation("/");
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      if (msg.includes("409")) {
        setError("An account with this email already exists");
      } else if (msg.includes("401")) {
        setError("Invalid email or password");
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Simulate Google OAuth - in production, use Google Identity Services
    const demoGoogleUser = {
      email: "alex.johnson@gmail.com",
      fullName: "Alex Johnson",
      googleId: "google-oauth-" + Date.now(),
      avatarUrl: undefined,
    };
    try {
      await loginWithGoogle(demoGoogleUser);
      toast({ title: "Signed in with Google" });
      setLocation("/");
    } catch {
      setError("Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)`,
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xl font-semibold tracking-tight">JobCopilot</span>
            </div>
            <p className="text-sm text-white/60 ml-[52px]">AI Application Engine</p>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                Your job search,<br />on autopilot.
              </h1>
              <p className="text-base text-white/70 mt-3 max-w-md leading-relaxed">
                Let AI find, match, and apply to your dream jobs while you focus on what matters - preparing for interviews.
              </p>
            </div>

            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10">
                    <Icon className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-sm text-white/80">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-white/40">
            Trusted by 12,000+ job seekers worldwide
          </div>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">JobCopilot</span>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Sign in to continue your job search"
                : "Start your AI-powered job search today"}
            </p>
          </div>

          {/* Google OAuth */}
          <Button
            variant="secondary"
            className="w-full h-10 text-sm font-medium gap-2"
            onClick={handleGoogleLogin}
            data-testid="button-google-auth"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-[11px] text-muted-foreground uppercase tracking-widest">
              or
            </span>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-10"
                  required
                  data-testid="input-fullname"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10"
                required
                data-testid="input-email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "Create password (8+ chars)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-10"
                required
                minLength={mode === "signup" ? 8 : 1}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-destructive" data-testid="text-error">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-10 text-sm font-medium gap-1"
              disabled={isSubmitting}
              data-testid="button-submit-auth"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                No account yet?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="text-primary font-medium hover:underline"
                  data-testid="button-switch-to-signup"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-primary font-medium hover:underline"
                  data-testid="button-switch-to-login"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-[10px] text-center text-muted-foreground/60 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
