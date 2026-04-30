import type { Block } from "@/lib/blocks";
import { getBlockMeta } from "@/lib/blocks";
import type { ProfileTheme } from "@/lib/theme";
import { Twitter, Github, Instagram, Youtube, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

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
    if (u.hostname.includes("spotify.com")) return `https://open.spotify.com/embed${u.pathname}`;
    if (u.hostname.includes("soundcloud.com"))
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
  } catch { return null; }
  return null;
};

const buttonClasses = (style: ProfileTheme["buttonStyle"]) => {
  switch (style) {
    case "solid":
      return "text-primary-foreground";
    case "outline":
      return "border-2 bg-transparent";
    case "gradient":
      return "text-primary-foreground";
    case "glass":
    default:
      return "glass";
  }
};

const buttonStyleProps = (style: ProfileTheme["buttonStyle"]): React.CSSProperties => {
  switch (style) {
    case "solid":
      return { background: `hsl(var(--theme-accent))` };
    case "outline":
      return { borderColor: `hsl(var(--theme-accent))`, color: `hsl(var(--theme-accent-glow))` };
    case "gradient":
      return {
        background: `linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))`,
      };
    default:
      return {};
  }
};

type Props = { block: Block; theme: ProfileTheme; onClick?: () => void; ownerXionAddress?: string | null };

export const BlockRenderer = ({ block, theme, onClick, ownerXionAddress }: Props) => {
  const c = block.config as Record<string, string>;
  const radius = `var(--theme-radius)`;
  const btnCls = cn(
    "block w-full px-4 py-3.5 text-center font-medium transition-all hover:scale-[1.02]",
    buttonClasses(theme.buttonStyle),
  );

  switch (block.type) {
    case "link":
      return (
        <a
          href={c.url || "#"}
          target="_blank"
          rel="noreferrer"
          onClick={onClick}
          className={btnCls}
          style={{ ...buttonStyleProps(theme.buttonStyle), borderRadius: radius }}
        >
          <span className="mr-2">{c.emoji || "🔗"}</span>
          {c.title || "Untitled link"}
        </a>
      );
    case "heading":
      return <h2 className="text-2xl font-bold mt-4 mb-1" style={{ fontFamily: "var(--theme-font)" }}>{c.text || "Heading"}</h2>;
    case "text":
      return <p className="text-sm text-foreground/80 leading-relaxed">{c.text}</p>;
    case "avatar":
      return (
        <div className="text-center py-2">
          <div
            className="mx-auto h-20 w-20 rounded-full grid place-items-center text-primary-foreground text-2xl font-bold mb-3"
            style={{
              background: `linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))`,
              boxShadow: `0 0 40px hsl(var(--theme-accent) / 0.4)`,
              fontFamily: "var(--theme-font)",
            }}
          >
            {(c.name || "X").slice(0, 1).toUpperCase()}
          </div>
          <div className="font-semibold" style={{ fontFamily: "var(--theme-font)" }}>{c.name || "Your name"}</div>
          <div className="text-xs text-muted-foreground">{c.subtitle}</div>
        </div>
      );
    case "social": {
      const items = (block.config as { items?: { platform: string; url: string }[] }).items || [];
      return (
        <div className="flex justify-center gap-3 py-2">
          {items.filter((it) => it.url).map((it, i) => {
            const Icon = SOCIAL_ICONS[it.platform] || Globe;
            return (
              <a
                key={i}
                href={it.url}
                target="_blank"
                rel="noreferrer"
                onClick={onClick}
                className="glass h-11 w-11 grid place-items-center hover:scale-110 transition-all"
                style={{ borderRadius: radius }}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      );
    }
    case "image":
      return c.url
        ? <img src={c.url} alt={c.alt || ""} className="w-full object-cover" style={{ borderRadius: radius }} />
        : <Placeholder label="Image" radius={radius} />;
    case "video_embed": {
      const embed = getEmbedUrl(c.url);
      return embed
        ? <div className="aspect-video overflow-hidden glass" style={{ borderRadius: radius }}>
            <iframe src={embed} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        : <Placeholder label="Paste a YouTube or Vimeo URL" radius={radius} />;
    }
    case "music_embed": {
      const embed = getEmbedUrl(c.url);
      return embed
        ? <iframe src={embed} className="w-full h-20 glass" style={{ borderRadius: radius }} allow="encrypted-media" />
        : <Placeholder label="Paste a Spotify or SoundCloud URL" radius={radius} />;
    }
    case "wallet": {
      const addr = c.address || ownerXionAddress || "";
      return (
        <div className="glass p-4" style={{ borderRadius: radius }}>
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <span>{c.label || "Wallet"}</span>
            {!c.address && ownerXionAddress && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">verified</span>
            )}
          </div>
          <div className="font-mono text-sm truncate">{addr || "Not connected"}</div>
        </div>
      );
    }
    case "nft":
      return (
        <div className="glass p-4 text-center" style={{ borderRadius: radius }}>
          <div
            className="aspect-square mb-3 grid place-items-center text-4xl"
            style={{
              borderRadius: radius,
              background: `linear-gradient(135deg, hsl(var(--theme-accent) / 0.3), hsl(var(--theme-accent-glow) / 0.2))`,
            }}
          >🎨</div>
          <div className="font-semibold text-sm" style={{ fontFamily: "var(--theme-font)" }}>{c.title}</div>
          <div className="text-xs text-muted-foreground font-mono truncate">{c.contract || "no contract"}</div>
        </div>
      );
    case "token_balance":
      return (
        <div className="glass p-4 flex items-center justify-between" style={{ borderRadius: radius }}>
          <div className="text-sm text-muted-foreground">{c.label}</div>
          <div className="font-bold" style={{ fontFamily: "var(--theme-font)" }}>— {c.token}</div>
        </div>
      );
    case "tip_jar":
      return (
        <button
          onClick={onClick}
          className={cn(btnCls, "text-primary-foreground")}
          style={{
            background: `linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))`,
            borderRadius: radius,
            boxShadow: `0 0 30px hsl(var(--theme-accent) / 0.35)`,
          }}
        >
          ❤️ {c.title || "Tip"} ({c.currency || "XION"})
        </button>
      );
    case "contact_form":
      return (
        <div className="glass p-4 space-y-2" style={{ borderRadius: radius }}>
          <div className="font-semibold text-sm" style={{ fontFamily: "var(--theme-font)" }}>{c.title}</div>
          <input placeholder="Your email" className="w-full h-9 px-3 bg-input/40 text-sm outline-none" style={{ borderRadius: radius }} />
          <textarea placeholder="Message" rows={3} className="w-full px-3 py-2 bg-input/40 text-sm outline-none" style={{ borderRadius: radius }} />
          <button
            className="w-full h-9 text-primary-foreground text-sm font-medium"
            style={{
              background: `linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))`,
              borderRadius: radius,
            }}
          >Send</button>
        </div>
      );
    case "calendar":
      return (
        <a
          href={c.url || "#"}
          target="_blank"
          rel="noreferrer"
          onClick={onClick}
          className={btnCls}
          style={{ ...buttonStyleProps(theme.buttonStyle), borderRadius: radius }}
        >
          📅 {c.title}
        </a>
      );
    default: {
      const meta = getBlockMeta(block.type);
      return <Placeholder label={meta.label} radius={radius} />;
    }
  }
};

const Placeholder = ({ label, radius }: { label: string; radius: string }) => (
  <div className="glass px-4 py-6 text-center text-sm text-muted-foreground" style={{ borderRadius: radius }}>
    {label}
  </div>
);
