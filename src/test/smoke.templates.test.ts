import { describe, it, expect } from "vitest";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  FEATURED_TEMPLATES,
  FEATURED_TEMPLATE_IDS,
  STARTER_TO_TEMPLATE,
  getTemplate,
} from "@/lib/templates";
import { BLOCK_LIBRARY } from "@/lib/blocks";

const VALID_BLOCK_TYPES = new Set(BLOCK_LIBRARY.map((b) => b.type));
const VALID_CATEGORIES = new Set(["starter", "creator", "web3", "professional", "personal", "business"]);

describe("TEMPLATES catalog", () => {
  it("has at least 20 templates", () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(20);
  });

  it("every template has a unique id", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template has non-empty name, tagline, and emoji", () => {
    for (const t of TEMPLATES) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.tagline.length).toBeGreaterThan(0);
      expect(t.emoji.length).toBeGreaterThan(0);
    }
  });

  it("every template has a valid category", () => {
    for (const t of TEMPLATES) {
      expect(VALID_CATEGORIES.has(t.category)).toBe(true);
    }
  });

  it("every template has at least 1 block", () => {
    for (const t of TEMPLATES) {
      expect(t.blocks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every template block uses a known BlockType", () => {
    for (const template of TEMPLATES) {
      for (const block of template.blocks) {
        expect(VALID_BLOCK_TYPES.has(block.type)).toBe(true);
      }
    }
  });

  it("every template has a valid theme with background and font", () => {
    const validBgs = new Set(["aurora", "midnight", "sunset", "mint", "lavender", "noir"]);
    const validFonts = new Set(["space-grotesk", "inter", "playfair", "jetbrains", "outfit"]);
    for (const t of TEMPLATES) {
      expect(validBgs.has(t.theme.background)).toBe(true);
      expect(validFonts.has(t.theme.font)).toBe(true);
      expect(t.theme.accentHue).toBeGreaterThanOrEqual(0);
      expect(t.theme.accentHue).toBeLessThanOrEqual(360);
    }
  });
});

describe("getTemplate", () => {
  it("returns the correct template by id", () => {
    const first = TEMPLATES[0];
    const found = getTemplate(first.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it("returns undefined for an unknown id", () => {
    expect(getTemplate("does-not-exist-ever")).toBeUndefined();
  });

  it("can find every template by id", () => {
    for (const t of TEMPLATES) {
      expect(getTemplate(t.id)).toBeDefined();
    }
  });
});

describe("TEMPLATE_CATEGORIES", () => {
  it("first entry is 'all'", () => {
    expect(TEMPLATE_CATEGORIES[0].id).toBe("all");
  });

  it("all entries have non-empty labels", () => {
    for (const cat of TEMPLATE_CATEGORIES) {
      expect(cat.label).toBeTruthy();
    }
  });

  it("covers starter, creator, professional, business, personal, web3", () => {
    const ids = TEMPLATE_CATEGORIES.map((c) => c.id);
    expect(ids).toContain("starter");
    expect(ids).toContain("creator");
    expect(ids).toContain("professional");
    expect(ids).toContain("business");
    expect(ids).toContain("personal");
    expect(ids).toContain("web3");
  });
});

describe("FEATURED_TEMPLATES", () => {
  it("has at least 5 entries", () => {
    expect(FEATURED_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });

  it("every featured template references a valid template id", () => {
    for (const ft of FEATURED_TEMPLATES) {
      expect(getTemplate(ft.id)).toBeDefined();
    }
  });

  it("every featured template has name, persona, and outcome", () => {
    for (const ft of FEATURED_TEMPLATES) {
      expect(ft.name).toBeTruthy();
      expect(ft.persona).toBeTruthy();
      expect(ft.outcome).toBeTruthy();
    }
  });
});

describe("FEATURED_TEMPLATE_IDS", () => {
  it("is a Set matching the FEATURED_TEMPLATES ids", () => {
    for (const ft of FEATURED_TEMPLATES) {
      expect(FEATURED_TEMPLATE_IDS.has(ft.id)).toBe(true);
    }
    expect(FEATURED_TEMPLATE_IDS.size).toBe(FEATURED_TEMPLATES.length);
  });
});

describe("STARTER_TO_TEMPLATE mapping", () => {
  it("every starter key maps to an existing template", () => {
    for (const [, templateId] of Object.entries(STARTER_TO_TEMPLATE)) {
      expect(getTemplate(templateId)).toBeDefined();
    }
  });

  it("includes the essential starter", () => {
    expect(STARTER_TO_TEMPLATE.essential).toBe("essential-rewards");
  });
});
