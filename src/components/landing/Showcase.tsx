import { Github, Twitter, Globe, Music } from "lucide-react";

type DemoBlock =
  | { kind: "link"; label: string; sub?: string }
  | { kind: "social" }
  | { kind: "nft" };

const demos: { handle: string; bio: string; accent: string; blocks: DemoBlock[] }[] = [
  {
    handle: "@nova.xion",
    bio: "Generative artist · XION early builder",
    accent: "from-primary/30 to-secondary/30",
    blocks: [
      { kind: "link", label: "My latest drop", sub: "stargate.xion" },
      { kind: "link", label: "Commission me" },
      { kind: "nft" },
      { kind: "social" },
    ],
  },
  {
    handle: "@dao.builder",
    bio: "Shipping public goods on XION",
    accent: "from-secondary/30 to-primary/30",
    blocks: [
      { kind: "link", label: "Read the whitepaper" },
      { kind: "link", label: "Tip me on XION", sub: "0xion…a9f2" },
      { kind: "social" },
    ],
  },
  {
    handle: "@lofi.dev",
    bio: "Music · code · coffee",
    accent: "from-primary/40 to-secondary/20",
    blocks: [
      { kind: "link", label: "Listen on Spotify" },
      { kind: "link", label: "GitHub" },
      { kind: "nft" },
    ],
  },
];

const Showcase = () => {
  return (
    <section id="showcase" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Showcase
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            One canvas, <span className="text-gradient">infinite vibes</span>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {demos.map((d) => (
            <div key={d.handle} className="glass rounded-3xl p-5 hover:-translate-y-1 transition-transform duration-300">
              <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${d.accent} aspect-[3/4] p-5 flex flex-col`}>
                <div className="absolute inset-0 bg-background-deep/40" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-gradient-primary mb-3 ring-2 ring-white/20" />
                  <div className="font-display font-semibold text-sm">{d.handle}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{d.bio}</div>
                </div>
                <div className="relative mt-5 flex-1 flex flex-col gap-2">
                  {d.blocks.map((b, i) => {
                    if (b.kind === "link") {
                      return (
                        <div key={i} className="glass-strong rounded-xl px-3 py-2.5 text-xs font-medium text-center">
                          {b.label}
                          {b.sub && <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{b.sub}</div>}
                        </div>
                      );
                    }
                    if (b.kind === "social") {
                      return (
                        <div key={i} className="flex justify-center gap-2 py-1">
                          {[Twitter, Github, Globe, Music].map((Icon, j) => (
                            <div key={j} className="h-8 w-8 rounded-lg glass-strong grid place-items-center">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="grid grid-cols-3 gap-1.5">
                        {[0, 1, 2].map((k) => (
                          <div key={k} className="aspect-square rounded-lg bg-gradient-to-br from-secondary/40 to-primary/40" />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Showcase;
