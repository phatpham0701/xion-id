import { describe, it, expect } from "vitest";
import {
  BLOCK_LIBRARY,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  getBlockMeta,
  type BlockType,
} from "@/lib/blocks";

const ALL_TYPES: BlockType[] = [
  "link", "heading", "text", "avatar", "social",
  "wallet", "nft", "nft_gallery", "token_balance",
  "image", "video_embed", "music_embed",
  "tip_jar", "contact_form", "calendar",
];

describe("BLOCK_LIBRARY catalog", () => {
  it("has exactly 15 blocks (one per BlockType)", () => {
    expect(BLOCK_LIBRARY).toHaveLength(15);
  });

  it("every block type is present exactly once", () => {
    const types = BLOCK_LIBRARY.map((b) => b.type);
    expect(new Set(types).size).toBe(types.length);
    for (const t of ALL_TYPES) {
      expect(types).toContain(t);
    }
  });

  it("every block has non-empty label, description, and useCase", () => {
    for (const b of BLOCK_LIBRARY) {
      expect(b.label.length).toBeGreaterThan(0);
      expect(b.description.length).toBeGreaterThan(0);
      expect(b.useCase.length).toBeGreaterThan(0);
    }
  });

  it("every block has a valid category", () => {
    const validCategories = new Set(["basic", "media", "web3", "advanced"]);
    for (const b of BLOCK_LIBRARY) {
      expect(validCategories.has(b.category)).toBe(true);
    }
  });

  it("every block has defaultConfig and previewConfig as objects", () => {
    for (const b of BLOCK_LIBRARY) {
      expect(typeof b.defaultConfig).toBe("object");
      expect(typeof b.previewConfig).toBe("object");
    }
  });

  it("optional badge field, when present, is one of the allowed values", () => {
    const allowed = new Set(["Popular", "Essential", "Web3", "Pro"]);
    for (const b of BLOCK_LIBRARY) {
      if (b.badge !== undefined) {
        expect(allowed.has(b.badge)).toBe(true);
      }
    }
  });
});

describe("getBlockMeta", () => {
  it("returns the correct block meta for each type", () => {
    for (const t of ALL_TYPES) {
      const meta = getBlockMeta(t);
      expect(meta).toBeDefined();
      expect(meta.type).toBe(t);
    }
  });

  it("wallet block has web3 category", () => {
    expect(getBlockMeta("wallet").category).toBe("web3");
  });

  it("link block is marked Popular", () => {
    expect(getBlockMeta("link").badge).toBe("Popular");
  });

  it("avatar block is marked Essential", () => {
    expect(getBlockMeta("avatar").badge).toBe("Essential");
  });
});

describe("CATEGORY_LABELS and CATEGORY_DESCRIPTIONS", () => {
  it("covers all 4 categories", () => {
    const cats = ["basic", "media", "web3", "advanced"] as const;
    for (const c of cats) {
      expect(CATEGORY_LABELS[c]).toBeTruthy();
      expect(CATEGORY_DESCRIPTIONS[c]).toBeTruthy();
    }
  });
});
