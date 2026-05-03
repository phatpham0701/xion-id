import { Sparkles, BadgeCheck, Gift } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    n: "01",
    title: "Choose a starting point",
    desc: "Pick the passport that matches your goal — collector, creator, supporter, or just a polished public page.",
  },
  {
    icon: BadgeCheck,
    n: "02",
    title: "Collect your proof",
    desc: "Earn badges for the things you do — events, places, drops, communities. You decide what's visible.",
  },
  {
    icon: Gift,
    n: "03",
    title: "Unlock what fits you",
    desc: "Get offers and rewards that actually match you — and skip everything that doesn't.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            How it works
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            From zero to a real{" "}
            <span className="text-gradient">passport</span>, in a minute.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="relative glass-strong rounded-3xl p-8 overflow-hidden">
              <div className="absolute -right-6 -top-8 font-display text-[140px] font-bold leading-none text-white/[0.04] select-none">
                {s.n}
              </div>
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl grid place-items-center mb-5 bg-gradient-primary text-primary-foreground shadow-glow-primary">
                  <s.icon className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
