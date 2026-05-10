import { describe, it, expect } from "vitest";
import {
  DEFAULT_THEME,
  BACKGROUNDS,
  FONTS,
  BUTTON_SHAPES,
  BUTTON_STYLES,
  themeFromJson,
  themeStyleVars,
  type ProfileTheme,
} from "@/lib/theme";

describe("DEFAULT_THEME", () => {
  it("has all required fields", () => {
    expect(DEFAULT_THEME.preset).toBeTruthy();
    expect(DEFAULT_THEME.background).toBeTruthy();
    expect(DEFAULT_THEME.font).toBeTruthy();
    expect(DEFAULT_THEME.buttonShape).toBeTruthy();
    expect(DEFAULT_THEME.buttonStyle).toBeTruthy();
    expect(typeof DEFAULT_THEME.accentHue).toBe("number");
  });

  it("accentHue is in 0-360 range", () => {
    expect(DEFAULT_THEME.accentHue).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_THEME.accentHue).toBeLessThanOrEqual(360);
  });
});

describe("BACKGROUNDS", () => {
  const expectedBgs = ["aurora", "midnight", "sunset", "mint", "lavender", "noir"] as const;

  it("covers all required backgrounds", () => {
    for (const key of expectedBgs) {
      expect(BACKGROUNDS[key]).toBeDefined();
    }
  });

  it("every background has label, css, and emoji", () => {
    for (const key of expectedBgs) {
      expect(BACKGROUNDS[key].label).toBeTruthy();
      expect(BACKGROUNDS[key].css).toBeTruthy();
      expect(BACKGROUNDS[key].emoji).toBeTruthy();
    }
  });
});

describe("FONTS", () => {
  const expectedFonts = ["space-grotesk", "inter", "playfair", "jetbrains", "outfit"] as const;

  it("covers all required fonts", () => {
    for (const key of expectedFonts) {
      expect(FONTS[key]).toBeDefined();
    }
  });

  it("every font has label and family", () => {
    for (const key of expectedFonts) {
      expect(FONTS[key].label).toBeTruthy();
      expect(FONTS[key].family).toBeTruthy();
    }
  });
});

describe("BUTTON_SHAPES", () => {
  const expectedShapes = ["pill", "rounded", "square", "soft"] as const;

  it("covers all required button shapes", () => {
    for (const key of expectedShapes) {
      expect(BUTTON_SHAPES[key]).toBeDefined();
    }
  });

  it("every shape has label and radius", () => {
    for (const key of expectedShapes) {
      expect(BUTTON_SHAPES[key].label).toBeTruthy();
      expect(BUTTON_SHAPES[key].radius).toBeTruthy();
    }
  });
});

describe("BUTTON_STYLES", () => {
  const expectedStyles = ["glass", "solid", "outline", "gradient"] as const;

  it("covers all required button styles", () => {
    for (const key of expectedStyles) {
      expect(BUTTON_STYLES[key]).toBeDefined();
    }
  });

  it("every style has a label", () => {
    for (const key of expectedStyles) {
      expect(BUTTON_STYLES[key].label).toBeTruthy();
    }
  });
});

describe("themeFromJson", () => {
  it("returns DEFAULT_THEME for null input", () => {
    const theme = themeFromJson(null);
    expect(theme).toEqual(DEFAULT_THEME);
  });

  it("returns DEFAULT_THEME for non-object", () => {
    expect(themeFromJson("bad")).toEqual(DEFAULT_THEME);
    expect(themeFromJson(42)).toEqual(DEFAULT_THEME);
  });

  it("returns DEFAULT_THEME for empty object", () => {
    expect(themeFromJson({})).toEqual(DEFAULT_THEME);
  });

  it("picks up overrides from a partial theme", () => {
    const theme = themeFromJson({ background: "noir", font: "inter" });
    expect(theme.background).toBe("noir");
    expect(theme.font).toBe("inter");
    expect(theme.buttonShape).toBe(DEFAULT_THEME.buttonShape);
  });

  it("preserves numeric accentHue", () => {
    const theme = themeFromJson({ accentHue: 200 });
    expect(theme.accentHue).toBe(200);
  });

  it("falls back to default accentHue for non-number", () => {
    const theme = themeFromJson({ accentHue: "not-a-number" });
    expect(theme.accentHue).toBe(DEFAULT_THEME.accentHue);
  });
});

describe("themeStyleVars", () => {
  it("returns an object with 5 CSS custom properties", () => {
    const vars = themeStyleVars(DEFAULT_THEME);
    const keys = Object.keys(vars);
    expect(keys).toHaveLength(5);
    expect(keys).toContain("--theme-bg");
    expect(keys).toContain("--theme-font");
    expect(keys).toContain("--theme-radius");
    expect(keys).toContain("--theme-accent");
    expect(keys).toContain("--theme-accent-glow");
  });

  it("--theme-bg contains the background CSS", () => {
    const vars = themeStyleVars(DEFAULT_THEME) as Record<string, string>;
    expect(vars["--theme-bg"]).toBe(BACKGROUNDS[DEFAULT_THEME.background].css);
  });

  it("--theme-font contains the font family", () => {
    const vars = themeStyleVars(DEFAULT_THEME) as Record<string, string>;
    expect(vars["--theme-font"]).toBe(FONTS[DEFAULT_THEME.font].family);
  });

  it("--theme-radius contains the button shape radius", () => {
    const vars = themeStyleVars(DEFAULT_THEME) as Record<string, string>;
    expect(vars["--theme-radius"]).toBe(BUTTON_SHAPES[DEFAULT_THEME.buttonShape].radius);
  });
});
