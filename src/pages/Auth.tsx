import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);
const passwordSchema = z
  .string()
  .min(8, { message: "At least 8 characters" })
  .max(72, { message: "Max 72 characters" });

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z"/>
  </svg>
);

const AuthCard = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleGoogle = async () => {
    setOauthLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/dashboard`,
      });
      if (result.error) {
        toast.error("Google sign-in failed", { description: String(result.error.message ?? result.error) });
        setOauthLoading(false);
        return;
      }
      if (result.redirected) return; // browser navigates away
      navigate("/dashboard");
    } catch (e) {
      toast.error("Unexpected error", { description: e instanceof Error ? e.message : "Try again" });
      setOauthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailParse = emailSchema.safeParse(email);
    if (!emailParse.success) return toast.error(emailParse.error.issues[0].message);
    const passParse = passwordSchema.safeParse(password);
    if (!passParse.success) return toast.error(passParse.error.issues[0].message);

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: emailParse.data,
          password: passParse.data,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Welcome aboard!", { description: "Your XIONID is ready." });
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailParse.data,
          password: passParse.data,
        });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      const friendly = msg.includes("already registered")
        ? "Account already exists. Try signing in."
        : msg.includes("Invalid login")
        ? "Email or password is incorrect."
        : msg;
      toast.error(mode === "signup" ? "Sign up failed" : "Sign in failed", { description: friendly });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-3xl p-8 md:p-10 w-full max-w-md animate-scale-in">
      <div className="flex items-center gap-2 mb-8">
        <BrandLogo size={36} />
        <span className="font-display text-lg font-semibold tracking-tight">
          <Wordmark />
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold tracking-tight mb-1.5">
        {mode === "signup" ? "Create your XIONID" : "Welcome back"}
      </h1>
      <p className="text-sm text-muted-foreground mb-7">
        {mode === "signup"
          ? "Free forever. Gasless on XION. No credit card."
          : "Sign in to your XION-powered link-in-bio."}
      </p>

      <Button
        type="button"
        variant="outline"
        className="w-full glass border-glass-border hover:bg-white/5 h-11 mb-3"
        onClick={handleGoogle}
        disabled={oauthLoading || loading}
      >
        {oauthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <GoogleIcon />
            <span className="ml-2">Continue with Google</span>
          </>
        )}
      </Button>

      <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span>or with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="w-full">
        <TabsList className="grid grid-cols-2 w-full bg-muted/40 mb-5">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>
        <TabsContent value={mode} forceMount>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9 h-11 bg-input/40 border-glass-border"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pl-9 h-11 bg-input/40 border-glass-border"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full h-11 bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium shadow-glow-primary glow-primary"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "signup" ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <Link
        to="/"
        className="mt-7 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to home
      </Link>
    </div>
  );
};

const Auth = () => {
  return (
    <div className="min-h-screen relative grid place-items-center px-4 py-12 overflow-hidden">
      <div className="aurora-orb h-[460px] w-[460px] -top-20 -left-20 bg-secondary animate-aurora-drift" />
      <div className="aurora-orb h-[420px] w-[420px] -bottom-20 -right-20 bg-primary animate-aurora-drift" style={{ animationDelay: "-8s" }} />
      <AuthCard />
    </div>
  );
};

export default Auth;
