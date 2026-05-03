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
  category: "starter" | "creator" | "web3" | "professional" | "personal" | "business";
  theme: ProfileTheme;
  blocks: TemplateBlock[];
};

const t = (overrides: Partial<ProfileTheme>): ProfileTheme => ({ ...DEFAULT_THEME, ...overrides });

// Sample XION address used in Web3 templates so the wallet block renders as
// a real-looking address out of the box. Users replace with their own.
const SAMPLE_XION = "xion1qf3w4cqkmd6lk2k7l3v5pjkz8m9hxn2u4yapr0";

export const TEMPLATES: ProfileTemplate[] = [
  // ────────── CREATOR ──────────
  {
    id: "creator-aurora",
    name: "Content Creator",
    tagline: "Links, socials, latest video and a tip jar — ready to ship.",
    emoji: "🌌",
    category: "creator",
    theme: t({ background: "aurora", font: "space-grotesk", buttonShape: "rounded", buttonStyle: "glass", accentHue: 280 }),
    blocks: [
      { type: "avatar", config: { name: "Riley Park", subtitle: "@rileymakes" } },
      { type: "text", config: { text: "Filmmaker & storyteller. New video every Friday — behind the scenes on Patreon." } },
      { type: "social", config: { items: [
        { platform: "youtube", url: "https://youtube.com/@rileymakes" },
        { platform: "instagram", url: "https://instagram.com/rileymakes" },
        { platform: "twitter", url: "https://twitter.com/rileymakes" },
      ] } },
      { type: "video_embed", config: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } },
      { type: "link", config: { title: "Watch on YouTube", url: "https://youtube.com/@rileymakes", emoji: "🎬" } },
      { type: "link", config: { title: "Behind the scenes (Patreon)", url: "https://patreon.com/rileymakes", emoji: "🎟️" } },
      { type: "link", config: { title: "Weekly newsletter", url: "https://rileymakes.substack.com", emoji: "💌" } },
      { type: "tip_jar", config: { title: "Buy me a coffee", currency: "XION" } },
    ],
  },
  {
    id: "musician-sunset",
    name: "Musician",
    tagline: "Latest single embedded, all streaming platforms, tour dates.",
    emoji: "🎵",
    category: "creator",
    theme: t({ background: "sunset", font: "playfair", buttonShape: "pill", buttonStyle: "gradient", accentHue: 330 }),
    blocks: [
      { type: "avatar", config: { name: "DJ Solace", subtitle: "Producer · Berlin → Tokyo" } },
      { type: "text", config: { text: "New EP “Midnight Currents” — out now on all platforms 🌙" } },
      { type: "music_embed", config: { url: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh" } },
      { type: "link", config: { title: "Listen on Spotify", url: "https://open.spotify.com/artist/", emoji: "🎧" } },
      { type: "link", config: { title: "Apple Music", url: "https://music.apple.com/artist/", emoji: "🍎" } },
      { type: "link", config: { title: "SoundCloud", url: "https://soundcloud.com/", emoji: "☁️" } },
      { type: "link", config: { title: "Tour 2026 — get tickets", url: "https://", emoji: "🎤" } },
      { type: "social", config: { items: [
        { platform: "instagram", url: "https://instagram.com/" },
        { platform: "youtube", url: "https://youtube.com/" },
      ] } },
      { type: "tip_jar", config: { title: "Support the next record", currency: "XION" } },
    ],
  },
  {
    id: "podcaster",
    name: "Podcaster",
    tagline: "All your episodes and platforms in one tap.",
    emoji: "🎙️",
    category: "creator",
    theme: t({ background: "sunset", font: "outfit", buttonShape: "rounded", buttonStyle: "glass", accentHue: 25 }),
    blocks: [
      { type: "avatar", config: { name: "The Long Game", subtitle: "Hosted by Sam & Jordan" } },
      { type: "text", config: { text: "Weekly conversations with people building things that take a decade. New episodes every Tuesday." } },
      { type: "music_embed", config: { url: "https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5" } },
      { type: "link", config: { title: "Spotify", url: "https://open.spotify.com/show/", emoji: "🎧" } },
      { type: "link", config: { title: "Apple Podcasts", url: "https://podcasts.apple.com/", emoji: "🎙️" } },
      { type: "link", config: { title: "YouTube (video)", url: "https://youtube.com/", emoji: "📺" } },
      { type: "link", config: { title: "Show notes & transcripts", url: "https://thelonggame.fm", emoji: "📝" } },
      { type: "contact_form", config: { title: "Pitch a guest" } },
      { type: "tip_jar", config: { title: "Support the show", currency: "XION" } },
    ],
  },
  {
    id: "designer-mint",
    name: "Designer",
    tagline: "Visual portfolio with featured work, case studies and booking.",
    emoji: "🎨",
    category: "creator",
    theme: t({ background: "mint", font: "outfit", buttonShape: "rounded", buttonStyle: "glass", accentHue: 165 }),
    blocks: [
      { type: "avatar", config: { name: "Maya Chen", subtitle: "Product designer · ex-Linear" } },
      { type: "text", config: { text: "Crafting interfaces that feel inevitable. Available for Q3 2026 projects." } },
      { type: "image", config: { url: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=800", alt: "Featured work — Atlas dashboard" } },
      { type: "link", config: { title: "Case study: Atlas redesign", url: "https://", emoji: "📐" } },
      { type: "link", config: { title: "Dribbble", url: "https://dribbble.com/", emoji: "🏀" } },
      { type: "link", config: { title: "Behance", url: "https://behance.net/", emoji: "🎨" } },
      { type: "link", config: { title: "Read on Are.na", url: "https://are.na/", emoji: "🧩" } },
      { type: "calendar", config: { title: "Book a 30-min intro call", url: "https://cal.com/maya" } },
    ],
  },
  {
    id: "photographer",
    name: "Photographer",
    tagline: "Image-first portfolio with print shop and bookings.",
    emoji: "📸",
    category: "creator",
    theme: t({ background: "noir", font: "playfair", buttonShape: "square", buttonStyle: "outline", accentHue: 20 }),
    blocks: [
      { type: "avatar", config: { name: "Noor Hassan", subtitle: "Documentary photography" } },
      { type: "text", config: { text: "Light, distance, and the people in between. Based in Istanbul, working worldwide." } },
      { type: "image", config: { url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800", alt: "Featured series" } },
      { type: "image", config: { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800", alt: "Recent work" } },
      { type: "link", config: { title: "Print shop", url: "https://", emoji: "🖼️" } },
      { type: "link", config: { title: "Editorial portfolio", url: "https://", emoji: "📰" } },
      { type: "link", config: { title: "Instagram", url: "https://instagram.com/", emoji: "📷" } },
      { type: "calendar", config: { title: "Book a session", url: "https://cal.com/" } },
    ],
  },
  {
    id: "writer-serif",
    name: "Writer",
    tagline: "Editorial layout for essayists, journalists and authors.",
    emoji: "✍️",
    category: "creator",
    theme: t({ background: "noir", font: "playfair", buttonShape: "soft", buttonStyle: "outline", accentHue: 35 }),
    blocks: [
      { type: "avatar", config: { name: "Eleanor Fitch", subtitle: "Essayist · The Atlantic, Wired" } },
      { type: "text", config: { text: "Long-form on technology, attention, and what we owe each other. Author of “Quiet Machines” (2025)." } },
      { type: "link", config: { title: "Read “Quiet Machines”", url: "https://", emoji: "📚" } },
      { type: "link", config: { title: "Substack — Field Notes", url: "https://eleanorfitch.substack.com", emoji: "📬" } },
      { type: "link", config: { title: "Recent essays in Wired", url: "https://wired.com", emoji: "📰" } },
      { type: "link", config: { title: "Speaking & lectures", url: "https://", emoji: "🎤" } },
      { type: "contact_form", config: { title: "Press & speaking inquiries" } },
    ],
  },

  // ────────── PROFESSIONAL ──────────
  {
    id: "developer-noir",
    name: "Developer",
    tagline: "Clean dev portfolio with repos, writing and a hire-me form.",
    emoji: "💻",
    category: "professional",
    theme: t({ background: "noir", font: "jetbrains", buttonShape: "square", buttonStyle: "outline", accentHue: 195 }),
    blocks: [
      { type: "avatar", config: { name: "Alex Rivera", subtitle: "Senior software engineer" } },
      { type: "text", config: { text: "I build performant web & on-chain experiences. TypeScript, Rust, occasionally Postgres at 3am." } },
      { type: "social", config: { items: [
        { platform: "github", url: "https://github.com/alexrivera" },
        { platform: "twitter", url: "https://twitter.com/alexrivera" },
      ] } },
      { type: "link", config: { title: "GitHub — open source", url: "https://github.com/alexrivera", emoji: "💻" } },
      { type: "link", config: { title: "Engineering blog", url: "https://alexrivera.dev/blog", emoji: "✍️" } },
      { type: "link", config: { title: "Resume / CV (PDF)", url: "https://", emoji: "📄" } },
      { type: "link", config: { title: "Latest project — Helix", url: "https://", emoji: "🚀" } },
      { type: "contact_form", config: { title: "Hire me" } },
    ],
  },
  {
    id: "consultant",
    name: "Consultant",
    tagline: "Land clients with services, case studies and instant booking.",
    emoji: "💼",
    category: "professional",
    theme: t({ background: "midnight", font: "inter", buttonShape: "soft", buttonStyle: "solid", accentHue: 215 }),
    blocks: [
      { type: "avatar", config: { name: "Priya Kapoor", subtitle: "Growth strategy consultant" } },
      { type: "text", config: { text: "I help Series A→B SaaS founders unlock their next growth lever. 40+ engagements, $300M+ in lift." } },
      { type: "link", config: { title: "Services & pricing", url: "https://", emoji: "💼" } },
      { type: "link", config: { title: "Case studies", url: "https://", emoji: "📊" } },
      { type: "link", config: { title: "Read my essays", url: "https://", emoji: "📖" } },
      { type: "calendar", config: { title: "Book a free 20-min consult", url: "https://cal.com/priya/intro" } },
      { type: "contact_form", config: { title: "Send a project brief" } },
    ],
  },
  {
    id: "founder-lavender",
    name: "Founder",
    tagline: "For startup founders raising, recruiting, and shipping in public.",
    emoji: "🚀",
    category: "business",
    theme: t({ background: "lavender", font: "space-grotesk", buttonShape: "rounded", buttonStyle: "gradient", accentHue: 270 }),
    blocks: [
      { type: "avatar", config: { name: "Jonas Weber", subtitle: "Co-founder & CEO, Lumen" } },
      { type: "text", config: { text: "Building the operating system for solo accountants. Seed-funded by Sequoia. Hiring engineers #4–8." } },
      { type: "link", config: { title: "Visit Lumen", url: "https://lumen.app", emoji: "🏢" } },
      { type: "link", config: { title: "We're hiring", url: "https://lumen.app/jobs", emoji: "👋" } },
      { type: "link", config: { title: "Press kit", url: "https://lumen.app/press", emoji: "📰" } },
      { type: "link", config: { title: "Read our launch post", url: "https://", emoji: "🚀" } },
      { type: "calendar", config: { title: "Book intro call", url: "https://cal.com/jonas" } },
      { type: "social", config: { items: [
        { platform: "linkedin", url: "https://linkedin.com/in/jonasweber" },
        { platform: "twitter", url: "https://twitter.com/jonasweber" },
      ] } },
    ],
  },
  {
    id: "local-business",
    name: "Local Business",
    tagline: "Hours, location, menu, booking — everything customers need.",
    emoji: "🏪",
    category: "business",
    theme: t({ background: "sunset", font: "outfit", buttonShape: "rounded", buttonStyle: "solid", accentHue: 18 }),
    blocks: [
      { type: "avatar", config: { name: "Tide Coffee", subtitle: "Specialty coffee · Lisbon" } },
      { type: "text", config: { text: "Open 8am–5pm · R. das Flores 42, 1200-194 Lisboa\nClosed Sundays. Dogs welcome 🐕" } },
      { type: "link", config: { title: "📍 Get directions", url: "https://maps.google.com", emoji: "" } },
      { type: "link", config: { title: "View menu", url: "https://", emoji: "☕" } },
      { type: "link", config: { title: "Order online", url: "https://", emoji: "🛍️" } },
      { type: "link", config: { title: "Reserve a table", url: "https://", emoji: "🪑" } },
      { type: "social", config: { items: [
        { platform: "instagram", url: "https://instagram.com/tidecoffee" },
      ] } },
      { type: "contact_form", config: { title: "Catering & private events" } },
    ],
  },

  // ────────── WEB3 ──────────
  {
    id: "web3-builder",
    name: "Web3 Builder",
    tagline: "Wallet, token holdings and shipped projects front and center.",
    emoji: "⛓️",
    category: "web3",
    theme: t({ background: "midnight", font: "jetbrains", buttonShape: "soft", buttonStyle: "outline", accentHue: 152 }),
    blocks: [
      { type: "avatar", config: { name: "builder.xion", subtitle: "Building on XION since genesis" } },
      { type: "text", config: { text: "Smart contract engineer. Currently shipping account-abstraction tooling on XION." } },
      { type: "wallet", config: { address: SAMPLE_XION, label: "My XION wallet" } },
      { type: "token_balance", config: { token: "XION", label: "XION holdings" } },
      { type: "link", config: { title: "GitHub — open source", url: "https://github.com/", emoji: "💻" } },
      { type: "link", config: { title: "Read the docs I write", url: "https://docs.burnt.com", emoji: "📖" } },
      { type: "link", config: { title: "Latest project — XionPay", url: "https://", emoji: "🚀" } },
      { type: "social", config: { items: [
        { platform: "twitter", url: "https://twitter.com/" },
        { platform: "github", url: "https://github.com/" },
      ] } },
      { type: "tip_jar", config: { title: "Tip me in XION", currency: "XION" } },
    ],
  },
  {
    id: "nft-collector",
    name: "NFT Collector",
    tagline: "Show off your wallet and prized pieces.",
    emoji: "💎",
    category: "web3",
    theme: t({ background: "lavender", font: "space-grotesk", buttonShape: "pill", buttonStyle: "glass", accentHue: 290 }),
    blocks: [
      { type: "avatar", config: { name: "0xCurator", subtitle: "Curating on-chain art since 2021" } },
      { type: "text", config: { text: "Collector of generative art and post-internet photography. DMs open for trades." } },
      { type: "wallet", config: { address: SAMPLE_XION, label: "Collector wallet" } },
      { type: "nft", config: { contract: SAMPLE_XION, tokenId: "142", title: "Fidenza #142 — Tyler Hobbs" } },
      { type: "nft", config: { contract: SAMPLE_XION, tokenId: "07", title: "Ringers #07 — Dmitri Cherniak" } },
      { type: "link", config: { title: "Full collection on OpenSea", url: "https://opensea.io/", emoji: "🌊" } },
      { type: "link", config: { title: "Curation notes", url: "https://", emoji: "📝" } },
      { type: "social", config: { items: [
        { platform: "twitter", url: "https://twitter.com/" },
      ] } },
    ],
  },
  {
    id: "dao-community",
    name: "DAO / Community",
    tagline: "Treasury, governance, and how to join — all in one place.",
    emoji: "🌐",
    category: "web3",
    theme: t({ background: "midnight", font: "space-grotesk", buttonShape: "soft", buttonStyle: "gradient", accentHue: 195 }),
    blocks: [
      { type: "avatar", config: { name: "Aurora DAO", subtitle: "Funding public goods on XION" } },
      { type: "text", config: { text: "A community of 1,200+ contributors funding open-source infrastructure. Quarterly grants, monthly calls." } },
      { type: "wallet", config: { address: SAMPLE_XION, label: "Treasury (multisig)" } },
      { type: "token_balance", config: { token: "XION", label: "Treasury balance" } },
      { type: "link", config: { title: "Read the constitution", url: "https://", emoji: "📜" } },
      { type: "link", config: { title: "Active proposals", url: "https://snapshot.org/", emoji: "🗳️" } },
      { type: "link", config: { title: "Join Discord", url: "https://discord.gg/", emoji: "💬" } },
      { type: "link", config: { title: "Apply for a grant", url: "https://", emoji: "🌱" } },
    ],
  },

  // ────────── PERSONAL ──────────
  {
    id: "minimal-paper",
    name: "Minimal",
    tagline: "Just the essentials. Nothing more.",
    emoji: "◽",
    category: "personal",
    theme: t({ background: "noir", font: "inter", buttonShape: "soft", buttonStyle: "outline", accentHue: 0 }),
    blocks: [
      { type: "heading", config: { text: "Sam Okafor" } },
      { type: "text", config: { text: "Engineer in Lagos. Currently at Paystack. Previously at Andela." } },
      { type: "link", config: { title: "Website", url: "https://samokafor.com", emoji: "" } },
      { type: "link", config: { title: "Email", url: "mailto:hi@samokafor.com", emoji: "" } },
      { type: "link", config: { title: "GitHub", url: "https://github.com/samokafor", emoji: "" } },
    ],
  },
  {
    id: "personal-card",
    name: "Personal Card",
    tagline: "Friendly all-rounder for any human on the internet.",
    emoji: "👋",
    category: "personal",
    theme: t({ background: "aurora", font: "outfit", buttonShape: "pill", buttonStyle: "glass", accentHue: 200 }),
    blocks: [
      { type: "avatar", config: { name: "Léa Dubois", subtitle: "Hello, internet 👋" } },
      { type: "text", config: { text: "Cooking, climbing, code. Currently learning Japanese and rebuilding my bicycle." } },
      { type: "social", config: { items: [
        { platform: "twitter", url: "https://twitter.com/leadubois" },
        { platform: "instagram", url: "https://instagram.com/leadubois" },
        { platform: "github", url: "https://github.com/leadubois" },
      ] } },
      { type: "link", config: { title: "My favorite project — RecipeBox", url: "https://", emoji: "✨" } },
      { type: "link", config: { title: "Currently reading", url: "https://", emoji: "📚" } },
      { type: "link", config: { title: "Photos from last trip", url: "https://", emoji: "📷" } },
    ],
  },
  {
    id: "streamer",
    name: "Streamer / Gamer",
    tagline: "Twitch, schedule, Discord, gear — built for live audiences.",
    emoji: "🎮",
    category: "personal",
    theme: t({ background: "midnight", font: "space-grotesk", buttonShape: "soft", buttonStyle: "gradient", accentHue: 285 }),
    blocks: [
      { type: "avatar", config: { name: "VoltGG", subtitle: "Twitch partner · Apex & Valorant" } },
      { type: "text", config: { text: "Live Mon/Wed/Fri 8pm CET. High-elo ranked grinds and chill community games on weekends." } },
      { type: "link", config: { title: "🔴 Watch live on Twitch", url: "https://twitch.tv/voltgg", emoji: "" } },
      { type: "link", config: { title: "YouTube — VOD highlights", url: "https://youtube.com/@voltgg", emoji: "📺" } },
      { type: "link", config: { title: "Join the Discord (8k members)", url: "https://discord.gg/", emoji: "💬" } },
      { type: "link", config: { title: "My gear & setup", url: "https://", emoji: "⌨️" } },
      { type: "link", config: { title: "Merch store", url: "https://", emoji: "👕" } },
      { type: "social", config: { items: [
        { platform: "twitter", url: "https://twitter.com/voltgg" },
        { platform: "instagram", url: "https://instagram.com/voltgg" },
      ] } },
      { type: "tip_jar", config: { title: "Donate (thank you ❤️)", currency: "XION" } },
    ],
  },
];

export const TEMPLATE_CATEGORIES: { id: ProfileTemplate["category"] | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "starter", label: "Starters" },
  { id: "creator", label: "Creators" },
  { id: "professional", label: "Professional" },
  { id: "business", label: "Business" },
  { id: "personal", label: "Personal" },
  { id: "web3", label: "Builders" },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
