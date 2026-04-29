import { MousePointerClick, Palette, Wallet, Image as ImageIcon, HandCoins, Sparkles, BarChart3, Shield } from "lucide-react";

const features = [
  { icon: MousePointerClick, title: "Drag & drop everything", desc: "Build your profile visually. Reorder, resize, and remix blocks in real time." },
  { icon: Palette, title: "Full customization studio", desc: "Themes, gradients, fonts, button shapes, animations — even custom CSS." },
  { icon: Wallet, title: "Wallet-native blocks", desc: "Show your XION address, NFT collection, and token balances on-chain." },
  { icon: ImageIcon, title: "Rich media embeds", desc: "Drop in images, YouTube, Vimeo and Spotify. Your story, your way." },
  { icon: HandCoins, title: "On-chain tip jar", desc: "Receive XION tips directly to your wallet. No middlemen, no cuts." },
  { icon: BarChart3, title: "Built-in analytics", desc: "Track views and clicks per block. Know what your audience loves." },
  { icon: Shield, title: "Social login → wallet", desc: "Powered by XION Meta Accounts. One tap in, fully self-custodial." },
  { icon: Sparkles, title: "Free. Forever.", desc: "No paywalls, no premium tier. XION's gasless infra makes it possible." },
];

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Features
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            A studio for your <span className="text-gradient">on-chain self</span>.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Every block, every pixel — yours to shape. We just provide the canvas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="glass rounded-2xl p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-primary/10 grid place-items-center mb-4 group-hover:scale-110 transition-transform" style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.18), hsl(var(--secondary)/0.18))" }}>
                <f.icon className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
