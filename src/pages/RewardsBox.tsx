import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RewardsLocker } from "@/components/dashboard/RewardsLocker";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";

const RewardsBox = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</Link>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className="text-sm font-semibold"><Wordmark /> · Offer Box</span>
          </Link>
          <div className="w-[120px]" />
        </div>
      </header>
      <main className="container py-8 md:py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Your <span className="text-gradient-brand">Offer Box</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Rewards matched to your verified signals. Claim, save or archive.</p>
        </div>
        <RewardsLocker />
      </main>
    </div>
  );
};

export default RewardsBox;
