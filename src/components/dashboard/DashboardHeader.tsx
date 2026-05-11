import { Link } from "react-router-dom";
import { LayoutTemplate, LogOut, Menu, Shield } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

type Props = {
  email?: string | null;
  isAdmin: boolean;
  onSignOut: () => void;
  onVerify: () => void;
};

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/badges", label: "Badges" },
  { to: "/challenges", label: "Challenges" },
  { to: "/opportunities", label: "Opportunities" },
];

export const DashboardHeader = ({ email, isAdmin, onSignOut, onVerify }: Props) => {
  return (
    <header className="border-b border-border/40 glass sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link to="/dashboard" className="flex items-center gap-2" aria-label="XIONID dashboard">
          <BrandLogo size={36} />
          <span className="font-display text-lg font-semibold tracking-tight">
            <Wordmark />
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Primary">
          {navLinks.map((l) => (
            <Button key={l.to} variant="ghost" size="sm" asChild>
              <Link to={l.to}>{l.label}</Link>
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={onVerify}>
            Verify Lifestyle
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/editor">
              <LayoutTemplate className="h-4 w-4 mr-1.5" />
              Studio
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/admin">
                <Shield className="h-4 w-4 mr-1.5" />
                Admin
              </Link>
            </Button>
          )}
          <span className="hidden xl:inline text-xs text-muted-foreground mr-2">{email}</span>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="hidden sm:inline-flex">
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign out
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-80">
              <SheetHeader>
                <SheetTitle className="font-display">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <SheetClose asChild key={l.to}>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to={l.to}>{l.label}</Link>
                    </Button>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" onClick={onVerify}>
                    Verify Lifestyle
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/editor">
                      <LayoutTemplate className="h-4 w-4 mr-1.5" />
                      Studio
                    </Link>
                  </Button>
                </SheetClose>
                {isAdmin && (
                  <SheetClose asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/admin">
                        <Shield className="h-4 w-4 mr-1.5" />
                        Admin
                      </Link>
                    </Button>
                  </SheetClose>
                )}
                <div className="my-3 h-px bg-border/60" />
                {email && (
                  <div className="px-3 text-xs text-muted-foreground truncate">{email}</div>
                )}
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" onClick={onSignOut}>
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Sign out
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
