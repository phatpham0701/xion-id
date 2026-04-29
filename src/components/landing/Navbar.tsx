import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            XION<span className="text-gradient">Profile</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#showcase" className="hover:text-foreground transition-colors">Showcase</a>
          <a href="https://xion.burnt.com/" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            Built on XION ↗
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium" asChild>
            <Link to="/auth">Claim your profile</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
