import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND, RESERVED_USERNAMES } from "@/lib/brand";
import {
  DEMO_GOALS,
  DEMO_STARTERS,
  completeDemoOnboarding,
  type DemoGoalKey,
  type DemoStarterKey,
} from "@/lib/demoMode";
import type { EditableProfile } from "@/components/dashboard/ProfileEditorCard";

const usernameSchema = z
  .string()
  .trim()
  .min(3, { message: "At least 3 characters" })
  .max(24, { message: "Max 24 characters" })
  .regex(/^[a-zA-Z0-9_.\-]+$/, { message: "Only letters, numbers, _ . -" });

type Props = {
  profile: EditableProfile;
  onSaved: (p: EditableProfile) => void;
};

type Step = "goal" | "starter";

export const OnboardingFlow = ({ profile, onSaved }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<DemoGoalKey | null>(null);
  const [starter, setStarter] = useState<DemoStarterKey | null>(null);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const recommended = goal ? DEMO_STARTERS.filter((s) => s.goalFit.includes(goal)) : DEMO_STARTERS;
  const others = goal ? DEMO_STARTERS.filter((s) => !s.goalFit.includes(goal)) : [];

  const finish = async () => {
    if (!goal || !starter) return;

    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    const lower = parsed.data.toLowerCase();
    if (RESERVED_USERNAMES.has(lower)) {
      return toast.error("That handle is reserved", { description: "Pick another one." });
    }

    setSaving(true);
    try {
      // Claim handle if not already claimed.
      if (!profile.username) {
        const { data: existing, error: checkErr } = await supabase
          .from("profiles").select("id").eq("username", parsed.data).maybeSingle();
        if (checkErr) throw checkErr;
        if (existing && existing.id !== profile.id) {
          toast.error("That handle is taken", { description: "Try another." });
          setSaving(false);
          return;
        }
        const { data, error } = await supabase
          .from("profiles").update({ username: parsed.data }).eq("id", profile.id)
          .select("id, username, display_name, avatar_url, bio, is_published").single();
        if (error) throw error;
        onSaved(data as EditableProfile);
      }

      completeDemoOnboarding(goal, starter);
      toast.success("You're in!", { description: "Your passport is ready." });
      navigate("/dashboard");
    } catch (err) {
      toast.error("Couldn't save", { description: err instanceof Error ? err.message : "Try again" });
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

              {/* Handle */}
              {!profile.username && (
                <div className="mt-7">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Pick your public ID</label>
                  <div className="mt-2 glass rounded-2xl flex items-center pl-4 pr-1 h-12">
                    <span className="text-sm text-muted-foreground select-none">{BRAND.domain}/</span>
                    <Input
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="yourname"
                      className="border-0 bg-transparent px-1 h-full text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                      maxLength={24}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    3–24 chars · letters, numbers, <code className="font-mono">_ . -</code>
                  </p>
                </div>
              )}

              <div className="mt-7 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep("goal")} className="text-muted-foreground">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={finish}
                  disabled={!starter || saving || (!profile.username && username.length < 3)}
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
