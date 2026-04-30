import { Fingerprint, Blocks, Share2 } from "lucide-react";

const steps = [
  {
    icon: Fingerprint,
    n: "01",
    title: "Sign in, get a wallet",
    desc: "Tap Google, email, or Apple. XION's Meta Account spins up a self-custodial wallet behind the scenes — no seed phrases.",
  },
  {
    icon: Blocks,
    n: "02",
    title: "Drag, drop, decorate",
    desc: "Pick blocks from the library, drop them on your canvas, and tweak the theme until it feels like home.",
  },
  {
    icon: Share2,
    n: "03",
    title: "Share xionid.app/you",
    desc: "Your profile lives at a clean handle URL. Share once, update forever. Free, gasless, on XION.",
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
            From zero to <span className="text-gradient">on-chain</span> in three taps.
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
