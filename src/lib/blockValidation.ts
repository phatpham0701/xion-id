import type { BlockType, BlockConfig } from "./blocks";

export type ValidationIssue = {
  field: string;
  message: string;
  /** "error" = blocks usefulness, "warning" = will work but suboptimal. */
  severity: "error" | "warning";
};

const isUrl = (v: unknown): boolean => {
  if (typeof v !== "string" || !v.trim()) return false;
  try { new URL(v); return true; } catch { return false; }
};

const isHostMatch = (v: unknown, hosts: string[]): boolean => {
  if (typeof v !== "string") return false;
  try { return hosts.some((h) => new URL(v).hostname.includes(h)); } catch { return false; }
};

const nonEmpty = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0;

const isXionAddress = (v: unknown): boolean =>
  typeof v === "string" && /^xion1[a-z0-9]{20,}$/i.test(v.trim());

/**
 * Validate a block config and return a list of issues.
 * Used by the library hover preview AND by the editor inspector
 * so users see what's missing before/after adding.
 */
export const validateBlockConfig = (
  type: BlockType,
  config: BlockConfig,
): ValidationIssue[] => {
  const c = config as Record<string, unknown>;
  const issues: ValidationIssue[] = [];

  switch (type) {
    case "link":
      if (!nonEmpty(c.title)) issues.push({ field: "title", message: "Add a clear button title", severity: "warning" });
      if (!isUrl(c.url))      issues.push({ field: "url", message: "URL is missing or invalid", severity: "error" });
      break;

    case "social": {
      const items = (c.items as { platform: string; url: string }[]) || [];
      if (items.length === 0) {
        issues.push({ field: "items", message: "Add at least one social link", severity: "error" });
        break;
      }
      const empties = items.filter((it) => !isUrl(it.url));
      if (empties.length === items.length) {
        issues.push({ field: "items", message: "All social URLs are empty", severity: "error" });
      } else if (empties.length > 0) {
        issues.push({ field: "items", message: `${empties.length} social URL${empties.length > 1 ? "s are" : " is"} empty`, severity: "warning" });
      }
      break;
    }

    case "heading":
      if (!nonEmpty(c.text)) issues.push({ field: "text", message: "Heading text is empty", severity: "error" });
      break;

    case "text":
      if (!nonEmpty(c.text)) issues.push({ field: "text", message: "Paragraph text is empty", severity: "error" });
      break;

    case "avatar":
      if (!nonEmpty(c.name))     issues.push({ field: "name", message: "Add your name", severity: "warning" });
      if (!nonEmpty(c.subtitle)) issues.push({ field: "subtitle", message: "A short tagline boosts engagement", severity: "warning" });
      break;

    case "image":
      if (!isUrl(c.url))    issues.push({ field: "url", message: "Image URL is missing or invalid", severity: "error" });
      if (!nonEmpty(c.alt)) issues.push({ field: "alt", message: "Add alt text for accessibility & SEO", severity: "warning" });
      break;

    case "video_embed":
      if (!isUrl(c.url)) {
        issues.push({ field: "url", message: "Video URL is missing or invalid", severity: "error" });
      } else if (!isHostMatch(c.url, ["youtube.com", "youtu.be", "vimeo.com"])) {
        issues.push({ field: "url", message: "Only YouTube and Vimeo URLs are supported", severity: "error" });
      }
      break;

    case "music_embed":
      if (!isUrl(c.url)) {
        issues.push({ field: "url", message: "Music URL is missing or invalid", severity: "error" });
      } else if (!isHostMatch(c.url, ["spotify.com", "soundcloud.com"])) {
        issues.push({ field: "url", message: "Only Spotify and SoundCloud URLs are supported", severity: "error" });
      }
      break;

    case "wallet":
      if (!nonEmpty(c.address)) {
        issues.push({ field: "address", message: "Wallet address is required", severity: "error" });
      } else if (!isXionAddress(c.address)) {
        issues.push({ field: "address", message: "Doesn't look like a XION address (xion1…)", severity: "warning" });
      }
      if (!nonEmpty(c.label)) issues.push({ field: "label", message: "Label helps visitors understand the wallet", severity: "warning" });
      break;

    case "nft":
      if (!nonEmpty(c.contract)) issues.push({ field: "contract", message: "Contract address is required", severity: "error" });
      if (!nonEmpty(c.tokenId))  issues.push({ field: "tokenId", message: "Token ID is required", severity: "error" });
      if (!nonEmpty(c.title))    issues.push({ field: "title", message: "Add a title for the NFT", severity: "warning" });
      break;

    case "token_balance":
      if (!nonEmpty(c.token)) issues.push({ field: "token", message: "Token symbol is required", severity: "error" });
      if (!nonEmpty(c.label)) issues.push({ field: "label", message: "Label clarifies what's being shown", severity: "warning" });
      break;

    case "tip_jar":
      if (!nonEmpty(c.title))    issues.push({ field: "title", message: "Add a title (e.g. “Buy me a coffee”)", severity: "warning" });
      if (!nonEmpty(c.currency)) issues.push({ field: "currency", message: "Currency is required", severity: "error" });
      break;

    case "calendar":
      if (!nonEmpty(c.title)) issues.push({ field: "title", message: "Add a clear CTA title", severity: "warning" });
      if (!isUrl(c.url))      issues.push({ field: "url", message: "Booking URL is missing or invalid", severity: "error" });
      break;

    case "contact_form":
      if (!nonEmpty(c.title)) issues.push({ field: "title", message: "Add a form title", severity: "warning" });
      break;
  }

  return issues;
};

export const summarizeIssues = (issues: ValidationIssue[]) => {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  return { errors, warnings, total: issues.length };
};
