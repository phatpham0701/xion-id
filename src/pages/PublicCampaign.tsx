import { Wordmark } from "@/components/Wordmark";
import { BrandLogo } from "@/components/BrandLogo";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { Sparkles, ArrowLeft, Heart, Target, Users, Copy, Share2, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/components/dashboard/QuickStats";
import { CAMPAIGN_CATEGORIES, supportDemoCampaign, type CampaignTierKey } from "@/lib/demoMode";
import { toast } from "sonner";

const timeAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const PublicCampaign = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const s = useDemo();
  const c = useMemo(() => s.campaigns.find((x) => x.id === id), [s.campaigns, id]);
  const [tierToConfirm, setTierToConfirm] = useState<CampaignTierKey | null>(null);
  const [name, setName] = useState("You");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && c) {
      QRCode.toCanvas(canvasRef.current, window.location.href, {
        width: 160, margin: 2, errorCorrectionLevel: "H",
        color: { dark: "#0f172a", light: "#ffffff" },
      }).catch(() => {});
    }
  }, [c]);

  if (!c) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p className="text-muted-foreground mb-3">Campaign not found.</p>
          <Button asChild variant="outline"><Link to="/campaigns">Back to campaigns</Link></Button>
        </div>
      </div>
    );
  }

  const cat = CAMPAIGN_CATEGORIES.find((k) => k.key === c.category);
  const pct = Math.min(100, ((c.raised ?? 0) / (c.goalAmount ?? 1)) * 100);
  const tiers = c.tiers ?? [];

  const confirmSupport = () => {
    if (!tierToConfirm) return;
    const { badgeIssued } = supportDemoCampaign(c.id, tierToConfirm, name || "Anonymous");
    toast.success("Demo support recorded", {
      description: badgeIssued ? `Badge issued: ${badgeIssued.label}` : "Thanks for backing this!",
    });
    setTierToConfirm(null);
  };

  return (
    <div className="min-h-screen relative">
      <div className="aurora-orb h-[420px] w-[420px] -top-40 -left-20 bg-secondary opacity-30 animate-aurora-drift" />

      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-primary grid place-items-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold"><Wordmark /></span>
          </Link>
        </div>
      </header>

      <main className="container py-8 relative grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="space-y-5">
          {/* Hero */}
          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="aspect-[16/7] bg-gradient-to-br from-primary/30 to-secondary/30 grid place-items-center text-7xl">
              {c.coverEmoji ?? "✨"}
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                <Badge variant="outline" className="text-[10px]">{cat?.emoji} {cat?.label ?? "Campaign"}</Badge>
                <Badge variant="outline" className="text-[10px]">Demo</Badge>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{c.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{c.blurb}</p>
              {c.story && <p className="mt-4 text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{c.story}</p>}
            </div>
          </div>

          {/* Creator card */}
          {c.ownerHandle && (
            <div className="glass-strong rounded-3xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-semibold">
                {c.ownerHandle.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">@{c.ownerHandle}</div>
                <div className="text-[11px] text-muted-foreground">Verified creator on XIONID</div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/${c.ownerHandle}`}>View profile</Link>
              </Button>
            </div>
          )}

          {/* Milestones */}
          {c.milestones && c.milestones.length > 0 && (
            <div className="glass-strong rounded-3xl p-5">
              <h2 className="font-display text-base font-semibold mb-3">Milestones</h2>
              <ol className="space-y-2">
                {c.milestones.map((m) => (
                  <li key={m.label} className="flex items-center gap-3">
                    <span className={`h-6 w-6 rounded-full grid place-items-center text-xs ${m.reached ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground"}`}>
                      {m.reached ? <Check className="h-3 w-3" /> : "•"}
                    </span>
                    <span className={`text-sm ${m.reached ? "" : "text-muted-foreground"}`}>{m.label}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">{new Date(m.at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Recent supporters */}
          <div className="glass-strong rounded-3xl p-5">
            <h2 className="font-display text-base font-semibold mb-3">Recent supporters</h2>
            {(c.supporters ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">Be the first to support this campaign.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {(c.supporters ?? []).slice(0, 8).map((sup) => (
                  <li key={sup.id} className="flex items-center gap-3 py-2.5">
                    <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary grid place-items-center text-xs font-semibold">
                      {sup.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{sup.name}</div>
                      {sup.message && <div className="text-[11px] text-muted-foreground truncate">"{sup.message}"</div>}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">${sup.amount}</div>
                    <div className="text-[10px] text-muted-foreground w-16 text-right">{timeAgo(sup.at)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-5 lg:sticky lg:top-20 self-start">
          <div className="glass-strong rounded-3xl p-5">
            <Progress value={pct} className="h-2" />
            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="font-display text-2xl font-bold">${c.raised ?? 0}</div>
                <div className="text-[11px] text-muted-foreground">raised of ${c.goalAmount ?? 0} goal</div>
              </div>
              <div className="text-right">
                <div className="font-semibold inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.participants}</div>
                <div className="text-[11px] text-muted-foreground">supporters</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {tiers.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTierToConfirm(t.key)}
                  className="w-full text-left rounded-2xl border border-glass-border bg-background/40 hover:border-primary/40 transition-all p-3 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm">
                    ${t.amount}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{t.label}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">{t.perks}</div>
                  </div>
                  <Heart className="h-4 w-4 text-primary" />
                </button>
              ))}
            </div>
          </div>

          {/* QR card */}
          <div className="glass-strong rounded-3xl p-5">
            <h3 className="font-display text-sm font-semibold mb-3">Share this campaign</h3>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2 shrink-0"><canvas ref={canvasRef} className="block" /></div>
              <div className="min-w-0 flex-1 space-y-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}>
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    if (typeof navigator !== "undefined" && typeof (navigator as Navigator).share === "function") {
                      try { await (navigator as Navigator).share({ title: c.title, url: window.location.href }); } catch { /* */ }
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied");
                    }
                  }}
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <Dialog open={!!tierToConfirm} onOpenChange={(o) => !o && setTierToConfirm(null)}>
        <DialogContent className="max-w-md">
          {tierToConfirm && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Confirm your support</DialogTitle>
                <DialogDescription>
                  {tiers.find((t) => t.key === tierToConfirm)?.label} · ${tiers.find((t) => t.key === tierToConfirm)?.amount}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl border border-glass-border bg-background/40 p-4 space-y-2">
                <div className="text-sm">{tiers.find((t) => t.key === tierToConfirm)?.perks}</div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Display as</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or 'Anonymous'" />
                </div>
                <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-2 border-t border-border/40">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  Demo only — no real payment will be charged.
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setTierToConfirm(null)}>Cancel</Button>
                <Button onClick={confirmSupport} className="bg-gradient-primary">
                  <Heart className="h-4 w-4" /> Support · demo
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicCampaign;
