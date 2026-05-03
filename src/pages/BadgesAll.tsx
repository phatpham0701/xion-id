import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgesPanel } from "@/components/dashboard/BadgesPanel";
import { BadgeScanWizard } from "@/components/dashboard/BadgeScanWizard";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";

const BadgesAll = () => {
  const [scanOpen, setScanOpen] = useState(false);
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</Link>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className="text-sm font-semibold"><Wordmark /> · Badges</span>
          </Link>
          <div className="w-[120px]" />
        </div>
      </header>
      <main className="container py-8 md:py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Your <span className="text-gradient-brand">proof</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Every signal you've verified. Filter by tier or category.</p>
        </div>
        <BadgesPanel onScan={() => setScanOpen(true)} />
      </main>
      <BadgeScanWizard open={scanOpen} onOpenChange={setScanOpen} />
    </div>
  );
};

export default BadgesAll;
