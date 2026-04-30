import type { BlockType, BlockMeta } from "./blocks";
import { supabase } from "@/integrations/supabase/client";

/* ────────────────────────────────────────────────────────────
 * Persona presets — each persona boosts blocks that matter most
 * for that kind of profile. Scores are 0–100.
 * ──────────────────────────────────────────────────────────── */

export type Persona = "creator" | "web3" | "professional" | "personal";

export const PERSONAS: { id: Persona; label: string; emoji: string; hint: string }[] = [
  { id: "creator",      label: "Creator",       emoji: "🎬", hint: "Musicians, streamers, video makers" },
  { id: "web3",         label: "Web3 builder",  emoji: "⛓️", hint: "Founders, devs, on-chain identity" },
  { id: "professional", label: "Professional",  emoji: "💼", hint: "Freelancers, consultants, hiring" },
  { id: "personal",     label: "Personal",      emoji: "✨", hint: "Linktree-style personal hub" },
];

/** Base popularity score across all profiles (rough industry signal). */
const POPULARITY: Record<BlockType, number> = {
  avatar: 100, link: 95, social: 88, heading: 60, text: 70,
  image: 55, video_embed: 50, music_embed: 35,
  wallet: 40, nft: 30, token_balance: 18,
  tip_jar: 28, calendar: 45, contact_form: 38,
};

/** Per-persona affinity (added on top of popularity). */
const PERSONA_BOOST: Record<Persona, Partial<Record<BlockType, number>>> = {
  creator: {
    video_embed: 60, music_embed: 55, image: 35, link: 30, social: 30, tip_jar: 40,
  },
  web3: {
    wallet: 70, nft: 55, token_balance: 50, tip_jar: 45, link: 20,
  },
  professional: {
    calendar: 70, contact_form: 60, link: 30, text: 25, social: 20,
  },
  personal: {
    link: 35, social: 35, image: 25, text: 20, music_embed: 15,
  },
};

export type SortMode = "recommended" | "popular" | "recent" | "category";

export const SORT_LABELS: Record<SortMode, string> = {
  recommended: "Recommended",
  popular: "Most popular",
  recent: "Recently used",
  category: "By category",
};

/* ────────────────────────────────────────────────────────────
 * User preferences (persisted to profiles.settings.blockPrefs)
 * ──────────────────────────────────────────────────────────── */

export type BlockPrefs = {
  persona: Persona;
  sortMode: SortMode;
  /** type → number of times the user has added it across this profile. */
  usage: Partial<Record<BlockType, number>>;
  /** type → unix ms timestamp of last add. */
  lastUsed: Partial<Record<BlockType, number>>;
};

export const DEFAULT_PREFS: BlockPrefs = {
  persona: "personal",
  sortMode: "recommended",
  usage: {},
  lastUsed: {},
};

export const prefsFromJson = (raw: unknown): BlockPrefs => {
  if (!raw || typeof raw !== "object") return DEFAULT_PREFS;
  const obj = raw as Record<string, unknown>;
  const bp = (obj.blockPrefs ?? obj) as Partial<BlockPrefs>;
  return {
    persona:  (bp.persona  as Persona)  ?? DEFAULT_PREFS.persona,
    sortMode: (bp.sortMode as SortMode) ?? DEFAULT_PREFS.sortMode,
    usage:    (bp.usage    as BlockPrefs["usage"])    ?? {},
    lastUsed: (bp.lastUsed as BlockPrefs["lastUsed"]) ?? {},
  };
};

const LS_KEY = (profileId: string) => `xionid:blockPrefs:${profileId}`;

export const loadLocalPrefs = (profileId: string): BlockPrefs | null => {
  try {
    const raw = localStorage.getItem(LS_KEY(profileId));
    return raw ? (JSON.parse(raw) as BlockPrefs) : null;
  } catch { return null; }
};

export const saveLocalPrefs = (profileId: string, prefs: BlockPrefs) => {
  try { localStorage.setItem(LS_KEY(profileId), JSON.stringify(prefs)); } catch { /* noop */ }
};

/** Persist prefs into profiles.settings (merges with existing settings). */
export const persistPrefs = async (profileId: string, prefs: BlockPrefs) => {
  saveLocalPrefs(profileId, prefs);
  const { data: cur } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", profileId)
    .maybeSingle();
  const merged = { ...((cur?.settings as Record<string, unknown>) || {}), blockPrefs: prefs };
  await supabase.from("profiles").update({ settings: merged as never }).eq("id", profileId);
};

/* ────────────────────────────────────────────────────────────
 * Scoring + sorting
 * ──────────────────────────────────────────────────────────── */

const RECENT_WINDOW_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export const scoreBlock = (meta: BlockMeta, prefs: BlockPrefs): number => {
  const base = POPULARITY[meta.type] ?? 0;
  const persona = PERSONA_BOOST[prefs.persona]?.[meta.type] ?? 0;
  const used = prefs.usage[meta.type] ?? 0;
  const last = prefs.lastUsed[meta.type] ?? 0;
  const recencyBoost = last && Date.now() - last < RECENT_WINDOW_MS ? 25 : 0;
  // Diminishing returns on heavy usage so it doesn't dominate forever.
  const usageBoost = Math.min(40, used * 8);
  return base + persona + usageBoost + recencyBoost;
};

export const sortLibrary = (
  library: BlockMeta[],
  prefs: BlockPrefs,
): BlockMeta[] => {
  const arr = [...library];
  switch (prefs.sortMode) {
    case "popular":
      return arr.sort((a, b) => (POPULARITY[b.type] ?? 0) - (POPULARITY[a.type] ?? 0));
    case "recent":
      return arr.sort((a, b) => (prefs.lastUsed[b.type] ?? 0) - (prefs.lastUsed[a.type] ?? 0));
    case "category":
      return arr; // caller already groups by category
    case "recommended":
    default:
      return arr.sort((a, b) => scoreBlock(b, prefs) - scoreBlock(a, prefs));
  }
};

/** Bump usage counters when a block is added. */
export const recordBlockAdd = (prefs: BlockPrefs, type: BlockType): BlockPrefs => ({
  ...prefs,
  usage:    { ...prefs.usage,    [type]: (prefs.usage[type] ?? 0) + 1 },
  lastUsed: { ...prefs.lastUsed, [type]: Date.now() },
});
