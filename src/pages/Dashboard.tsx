import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import {
  Sparkles, LogOut, Eye, ExternalLink, Pencil, Check, Loader2,
  Copy, BarChart3, Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const usernameSchema = z
  .string()
  .trim()
  .min(3, { message: "At least 3 characters" })
  .max(24, { message: "Max 24 characters" })
  .regex(/^[a-zA-Z0-9_.\-]+$/, { message: "Only letters, numbers, _ . -" });

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_published: boolean;
  updated_at: string;
};

const Onboarding = ({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) => {
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const claim = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setSaving(true);
    try {
      // Check availability (case-insensitive due to citext)
      const { data: existing, error: checkErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", parsed.data)
        .maybeSingle();
      if (checkErr) throw checkErr;
      if (existing && existing.id !== profile.id) {
        toast.error("That handle is taken", { description: "Try another one." });
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ username: parsed.data })
        .eq("id", profile.id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Profile claimed!", { description: `xionprofile.com/${parsed.data}` });
      onSaved(data as Profile);
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
            This is your permanent XIONProfile URL. Pick wisely.
          </p>
        </div>

        <form onSubmit={claim} className="space-y-4">
          <div className="glass rounded-2xl flex items-center pl-4 pr-1 h-14 focus-within:border-primary/50 transition-colors">
            <span className="text-sm text-muted-foreground select-none">xionprofile.com/</span>
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
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim handle"}
          </Button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<{ views: number; clicks: number }>({ views: 0, clicks: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, is_published, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        toast.error("Couldn't load profile", { description: error.message });
      }
      setProfile(data as Profile | null);
      setLoading(false);

      if (data?.id) {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [views, clicks] = await Promise.all([
          supabase.from("analytics_events").select("id", { count: "exact", head: true })
            .eq("profile_id", data.id).eq("event_type", "profile_view").gte("created_at", since),
          supabase.from("analytics_events").select("id", { count: "exact", head: true })
            .eq("profile_id", data.id).eq("event_type", "block_click").gte("created_at", since),
        ]);
        setStats({ views: views.count ?? 0, clicks: clicks.count ?? 0 });
      }
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

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied");
  };

  return (
    <div className="min-h-screen relative">
      <div className="aurora-orb h-[460px] w-[460px] -top-40 -left-20 bg-secondary opacity-40 animate-aurora-drift" />
      <div className="aurora-orb h-[420px] w-[420px] top-40 -right-20 bg-primary opacity-30 animate-aurora-drift" style={{ animationDelay: "-7s" }} />

      {/* Header */}
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              XION<span className="text-gradient">Profile</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground mr-2">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10 md:py-14 relative">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Your <span className="text-gradient">studio</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Edit, decorate, and share your on-chain profile.</p>
        </div>

        {/* Main profile card */}
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
          <div className="glass-strong rounded-3xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-display text-xl font-semibold shrink-0">
                  {(profile.display_name || profile.username || "X").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xl font-semibold truncate">
                    {profile.display_name || profile.username}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    @{profile.username}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary glass rounded-full px-2.5 py-1 shrink-0">
                <Check className="h-3 w-3" />
                <span>Live</span>
              </div>
            </div>

            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-mono truncate flex-1">{profileUrl}</span>
              <Button size="sm" variant="ghost" onClick={copyLink} className="h-8 px-2">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium"
                asChild
              >
                <Link to="/editor">
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit profile
                </Link>
              </Button>
              <Button variant="outline" className="glass border-glass-border" asChild>
                <a href={`/${profile.username}`} target="_blank" rel="noreferrer">
                  <Eye className="h-4 w-4 mr-1.5" />
                  Preview
                  <ExternalLink className="h-3 w-3 ml-1.5 opacity-60" />
                </a>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <StatCard icon={BarChart3} label="Profile views" value="0" hint="Last 7 days" />
            <StatCard icon={Sparkles} label="Block clicks" value="0" hint="Last 7 days" />
            <div className="glass rounded-3xl p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Coming soon</div>
              <div className="font-display text-base font-semibold mb-1">XION wallet</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Phase 2 plugs in Abstraxion social-login wallet and on-chain tip jar.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({
  icon: Icon, label, value, hint,
}: {
  icon: typeof BarChart3; label: string; value: string; hint: string;
}) => (
  <div className="glass rounded-3xl p-6">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="font-display text-3xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{hint}</div>
  </div>
);

export default Dashboard;
