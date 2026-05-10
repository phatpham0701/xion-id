import { describe, it, expect } from "vitest";
import { validateBlockConfig, summarizeIssues } from "@/lib/blockValidation";

describe("validateBlockConfig — link", () => {
  it("returns no issues for a valid link block", () => {
    const issues = validateBlockConfig("link", { title: "My link", url: "https://example.com" });
    expect(issues).toHaveLength(0);
  });

  it("reports error when url is missing", () => {
    const issues = validateBlockConfig("link", { title: "My link", url: "" });
    expect(issues.some((i) => i.field === "url" && i.severity === "error")).toBe(true);
  });

  it("reports warning when title is missing", () => {
    const issues = validateBlockConfig("link", { title: "", url: "https://example.com" });
    expect(issues.some((i) => i.field === "title" && i.severity === "warning")).toBe(true);
  });
});

describe("validateBlockConfig — heading", () => {
  it("returns no issues for non-empty heading", () => {
    expect(validateBlockConfig("heading", { text: "About me" })).toHaveLength(0);
  });

  it("returns error for empty heading", () => {
    const issues = validateBlockConfig("heading", { text: "" });
    expect(issues[0].severity).toBe("error");
  });
});

describe("validateBlockConfig — text", () => {
  it("returns no issues for non-empty paragraph", () => {
    expect(validateBlockConfig("text", { text: "Hello world" })).toHaveLength(0);
  });

  it("returns error for empty paragraph", () => {
    const issues = validateBlockConfig("text", { text: "" });
    expect(issues[0].severity).toBe("error");
  });
});

describe("validateBlockConfig — avatar", () => {
  it("returns warnings when name and subtitle are empty", () => {
    const issues = validateBlockConfig("avatar", { name: "", subtitle: "" });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.every((i) => i.severity === "warning")).toBe(true);
  });

  it("returns no issues when name and subtitle are provided", () => {
    expect(validateBlockConfig("avatar", { name: "Alex", subtitle: "@alex" })).toHaveLength(0);
  });
});

describe("validateBlockConfig — social", () => {
  it("returns error when items is empty", () => {
    const issues = validateBlockConfig("social", { items: [] });
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("returns error when all URLs are empty", () => {
    const issues = validateBlockConfig("social", {
      items: [{ platform: "twitter", url: "" }, { platform: "github", url: "" }],
    });
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("returns warning when only some URLs are empty", () => {
    const issues = validateBlockConfig("social", {
      items: [
        { platform: "twitter", url: "https://twitter.com/x" },
        { platform: "github", url: "" },
      ],
    });
    expect(issues.some((i) => i.severity === "warning")).toBe(true);
  });

  it("returns no issues when all URLs are valid", () => {
    const issues = validateBlockConfig("social", {
      items: [
        { platform: "twitter", url: "https://twitter.com/x" },
        { platform: "github", url: "https://github.com/x" },
      ],
    });
    expect(issues).toHaveLength(0);
  });
});

describe("validateBlockConfig — image", () => {
  it("returns error for missing URL", () => {
    const issues = validateBlockConfig("image", { url: "", alt: "desc" });
    expect(issues.some((i) => i.field === "url" && i.severity === "error")).toBe(true);
  });

  it("returns warning for missing alt text", () => {
    const issues = validateBlockConfig("image", { url: "https://example.com/img.png", alt: "" });
    expect(issues.some((i) => i.field === "alt" && i.severity === "warning")).toBe(true);
  });

  it("returns no issues for valid image block", () => {
    expect(validateBlockConfig("image", { url: "https://example.com/img.png", alt: "A photo" })).toHaveLength(0);
  });
});

describe("validateBlockConfig — video_embed", () => {
  it("returns error for missing URL", () => {
    const issues = validateBlockConfig("video_embed", { url: "" });
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("returns error for unsupported host", () => {
    const issues = validateBlockConfig("video_embed", { url: "https://dailymotion.com/video/123" });
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("returns no issues for youtube URL", () => {
    expect(validateBlockConfig("video_embed", { url: "https://www.youtube.com/watch?v=abc" })).toHaveLength(0);
  });

  it("returns no issues for vimeo URL", () => {
    expect(validateBlockConfig("video_embed", { url: "https://vimeo.com/12345" })).toHaveLength(0);
  });
});

describe("validateBlockConfig — music_embed", () => {
  it("returns error for missing URL", () => {
    const issues = validateBlockConfig("music_embed", { url: "" });
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("returns error for unsupported host", () => {
    const issues = validateBlockConfig("music_embed", { url: "https://apple.com/music" });
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("returns no issues for spotify URL", () => {
    expect(validateBlockConfig("music_embed", { url: "https://open.spotify.com/track/abc" })).toHaveLength(0);
  });

  it("returns no issues for soundcloud URL", () => {
    expect(validateBlockConfig("music_embed", { url: "https://soundcloud.com/artist/track" })).toHaveLength(0);
  });
});

describe("validateBlockConfig — wallet", () => {
  it("returns error when address is empty", () => {
    const issues = validateBlockConfig("wallet", { address: "", label: "My wallet" });
    expect(issues.some((i) => i.field === "address" && i.severity === "error")).toBe(true);
  });

  it("returns warning when address is not a XION address", () => {
    const issues = validateBlockConfig("wallet", { address: "0xdeadbeef", label: "ETH wallet" });
    expect(issues.some((i) => i.field === "address" && i.severity === "warning")).toBe(true);
  });

  it("returns no errors for valid XION address", () => {
    const issues = validateBlockConfig("wallet", {
      address: "xion1qf3w4cqkmd6lk2k7l3v5pjkz8m9hxn2u4yapr0",
      label: "My wallet",
    });
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });
});

describe("validateBlockConfig — nft", () => {
  it("returns errors when contract and tokenId are empty", () => {
    const issues = validateBlockConfig("nft", { contract: "", tokenId: "", title: "" });
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it("returns no errors when all fields are filled", () => {
    const issues = validateBlockConfig("nft", { contract: "xion1abc", tokenId: "1", title: "My NFT" });
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });
});

describe("validateBlockConfig — token_balance", () => {
  it("returns error when token is empty", () => {
    const issues = validateBlockConfig("token_balance", { token: "", label: "" });
    expect(issues.some((i) => i.field === "token" && i.severity === "error")).toBe(true);
  });

  it("returns no errors for valid token_balance", () => {
    const issues = validateBlockConfig("token_balance", { token: "XION", label: "Treasury" });
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });
});

describe("validateBlockConfig — tip_jar", () => {
  it("returns error when currency is empty", () => {
    const issues = validateBlockConfig("tip_jar", { title: "Tip me", currency: "" });
    expect(issues.some((i) => i.field === "currency" && i.severity === "error")).toBe(true);
  });

  it("returns no errors for valid tip_jar", () => {
    expect(validateBlockConfig("tip_jar", { title: "Buy me a coffee", currency: "XION" })).toHaveLength(0);
  });
});

describe("validateBlockConfig — calendar", () => {
  it("returns error when URL is missing", () => {
    const issues = validateBlockConfig("calendar", { title: "Book a call", url: "" });
    expect(issues.some((i) => i.field === "url" && i.severity === "error")).toBe(true);
  });

  it("returns no errors for valid calendar block", () => {
    expect(validateBlockConfig("calendar", { title: "Book a call", url: "https://cal.com/me" })).toHaveLength(0);
  });
});

describe("validateBlockConfig — contact_form", () => {
  it("returns warning when title is empty", () => {
    const issues = validateBlockConfig("contact_form", { title: "" });
    expect(issues.some((i) => i.field === "title" && i.severity === "warning")).toBe(true);
  });

  it("returns no issues for valid contact_form", () => {
    expect(validateBlockConfig("contact_form", { title: "Get in touch" })).toHaveLength(0);
  });
});

describe("summarizeIssues", () => {
  it("correctly counts errors, warnings, and totals", () => {
    const issues = validateBlockConfig("link", { title: "", url: "" });
    const summary = summarizeIssues(issues);
    expect(summary.errors).toBeGreaterThanOrEqual(1);
    expect(summary.total).toBe(issues.length);
    expect(summary.total).toBe(summary.errors + summary.warnings);
  });

  it("returns zero counts for empty issues", () => {
    const summary = summarizeIssues([]);
    expect(summary.errors).toBe(0);
    expect(summary.warnings).toBe(0);
    expect(summary.total).toBe(0);
  });
});
