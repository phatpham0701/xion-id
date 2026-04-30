import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroMockup from "@/assets/hero-mockup.png";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
      {/* Aurora orbs */}
      <div className="aurora-orb h-[420px] w-[420px] -top-20 -left-20 bg-secondary animate-aurora-drift" />
      <div className="aurora-orb h-[480px] w-[480px] top-40 -right-32 bg-primary animate-aurora-drift" style={{ animationDelay: "-6s" }} />
      <div className="aurora-orb h-[360px] w-[360px] bottom-0 left-1/3 bg-secondary/70 animate-aurora-drift" style={{ animationDelay: "-12s" }} />

      <div className="container relative grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Built on XION · Gasless · 100% free</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Your Web3 identity,{" "}
            <span className="text-gradient">beautifully crafted</span>.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            XionID is a drag-and-drop link-in-bio for the on-chain world.
            Sign in with one tap, design freely, share <span className="text-foreground/90 font-medium">xionid.app/you</span> — no gas, no fees, no fuss.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium shadow-glow-primary glow-primary group h-12 px-7">
              <Link to="/auth">
                Claim your profile
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass border-glass-border hover:bg-white/5 h-12 px-7">
              <a href="#showcase">See live demo</a>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <Stat value="100%" label="Free forever" />
            <div className="h-8 w-px bg-border" />
            <Stat value="0" label="Gas fees" />
            <div className="h-8 w-px bg-border" />
            <Stat value="∞" label="Customization" />
          </div>
        </div>

        <div className="relative animate-scale-in">
          <div className="relative mx-auto max-w-[480px] animate-float">
            <img
              src={heroMockup}
              alt="XionID glassmorphism mobile mockup with avatar, link buttons and NFT grid"
              width={1024}
              height={1024}
              className="w-full h-auto drop-shadow-[0_30px_60px_rgba(20,10,40,0.5)]"
            />
          </div>
          <div className="absolute -inset-10 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl" />
        </div>
      </div>
    </section>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="font-display text-2xl font-semibold text-foreground">{value}</div>
    <div className="uppercase tracking-wider mt-0.5">{label}</div>
  </div>
);

export default Hero;
