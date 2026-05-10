import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RESERVED_USERNAMES } from "@/lib/brand";
import { completeDemoOnboarding } from "@/lib/demoMode";
import { SPORT_INTERESTS, getSportLifestyleState, saveSportLifestyleState, type SportInterest } from "@/lib/sportLifestyle";
import { getOnboardingAvatarIdFromUrl, getOnboardingAvatarUrl } from "@/lib/onboardingAvatars";
import { AvatarPicker } from "@/components/onboarding/AvatarPicker";
import type { EditableProfile } from "@/components/dashboard/ProfileEditorCard";

type Props = {
  profile: EditableProfile;
  onSaved: (p: EditableProfile) => void;
};

type Step = "identity" | "sport";

const USERNAME_RE = /^[a-zA-Z0-9_.-]+$/;
const sanitize = (raw: string): string => raw.toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 20);

const generateDemoUsername = async (email?: string | null): Promise<string> => {
  const prefix = email ? sanitize(email.split("@")[0]) : "";
  const base = prefix.length >= 3 ? prefix : "demo-athlete";
  const candidates = [base, `${base}-${Math.floor(1000 + Math.random() * 9000)}`, `${base}-${Math.floor(1000 + Math.random() * 9000)}`];
  for (const cand of candidates) {
    if (RESERVED_USERNAMES.has(cand)) continue;
    if (!USERNAME_RE.test(cand) || cand.length < 3) continue;
    try {
      const { data } = await supabase.from("profiles").select("id").eq("username", cand).maybeSingle();
      if (!data) return cand;
    } catch {
      return cand;
    }
  }
  return `demo-athlete-${Math.floor(10000 + Math.random() * 90000)}`;
};

export const OnboardingFlow = ({ profile, onSaved }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("identity");
  const [username, setUsername] = useState(profile.username ?? "");
  const [displayName, setDisplayName] = useState(profile.display_name ?? user?.user_metadata?.full_name ?? "");
  const [avatarId, setAvatarId] = useState(getOnboardingAvatarIdFromUrl(profile.avatar_url));
  const [interest, setInterest] = useState<SportInterest>(getSportLifestyleState().selectedInterest);
  const [saving, setSaving] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const validateIdentityShape = () => {
    const clean = sanitize(username);
    if (clean.length < 3 || !USERNAME_RE.test(clean) || RESERVED_USERNAMES.has(clean)) {
      toast.error("Choose a valid username with at least 3 letters or numbers.");
      return false;
    }
    if (!displayName.trim()) {
      toast.error("Add a display name for your Sport Lifestyle Passport.");
      return false;
    }
    return true;
  };

  const checkUsernameAvailable = async () => {
    const clean = sanitize(username);
    if (profile.username === clean) return true;
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .maybeSingle();
      if (error) {
        toast.error("Couldn't verify username availability", { description: "Please try again before continuing." });
        return false;
      }
      if (data?.id && data.id !== profile.id) {
        toast.error("Username already taken", { description: "Choose another public ID before continuing." });
        return false;
      }
      return true;
    } catch {
      toast.error("Couldn't verify username availability", { description: "Please try again before continuing." });
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const validateIdentity = async () => validateIdentityShape() && await checkUsernameAvailable();

  const continueToSport = async () => {
    if (await validateIdentity()) setStep("sport");
  };

  const finish = async () => {
    if (!(await validateIdentity())) return;
    setSaving(true);
    const clean = sanitize(username) || (await generateDemoUsername(user?.email));
    const avatarUrl = getOnboardingAvatarUrl(avatarId);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ username: clean, display_name: displayName.trim(), avatar_url: avatarUrl })
        .eq("id", profile.id)
        .select("id, username, display_name, avatar_url, bio, is_published")
        .single();
      if (error) {
        if (error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("unique")) {
          toast.error("Username already taken", { description: "Choose another public ID before opening the Dashboard." });
          setStep("identity");
          setSaving(false);
          return;
        }
        throw error;
      }
      if (data) onSaved(data as EditableProfile);
    } catch (error) {
      toast.error("Couldn't save identity", { description: error instanceof Error ? error.message : "Please try again." });
      setSaving(false);
      return;
    }

    const lifestyle = getSportLifestyleState();
    saveSportLifestyleState({ ...lifestyle, selectedInterest: interest });
    completeDemoOnboarding("badges", "athlete");
    toast.success("Sport Lifestyle Passport ready.", { description: "You're landing on the Dashboard command center." });
    navigate("/dashboard");
    setSaving(false);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-12 relative overflow-hidden">
      <div className="aurora-orb h-[420px] w-[420px] -top-20 -left-10 bg-secondary animate-aurora-drift" />
      <div className="aurora-orb h-[460px] w-[460px] bottom-0 -right-20 bg-primary animate-aurora-drift" style={{ animationDelay: "-7s" }} />

      <div className="relative w-full max-w-3xl animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Pip active={step === "identity"} done={step === "sport"} label="1" />
          <div className="h-px w-10 bg-border" />
          <Pip active={step === "sport"} done={false} label="2" />
        </div>

        <div className="glass-strong rounded-3xl p-8 md:p-10">
          {step === "identity" && (
            <>
              <Header eyebrow="Step 1 of 2" title={<>Build your <span className="text-gradient">identity</span></>} sub="Create the basic identity layer for your Sport Lifestyle Passport." />
              <div className="mt-7 grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <Input value={username} onChange={(event) => setUsername(sanitize(event.target.value))} placeholder="alexrunner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display name</label>
                    <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Alex Rivera" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium">Avatar</div>
                  <AvatarPicker value={avatarId} onChange={setAvatarId} />
                </div>
              </div>
              <div className="mt-7 flex justify-end">
                <Button onClick={continueToSport} disabled={checkingUsername} className="bg-gradient-primary text-primary-foreground font-medium h-11 px-6">
                  {checkingUsername ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === "sport" && (
            <>
              <Header eyebrow="Step 2 of 2" title={<>Pick your <span className="text-gradient">sport lifestyle</span></>} sub="Your first interest personalizes badges, challenges, proof types, and opportunities." />
              <div className="mt-7 grid sm:grid-cols-2 gap-3">
                {SPORT_INTERESTS.map((item) => (
                  <button key={item} onClick={() => setInterest(item)} className={`text-left rounded-2xl p-4 border transition-all ${interest === item ? "border-primary/60 bg-primary/5 shadow-glow-primary" : "border-glass-border bg-background/30 hover:border-primary/30"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display font-semibold">{item}</span>
                      {interest === item && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-7 flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep("identity")} className="text-muted-foreground"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                <Button type="button" onClick={finish} disabled={saving || checkingUsername} className="bg-gradient-primary text-primary-foreground font-medium h-11 px-6 shadow-glow-primary glow-primary">
                  {saving || checkingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-1.5" />Open Dashboard</>}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Header = ({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub: string }) => (
  <div className="text-center">
    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{eyebrow}</div>
    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
    <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
  </div>
);

const Pip = ({ active, done, label }: { active: boolean; done: boolean; label: string }) => (
  <div className={`h-7 w-7 rounded-full grid place-items-center text-[11px] font-semibold border ${done ? "bg-primary text-primary-foreground border-primary" : active ? "bg-primary/15 text-primary border-primary/60" : "bg-background/40 text-muted-foreground border-border"}`}>
    {done ? <Check className="h-3.5 w-3.5" /> : label}
  </div>
);
