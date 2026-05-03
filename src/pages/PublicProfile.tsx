import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Sparkles, ArrowLeft, BadgeCheck, ShieldCheck, QrCode, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import { themeFromJson, themeStyleVars } from "@/lib/theme";
import { trackEvent } from "@/lib/analytics";
import { PublicBadgesStrip } from "@/components/blocks/PublicBadgesBlock";
import type { Block } from "@/lib/blocks";

type PublicProfile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_published: boolean;
  theme: unknown;
  xion_address: string | null;
};

const hasTipJar = (blocks: Block[]) => blocks.some((block) => block.type === "tip_jar");

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "not_found">("loading");

  useEffect(() => {
    if (!username) return;

    let cancelled = false;
    setStatus("loading");

    (async () => {
      const { data: p, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, is_published, theme, xion_address")
        .eq("username", username)
        .maybeSingle();

      if (cancelled) return;

      if (profileError || !p || !p.username || !p.is_published) {
        setStatus("not_found");
        return;
      }

      setProfile(p as PublicProfile);

      const { data: b } = await supabase
        .from("blocks")
        .select("*")
        .eq("profile_id", p.id)
        .eq("is_visible", true)
        .order("position", { ascending: true });

      if (cancelled) return;

      setBlocks((b || []) as Block[]);
      setStatus("ready");

      trackEvent(p.id, "profile_view");

      document.title = `@${p.username} · XIONID`;
      const desc = p.bio || `${p.display_name || p.username}'s profile on XIONID`;

      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }

      metaDescription.setAttribute("content", desc.slice(0, 160));
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const theme = useMemo(() => themeFromJson(profile?.theme), [profile]);
  const styleVars = useMemo(() => themeStyleVars(theme), [theme]);
  const tipJarEnabled = useMemo(() => hasTipJar(blocks), [blocks]);

  // Filter out empty/placeholder blocks so demo profiles never expose stub copy
  // like "Your name", "@you", or empty link buttons.
  const visibleBlocks = useMemo(() => {
    const isPlaceholder = (b: Block): boolean => {
      const c = (b.config ?? {}) as Record<string, unknown>;
      const txt = String(c.text ?? c.title ?? c.name ?? "").trim().toLowerCase();
      const url = String(c.url ?? "").trim();
      if (b.type === "link" && (!url || url === "https://" || url === "http://")) return true;
      if (b.type === "text" || b.type === "heading") {
        if (!txt) return true;
        if (["your name", "your bio", "your title", "@you", "your username"].includes(txt)) return true;
      }
      if (b.type === "avatar") {
        if (txt === "your name" || txt === "@you") return true;
      }
      return false;
    };
    return blocks.filter((b) => !isPlaceholder(b));
  }, [blocks]);

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="glass rounded-2xl px-5 py-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading XIONID profile...</span>
        </div>
      </div>
    );
  }

  if (status === "not_found" || !profile) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center bg-background">
        <div className="glass-strong rounded-3xl p-10 max-w-md">
          <div className="text-6xl mb-4">👻</div>

          <h1 className="font-display text-2xl font-bold mb-2">Profile not found</h1>

          <p className="text-muted-foreground mb-6">
            <code className="font-mono">@{username}</code> doesn&apos;t exist on XIONID.
          </p>

          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        ...styleVars,
        background: "var(--theme-bg)",
        backgroundAttachment: "fixed",
        fontFamily: "var(--theme-font)",
      }}
    >
      <div className="aurora-orb h-[420px] w-[420px] -top-32 left-1/2 -translate-x-1/2 bg-primary opacity-20 animate-aurora-drift pointer-events-none" />
      <div
        className="aurora-orb h-[420px] w-[420px] bottom-0 right-0 bg-secondary opacity-20 animate-aurora-drift pointer-events-none"
        style={{ animationDelay: "-7s" }}
      />

      <main className="relative container max-w-md mx-auto px-5 py-8">
        <div className="mb-5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            XIONID
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
            <QrCode className="h-3.5 w-3.5 text-primary" />
            xionid.com/{profile.username}
          </div>
        </div>

        <header className="mb-5 overflow-hidden rounded-[2rem] border border-white/10 bg-background/45 p-5 text-center shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="mx-auto mb-4 w-fit">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                className="h-24 w-24 rounded-[2rem] object-cover ring-2 ring-white/15"
                style={{ boxShadow: `0 0 40px hsl(var(--theme-accent) / 0.4)` }}
              />
            ) : (
              <div
                className="grid h-24 w-24 place-items-center rounded-[2rem] text-3xl font-bold text-primary-foreground ring-2 ring-white/15"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))`,
                  boxShadow: `0 0 40px hsl(var(--theme-accent) / 0.4)`,
                }}
              >
                {(profile.display_name || profile.username).slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="mb-2 flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{profile.display_name || profile.username}</h1>

            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            </span>
          </div>

          <div className="text-sm text-muted-foreground">@{profile.username}</div>

          {profile.bio ? (
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-foreground/80">{profile.bio}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {profile.xion_address ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary"
                title="Identity verified on XION"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                Identity verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                XION profile
              </span>
            )}

            {tipJarEnabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[11px] font-medium text-secondary">
                <Heart className="h-3.5 w-3.5" />
                Creator support enabled
              </span>
            ) : null}
          </div>
        </header>

        <PublicBadgesStrip profileId={profile.id} />

        <section className="space-y-3">
          {visibleBlocks.length === 0 ? (
            <div className="glass rounded-2xl px-4 py-8 text-center text-sm text-muted-foreground">
              This profile hasn&apos;t added any public blocks yet.
            </div>
          ) : (
            visibleBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                theme={theme}
                ownerXionAddress={profile.xion_address}
                interactive
                onClick={() => trackEvent(profile.id, "block_click", block.id)}
              />
            ))
          )}
        </section>

        <footer className="mt-14 mb-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-background/30 px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles className="h-3 w-3 text-accent" />
            Made with{" "}
            <span className="font-semibold text-foreground">XION<span className="text-gradient-brand">ID</span></span>
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default PublicProfile;
