import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import {
  Sparkles, LogOut, Loader2, LayoutTemplate, Pencil, Wand2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BRAND, RESERVED_USERNAMES } from "@/lib/brand";
import { ProfileEditorCard, type EditableProfile } from "@/components/dashboard/ProfileEditorCard";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { TipAnalyticsCard } from "@/components/dashboard/TipAnalyticsCard";

const usernameSchema = z
  .string()
  .trim()
  .min(3, { message: "At least 3 characters" })
  .max(24, { message: "Max 24 characters" })
  .regex(/^[a-zA-Z0-9_.\-]+$/, { message: "Only letters, numbers, _ . -" });

const Onboarding = ({ profile, onSaved }: { profile: EditableProfile; onSaved: (p: EditableProfile) => void }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const claim = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    const lower = parsed.data.toLowerCase();
    if (RESERVED_USERNAMES.has(lower)) {
      return toast.error("That handle is reserved", { description: "Pick another one." });
    }

    setSaving(true);
    try {
      const { data: existing, error: checkErr } = await supabase
        .from("profiles").select("id").eq("username", parsed.data).maybeSingle();
      if (checkErr) throw checkErr;
      if (existing && existing.id !== profile.id) {
        toast.error("That handle is taken", { description: "Try another one." });
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles").update({ username: parsed.data }).eq("id", profile.id)
        .select("id, username, display_name, avatar_url, bio, is_published").single();
      if (error) throw error;
      toast.success("Profile claimed!", { description: `${BRAND.domain}/${parsed.data}` });
      onSaved(data as EditableProfile);
      // Nudge new users straight to templates
      navigate("/templates");
    } catch (err) {
      toast.error("Couldn't save", { description: err instanceof Error ? err.message : "Try again" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-12 relative overflow-hidden">
      <div className="aurora-orb h-[420px] w-[420px] -top-20 -left-10 bg-secondary animate-aurora-drift" />
      <div className="aurora-orb h-[460px] w-[460px] bottom-0 -right-20 bg-primary animate-aurora-drift" style={{ animationDelay: "-7s" }} />
      <div className="glass-strong rounded-3xl p-8 md:p-10 w-full max-w-lg animate-scale-in">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary mb-4">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Choose your <span className="text-gradient">handle</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This is your permanent XionID URL. Pick wisely.
          </p>
        </div>

        <form onSubmit={claim} className="space-y-4">
          <div className="glass rounded-2xl flex items-center pl-4 pr-1 h-14 focus-within:border-primary/50 transition-colors">
            <span className="text-sm text-muted-foreground select-none">{BRAND.domain}/</span>
            <Input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              className="border-0 bg-transparent px-1 h-full text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={24}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            3–24 chars · letters, numbers, <code className="font-mono">_ . -</code>
          </p>
          <Button
            type="submit"
            disabled={saving || username.length < 3}
            className="w-full h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium shadow-glow-primary glow-primary"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim handle & pick a template"}
          </Button>
        </form>
      </div>
    </div>
  );
};

const EmptyStateHero = () => (
  <div className="glass-strong rounded-3xl p-8 md:p-10 text-center animate-fade-in">
    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary mb-5">
      <Wand2 className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
    </div>
    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2">
      Your profile is <span className="text-gradient">empty</span>
    </h2>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      Pick a template to start with a polished profile in one tap, or build from scratch in the editor.
    </p>
    <div className="flex flex-wrap justify-center gap-2">
      <Button asChild className="bg-gradient-primary text-primary-foreground font-medium">
        <Link to="/templates"><LayoutTemplate className="h-4 w-4 mr-1.5" />Browse 15 templates</Link>
      </Button>
      <Button asChild variant="outline" className="glass border-glass-border">
        <Link to="/editor"><Pencil className="h-4 w-4 mr-1.5" />Build from scratch</Link>
      </Button>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockCount, setBlockCount] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, is_published")
        .eq("user_id", user.id).maybeSingle();
      if (error) toast.error("Couldn't load profile", { description: error.message });
      setProfile(data as EditableProfile | null);
      if (data?.id) {
        const { count } = await supabase
          .from("blocks").select("id", { count: "exact", head: true }).eq("profile_id", data.id);
        setBlockCount(count ?? 0);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-64 w-full max-w-3xl rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <p className="text-muted-foreground">Profile not found. Try signing out and back in.</p>
      </div>
    );
  }

  if (!profile.username) {
    return <Onboarding profile={profile} onSaved={setProfile} />;
  }

  const profileUrl = `${window.location.origin}/${profile.username}`;
  const isEmpty = blockCount === 0;

  return (
    <div className="min-h-screen relative">
      <div className="aurora-orb h-[460px] w-[460px] -top-40 -left-20 bg-secondary opacity-40 animate-aurora-drift" />
      <div className="aurora-orb h-[420px] w-[420px] top-40 -right-20 bg-primary opacity-30 animate-aurora-drift" style={{ animationDelay: "-7s" }} />

      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="XionID home">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              Xion<span className="text-gradient">ID</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/templates"><LayoutTemplate className="h-4 w-4 mr-1.5" />Templates</Link>
            </Button>
            <span className="hidden md:inline text-xs text-muted-foreground mr-2">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10 md:py-14 relative space-y-6">
        <div className="animate-fade-in">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Your <span className="text-gradient">studio</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Edit, decorate, and share your on-chain profile.</p>
        </div>

        {isEmpty ? (
          <>
            <ProfileEditorCard
              profile={profile}
              onChange={setProfile}
              onShare={() => setShareOpen(true)}
            />
            <div className="grid lg:grid-cols-2 gap-6">
              <WalletCard />
              <EmptyStateHero />
            </div>
          </>
        ) : (
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
            <div className="space-y-6">
              <ProfileEditorCard
                profile={profile}
                onChange={setProfile}
                onShare={() => setShareOpen(true)}
              />
              <RecentActivity profileId={profile.id} />
            </div>
            <div className="space-y-6">
              <WalletCard />
              <TipAnalyticsCard profileId={profile.id} />
              <AnalyticsPanel profileId={profile.id} />
            </div>
          </div>
        )}
      </main>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        profileUrl={profileUrl}
        username={profile.username}
      />
    </div>
  );
};

export default Dashboard;
