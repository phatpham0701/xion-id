import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container">
        <div className="relative glass-strong rounded-[2rem] p-10 md:p-16 overflow-hidden text-center">
          <div className="aurora-orb h-[300px] w-[300px] -top-20 -left-10 bg-primary animate-aurora-drift" />
          <div className="aurora-orb h-[340px] w-[340px] -bottom-24 -right-10 bg-secondary animate-aurora-drift" style={{ animationDelay: "-9s" }} />

          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              Two steps to get started
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Pick a goal. Pick a starter.{" "}
              <span className="text-gradient">You're in.</span>
            </h2>
            <p className="mt-5 text-muted-foreground text-lg">
              No setup forms. No long onboarding. Just a polished passport, ready to share.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium h-12 px-7 group shadow-glow-primary glow-primary">
                <Link to="/auth">
                  Try the demo
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass border-glass-border h-12 px-7">
                <Link to="/preview/template/essential-rewards">View sample profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
