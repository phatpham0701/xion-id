import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import { themeFromJson, themeStyleVars } from "@/lib/theme";
import { trackEvent } from "@/lib/analytics";
import type { Block } from "@/lib/blocks";

type PublicProfile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_published: boolean;
  theme: unknown;
};

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "not_found">("loading");

  useEffect(() => {
    if (!username) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, is_published, theme")
        .eq("username", username)
        .maybeSingle();

      if (!p || !p.username) { setStatus("not_found"); return; }
      setProfile(p as PublicProfile);

      const { data: b } = await supabase
        .from("blocks")
        .select("*")
        .eq("profile_id", p.id)
        .eq("is_visible", true)
        .order("position", { ascending: true });
      setBlocks((b || []) as Block[]);
      setStatus("ready");

      // Fire-and-forget analytics view event
      trackEvent(p.id, "profile_view");

      // SEO
      document.title = `@${p.username} · XionID`;
      const desc = p.bio || `${p.display_name || p.username}'s profile on XionID`;
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
      }
      m.setAttribute("content", desc.slice(0, 160));
    })();
  }, [username]);

  const theme = useMemo(() => themeFromJson(profile?.theme), [profile]);
  const styleVars = useMemo(() => themeStyleVars(theme), [theme]);

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "not_found" || !profile) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div className="glass-strong rounded-3xl p-10 max-w-md">
          <div className="text-6xl mb-4">👻</div>
          <h1 className="font-display text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground mb-6">
            <code className="font-mono">@{username}</code> doesn't exist on XionID.
          </p>
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
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        ...styleVars,
        background: "var(--theme-bg)",
        backgroundAttachment: "fixed",
        fontFamily: "var(--theme-font)",
      }}
    >
      <main className="container max-w-md mx-auto px-5 py-12">
        {/* Header */}
        <header className="text-center mb-8">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="mx-auto h-24 w-24 rounded-full object-cover mb-4 ring-2"
              style={{ boxShadow: `0 0 40px hsl(var(--theme-accent) / 0.4)` }}
            />
          ) : (
            <div
              className="mx-auto h-24 w-24 rounded-full grid place-items-center text-primary-foreground text-3xl font-bold mb-4"
              style={{
                background: `linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))`,
                boxShadow: `0 0 40px hsl(var(--theme-accent) / 0.4)`,
              }}
            >
              {(profile.display_name || profile.username).slice(0, 1).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.display_name || profile.username}
          </h1>
          <div className="text-sm text-muted-foreground">@{profile.username}</div>
          {profile.bio && (
            <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{profile.bio}</p>
          )}
        </header>

        {/* Blocks */}
        <div className="space-y-3">
          {blocks.length === 0 ? (
            <div className="glass rounded-2xl px-4 py-8 text-center text-sm text-muted-foreground">
              This profile hasn't added any blocks yet.
            </div>
          ) : (
            blocks.map((b) => (
              <BlockRenderer
                key={b.id}
                block={b}
                theme={theme}
                onClick={() => trackEvent(profile.id, "block_click", b.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            Made with <span className="font-semibold">Xion<span className="text-gradient">ID</span></span>
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default PublicProfile;
