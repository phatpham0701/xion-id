export type ProfileTheme = {
  preset: string;
  background: "aurora" | "midnight" | "sunset" | "mint" | "lavender" | "noir";
  font: "space-grotesk" | "inter" | "playfair" | "jetbrains" | "outfit";
  buttonShape: "pill" | "rounded" | "square" | "soft";
  buttonStyle: "glass" | "solid" | "outline" | "gradient";
  accentHue: number; // 0-360
};

export const DEFAULT_THEME: ProfileTheme = {
  preset: "aurora",
  background: "aurora",
  font: "space-grotesk",
  buttonShape: "rounded",
  buttonStyle: "glass",
  accentHue: 152,
};

export const BACKGROUNDS: Record<ProfileTheme["background"], { label: string; css: string; emoji: string }> = {
  aurora: {
    label: "Aurora",
    emoji: "🌌",
    css: `radial-gradient(ellipse 80% 60% at 20% 0%, hsl(258 90% 60% / 0.45), transparent 60%),
          radial-gradient(ellipse 70% 50% at 80% 20%, hsl(152 76% 50% / 0.35), transparent 60%),
          radial-gradient(ellipse 100% 80% at 50% 100%, hsl(218 80% 40% / 0.45), transparent 70%),
          linear-gradient(180deg, hsl(232 47% 10%), hsl(218 56% 14%))`,
  },
  midnight: {
    label: "Midnight",
    emoji: "🌃",
    css: `radial-gradient(ellipse at top, hsl(232 60% 20%), hsl(232 70% 6%))`,
  },
  sunset: {
    label: "Sunset",
    emoji: "🌅",
    css: `linear-gradient(180deg, hsl(15 80% 22%), hsl(330 60% 18%) 50%, hsl(280 70% 15%))`,
  },
  mint: {
    label: "Mint dream",
    emoji: "🌿",
    css: `radial-gradient(ellipse at top, hsl(160 60% 25%), hsl(180 70% 10%))`,
  },
  lavender: {
    label: "Lavender",
    emoji: "💜",
    css: `radial-gradient(ellipse at top, hsl(270 60% 30%), hsl(250 70% 12%))`,
  },
  noir: {
    label: "Noir",
    emoji: "⚫",
    css: `linear-gradient(180deg, hsl(0 0% 8%), hsl(0 0% 4%))`,
  },
};

export const FONTS: Record<ProfileTheme["font"], { label: string; family: string }> = {
  "space-grotesk": { label: "Space Grotesk", family: '"Space Grotesk", system-ui, sans-serif' },
  inter: { label: "Inter", family: '"Inter", "DM Sans", system-ui, sans-serif' },
  playfair: { label: "Playfair", family: '"Playfair Display", Georgia, serif' },
  jetbrains: { label: "JetBrains Mono", family: '"JetBrains Mono", monospace' },
  outfit: { label: "Outfit", family: '"Outfit", system-ui, sans-serif' },
};

export const BUTTON_SHAPES: Record<ProfileTheme["buttonShape"], { label: string; radius: string }> = {
  pill: { label: "Pill", radius: "9999px" },
  rounded: { label: "Rounded", radius: "1rem" },
  soft: { label: "Soft", radius: "0.5rem" },
  square: { label: "Square", radius: "0.125rem" },
};

export const BUTTON_STYLES: Record<ProfileTheme["buttonStyle"], { label: string }> = {
  glass: { label: "Glass" },
  solid: { label: "Solid" },
  outline: { label: "Outline" },
  gradient: { label: "Gradient" },
};

export const themeFromJson = (raw: unknown): ProfileTheme => {
  const t = (raw && typeof raw === "object" ? raw : {}) as Partial<ProfileTheme>;
  return {
    preset: t.preset ?? DEFAULT_THEME.preset,
    background: (t.background as ProfileTheme["background"]) ?? DEFAULT_THEME.background,
    font: (t.font as ProfileTheme["font"]) ?? DEFAULT_THEME.font,
    buttonShape: (t.buttonShape as ProfileTheme["buttonShape"]) ?? DEFAULT_THEME.buttonShape,
    buttonStyle: (t.buttonStyle as ProfileTheme["buttonStyle"]) ?? DEFAULT_THEME.buttonStyle,
    accentHue: typeof t.accentHue === "number" ? t.accentHue : DEFAULT_THEME.accentHue,
  };
};

export const themeStyleVars = (theme: ProfileTheme): React.CSSProperties => ({
  ["--theme-bg" as never]: BACKGROUNDS[theme.background].css,
  ["--theme-font" as never]: FONTS[theme.font].family,
  ["--theme-radius" as never]: BUTTON_SHAPES[theme.buttonShape].radius,
  ["--theme-accent" as never]: `${theme.accentHue} 76% 57%`,
  ["--theme-accent-glow" as never]: `${theme.accentHue} 80% 70%`,
});
