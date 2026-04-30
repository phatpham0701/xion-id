import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "Not found · XionID";
  }, [location.pathname]);

  return (
    <div className="min-h-screen grid place-items-center px-6 relative overflow-hidden">
      <div className="aurora-orb h-[420px] w-[420px] -top-20 -left-10 bg-secondary animate-aurora-drift" />
      <div className="aurora-orb h-[460px] w-[460px] -bottom-20 -right-10 bg-primary animate-aurora-drift" style={{ animationDelay: "-7s" }} />
      <div className="glass-strong rounded-3xl p-10 text-center max-w-md relative">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary mb-5">
          <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-5xl font-bold tracking-tight mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page drifted off the aurora.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
