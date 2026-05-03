import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { ArrowLeft, Sparkles, QrCode, Copy, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/components/dashboard/QuickStats";
import { toast } from "sonner";

type QrKind = "profile" | "campaign" | "reward" | "support";

type QrCard = {
  id: string;
  kind: QrKind;
  title: string;
  description: string;
  url: string;
  status: string;
};

const KIND_META: Record<QrKind, { label: string; emoji: string; tone: string }> = {
  profile:  { label: "Profile QR",  emoji: "🪪", tone: "from-primary/30 to-secondary/30" },
  campaign: { label: "Campaign QR", emoji: "📣", tone: "from-secondary/30 to-primary/30" },
  reward:   { label: "Reward QR",   emoji: "🎁", tone: "from-amber-400/30 to-pink-400/30" },
  support:  { label: "Support QR",  emoji: "💝", tone: "from-fuchsia-400/30 to-cyan-400/30" },
};

const QrCenter = () => {
  const navigate = useNavigate();
  const s = useDemo();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const handle = s.profile.username || "you";

  const cards: QrCard[] = [
    {
      id: "profile",
      kind: "profile",
      title: `@${handle}`,
      description: "Your public profile — share anywhere.",
      url: `${origin}/${handle}`,
      status: "Active",
    },
    ...s.campaigns.map<QrCard>((c) => ({
      id: `c-${c.id}`,
      kind: "campaign",
      title: c.title,
      description: c.blurb,
      url: `${origin}/c/${c.id}`,
      status: c.visibility === "private" ? "Private" : "Live",
    })),
    {
      id: "reward",
      kind: "reward",
      title: "Reward redemption",
      description: "Show this at a partner counter.",
      url: `${origin}/${handle}?reward=1`,
      status: "Demo",
    },
    {
      id: "support",
      kind: "support",
      title: "Quick support",
      description: "Let someone back you in seconds.",
      url: `${origin}/${handle}?support=1`,
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="aurora-orb h-[420px] w-[420px] -top-40 -left-20 bg-secondary opacity-30 animate-aurora-drift" />

      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
            <Link to="/" className="flex items-center gap-2 ml-2">
              <BrandLogo size={36} />
              <span className="font-display text-lg font-semibold"><Wordmark /></span>
            </Link>
          </div>
          <Badge variant="outline" className="text-[10px]"><QrCode className="h-3 w-3 mr-1" /> QR Center</Badge>
        </div>
      </header>

      <main className="container py-8 md:py-10 relative space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">QR Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every link in your XIONID world, scannable.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => <QrCardItem key={c.id} card={c} handle={handle} />)}
        </div>
      </main>
    </div>
  );
};

const QrCardItem = ({ card, handle }: { card: QrCard; handle: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const meta = KIND_META[card.kind];

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, card.url, {
      width: 180, margin: 2, errorCorrectionLevel: "H",
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then(() => setReady(true)).catch(() => setReady(true));
  }, [card.url]);

  const download = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(card.url, {
        width: 1024, margin: 2, errorCorrectionLevel: "H",
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `xionid-${handle}-${card.kind}-${card.id}.png`;
      a.click();
      toast.success("QR downloaded");
    } catch {
      toast.error("Couldn't download");
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && typeof (navigator as Navigator).share === "function") {
      try { await (navigator as Navigator).share({ title: card.title, url: card.url }); return; } catch { /* */ }
    }
    navigator.clipboard.writeText(card.url);
    toast.success("Link copied");
  };

  return (
    <div className="glass-strong rounded-3xl p-5">
      <div className={`rounded-2xl bg-gradient-to-br ${meta.tone} p-4 grid place-items-center mb-3`}>
        <div className="rounded-xl bg-white p-2 shadow-glow-primary/30">
          <canvas ref={canvasRef} className="block" />
          {!ready && <div className="h-[180px] w-[180px]" />}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{meta.emoji} {meta.label}</span>
        <Badge variant="outline" className="text-[10px] ml-auto">{card.status}</Badge>
      </div>
      <h3 className="font-display text-base font-semibold mt-1 line-clamp-1">{card.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
      <div className="text-[10px] font-mono text-muted-foreground truncate mt-2">{card.url}</div>
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(card.url); toast.success("Copied"); }}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={download}>
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={share}>
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default QrCenter;
