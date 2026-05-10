export type OnboardingAvatar = {
  avatar_id: string;
  sort_order: number;
  slug: string;
  category: string;
  gender_variant: "male" | "female";
  filename: string;
  src: string;
  ui_label: string;
  ui_subtitle: string;
  is_default: boolean;
  tagline_key: string;
  legacyEmoji?: string;
};

type AvatarSeed = {
  category: string;
  label: string;
  subtitle: string;
  legacyByGender?: Partial<Record<OnboardingAvatar["gender_variant"], string>>;
};

const AVATAR_SEEDS: AvatarSeed[] = [
  { category: "runner", label: "Runner", subtitle: "Endurance signal", legacyByGender: { male: "🏃" } },
  { category: "strength", label: "Strength", subtitle: "Discipline signal", legacyByGender: { male: "🏋️" } },
  { category: "cyclist", label: "Cyclist", subtitle: "Aerobic engine", legacyByGender: { male: "🚴" } },
  { category: "swimmer", label: "Swimmer", subtitle: "Water discipline", legacyByGender: { male: "🏊" } },
  { category: "recovery", label: "Recovery", subtitle: "Calm consistency", legacyByGender: { female: "🧘" } },
  { category: "hybrid", label: "Hybrid", subtitle: "Multi-sport identity", legacyByGender: { male: "⚡" } },
  { category: "wellness", label: "Wellness", subtitle: "Longevity rhythm", legacyByGender: { male: "🛡️" } },
  { category: "gear", label: "Gear", subtitle: "Equipment lifestyle" },
  { category: "nutrition", label: "Nutrition", subtitle: "Recovery stack" },
  { category: "creator", label: "Creator", subtitle: "Lifestyle media" },
  { category: "community", label: "Community", subtitle: "Club leadership" },
  { category: "elite", label: "Elite", subtitle: "Ambassador rank", legacyByGender: { male: "🥇" } },
];

const GENDER_VARIANTS: OnboardingAvatar["gender_variant"][] = ["male", "female"];

export const ONBOARDING_AVATARS: OnboardingAvatar[] = AVATAR_SEEDS.flatMap((seed, seedIndex) =>
  GENDER_VARIANTS.map((genderVariant, genderIndex) => {
    const avatarId = `${seed.category}-${genderVariant}`;
    const filename = `xionid-avatar-${avatarId}.webp`;

    return {
      avatar_id: avatarId,
      sort_order: seedIndex * GENDER_VARIANTS.length + genderIndex + 1,
      slug: avatarId,
      category: seed.category,
      gender_variant: genderVariant,
      filename,
      src: `/avatars/onboarding/${filename}`,
      ui_label: seed.label,
      ui_subtitle: seed.subtitle,
      is_default: avatarId === "runner-male",
      tagline_key: `onboarding.avatar.${avatarId}`,
      legacyEmoji: seed.legacyByGender?.[genderVariant],
    };
  }),
);

export const DEFAULT_ONBOARDING_AVATAR_ID = "runner-male";

const AVATARS_BY_ID = new Map(ONBOARDING_AVATARS.map((avatar) => [avatar.avatar_id, avatar]));
const AVATARS_BY_SRC = new Map(ONBOARDING_AVATARS.map((avatar) => [avatar.src, avatar]));
const AVATARS_BY_FILENAME = new Map(ONBOARDING_AVATARS.map((avatar) => [avatar.filename, avatar]));
const LEGACY_EMOJI_TO_ID = new Map(
  ONBOARDING_AVATARS.flatMap((avatar) => (avatar.legacyEmoji ? [[avatar.legacyEmoji, avatar.avatar_id] as const] : [])),
);

const INTEREST_TO_AVATAR_ID: Record<string, string> = {
  Running: "runner-male",
  "Gym / Strength": "strength-male",
  Strength: "strength-male",
  Cycling: "cyclist-male",
  Swimming: "swimmer-male",
  "Hybrid Athlete": "hybrid-male",
  Hybrid: "hybrid-male",
  "Marathon / Events": "runner-female",
  Recovery: "recovery-female",
  Wellness: "wellness-male",
  "Sports Gear": "gear-male",
  Supplements: "nutrition-male",
};

export const getOnboardingAvatarById = (id?: string | null): OnboardingAvatar => {
  if (!id) return AVATARS_BY_ID.get(DEFAULT_ONBOARDING_AVATAR_ID)!;
  return AVATARS_BY_ID.get(id) ?? AVATARS_BY_ID.get(DEFAULT_ONBOARDING_AVATAR_ID)!;
};

export const getOnboardingAvatarUrl = (id?: string | null): string => getOnboardingAvatarById(id).src;

export const getOnboardingAvatarIdFromUrl = (value?: string | null): string => {
  if (!value || typeof value !== "string") return DEFAULT_ONBOARDING_AVATAR_ID;

  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_ONBOARDING_AVATAR_ID;

  const byId = AVATARS_BY_ID.get(trimmed);
  if (byId) return byId.avatar_id;

  const bySrc = AVATARS_BY_SRC.get(trimmed);
  if (bySrc) return bySrc.avatar_id;

  const filename = trimmed.split(/[/?#]/).find((part) => AVATARS_BY_FILENAME.has(part));
  if (filename) return AVATARS_BY_FILENAME.get(filename)!.avatar_id;

  for (const [emoji, avatarId] of LEGACY_EMOJI_TO_ID) {
    if (trimmed.includes(emoji) || trimmed.includes(encodeURIComponent(emoji))) return avatarId;
  }

  return DEFAULT_ONBOARDING_AVATAR_ID;
};

export const getDefaultAvatarIdForInterest = (interest?: string | null): string => {
  if (!interest) return DEFAULT_ONBOARDING_AVATAR_ID;
  return INTEREST_TO_AVATAR_ID[interest] ?? DEFAULT_ONBOARDING_AVATAR_ID;
};
