import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { OPPORTUNITY_CATEGORIES, getMatchedOpportunities, getSportLifestyleState, type SportLifestyleState } from "@/lib/sportLifestyle";

const RewardsBox = () => {
  const [lifestyle, setLifestyle] = useState<SportLifestyleState>(() => getSportLifestyleState());

  useEffect(() => {
    const refresh = () => setLifestyle(getSportLifestyleState());
    window.addEventListener("xionid:sport-lifestyle:change", refresh);
    return () => window.removeEventListener("xionid:sport-lifestyle:change", refresh);
  }, []);

  const opportunities = useMemo(() => getMatchedOpportunities(lifestyle.selectedInterest), [lifestyle.selectedInterest]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</Link></Button>
          <Link to="/" className="flex items-center gap-2"><BrandLogo size={28} /><span className="text-sm font-semibold"><Wordmark /> · Opportunities</span></Link>
          <div className="w-[120px]" />
        </div>
      </header>

      <main className="container py-8 md:py-10 space-y-6">
        <div>
          <Badge variant="outline" className="mb-3">Lifestyle opportunities</Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Support matched to your <span className="text-gradient-brand">sport lifestyle</span></h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">This is not a voucher marketplace. Opportunities are pilot-safe matches based on sport interests, proof history, badge tiers, challenge progress, and rank readiness.</p>
        </div>

        <section className="glass-strong rounded-3xl p-5 md:p-6">
          <h2 className="font-display text-xl font-semibold mb-3">Opportunity categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {OPPORTUNITY_CATEGORIES.map((category) => <div key={category} className="rounded-2xl border border-glass-border bg-background/40 p-4 text-sm font-medium">{category}</div>)}
          </div>
        </section>

        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="rounded-3xl border border-glass-border bg-background/50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="secondary">{opportunity.category}</Badge>
                  <h3 className="font-display text-xl font-semibold mt-3">{opportunity.title}</h3>
                </div>
                <BriefcaseBusiness className="h-5 w-5 text-primary shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">{opportunity.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">Readiness: {opportunity.readiness}</Badge>
                <Badge variant="outline">{opportunity.status} pilot</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Pilot status means no guaranteed compensation, sponsorship, employment, or income is implied.</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default RewardsBox;
