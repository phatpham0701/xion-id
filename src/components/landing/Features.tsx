import { User, Award, Gift, Users, Mic, Megaphone, Trophy, ShoppingBag } from "lucide-react";

const valueCards = [
  {
    icon: User,
    title: "Profiles",
    desc: "A polished, sharable page that represents you. Pick a starter, edit in seconds.",
  },
  {
    icon: Award,
    title: "Badges",
    desc: "Collect verified-style proof for the things you actually do — events, places, drops.",
  },
  {
    icon: Gift,
    title: "Rewards",
    desc: "Unlock offers that fit you. You stay in control of what's shown and what's used.",
  },
];

const personas = [
  { icon: ShoppingBag, label: "Offer seekers" },
  { icon: Mic,         label: "Creators" },
  { icon: Users,       label: "Communities" },
  { icon: Megaphone,   label: "Support campaigns" },
  { icon: Trophy,      label: "Athletes" },
];

const Features = () => {
  return (
    <section id="product" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Product
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            One passport for{" "}
            <span className="text-gradient">who you are</span>.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Three simple things, working together.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {valueCards.map((f) => (
            <article
              key={f.title}
              className="glass-strong rounded-3xl p-7 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div
                className="h-12 w-12 rounded-2xl grid place-items-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.18), hsl(var(--secondary)/0.18))" }}
              >
                <f.icon className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>

        {/* Persona strip */}
        <div className="mt-14">
          <div className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
            Built for
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {personas.map((p) => (
              <div
                key={p.label}
                className="glass rounded-full px-4 py-2 inline-flex items-center gap-2 text-sm text-foreground/80"
              >
                <p.icon className="h-3.5 w-3.5 text-primary" />
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
