import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { label: "Product", href: "#product", external: true },
  { label: "Templates", href: "/templates", external: false },
  { label: "Demo", href: "/auth", external: false },
] as const;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header role="banner" className="fixed top-0 inset-x-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1.5"
      >
        Skip to content
      </a>

      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          aria-label="XIONID — Home"
          className="flex items-center gap-2.5 group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandLogo size={36} className="drop-shadow-[0_0_18px_hsl(var(--primary)/0.5)] transition-transform group-hover:rotate-[6deg]" />
          <Wordmark className="text-lg font-bold tracking-tight text-foreground" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-sm text-foreground/80">
          {NAV_LINKS.map(({ label, href, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                className="hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                to={href}
                className="hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-2">
          {user ? (
            <Button
              size="sm"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold"
              asChild
            >
              <Link to="/dashboard" aria-label="Go to your XIONID dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth" aria-label="Sign in to XIONID">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold"
                asChild
              >
                <Link to="/auth" aria-label="Get started with XIONID">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            size="sm"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold"
            asChild
          >
            <Link to={user ? "/dashboard" : "/auth"}>{user ? "Dashboard" : "Get started"}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav"
        className={cn(
          "sm:hidden overflow-hidden transition-all duration-200 ease-in-out",
          open ? "max-h-64 border-b border-glass-border" : "max-h-0"
        )}
        aria-hidden={!open}
      >
        {open && (
          <nav
            aria-label="Mobile navigation"
            className="container flex flex-col gap-1 pb-4 pt-2"
          >
            {NAV_LINKS.map(({ label, href, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-white/5 hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  to={href}
                  className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-white/5 hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              )
            )}
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-white/5 hover:text-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-white/5 hover:text-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
