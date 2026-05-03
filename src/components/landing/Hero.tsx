import { ArrowRight, Sparkles, Award, Gift, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
      <div className="aurora-orb h-[420px] w-[420px] -top-20 -left-20 bg-secondary animate-aurora-drift" />
      <div className="aurora-orb h-[480px] w-[480px] top-40 -right-32 bg-primary animate-aurora-drift" style={{ animationDelay: "-6s" }} />

      <div className="container relative grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="tracking-[0.18em] uppercase text-[10px]">Verify everything</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
            One identity.{" "}
            <span className="text-gradient-brand">Better rewards.</span>{" "}
            Real proof.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Build a polished profile, collect verified badges, and unlock more relevant offers — with full control over what you show.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium shadow-glow-primary glow-primary group h-12 px-7">
              <Link to="/auth">
                Try the demo
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass border-glass-border hover:bg-white/5 h-12 px-7">
              <Link to="/preview/template/essential-rewards">View sample profile</Link>
            </Button>
          </div>
        </div>

        <div className="relative animate-scale-in">
          <HeroMockup />
          <div className="absolute -inset-10 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl" />
        </div>
      </div>
    </section>
  );
};

/** Premium product mockup: profile + badges + rewards + studio strip. */
const HeroMockup = () => (
  <div className="relative mx-auto max-w-[460px]">
    {/* Subtle orbit ring + signal dots motif */}
    <div className="pointer-events-none absolute -inset-10 -z-10" aria-hidden>
      <div className="absolute inset-6 rounded-[42px] border border-primary/15" />
      <div className="absolute inset-12 rounded-[36px] border border-secondary/10" />
      <span className="absolute top-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-accent shadow-glow-accent" />
      <span className="absolute top-1/2 -left-1 h-1 w-1 rounded-full bg-secondary" />
      <span className="absolute bottom-4 right-6 h-1 w-1 rounded-full bg-primary" />
    </div>

    {/* Profile card */}
    <div className="glass-strong rounded-3xl p-5 shadow-elevated animate-float">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center text-2xl">✨</div>
        <div className="min-w-0 flex-1">
          <div className="font-display font-semibold truncate">Alex Rivera</div>
          <div className="text-xs text-muted-foreground">@alex · Verified identity</div>
        </div>
        <div className="text-[10px] uppercase tracking-wider glass rounded-full px-2 py-0.5 text-primary">Live</div>
      </div>
      <p className="mt-3 text-sm text-foreground/80">Designer · builder · collector of small wins.</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { e: "🏅", l: "OG" },
          { e: "🎴", l: "Collector" },
          { e: "🧭", l: "Explorer" },
        ].map((b) => (
          <div key={b.l} className="rounded-2xl border border-glass-border bg-background/40 p-2.5 text-center">
            <div className="text-lg">{b.e}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{b.l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Reward card — floating right */}
    <div
      className="absolute -right-4 -top-6 glass-strong rounded-2xl p-3 w-[180px] shadow-elevated animate-float"
      style={{ animationDelay: "-2s" }}
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-primary/15 grid place-items-center text-primary">
          <Gift className="h-4 w-4" />
        </div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">New offer</div>
      </div>
      <div className="mt-2 text-sm font-semibold leading-tight">20% off Nimbus Coffee</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">For verified Explorers</div>
    </div>

    {/* Badge claim — floating left */}
    <div
      className="absolute -left-6 top-32 glass-strong rounded-2xl p-3 w-[170px] shadow-elevated animate-float"
      style={{ animationDelay: "-4s" }}
    >
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-4 w-4 text-secondary" />
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Badge claimed</div>
      </div>
      <div className="mt-1.5 text-sm font-semibold">Explorer · tier 1</div>
      <div className="text-[11px] text-muted-foreground">Verified just now</div>
    </div>

    {/* Studio strip below */}
    <div className="mt-6 glass rounded-2xl p-3 flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center">
        <Award className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium">Studio · 4 sections</div>
        <div className="text-[11px] text-muted-foreground truncate">Profile · Badges · Rewards · Activity</div>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-primary">Ready</div>
    </div>
  </div>
);

export default Hero;
