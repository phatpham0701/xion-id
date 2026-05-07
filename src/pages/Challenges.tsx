import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { ChallengeCreatorDialog } from "@/components/dashboard/ChallengeCreatorDialog";
import { getCountdown, getSportLifestyleState, type SportLifestyleState } from "@/lib/sportLifestyle";

const Challenges = () => {
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [lifestyle, setLifestyle] = useState<SportLifestyleState>(() => getSportLifestyleState());

  useEffect(() => {
    const refresh = () => setLifestyle(getSportLifestyleState());
    window.addEventListener("xionid:sport-lifestyle:change", refresh);
    return () => window.removeEventListener("xionid:sport-lifestyle:change", refresh);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</Link></Button>
          <Link to="/" className="flex items-center gap-2"><BrandLogo size={28} /><span className="text-sm font-semibold"><Wordmark /> · Challenges</span></Link>
          <Button size="sm" className="bg-gradient-primary" onClick={() => setCreatorOpen(true)}>New</Button>
        </div>
      </header>

      <main className="container py-8 md:py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Personal <span className="text-gradient-brand">challenges</span></h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">Create deadlines and countdowns around your own sport lifestyle targets. Accepted or simulated proof can update challenge progress and badge momentum.</p>
        </div>

        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lifestyle.challenges.map((challenge) => {
            const pct = Math.min(100, Math.round((challenge.currentProgress / Math.max(1, challenge.target)) * 100));
            return (
              <div key={challenge.id} className="rounded-3xl border border-glass-border bg-background/50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="outline">{challenge.sportType}</Badge>
                    <h3 className="font-display text-xl font-semibold mt-3">{challenge.title}</h3>
                  </div>
                  <Target className="h-5 w-5 text-primary shrink-0" />
                </div>
                <Progress value={pct} className="h-2 mt-4" />
                <div className="mt-3 text-sm font-medium">{challenge.currentProgress}/{challenge.target} {challenge.targetMetric}</div>
                <div className="text-xs text-muted-foreground mt-1">Deadline {challenge.deadline} · {getCountdown(challenge.deadline)}</div>
                <div className="mt-4 rounded-2xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">Linked badge impact preview: proof matching this challenge can increase badge progress and rank signal.</div>
              </div>
            );
          })}
        </section>
      </main>

      <ChallengeCreatorDialog open={creatorOpen} onOpenChange={setCreatorOpen} state={lifestyle} onStateChange={setLifestyle} />
    </div>
  );
};

export default Challenges;
