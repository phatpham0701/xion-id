import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = handle.trim();
    navigate(`/auth${trimmed ? `?handle=${encodeURIComponent(trimmed)}` : ""}`);
  };

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container">
        <div className="relative glass-strong rounded-[2rem] p-10 md:p-16 overflow-hidden text-center">
          <div className="aurora-orb h-[300px] w-[300px] -top-20 -left-10 bg-primary animate-aurora-drift" />
          <div className="aurora-orb h-[340px] w-[340px] -bottom-24 -right-10 bg-secondary animate-aurora-drift" style={{ animationDelay: "-9s" }} />

          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Claim your <span className="text-gradient">XionID</span>.
            </h2>
            <p className="mt-5 text-muted-foreground text-lg">
              Free for life. Gasless on XION. Live in under a minute.
            </p>

            <form className="mt-9 flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={onSubmit}>
              <div className="flex-1 glass rounded-full flex items-center pl-5 pr-1 h-12">
                <span className="text-muted-foreground text-sm">xionid.app/</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourname"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60 px-1"
                  maxLength={24}
                  aria-label="Choose your handle"
                />
              </div>
              <Button size="lg" type="submit" className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium h-12 px-6 rounded-full shadow-glow-primary glow-primary group">
                Claim
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </form>

            <p className="mt-4 text-xs text-muted-foreground">
              No credit card. No gas. No catch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
