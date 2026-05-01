import {
  Link as LinkIcon, Type, Heading1, Image as ImageIcon, Music, Video,
  AtSign, Wallet, Gem, Coins, Heart, Mail, Calendar, User, LayoutGrid,
} from "lucide-react";

export type BlockType =
  | "link" | "heading" | "text" | "avatar" | "social"
  | "wallet" | "nft" | "nft_gallery" | "token_balance"
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
  /** Short, action-oriented one-liner shown in the library card. */
  description: string;
  /** Specific scenario — answers "when should I use this?". */
  useCase: string;
  /** Concrete tip shown inside the hover preview to drive good content. */
  tip?: string;
  /** Optional badge: "Popular", "New", "Pro tip". */
  badge?: "Popular" | "Essential" | "Web3" | "Pro";
  icon: typeof LinkIcon;
  category: "basic" | "media" | "web3" | "advanced";
  /** Used when the block is added to a profile. */
  defaultConfig: BlockConfig;
  /** Realistic content used purely for the hover preview render. */
  previewConfig: BlockConfig;
};

export const BLOCK_LIBRARY: BlockMeta[] = [
  // ─────────── BASIC ───────────
  {
    type: "avatar",
    label: "Profile header",
    description: "Your photo, name, and tagline at the top.",
    useCase: "Always start here — gives visitors instant context about who you are.",
    tip: "Pair with one Text block underneath for a richer intro.",
    badge: "Essential",
    icon: User,
    category: "basic",
    defaultConfig: { name: "Your name", subtitle: "@handle" },
    previewConfig: { name: "Maya Chen", subtitle: "Product designer · ex-Linear" },
  },
  {
    type: "link",
    label: "Link button",
    description: "A tappable button linking anywhere on the web.",
    useCase: "Send visitors to your YouTube, store, blog, booking page, or anything with a URL.",
    tip: "Use a clear verb in the title — “Watch latest video” beats “YouTube”.",
    badge: "Popular",
    icon: LinkIcon,
    category: "basic",
    defaultConfig: { title: "My link", url: "https://", emoji: "🔗" },
    previewConfig: { title: "Watch my latest video", url: "https://", emoji: "🎬" },
  },
  {
    type: "social",
    label: "Social icons",
    description: "Compact row of icons for Twitter, GitHub, IG, YouTube…",
    useCase: "Group secondary platforms in one row instead of stacking many link buttons.",
    tip: "Keep it under 5 icons — too many waters down the click-through rate.",
    icon: AtSign,
    category: "basic",
    defaultConfig: { items: [{ platform: "twitter", url: "" }, { platform: "github", url: "" }] },
    previewConfig: {
      items: [
        { platform: "twitter", url: "https://twitter.com/x" },
        { platform: "github", url: "https://github.com/x" },
        { platform: "instagram", url: "https://instagram.com/x" },
        { platform: "youtube", url: "https://youtube.com/x" },
      ],
    },
  },
  {
    type: "heading",
    label: "Section heading",
    description: "A bold title to break your profile into sections.",
    useCase: "Use to separate groups of links — “Music”, “Projects”, “Press”.",
    icon: Heading1,
    category: "basic",
    defaultConfig: { text: "Section title" },
    previewConfig: { text: "Latest projects" },
  },
  {
    type: "text",
    label: "Bio / paragraph",
    description: "Free-form text for your bio or a note.",
    useCase: "Add personality, context, or a call-to-action between blocks.",
    tip: "Keep it under 2 sentences — visitors skim, not read.",
    icon: Type,
    category: "basic",
    defaultConfig: { text: "Tell people about yourself…" },
    previewConfig: { text: "Crafting interfaces that feel inevitable. Available for Q3 projects." },
  },

  // ─────────── MEDIA ───────────
  {
    type: "image",
    label: "Image",
    description: "Display a photo, screenshot, or banner.",
    useCase: "Showcase featured work, a product shot, or an event flyer.",
    tip: "Use 1200×800 or larger for crisp display on retina screens.",
    icon: ImageIcon,
    category: "media",
    defaultConfig: { url: "", alt: "" },
    previewConfig: { url: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=800", alt: "Featured work" },
  },
  {
    type: "video_embed",
    label: "Video embed",
    description: "Inline player for YouTube or Vimeo.",
    useCase: "Feature your latest video, talk, or product demo without leaving the page.",
    tip: "Paste the share URL — we auto-convert it to an embed.",
    icon: Video,
    category: "media",
    defaultConfig: { url: "" },
    previewConfig: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  },
  {
    type: "music_embed",
    label: "Music embed",
    description: "Spotify or SoundCloud player, fully interactive.",
    useCase: "Musicians, podcasters, DJs — let visitors hit play right on your profile.",
    tip: "Spotify track, album, artist or episode URLs all work.",
    icon: Music,
    category: "media",
    defaultConfig: { url: "" },
    previewConfig: { url: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh" },
  },

  // ─────────── WEB3 ───────────
  {
    type: "wallet",
    label: "Wallet address",
    description: "Display your XION address with a copy-friendly format.",
    useCase: "Receive payments, accept donations, or prove on-chain identity.",
    tip: "Visitors can copy your address with one tap.",
    badge: "Web3",
    icon: Wallet,
    category: "web3",
    defaultConfig: { address: "xion1...", label: "My XION wallet" },
    previewConfig: { address: "xion1qf3w4cqkmd6lk2k7l3v5pjkz8m9hxn2u4yapr0", label: "My XION wallet" },
  },
  {
    type: "nft",
    label: "NFT showcase",
    description: "Highlight a single NFT with image, title, and contract.",
    useCase: "Show off prized pieces from your collection or a project you minted.",
    tip: "Add multiple NFT blocks to build a mini gallery.",
    badge: "Web3",
    icon: Gem,
    category: "web3",
    defaultConfig: { contract: "", tokenId: "", title: "Featured NFT" },
    previewConfig: { contract: "xion1...", tokenId: "142", title: "Fidenza #142" },
  },
  {
    type: "nft_gallery",
    label: "NFT gallery",
    description: "Live grid of NFTs you hold, fetched on-chain.",
    useCase: "Show your full collection from one or more CW721 contracts.",
    tip: "Paste collection contract addresses — we'll auto-fetch your tokens.",
    badge: "Web3",
    icon: LayoutGrid,
    category: "web3",
    defaultConfig: { title: "My NFTs", contracts: [], limit: 8 },
    previewConfig: { title: "My XION NFTs", contracts: ["xion1..."], limit: 6 },
  },
  {
    type: "token_balance",
    label: "Token balance",
    description: "Live display of how much of a token you hold.",
    useCase: "Signal alignment with a project, or transparency for treasuries / DAOs.",
    badge: "Web3",
    icon: Coins,
    category: "web3",
    defaultConfig: { token: "XION", label: "XION balance" },
    previewConfig: { token: "XION", label: "Treasury balance" },
  },

  // ─────────── ADVANCED ───────────
  {
    type: "tip_jar",
    label: "Tip jar",
    description: "Accept on-chain tips in XION with one tap.",
    useCase: "Creators, podcasters, OSS maintainers — let your audience say thanks.",
    tip: "Pair with a Text block above explaining what tips support.",
    badge: "Web3",
    icon: Heart,
    category: "advanced",
    defaultConfig: {
      title: "Buy me a coffee",
      currency: "XION",
      cta: "Tip on XION",
      description: "Send a quick on-chain tip — gas is sponsored by my treasury.",
      suggestedAmounts: [0.1, 0.5, 1],
      allowCustom: true,
      allowMessage: true,
    },
    previewConfig: {
      title: "Support the next album",
      currency: "XION",
      cta: "Tip on XION",
      suggestedAmounts: [0.5, 1, 5],
      allowCustom: true,
      allowMessage: true,
    },
  },
  {
    type: "calendar",
    label: "Booking link",
    description: "Direct link to your Cal.com / Calendly / Savvycal page.",
    useCase: "Consultants, designers, recruiters — let people book a slot in 1 click.",
    tip: "Use a clear duration in the title — “Book a 30-min intro”.",
    icon: Calendar,
    category: "advanced",
    defaultConfig: { title: "Book a call", url: "" },
    previewConfig: { title: "Book a 30-min intro call", url: "https://cal.com/" },
  },
  {
    type: "contact_form",
    label: "Contact form",
    description: "Inline form so visitors can email you without leaving.",
    useCase: "Hiring managers, prospects, press — capture inquiries with no friction.",
    icon: Mail,
    category: "advanced",
    defaultConfig: { title: "Get in touch" },
    previewConfig: { title: "Hire me" },
  },
];

export const getBlockMeta = (type: BlockType) =>
  BLOCK_LIBRARY.find((b) => b.type === type)!;

export const CATEGORY_LABELS: Record<BlockMeta["category"], string> = {
  basic: "Essentials",
  media: "Media",
  web3: "Web3",
  advanced: "Conversion",
};

export const CATEGORY_DESCRIPTIONS: Record<BlockMeta["category"], string> = {
  basic: "The building blocks every profile needs.",
  media: "Embed rich content — images, video, audio.",
  web3: "On-chain identity, holdings, and assets.",
  advanced: "Turn visitors into bookings, leads, and tips.",
};
