import { ReactNode } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { Loader2, LayoutDashboard, Users, IdCard, Award, Gift, Megaphone, ScrollText, ArrowLeft } from "lucide-react";
import { useIsAdmin } from "@/lib/admin";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/profiles", label: "Profiles", icon: IdCard },
  { to: "/admin/badges", label: "Badges", icon: Award },
  { to: "/admin/rewards", label: "Rewards", icon: Gift },
  { to: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/admin/audit", label: "Audit log", icon: ScrollText },
];

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { loading, isAdmin } = useIsAdmin();
  const location = useLocation();
  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const AdminLayout = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 md:px-6">
        <aside className="hidden md:flex w-60 shrink-0 flex-col gap-1 sticky top-6 self-start">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <Link to="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to app
            </Link>
            <div className="mt-3 text-sm font-semibold">XIONID Admin</div>
            <div className="text-xs text-muted-foreground">Internal control room</div>
          </div>
          <nav className="rounded-xl border bg-card p-2 shadow-sm">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="md:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
            {NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs",
                    isActive ? "bg-primary text-primary-foreground border-primary" : "bg-card",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
};
