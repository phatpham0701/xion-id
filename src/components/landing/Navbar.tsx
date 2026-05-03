import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";

const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" aria-label="XionID home">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <Wordmark className="font-display text-lg font-semibold tracking-tight" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#product" className="hover:text-foreground transition-colors">Product</a>
          <Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link>
          <Link to="/auth" className="hover:text-foreground transition-colors">Demo</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium" asChild>
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
