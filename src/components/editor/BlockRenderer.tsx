import type { Block } from "@/lib/blocks";
import { getBlockMeta } from "@/lib/blocks";
import { Twitter, Github, Instagram, Youtube, Globe } from "lucide-react";

const SOCIAL_ICONS: Record<string, typeof Twitter> = {
  twitter: Twitter, github: Github, instagram: Instagram, youtube: Youtube, website: Globe,
};

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${u.pathname.slice(1)}`;
    if (u.hostname.includes("spotify.com"))
      return `https://open.spotify.com/embed${u.pathname}`;
    if (u.hostname.includes("soundcloud.com"))
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
  } catch { return null; }
  return null;
};

export const BlockRenderer = ({ block }: { block: Block }) => {
  const c = block.config as Record<string, string>;

  switch (block.type) {
    case "link":
      return (
        <a
          href={c.url || "#"}
          target="_blank"
          rel="noreferrer"
          className="block w-full glass rounded-2xl px-4 py-3.5 text-center font-medium hover:scale-[1.02] hover:border-primary/50 transition-all"
        >
          <span className="mr-2">{c.emoji || "🔗"}</span>
          {c.title || "Untitled link"}
        </a>
      );
    case "heading":
      return <h2 className="font-display text-2xl font-bold mt-4 mb-1">{c.text || "Heading"}</h2>;
    case "text":
      return <p className="text-sm text-foreground/80 leading-relaxed">{c.text}</p>;
    case "avatar":
      return (
        <div className="text-center py-2">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-display text-2xl font-bold mb-3 shadow-glow-primary">
            {(c.name || "X").slice(0, 1).toUpperCase()}
          </div>
          <div className="font-display font-semibold">{c.name || "Your name"}</div>
          <div className="text-xs text-muted-foreground">{c.subtitle}</div>
        </div>
      );
    case "social": {
      const items = (block.config as { items?: { platform: string; url: string }[] }).items || [];
      return (
        <div className="flex justify-center gap-3 py-2">
          {items.map((it, i) => {
            const Icon = SOCIAL_ICONS[it.platform] || Globe;
            return (
              <a key={i} href={it.url || "#"} target="_blank" rel="noreferrer"
                 className="glass h-11 w-11 rounded-full grid place-items-center hover:border-primary/50 hover:scale-110 transition-all">
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      );
    }
    case "image":
      return c.url
        ? <img src={c.url} alt={c.alt || ""} className="w-full rounded-2xl object-cover" />
        : <Placeholder label="Image" />;
    case "video_embed": {
      const embed = getEmbedUrl(c.url);
      return embed
        ? <div className="aspect-video rounded-2xl overflow-hidden glass">
            <iframe src={embed} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        : <Placeholder label="Paste a YouTube or Vimeo URL" />;
    }
    case "music_embed": {
      const embed = getEmbedUrl(c.url);
      return embed
        ? <iframe src={embed} className="w-full h-20 rounded-2xl glass" allow="encrypted-media" />
        : <Placeholder label="Paste a Spotify or SoundCloud URL" />;
    }
    case "wallet":
      return (
        <div className="glass rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{c.label || "Wallet"}</div>
          <div className="font-mono text-sm truncate">{c.address}</div>
        </div>
      );
    case "nft":
      return (
        <div className="glass rounded-2xl p-4 text-center">
          <div className="aspect-square rounded-xl bg-gradient-aurora mb-3 grid place-items-center text-4xl">🎨</div>
          <div className="font-display font-semibold text-sm">{c.title}</div>
          <div className="text-xs text-muted-foreground font-mono truncate">{c.contract || "no contract"}</div>
        </div>
      );
    case "token_balance":
      return (
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{c.label}</div>
          <div className="font-display font-bold">— {c.token}</div>
        </div>
      );
    case "tip_jar":
      return (
        <button className="w-full bg-gradient-primary text-primary-foreground rounded-2xl px-4 py-3.5 font-medium shadow-glow-primary glow-primary">
          ❤️ {c.title || "Tip"} ({c.currency || "XION"})
        </button>
      );
    case "contact_form":
      return (
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="font-display font-semibold text-sm">{c.title}</div>
          <div className="h-9 rounded-lg bg-input/40" />
          <div className="h-20 rounded-lg bg-input/40" />
          <div className="h-9 rounded-lg bg-gradient-primary opacity-70" />
        </div>
      );
    case "calendar":
      return (
        <a href={c.url || "#"} target="_blank" rel="noreferrer"
           className="block w-full glass rounded-2xl px-4 py-3.5 text-center font-medium hover:border-primary/50 transition-all">
          📅 {c.title}
        </a>
      );
    default: {
      const meta = getBlockMeta(block.type);
      return <Placeholder label={meta.label} />;
    }
  }
};

const Placeholder = ({ label }: { label: string }) => (
  <div className="glass rounded-2xl px-4 py-6 text-center text-sm text-muted-foreground">
    {label}
  </div>
);
