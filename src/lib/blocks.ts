import {
  Link as LinkIcon, Type, Heading1, Image as ImageIcon, Music, Video,
  AtSign, Wallet, Gem, Coins, Heart, Mail, Calendar, User,
} from "lucide-react";

export type BlockType =
  | "link" | "heading" | "text" | "avatar" | "social"
  | "wallet" | "nft" | "token_balance"
  | "image" | "video_embed" | "music_embed"
  | "tip_jar" | "contact_form" | "calendar";

export type BlockConfig = Record<string, unknown>;

export type Block = {
  id: string;
  profile_id: string;
  type: BlockType;
  position: number;
  config: BlockConfig;
  is_visible: boolean;
};

export type BlockMeta = {
  type: BlockType;
  label: string;
  description: string;
  icon: typeof LinkIcon;
  category: "basic" | "media" | "web3" | "advanced";
  defaultConfig: BlockConfig;
};

export const BLOCK_LIBRARY: BlockMeta[] = [
  // Basic
  { type: "link", label: "Link", description: "A clickable button link", icon: LinkIcon, category: "basic",
    defaultConfig: { title: "My link", url: "https://", emoji: "🔗" } },
  { type: "heading", label: "Heading", description: "Section title", icon: Heading1, category: "basic",
    defaultConfig: { text: "Section title" } },
  { type: "text", label: "Text", description: "Paragraph text", icon: Type, category: "basic",
    defaultConfig: { text: "Tell people about yourself…" } },
  { type: "avatar", label: "Avatar", description: "Profile photo + name", icon: User, category: "basic",
    defaultConfig: { name: "Your name", subtitle: "@handle" } },
  { type: "social", label: "Social icons", description: "Row of social links", icon: AtSign, category: "basic",
    defaultConfig: { items: [{ platform: "twitter", url: "" }, { platform: "github", url: "" }] } },

  // Media
  { type: "image", label: "Image", description: "Display an image", icon: ImageIcon, category: "media",
    defaultConfig: { url: "", alt: "" } },
  { type: "video_embed", label: "Video", description: "YouTube / Vimeo embed", icon: Video, category: "media",
    defaultConfig: { url: "" } },
  { type: "music_embed", label: "Music", description: "Spotify / SoundCloud", icon: Music, category: "media",
    defaultConfig: { url: "" } },

  // Web3
  { type: "wallet", label: "Wallet address", description: "Show XION address", icon: Wallet, category: "web3",
    defaultConfig: { address: "xion1...", label: "My XION wallet" } },
  { type: "nft", label: "NFT showcase", description: "Featured NFT", icon: Gem, category: "web3",
    defaultConfig: { contract: "", tokenId: "", title: "Featured NFT" } },
  { type: "token_balance", label: "Token balance", description: "Display token holding", icon: Coins, category: "web3",
    defaultConfig: { token: "XION", label: "XION balance" } },

  // Advanced
  { type: "tip_jar", label: "Tip jar", description: "Receive tips on-chain", icon: Heart, category: "advanced",
    defaultConfig: { title: "Buy me a coffee", currency: "XION" } },
  { type: "contact_form", label: "Contact form", description: "Email contact form", icon: Mail, category: "advanced",
    defaultConfig: { title: "Get in touch" } },
  { type: "calendar", label: "Calendar", description: "Booking link", icon: Calendar, category: "advanced",
    defaultConfig: { title: "Book a call", url: "" } },
];

export const getBlockMeta = (type: BlockType) =>
  BLOCK_LIBRARY.find((b) => b.type === type)!;

export const CATEGORY_LABELS: Record<BlockMeta["category"], string> = {
  basic: "Basic",
  media: "Media",
  web3: "Web3",
  advanced: "Advanced",
};
