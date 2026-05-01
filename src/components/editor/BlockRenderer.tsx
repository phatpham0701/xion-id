import type { ComponentType, CSSProperties } from "react";
import {
  Calendar,
  Coins,
  Copy,
  ExternalLink,
  Gem,
  Github,
  Globe,
  Heart,
  Instagram,
  Mail,
  Music,
  Play,
  Send,
  Twitter,
  Wallet,
  Youtube,
  Zap,
} from "lucide-react";
import type { Block } from "@/lib/blocks";
import { getBlockMeta } from "@/lib/blocks";
import { LiveTipJarBlock } from "@/components/blocks/LiveTipJarBlock";
import type { ProfileTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type Props = {
  block: Block;
  theme: ProfileTheme;
  onClick?: () => void;
  ownerXionAddress?: string | null;
  /** When true, web3 blocks render their interactive (on-chain) variant. */
  interactive?: boolean;
};

type BlockStyle = {
  alignment: "left" | "center" | "right";
  width: "full" | "compact";
  padding: "compact" | "normal" | "spacious";
  backgroundStyle: "none" | "glass" | "solid" | "gradient";
  radius: "soft" | "rounded" | "pill" | "square";
  shadow: "none" | "soft" | "glow";
  accent: "default" | "primary" | "secondary";
};

const DEFAULT_BLOCK_STYLE: BlockStyle = {
  alignment: "center",
  width: "full",
  padding: "normal",
  backgroundStyle: "none",
  radius: "rounded",
  shadow: "none",
  accent: "default",
};

const SOCIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
  youtube: Youtube,
  website: Globe,
};

const getConfig = (block: Block) => (block.config || {}) as Record<string, unknown>;

const getString = (config: Record<string, unknown>, key: string, fallback = ""): string => {
  const value = config[key];
  return typeof value === "string" ? value : fallback;
};

const getBlockStyle = (config: Record<string, unknown>): BlockStyle => ({
  ...DEFAULT_BLOCK_STYLE,
  ...((config.__style || {}) as Partial<BlockStyle>),
});

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (parsed.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${parsed.pathname.slice(1)}`;
    }

    if (parsed.hostname.includes("spotify.com")) {
      return `https://open.spotify.com/embed${parsed.pathname}`;
    }

    if (parsed.hostname.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
    }
  } catch {
    return null;
  }

  return null;
};

const truncateMiddle = (value: string, head = 8, tail = 6) => {
  if (!value) return "";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
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

const buttonStyleProps = (style: ProfileTheme["buttonStyle"]): CSSProperties => {
  switch (style) {
    case "solid":
      return { background: "hsl(var(--theme-accent))" };
    case "outline":
      return {
        borderColor: "hsl(var(--theme-accent))",
        color: "hsl(var(--theme-accent-glow))",
      };
    case "gradient":
      return {
        background: "linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))",
      };
    default:
      return {};
  }
};

const alignmentClass = (alignment: BlockStyle["alignment"]) => {
  switch (alignment) {
    case "left":
      return "text-left items-start";
    case "right":
      return "text-right items-end";
    case "center":
    default:
      return "text-center items-center";
  }
};

const contentAlignmentClass = (alignment: BlockStyle["alignment"]) => {
  switch (alignment) {
    case "left":
      return "justify-start text-left";
    case "right":
      return "justify-end text-right";
    case "center":
    default:
      return "justify-center text-center";
  }
};

const paddingClass = (padding: BlockStyle["padding"]) => {
  switch (padding) {
    case "compact":
      return "p-3";
    case "spacious":
      return "p-5";
    case "normal":
    default:
      return "p-4";
  }
};

const radiusClass = (radius: BlockStyle["radius"]) => {
  switch (radius) {
    case "square":
      return "rounded-md";
    case "soft":
      return "rounded-xl";
    case "pill":
      return "rounded-[2rem]";
    case "rounded":
    default:
      return "rounded-2xl";
  }
};

const shadowClass = (shadow: BlockStyle["shadow"]) => {
  switch (shadow) {
    case "soft":
      return "shadow-lg shadow-black/10";
    case "glow":
      return "shadow-xl shadow-primary/20";
    case "none":
    default:
      return "";
  }
};

const backgroundClass = (backgroundStyle: BlockStyle["backgroundStyle"]) => {
  switch (backgroundStyle) {
    case "glass":
      return "glass border border-white/10";
    case "solid":
      return "border border-border/50 bg-background/80";
    case "gradient":
      return "border border-white/10 bg-gradient-to-br from-primary/25 via-background/60 to-secondary/25";
    case "none":
    default:
      return "";
  }
};

const accentClass = (accent: BlockStyle["accent"]) => {
  switch (accent) {
    case "primary":
      return "ring-1 ring-primary/25";
    case "secondary":
      return "ring-1 ring-secondary/25";
    case "default":
    default:
      return "";
  }
};

const StyledBlock = ({
  style,
  children,
  className,
}: {
  style: BlockStyle;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "w-full transition-all",
      style.width === "compact" && "mx-auto max-w-[86%]",
      alignmentClass(style.alignment),
      backgroundClass(style.backgroundStyle),
      paddingClass(style.padding),
      radiusClass(style.radius),
      shadowClass(style.shadow),
      accentClass(style.accent),
      className,
    )}
  >
    {children}
  </div>
);

const Placeholder = ({ label, style }: { label: string; style: BlockStyle }) => (
  <StyledBlock
    style={{ ...style, backgroundStyle: style.backgroundStyle === "none" ? "glass" : style.backgroundStyle }}
  >
    <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-muted-foreground">
      <div className="rounded-2xl border border-border/50 bg-background/40 px-4 py-2 text-xs">{label}</div>
    </div>
  </StyledBlock>
);

export const BlockRenderer = ({ block, theme, onClick, ownerXionAddress }: Props) => {
  const config = getConfig(block);
  const blockStyle = getBlockStyle(config);
  const radius = "var(--theme-radius)";

  const buttonBase = cn(
    "block w-full px-4 py-3.5 font-medium transition-all hover:scale-[1.02]",
    "focus:outline-none focus:ring-2 focus:ring-primary/50",
    buttonClasses(theme.buttonStyle),
    contentAlignmentClass(blockStyle.alignment),
  );

  switch (block.type) {
    case "link": {
      const title = getString(config, "title", "Untitled link");
      const url = getString(config, "url", "#");
      const emoji = getString(config, "emoji", "");

      return (
        <StyledBlock style={{ ...blockStyle, backgroundStyle: "none", padding: "compact" }}>
          <a
            href={url || "#"}
            target="_blank"
            rel="noreferrer"
            onClick={onClick}
            className={buttonBase}
            style={{
              ...buttonStyleProps(theme.buttonStyle),
              borderRadius: radius,
            }}
          >
            <span className="inline-flex items-center gap-2">
              {emoji ? <span>{emoji}</span> : null}
              <span>{title}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </span>
          </a>
        </StyledBlock>
      );
    }

    case "heading": {
      const text = getString(config, "text", "Heading");

      return (
        <StyledBlock style={blockStyle}>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">{text}</h2>
        </StyledBlock>
      );
    }

    case "text": {
      const text = getString(config, "text", "Tell people about yourself…");

      return (
        <StyledBlock style={blockStyle}>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{text}</p>
        </StyledBlock>
      );
    }

    case "avatar": {
      const name = getString(config, "name", "Your name");
      const subtitle = getString(config, "subtitle", "@handle");
      const initial = name.slice(0, 1).toUpperCase() || "X";

      return (
        <StyledBlock
          style={{
            ...blockStyle,
            backgroundStyle: blockStyle.backgroundStyle === "none" ? "glass" : blockStyle.backgroundStyle,
          }}
        >
          <div className={cn("flex flex-col gap-3", alignmentClass(blockStyle.alignment))}>
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center rounded-3xl border border-white/15 bg-gradient-to-br from-primary/70 to-secondary/70 text-2xl font-bold text-primary-foreground shadow-xl shadow-primary/20">
                {initial}
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full border border-background bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                XION
              </div>
            </div>

            <div>
              <div className="font-display text-xl font-bold text-foreground">{name}</div>
              {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
            </div>
          </div>
        </StyledBlock>
      );
    }

    case "social": {
      const items = (config as { items?: { platform: string; url: string }[] }).items || [];

      const activeItems = items.filter((item) => item.url);

      if (activeItems.length === 0) {
        return <Placeholder label="Add social links" style={blockStyle} />;
      }

      return (
        <StyledBlock style={{ ...blockStyle, backgroundStyle: "none" }}>
          <div className={cn("flex flex-wrap gap-2", contentAlignmentClass(blockStyle.alignment))}>
            {activeItems.map((item, index) => {
              const Icon = SOCIAL_ICONS[item.platform] || Globe;

              return (
                <a
                  key={`${item.platform}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClick}
                  className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-background/50 text-foreground shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              );
            })}
          </div>
        </StyledBlock>
      );
    }

    case "image": {
      const url = getString(config, "url");
      const alt = getString(config, "alt", "Image");

      return url ? (
        <StyledBlock
          style={{
            ...blockStyle,
            padding: "compact",
            backgroundStyle: blockStyle.backgroundStyle === "none" ? "none" : blockStyle.backgroundStyle,
          }}
        >
          <img src={url} alt={alt} className={cn("w-full object-cover", radiusClass(blockStyle.radius))} />
        </StyledBlock>
      ) : (
        <Placeholder label="Image placeholder" style={blockStyle} />
      );
    }

    case "video_embed": {
      const embed = getEmbedUrl(getString(config, "url"));

      return embed ? (
        <StyledBlock style={{ ...blockStyle, padding: "compact" }}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <iframe
              src={embed}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video embed"
            />
          </div>
        </StyledBlock>
      ) : (
        <Placeholder label="Video embed" style={blockStyle} />
      );
    }

    case "music_embed": {
      const embed = getEmbedUrl(getString(config, "url"));

      return embed ? (
        <StyledBlock style={{ ...blockStyle, padding: "compact" }}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <iframe
              src={embed}
              className="h-28 w-full"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Music embed"
            />
          </div>
        </StyledBlock>
      ) : (
        <Placeholder label="Music embed" style={blockStyle} />
      );
    }

    case "wallet": {
      const address = getString(config, "address") || ownerXionAddress || "";
      const label = getString(config, "label", "XION wallet");

      return (
        <StyledBlock
          style={{
            ...blockStyle,
            backgroundStyle: blockStyle.backgroundStyle === "none" ? "glass" : blockStyle.backgroundStyle,
          }}
        >
          <div className="flex items-start gap-3 text-left">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Wallet className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {label}
                {!getString(config, "address") && ownerXionAddress ? (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    Verified
                  </span>
                ) : null}
              </div>

              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                  {address ? truncateMiddle(address) : "Not connected"}
                </span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </StyledBlock>
      );
    }

    case "nft": {
      const title = getString(config, "title", "Featured NFT");
      const contract = getString(config, "contract", "No contract");
      const tokenId = getString(config, "tokenId", "");

      return (
        <StyledBlock
          style={{
            ...blockStyle,
            backgroundStyle: blockStyle.backgroundStyle === "none" ? "glass" : blockStyle.backgroundStyle,
          }}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary/15 text-secondary">
              <Gem className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{title}</div>
              <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {truncateMiddle(contract)}
                {tokenId ? ` · #${tokenId}` : ""}
              </div>
            </div>
          </div>
        </StyledBlock>
      );
    }

    case "token_balance": {
      const label = getString(config, "label", "Token balance");
      const token = getString(config, "token", "XION");

      return (
        <StyledBlock
          style={{
            ...blockStyle,
            backgroundStyle: blockStyle.backgroundStyle === "none" ? "glass" : blockStyle.backgroundStyle,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground">Live balance coming soon</div>
              </div>
            </div>
            <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {token}
            </div>
          </div>
        </StyledBlock>
      );
    }

    case "tip_jar": {
      const title = getString(config, "title", "Support this creator");
      const currency = getString(config, "currency", "XION");
      const cta = getString(config, "cta", "Tip on XION");
      const description =
        getString(config, "description") ||
        "Scan, choose an amount, and support this creator through a XION-powered flow.";

      return (
        <StyledBlock
          style={{
            ...blockStyle,
            backgroundStyle: blockStyle.backgroundStyle === "none" ? "gradient" : blockStyle.backgroundStyle,
            padding: "spacious",
            shadow: blockStyle.shadow === "none" ? "glow" : blockStyle.shadow,
          }}
        >
          <div className="space-y-4">
            <div
              className={cn(
                "flex items-start gap-3",
                blockStyle.alignment === "center" && "justify-center text-center",
              )}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/20 text-primary">
                <Heart className="h-5 w-5" />
              </div>

              <div className={cn("min-w-0", blockStyle.alignment === "center" ? "text-center" : "text-left")}>
                <div className="text-base font-bold text-foreground">{title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["0.1", "0.5", "1"].map((amount) => (
                <div
                  key={amount}
                  className="rounded-2xl border border-white/10 bg-background/45 px-3 py-2 text-center text-xs font-semibold text-foreground backdrop-blur"
                >
                  {amount} {currency}
                </div>
              ))}
            </div>

            <div
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
              style={{
                background: "linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))",
              }}
            >
              <Zap className="h-4 w-4" />
              {cta}
            </div>

            <div className="rounded-full border border-primary/30 bg-background/40 px-3 py-1.5 text-center text-[11px] text-muted-foreground">
              XION testnet tip integration in progress
            </div>
          </div>
        </StyledBlock>
      );
    }

    case "contact_form": {
      const title = getString(config, "title", "Get in touch");

      return (
        <StyledBlock
          style={{
            ...blockStyle,
            backgroundStyle: blockStyle.backgroundStyle === "none" ? "glass" : blockStyle.backgroundStyle,
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold">{title}</div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-background/40 p-3 text-left text-xs text-muted-foreground">
              Message form preview
            </div>
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              <Send className="h-4 w-4" />
              Send
            </div>
          </div>
        </StyledBlock>
      );
    }

    case "calendar": {
      const title = getString(config, "title", "Book a call");
      const url = getString(config, "url", "#");

      return (
        <StyledBlock style={{ ...blockStyle, backgroundStyle: "none", padding: "compact" }}>
          <a
            href={url || "#"}
            target="_blank"
            rel="noreferrer"
            onClick={onClick}
            className={buttonBase}
            style={{
              ...buttonStyleProps(theme.buttonStyle),
              borderRadius: radius,
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {title}
            </span>
          </a>
        </StyledBlock>
      );
    }

    default: {
      const meta = getBlockMeta(block.type);
      return <Placeholder label={meta?.label || "Unsupported block"} style={blockStyle} />;
    }
  }
};
