import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { RESERVED_USERNAMES } from "@/lib/brand";
import {
  DEMO_GOALS,
  DEMO_STARTERS,
  completeDemoOnboarding,
  type DemoGoalKey,
  type DemoStarterKey,
} from "@/lib/demoMode";
import type { EditableProfile } from "@/components/dashboard/ProfileEditorCard";

type Props = {
  profile: EditableProfile;
  onSaved: (p: EditableProfile) => void;
};

type Step = "goal" | "starter";

const USERNAME_RE = /^[a-zA-Z0-9_.\-]+$/;

const sanitize = (raw: string): string => {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_.\-]/g, "").slice(0, 20);
  return cleaned.length >= 3 ? cleaned : "";
};

const generateDemoUsername = async (email?: string | null): Promise<string> => {
  const prefix = email ? sanitize(email.split("@")[0]) : "";
  const base = prefix || "demo-user";
  const candidates = [
    base,
    `${base}-${Math.floor(1000 + Math.random() * 9000)}`,
    `${base}-${Math.floor(1000 + Math.random() * 9000)}`,
  ];
  for (const cand of candidates) {
    if (RESERVED_USERNAMES.has(cand)) continue;
    if (!USERNAME_RE.test(cand) || cand.length < 3) continue;
    try {
      const { data } = await supabase
        .from("profiles").select("id").eq("username", cand).maybeSingle();
      if (!data) return cand;
    } catch {
      return cand; // Supabase unavailable — fall back to candidate
    }
  }
  return `demo-user-${Math.floor(10000 + Math.random() * 90000)}`;
};

export const OnboardingFlow = ({ profile, onSaved }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<DemoGoalKey | null>(null);
  const [starter, setStarter] = useState<DemoStarterKey | null>(null);
  const [saving, setSaving] = useState(false);

  const recommended = goal ? DEMO_STARTERS.filter((s) => s.goalFit.includes(goal)) : DEMO_STARTERS;
  const others = goal ? DEMO_STARTERS.filter((s) => !s.goalFit.includes(goal)) : [];

  const finish = async () => {
    if (!starter || !goal) return;
    setSaving(true);
    try {
      // Auto-generate a demo username if none claimed yet.
      if (!profile.username) {
        const generated = await generateDemoUsername(user?.email);
        try {
          const { data, error } = await supabase
            .from("profiles").update({ username: generated }).eq("id", profile.id)
            .select("id, username, display_name, avatar_url, bio, is_published").single();
          if (!error && data) {
            onSaved(data as EditableProfile);
          } else {
            // Graceful fallback: keep going with a local profile shape.
            onSaved({ ...profile, username: generated });
          }
        } catch {
          onSaved({ ...profile, username: generated });
        }
      }

      completeDemoOnboarding(goal, starter);
      toast.success("Demo passport ready.");
      navigate("/dashboard");
    } catch {
      // Never surface raw errors in demo mode.
      completeDemoOnboarding(goal, starter);
      toast.success("Demo passport ready.");
      navigate("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-12 relative overflow-hidden">
      <div className="aurora-orb h-[420px] w-[420px] -top-20 -left-10 bg-secondary animate-aurora-drift" />
      <div className="aurora-orb h-[460px] w-[460px] bottom-0 -right-20 bg-primary animate-aurora-drift" style={{ animationDelay: "-7s" }} />

      <div className="relative w-full max-w-3xl animate-scale-in">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Pip active={step === "goal"} done={step === "starter"} label="1" />
          <div className="h-px w-10 bg-border" />
          <Pip active={step === "starter"} done={false} label="2" />
        </div>

        <div className="glass-strong rounded-3xl p-8 md:p-10">
          {step === "goal" && (
            <>
              <Header
                eyebrow="Step 1 of 2"
                title={<>Choose your <span className="text-gradient">goal</span></>}
                sub="Pick the one that fits best — you can change it later."
              />
              <div className="mt-7 grid sm:grid-cols-2 gap-3">
                {DEMO_GOALS.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className={`text-left rounded-2xl p-4 border transition-all ${
                      goal === g.key
                        ? "border-primary/60 bg-primary/5 shadow-glow-primary"
                        : "border-glass-border bg-background/30 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{g.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-semibold">{g.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{g.blurb}</div>
                      </div>
                      {goal === g.key && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-7 flex justify-end">
                <Button
                  onClick={() => setStep("starter")}
                  disabled={!goal}
                  className="bg-gradient-primary text-primary-foreground font-medium h-11 px-6"
                >
                  Continue
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === "starter" && (
            <>
              <Header
                eyebrow="Step 2 of 2"
                title={<>Choose your <span className="text-gradient">starter</span></>}
                sub="A polished starting point — fully customizable later."
              />

              <div className="mt-7 space-y-5">
                <StarterGrid items={recommended} selected={starter} onPick={setStarter} title="Recommended for you" />
                {others.length > 0 && (
                  <StarterGrid items={others} selected={starter} onPick={setStarter} title="Other starters" muted />
                )}
              </div>

              <div className="mt-7 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("goal")}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={finish}
                  disabled={!starter || saving}
                  className="bg-gradient-primary text-primary-foreground font-medium h-11 px-6 shadow-glow-primary glow-primary"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Open my passport
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Header = ({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub: string }) => (
  <div className="text-center">
    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{eyebrow}</div>
    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
    <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
  </div>
);

const Pip = ({ active, done, label }: { active: boolean; done: boolean; label: string }) => (
  <div
    className={`h-7 w-7 rounded-full grid place-items-center text-[11px] font-semibold border ${
      done
        ? "bg-primary text-primary-foreground border-primary"
        : active
        ? "bg-primary/15 text-primary border-primary/60"
        : "bg-background/40 text-muted-foreground border-border"
    }`}
  >
    {done ? <Check className="h-3.5 w-3.5" /> : label}
  </div>
);

const StarterGrid = ({
  items,
  selected,
  onPick,
  title,
  muted,
}: {
  items: typeof DEMO_STARTERS;
  selected: DemoStarterKey | null;
  onPick: (k: DemoStarterKey) => void;
  title: string;
  muted?: boolean;
}) => (
  <div>
    <div className={`text-xs uppercase tracking-wider mb-2 ${muted ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
      {title}
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {items.map((s) => (
        <button
          key={s.key}
          onClick={() => onPick(s.key)}
          className={`text-left rounded-2xl p-3.5 border transition-all ${
            selected === s.key
              ? "border-primary/60 bg-primary/5 shadow-glow-primary"
              : "border-glass-border bg-background/30 hover:border-primary/30"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className="text-xl shrink-0">{s.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-semibold text-sm leading-tight">{s.title}</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{s.blurb}</div>
            </div>
            {selected === s.key && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
          </div>
        </button>
      ))}
    </div>
  </div>
);
