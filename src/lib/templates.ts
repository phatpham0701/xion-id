import type { BlockType, BlockConfig } from "./blocks";
import { DEFAULT_THEME, type ProfileTheme } from "./theme";

export type TemplateBlock = {
  type: BlockType;
  config: BlockConfig;
  is_visible?: boolean;
};

export type ProfileTemplate = {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  category: "creator" | "web3" | "professional" | "personal" | "business";
  theme: ProfileTheme;
  blocks: TemplateBlock[];
};

const t = (overrides: Partial<ProfileTheme>): ProfileTheme => ({ ...DEFAULT_THEME, ...overrides });

export const TEMPLATES: ProfileTemplate[] = [
  {
    id: "creator-aurora",
    name: "Creator Aurora",
    tagline: "For content creators with links, socials & a tip jar",
    emoji: "🌌",
    category: "creator",
    theme: t({ background: "aurora", font: "space-grotesk", buttonShape: "rounded", buttonStyle: "glass", accentHue: 280 }),
    blocks: [
      { type: "avatar", config: { name: "Your Name", subtitle: "@yourhandle" } },
      { type: "text", config: { text: "Creator · storyteller · always shipping ✨" } },
      { type: "social", config: { items: [
        { platform: "twitter", url: "https://twitter.com/" },
        { platform: "instagram", url: "https://instagram.com/" },
        { platform: "youtube", url: "https://youtube.com/" },
      ] } },
      { type: "link", config: { title: "Latest video", url: "https://youtube.com/", emoji: "🎬" } },
      { type: "link", config: { title: "Newsletter", url: "https://", emoji: "💌" } },
      { type: "tip_jar", config: { title: "Buy me a coffee", currency: "XION" } },
    ],
  },
  {
    id: "web3-builder",
    name: "Web3 Builder",
    tagline: "Wallet, NFTs & token holdings front and center",
    emoji: "⛓️",
    category: "web3",
    theme: t({ background: "midnight", font: "jetbrains", buttonShape: "soft", buttonStyle: "outline", accentHue: 152 }),
    blocks: [
      { type: "avatar", config: { name: "Builder.xion", subtitle: "Building on XION" } },
      { type: "wallet", config: { address: "xion1...", label: "My XION wallet" } },
      { type: "token_balance", config: { token: "XION", label: "XION balance" } },
      { type: "nft", config: { contract: "", tokenId: "", title: "Featured NFT" } },
      { type: "link", config: { title: "GitHub", url: "https://github.com/", emoji: "💻" } },
      { type: "link", config: { title: "Read my docs", url: "https://", emoji: "📖" } },
    ],
  },
  {
    id: "musician-sunset",
    name: "Musician",
    tagline: "Embed your latest track and tour links",
    emoji: "🎵",
    category: "creator",
    theme: t({ background: "sunset", font: "playfair", buttonShape: "pill", buttonStyle: "gradient", accentHue: 330 }),
    blocks: [
      { type: "avatar", config: { name: "Stage Name", subtitle: "Singer · Producer" } },
      { type: "music_embed", config: { url: "https://open.spotify.com/" } },
      { type: "link", config: { title: "Listen on Spotify", url: "https://open.spotify.com/", emoji: "🎧" } },
      { type: "link", config: { title: "Apple Music", url: "https://music.apple.com/", emoji: "🍎" } },
      { type: "link", config: { title: "Tour dates", url: "https://", emoji: "🎤" } },
      { type: "tip_jar", config: { title: "Support my music", currency: "XION" } },
    ],
  },
  {
    id: "developer-noir",
    name: "Developer",
    tagline: "Clean dev portfolio with repos and writing",
    emoji: "💻",
    category: "professional",
    theme: t({ background: "noir", font: "jetbrains", buttonShape: "square", buttonStyle: "outline", accentHue: 195 }),
    blocks: [
      { type: "avatar", config: { name: "Your Name", subtitle: "Software engineer" } },
      { type: "text", config: { text: "I build performant web & on-chain experiences." } },
      { type: "social", config: { items: [
        { platform: "github", url: "https://github.com/" },
        { platform: "twitter", url: "https://twitter.com/" },
      ] } },
      { type: "link", config: { title: "GitHub", url: "https://github.com/", emoji: "💻" } },
      { type: "link", config: { title: "Blog", url: "https://", emoji: "✍️" } },
      { type: "link", config: { title: "Resume / CV", url: "https://", emoji: "📄" } },
      { type: "contact_form", config: { title: "Hire me" } },
    ],
  },
  {
    id: "designer-mint",
    name: "Designer",
    tagline: "Showcase your visual work with image blocks",
    emoji: "🎨",
    category: "creator",
    theme: t({ background: "mint", font: "outfit", buttonShape: "rounded", buttonStyle: "glass", accentHue: 165 }),
    blocks: [
      { type: "avatar", config: { name: "Your Name", subtitle: "Product designer" } },
      { type: "text", config: { text: "Crafting interfaces that feel inevitable." } },
      { type: "image", config: { url: "", alt: "Featured work" } },
      { type: "link", config: { title: "Dribbble", url: "https://dribbble.com/", emoji: "🏀" } },
      { type: "link", config: { title: "Behance", url: "https://behance.net/", emoji: "🎨" } },
      { type: "link", config: { title: "Figma community", url: "https://figma.com/", emoji: "🧩" } },
      { type: "calendar", config: { title: "Book a design call", url: "https://cal.com/" } },
    ],
  },
  {
    id: "founder-lavender",
    name: "Founder",
    tagline: "For startup founders raising and recruiting",
    emoji: "🚀",
    category: "business",
    theme: t({ background: "lavender", font: "space-grotesk", buttonShape: "rounded", buttonStyle: "gradient", accentHue: 270 }),
    blocks: [
      { type: "avatar", config: { name: "Your Name", subtitle: "Founder & CEO" } },
      { type: "text", config: { text: "Building the future of [your category]." } },
      { type: "link", config: { title: "Visit our company", url: "https://", emoji: "🏢" } },
      { type: "link", config: { title: "We're hiring", url: "https://", emoji: "👋" } },
      { type: "link", config: { title: "Press kit", url: "https://", emoji: "📰" } },
      { type: "calendar", config: { title: "Book intro call", url: "https://cal.com/" } },
      { type: "social", config: { items: [
        { platform: "linkedin", url: "https://linkedin.com/" },
        { platform: "twitter", url: "https://twitter.com/" },
      ] } },
    ],
  },
  {
    id: "minimal-paper",
    name: "Minimal",
    tagline: "Just the essentials. Nothing more.",
    emoji: "◽",
    category: "personal",
    theme: t({ background: "noir", font: "inter", buttonShape: "soft", buttonStyle: "outline", accentHue: 0 }),
    blocks: [
      { type: "heading", config: { text: "Your Name" } },
      { type: "text", config: { text: "One short line about you." } },
      { type: "link", config: { title: "Website", url: "https://", emoji: "" } },
      { type: "link", config: { title: "Email", url: "mailto:you@example.com", emoji: "" } },
    ],
  },
  {
    id: "nft-collector",
    name: "NFT Collector",
    tagline: "Show off your wallet and prized pieces",
    emoji: "💎",
    category: "web3",
    theme: t({ background: "lavender", font: "space-grotesk", buttonShape: "pill", buttonStyle: "glass", accentHue: 290 }),
    blocks: [
      { type: "avatar", config: { name: "Collector.xion", subtitle: "Curating on-chain art" } },
      { type: "wallet", config: { address: "xion1...", label: "Collector wallet" } },
      { type: "nft", config: { contract: "", tokenId: "", title: "Crown jewel" } },
      { type: "nft", config: { contract: "", tokenId: "", title: "New mint" } },
      { type: "link", config: { title: "View full collection", url: "https://", emoji: "🖼️" } },
    ],
  },
  {
    id: "podcaster",
    name: "Podcaster",
    tagline: "All your episodes and platforms in one place",
    emoji: "🎙️",
    category: "creator",
    theme: t({ background: "sunset", font: "outfit", buttonShape: "rounded", buttonStyle: "glass", accentHue: 25 }),
    blocks: [
      { type: "avatar", config: { name: "Show name", subtitle: "Hosted by you" } },
      { type: "text", config: { text: "Conversations about [topic]. New episode every week." } },
      { type: "music_embed", config: { url: "https://open.spotify.com/" } },
      { type: "link", config: { title: "Spotify", url: "https://open.spotify.com/", emoji: "🎧" } },
      { type: "link", config: { title: "Apple Podcasts", url: "https://podcasts.apple.com/", emoji: "🎙️" } },
      { type: "link", config: { title: "YouTube", url: "https://youtube.com/", emoji: "📺" } },
      { type: "tip_jar", config: { title: "Support the show", currency: "XION" } },
    ],
  },
  {
    id: "writer-serif",
    name: "Writer",
    tagline: "Editorial layout for essayists and journalists",
    emoji: "✍️",
    category: "creator",
    theme: t({ background: "noir", font: "playfair", buttonShape: "soft", buttonStyle: "outline", accentHue: 35 }),
    blocks: [
      { type: "avatar", config: { name: "Your Name", subtitle: "Writer" } },
      { type: "text", config: { text: "Long-form essays on technology, culture and the in-between." } },
      { type: "link", config: { title: "Substack", url: "https://substack.com/", emoji: "📬" } },
      { type: "link", config: { title: "Medium", url: "https://medium.com/", emoji: "📝" } },
      { type: "link", config: { title: "Latest essay", url: "https://", emoji: "📖" } },
      { type: "link", config: { title: "Books", url: "https://", emoji: "📚" } },
    ],
  },
  {
    id: "consultant",
    name: "Consultant",
    tagline: "Land clients with services + booking",
    emoji: "💼",
    category: "professional",
    theme: t({ background: "midnight", font: "inter", buttonShape: "soft", buttonStyle: "solid", accentHue: 215 }),
    blocks: [
      { type: "avatar", config: { name: "Your Name", subtitle: "Independent consultant" } },
      { type: "text", config: { text: "I help [audience] do [outcome]. Available for projects." } },
      { type: "link", config: { title: "Services & pricing", url: "https://", emoji: "💼" } },
      { type: "link", config: { title: "Case studies", url: "https://", emoji: "📊" } },
      { type: "calendar", config: { title: "Book a discovery call", url: "https://cal.com/" } },
      { type: "contact_form", config: { title: "Send a brief" } },
    ],
  },
  {
    id: "personal-card",
    name: "Personal Card",
    tagline: "Friendly all-rounder for any human",
    emoji: "👋",
    category: "personal",
    theme: t({ background: "aurora", font: "outfit", buttonShape: "pill", buttonStyle: "glass", accentHue: 200 }),
    blocks: [
      { type: "avatar", config: { name: "Your Name", subtitle: "Hello, internet 👋" } },
      { type: "text", config: { text: "A little about me, what I love, where I am." } },
      { type: "social", config: { items: [
        { platform: "twitter", url: "https://twitter.com/" },
        { platform: "instagram", url: "https://instagram.com/" },
        { platform: "github", url: "https://github.com/" },
      ] } },
      { type: "link", config: { title: "My favorite project", url: "https://", emoji: "✨" } },
      { type: "link", config: { title: "Currently reading", url: "https://", emoji: "📚" } },
    ],
  },
];

export const TEMPLATE_CATEGORIES: { id: ProfileTemplate["category"] | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "creator", label: "Creators" },
  { id: "web3", label: "Web3" },
  { id: "professional", label: "Professional" },
  { id: "business", label: "Business" },
  { id: "personal", label: "Personal" },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
