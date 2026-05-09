import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_PREFS,
  PERSONAS,
  SORT_LABELS,
  prefsFromJson,
  scoreBlock,
  sortLibrary,
  recordBlockAdd,
  loadLocalPrefs,
  saveLocalPrefs,
  type Persona,
  type SortMode,
} from "@/lib/blockRanking";
import { BLOCK_LIBRARY, getBlockMeta } from "@/lib/blocks";

describe("PERSONAS catalog", () => {
  it("has exactly 4 personas", () => {
    expect(PERSONAS).toHaveLength(4);
  });

  it("every persona has id, label, emoji, and hint", () => {
    for (const p of PERSONAS) {
      expect(p.id).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.emoji).toBeTruthy();
      expect(p.hint).toBeTruthy();
    }
  });

  it("includes creator, web3, professional, and personal", () => {
    const ids = PERSONAS.map((p) => p.id);
    expect(ids).toContain("creator");
    expect(ids).toContain("web3");
    expect(ids).toContain("professional");
    expect(ids).toContain("personal");
  });
});

describe("SORT_LABELS", () => {
  it("covers all 4 sort modes", () => {
    const modes: SortMode[] = ["recommended", "popular", "recent", "category"];
    for (const m of modes) {
      expect(SORT_LABELS[m]).toBeTruthy();
    }
  });
});

describe("DEFAULT_PREFS", () => {
  it("has persona=personal and sortMode=recommended", () => {
    expect(DEFAULT_PREFS.persona).toBe("personal");
    expect(DEFAULT_PREFS.sortMode).toBe("recommended");
  });

  it("has empty usage and lastUsed maps", () => {
    expect(Object.keys(DEFAULT_PREFS.usage)).toHaveLength(0);
    expect(Object.keys(DEFAULT_PREFS.lastUsed)).toHaveLength(0);
  });
});

describe("prefsFromJson", () => {
  it("returns defaults for null", () => {
    expect(prefsFromJson(null)).toEqual(DEFAULT_PREFS);
  });

  it("returns defaults for non-object", () => {
    expect(prefsFromJson("bad")).toEqual(DEFAULT_PREFS);
    expect(prefsFromJson(42)).toEqual(DEFAULT_PREFS);
  });

  it("parses a valid prefs object", () => {
    const raw = { persona: "creator", sortMode: "popular", usage: {}, lastUsed: {} };
    const prefs = prefsFromJson(raw);
    expect(prefs.persona).toBe("creator");
    expect(prefs.sortMode).toBe("popular");
  });

  it("reads blockPrefs nested key if present", () => {
    const raw = { blockPrefs: { persona: "web3", sortMode: "recent", usage: {}, lastUsed: {} } };
    const prefs = prefsFromJson(raw);
    expect(prefs.persona).toBe("web3");
  });

  it("falls back to defaults for missing sub-fields", () => {
    const prefs = prefsFromJson({ persona: "professional" });
    expect(prefs.sortMode).toBe(DEFAULT_PREFS.sortMode);
  });
});

describe("scoreBlock", () => {
  it("returns a positive score for any block", () => {
    for (const meta of BLOCK_LIBRARY) {
      expect(scoreBlock(meta, DEFAULT_PREFS)).toBeGreaterThan(0);
    }
  });

  it("web3 persona boosts wallet block score", () => {
    const web3Prefs = { ...DEFAULT_PREFS, persona: "web3" as Persona };
    const personalPrefs = { ...DEFAULT_PREFS, persona: "personal" as Persona };
    expect(scoreBlock(getBlockMeta("wallet"), web3Prefs)).toBeGreaterThan(
      scoreBlock(getBlockMeta("wallet"), personalPrefs)
    );
  });

  it("usage boosts score (diminishing returns cap at 40)", () => {
    const basePrefs = { ...DEFAULT_PREFS };
    const usedPrefs = { ...DEFAULT_PREFS, usage: { link: 10 } };
    expect(scoreBlock(getBlockMeta("link"), usedPrefs)).toBeGreaterThan(
      scoreBlock(getBlockMeta("link"), basePrefs)
    );
  });

  it("recency boost applies for recently used block", () => {
    const recentPrefs = { ...DEFAULT_PREFS, lastUsed: { link: Date.now() - 1000 } };
    expect(scoreBlock(getBlockMeta("link"), recentPrefs)).toBeGreaterThan(
      scoreBlock(getBlockMeta("link"), DEFAULT_PREFS)
    );
  });

  it("recency boost does NOT apply for block used > 14 days ago", () => {
    const oldPrefs = { ...DEFAULT_PREFS, lastUsed: { link: Date.now() - 15 * 86400 * 1000 } };
    expect(scoreBlock(getBlockMeta("link"), oldPrefs)).toBe(
      scoreBlock(getBlockMeta("link"), DEFAULT_PREFS)
    );
  });
});

describe("sortLibrary", () => {
  it("popular mode sorts by decreasing popularity", () => {
    const sorted = sortLibrary(BLOCK_LIBRARY, { ...DEFAULT_PREFS, sortMode: "popular" });
    expect(sorted[0].type).toBe("avatar"); // avatar has 100 popularity
    expect(sorted).toHaveLength(BLOCK_LIBRARY.length);
  });

  it("recommended mode returns all blocks", () => {
    const sorted = sortLibrary(BLOCK_LIBRARY, { ...DEFAULT_PREFS, sortMode: "recommended" });
    expect(sorted).toHaveLength(BLOCK_LIBRARY.length);
  });

  it("category mode preserves order", () => {
    const sorted = sortLibrary(BLOCK_LIBRARY, { ...DEFAULT_PREFS, sortMode: "category" });
    expect(sorted).toHaveLength(BLOCK_LIBRARY.length);
  });

  it("recent mode returns all blocks", () => {
    const sorted = sortLibrary(BLOCK_LIBRARY, { ...DEFAULT_PREFS, sortMode: "recent" });
    expect(sorted).toHaveLength(BLOCK_LIBRARY.length);
  });

  it("does not mutate the original library", () => {
    const original = [...BLOCK_LIBRARY];
    sortLibrary(BLOCK_LIBRARY, { ...DEFAULT_PREFS, sortMode: "popular" });
    expect(BLOCK_LIBRARY).toEqual(original);
  });
});

describe("recordBlockAdd", () => {
  it("increments usage count for a new block type", () => {
    const next = recordBlockAdd(DEFAULT_PREFS, "link");
    expect(next.usage.link).toBe(1);
  });

  it("increments usage count for repeated adds", () => {
    const once = recordBlockAdd(DEFAULT_PREFS, "link");
    const twice = recordBlockAdd(once, "link");
    expect(twice.usage.link).toBe(2);
  });

  it("sets lastUsed to approximately now", () => {
    const before = Date.now();
    const next = recordBlockAdd(DEFAULT_PREFS, "text");
    expect(next.lastUsed.text).toBeGreaterThanOrEqual(before);
  });

  it("does not mutate the original prefs", () => {
    recordBlockAdd(DEFAULT_PREFS, "link");
    expect(DEFAULT_PREFS.usage.link).toBeUndefined();
  });
});

describe("loadLocalPrefs / saveLocalPrefs (localStorage)", () => {
  const profileId = "test-profile-123";

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("loadLocalPrefs returns null when nothing stored", () => {
    expect(loadLocalPrefs(profileId)).toBeNull();
  });

  it("round-trips prefs through localStorage", () => {
    const prefs = { ...DEFAULT_PREFS, persona: "creator" as Persona };
    saveLocalPrefs(profileId, prefs);
    const loaded = loadLocalPrefs(profileId);
    expect(loaded?.persona).toBe("creator");
  });

  it("different profileIds use different storage keys", () => {
    saveLocalPrefs("profile-A", { ...DEFAULT_PREFS, persona: "creator" as Persona });
    saveLocalPrefs("profile-B", { ...DEFAULT_PREFS, persona: "web3" as Persona });
    expect(loadLocalPrefs("profile-A")?.persona).toBe("creator");
    expect(loadLocalPrefs("profile-B")?.persona).toBe("web3");
  });
});
