/**
 * XIONID Studio — Section Presets
 *
 * A "section" is a curated group of one or more existing blocks. Presets
 * are added to the canvas as a small kit, so we avoid changing the
 * database `block_type` enum.
 *
 * Naming is product-safe (no Web3 vocabulary).
 */

import { Award, BadgeCheck, Calendar, Gift, Heart, Image as ImageIcon, Megaphone, QrCode, Sparkles, Activity, User, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BlockType, BlockConfig } from "./blocks";

export type SectionPresetBlock = {
  type: BlockType;
  config: BlockConfig;
  is_visible?: boolean;
};

export type SectionPreset = {
  key:
    | "profile_hero"
    | "badge_wall"
    | "reward_preview"
    | "campaign_card"
    | "qr_card"
    | "support_module"
    | "offer_box"
    | "activity_timeline"
    | "public_id_card";
  label: string;
  description: string;
  icon: LucideIcon;
  /** Tags help us recommend in Standard vs Advanced mode. */
  audience: ("standard" | "advanced")[];
  blocks: SectionPresetBlock[];
};

const QR_PLACEHOLDER =
  "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fxionid.com%2Fyou";

export const SECTION_PRESETS: SectionPreset[] = [
  {
    key: "profile_hero",
    label: "Profile Hero",
    description: "Your photo, name and intro line — the start of every page.",
    icon: User,
    audience: ["standard", "advanced"],
    blocks: [
      { type: "avatar", config: { name: "Your name", subtitle: "@you" } },
      { type: "text",   config: { text: "A short intro line about who you are." } },
    ],
  },
  {
    key: "public_id_card",
    label: "Public ID Card",
    description: "A clean identity card with your handle and primary CTA.",
    icon: BadgeCheck,
    audience: ["standard", "advanced"],
    blocks: [
      { type: "avatar", config: { name: "Your name", subtitle: "@you" } },
      { type: "link",   config: { title: "Visit my page", url: "https://", emoji: "🔗" } },
    ],
  },
  {
    key: "badge_wall",
    label: "Badge Wall",
    description: "Featured proof and badges you've collected.",
    icon: Award,
    audience: ["standard", "advanced"],
    blocks: [
      { type: "heading", config: { text: "My badges" } },
      { type: "image",   config: { url: "https://images.unsplash.com/photo-1521120098171-ddc1d3a3a4f7?w=900", alt: "Badge wall" } },
      { type: "text",    config: { text: "Verified for Explorer · Collector · OG 2024." } },
    ],
  },
  {
    key: "reward_preview",
    label: "Reward Preview",
    description: "A short list of rewards and perks you've claimed.",
    icon: Sparkles,
    audience: ["standard", "advanced"],
    blocks: [
      { type: "heading", config: { text: "My rewards" } },
      { type: "link",    config: { title: "Early supporter sticker pack", url: "https://", emoji: "🎁" } },
      { type: "link",    config: { title: "Backstage AMA invite",         url: "https://", emoji: "🎟️" } },
      { type: "link",    config: { title: "Signed digital print",         url: "https://", emoji: "🖼️" } },
    ],
  },
  {
    key: "offer_box",
    label: "Offer Box",
    description: "Highlight one offer or perk for your audience.",
    icon: Gift,
    audience: ["standard", "advanced"],
    blocks: [
      { type: "heading", config: { text: "Today's offer" } },
      { type: "text",    config: { text: "20% off any drink at Nimbus Coffee. Show this page in store." } },
      { type: "link",    config: { title: "Claim offer", url: "https://", emoji: "✨" } },
    ],
  },
  {
    key: "qr_card",
    label: "QR Card",
    description: "A scannable code for in-person check-ins or sharing.",
    icon: QrCode,
    audience: ["standard", "advanced"],
    blocks: [
      { type: "heading", config: { text: "Scan to connect" } },
      { type: "image",   config: { url: QR_PLACEHOLDER, alt: "Scan code" } },
    ],
  },
  {
    key: "campaign_card",
    label: "Campaign Card",
    description: "A focused card to launch and track a campaign.",
    icon: Megaphone,
    audience: ["advanced"],
    blocks: [
      { type: "heading", config: { text: "Spring identity drop" } },
      { type: "text",    config: { text: "Join 1,200+ supporters. Ends in 14 days." } },
      { type: "link",    config: { title: "Join campaign", url: "https://", emoji: "📣" } },
    ],
  },
  {
    key: "support_module",
    label: "Support Module",
    description: "Let your audience send quick support to back your work.",
    icon: Heart,
    audience: ["standard", "advanced"],
    blocks: [
      { type: "tip_jar", config: {
        title: "Support my work",
        currency: "XION",
        cta: "Send support",
        description: "Every contribution helps me keep building.",
        suggestedAmounts: [1, 5, 10],
        allowCustom: true,
        allowMessage: true,
      } },
    ],
  },
  {
    key: "activity_timeline",
    label: "Activity Timeline",
    description: "Recent activity, events, and milestones.",
    icon: Activity,
    audience: ["advanced"],
    blocks: [
      { type: "heading", config: { text: "Recent activity" } },
      { type: "text",    config: { text: "🏅 Earned Explorer badge — 2 days ago\n🎁 Unlocked offer at Nimbus — 4 days ago\n☕ Checked in at partner café — last week" } },
    ],
  },
];

export const SECTION_PRESET_GROUPS: { label: string; icon: LucideIcon; keys: SectionPreset["key"][] }[] = [
  { label: "Identity", icon: User,    keys: ["profile_hero", "public_id_card"] },
  { label: "Proof",    icon: Award,   keys: ["badge_wall"] },
  { label: "Rewards",  icon: Gift,    keys: ["reward_preview", "offer_box"] },
  { label: "Engage",   icon: Heart,   keys: ["support_module", "campaign_card", "activity_timeline"] },
  { label: "Share",    icon: Layers,  keys: ["qr_card"] },
];

export const getSectionPreset = (key: SectionPreset["key"]) =>
  SECTION_PRESETS.find((p) => p.key === key)!;

// Re-export icons commonly needed by callers.
export { Calendar, ImageIcon };
