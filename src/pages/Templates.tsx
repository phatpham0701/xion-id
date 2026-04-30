import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { TemplateGallery } from "@/components/templates/TemplateGallery";

const Templates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [hasBlocks, setHasBlocks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replace, setReplace] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!p) { setLoading(false); return; }
      if (!p.username) { navigate("/dashboard"); return; }
      setProfileId(p.id);
      const { count } = await supabase
        .from("blocks").select("id", { count: "exact", head: true }).eq("profile_id", p.id);
      setHasBlocks((count ?? 0) > 0);
      setReplace((count ?? 0) > 0); // default: replace if profile already has blocks
      setLoading(false);
    })();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="aurora-orb h-[460px] w-[460px] -top-40 -left-20 bg-secondary opacity-30 animate-aurora-drift pointer-events-none" />
      <div className="aurora-orb h-[420px] w-[420px] top-40 -right-20 bg-primary opacity-25 animate-aurora-drift pointer-events-none" style={{ animationDelay: "-7s" }} />

      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold">Templates</span>
          </div>
          <div className="w-[120px]" />
        </div>
      </header>

      <main className="container py-10 md:py-14 relative">
        <div className="mb-8 max-w-2xl animate-fade-in">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Start from a <span className="text-gradient">template</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Pick a starting point — every template is fully editable. Swap blocks, change colors, make it yours.
          </p>
        </div>

        {hasBlocks && (
          <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">You already have blocks on your profile.</div>
              <div className="text-xs text-muted-foreground">
                Choose how to apply the template:
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setReplace(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  replace ? "bg-gradient-primary text-primary-foreground" : "glass border border-glass-border"
                }`}
              >
                Replace existing
              </button>
              <button
                onClick={() => setReplace(false)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !replace ? "bg-gradient-primary text-primary-foreground" : "glass border border-glass-border"
                }`}
              >
                Append to existing
              </button>
            </div>
          </div>
        )}

        <TemplateGallery
          profileId={profileId}
          replaceExisting={replace}
          onApplied={() => navigate("/editor")}
        />
      </main>
    </div>
  );
};

export default Templates;
