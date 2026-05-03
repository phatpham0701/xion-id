import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";
import { BrandLogo } from "@/components/BrandLogo";

const Navbar = () => {
  return (
    <header role="banner" className="fixed top-0 inset-x-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1.5"
      >
        Skip to content
      </a>
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          aria-label="XIONID — Home"
          className="flex items-center gap-2.5 group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandLogo size={36} className="drop-shadow-[0_0_18px_hsl(var(--primary)/0.5)] transition-transform group-hover:rotate-[6deg]" />
          <Wordmark className="text-lg font-bold tracking-tight text-foreground" />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-sm text-foreground/80">
          <a
            href="#product"
            className="hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Product
          </a>
          <Link
            to="/templates"
            className="hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Templates
          </Link>
          <Link
            to="/auth"
            className="hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Demo
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/auth" aria-label="Sign in to XIONID">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold"
            asChild
          >
            <Link to="/auth" aria-label="Get started with XIONID">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
