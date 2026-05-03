import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Plus, ArrowLeft, Megaphone, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDemo } from "@/components/dashboard/QuickStats";
import { CreateCampaignWizard } from "@/components/campaigns/CreateCampaignWizard";
import { CAMPAIGN_CATEGORIES } from "@/lib/demoMode";

const Campaigns = () => {
  const s = useDemo();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      <div className="aurora-orb h-[420px] w-[420px] -top-40 -left-20 bg-secondary opacity-30 animate-aurora-drift" />
      <div className="aurora-orb h-[380px] w-[380px] top-40 -right-20 bg-primary opacity-25 animate-aurora-drift" style={{ animationDelay: "-7s" }} />

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
          <Button onClick={() => setOpen(true)} className="bg-gradient-primary">
            <Plus className="h-4 w-4" /> New campaign
          </Button>
        </div>
      </header>

      <main className="container py-8 md:py-10 relative space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Campaigns</h1>
            <p className="mt-1 text-sm text-muted-foreground">Rally support around what you're working on.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">Demo</Badge>
            {s.campaigns.length} live
          </div>
        </div>

        {s.campaigns.length === 0 ? (
          <div className="glass-strong rounded-3xl p-10 text-center">
            <Megaphone className="h-8 w-8 mx-auto text-primary mb-3" />
            <h2 className="font-display text-xl font-semibold mb-1">No campaigns yet</h2>
            <p className="text-sm text-muted-foreground mb-4">Launch your first one in under a minute.</p>
            <Button onClick={() => setOpen(true)} className="bg-gradient-primary">
              <Plus className="h-4 w-4" /> Create campaign
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {s.campaigns.map((c) => {
              const cat = CAMPAIGN_CATEGORIES.find((k) => k.key === c.category);
              const pct = Math.min(100, ((c.raised ?? 0) / (c.goalAmount ?? 1)) * 100);
              return (
                <Link
                  key={c.id}
                  to={`/c/${c.id}`}
                  className="glass-strong rounded-3xl p-5 hover:-translate-y-0.5 transition-all"
                >
                  <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 grid place-items-center text-5xl mb-3">
                    {c.coverEmoji ?? "✨"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>{cat?.emoji} {cat?.label ?? "Campaign"}</span>
                  </div>
                  <h3 className="font-display text-base font-semibold mt-1 line-clamp-2">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.blurb}</p>
                  <Progress value={pct} className="h-1.5 mt-3" />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                    <span className="inline-flex items-center gap-1"><Target className="h-3 w-3" /> ${c.raised ?? 0} / ${c.goalAmount ?? 0}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {c.participants}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <CreateCampaignWizard
        open={open}
        onOpenChange={setOpen}
        ownerHandle={s.profile.username}
      />
    </div>
  );
};

export default Campaigns;
