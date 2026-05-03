/**
 * XIONID — public badge persistence on `profiles.settings`.
 *
 * The dashboard's badge system runs in demo localStorage. To make
 * "Show on profile" actually appear on the public /:username page, we
 * mirror selected badges into `profiles.settings.xionidPublicBadges`.
 *
 * No DB migration required — `settings` is an existing JSON field.
 */

import { supabase } from "@/integrations/supabase/client";
import type { BadgeCategory, BadgeTier, DemoBadge } from "@/lib/demoMode";

export type PublicProfileBadge = {
  id: string;
  kind: string;
  label: string;
  emoji: string;
  description?: string;
  tierName: BadgeTier;
  category: BadgeCategory;
  verifiedAt: string;
  featured: boolean;
  hidden: boolean;
  privacyNote?: string;
};

export type PublicBadgesSettings = {
  enabled: boolean;
  badges: PublicProfileBadge[];
};

const KEY = "xionidPublicBadges";

type SettingsLike = Record<string, unknown> | null | undefined;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const getPublicBadgesFromSettings = (settings: SettingsLike): PublicBadgesSettings => {
  if (!isObject(settings)) return { enabled: false, badges: [] };
  const raw = settings[KEY];
  if (!isObject(raw)) return { enabled: false, badges: [] };
  const badges = Array.isArray(raw.badges) ? (raw.badges as PublicProfileBadge[]) : [];
  return { enabled: !!raw.enabled, badges };
};

const fromDemo = (b: DemoBadge): PublicProfileBadge => ({
  id: b.id,
  kind: b.kind,
  label: b.label,
  emoji: b.emoji,
  description: b.description,
  tierName: b.tierName,
  category: b.category,
  verifiedAt: b.verifiedAt,
  featured: true,
  hidden: false,
  privacyNote: b.privacyNote,
});

export const mergeBadgeIntoPublicSettings = (
  settings: SettingsLike,
  badge: DemoBadge | PublicProfileBadge,
  options?: { featured?: boolean; hidden?: boolean },
): Record<string, unknown> => {
  const base = isObject(settings) ? { ...settings } : {};
  const current = getPublicBadgesFromSettings(base);
  const incoming: PublicProfileBadge = "tierName" in badge && "label" in badge
    ? { ...fromDemo(badge as DemoBadge), ...options }
    : { ...(badge as PublicProfileBadge), ...options };
  // Replace by id, otherwise by kind, otherwise prepend.
  const idx = current.badges.findIndex((x) => x.id === incoming.id || x.kind === incoming.kind);
  const next = [...current.badges];
  if (idx >= 0) next[idx] = { ...next[idx], ...incoming };
  else next.unshift(incoming);
  base[KEY] = { enabled: true, badges: next } satisfies PublicBadgesSettings;
  return base;
};

export const removeBadgeFromPublicSettings = (
  settings: SettingsLike,
  badgeId: string,
): Record<string, unknown> => {
  const base = isObject(settings) ? { ...settings } : {};
  const current = getPublicBadgesFromSettings(base);
  const next = current.badges.filter((b) => b.id !== badgeId);
  base[KEY] = { enabled: next.some((b) => b.featured && !b.hidden), badges: next };
  return base;
};

export const setBadgeVisibilityInPublicSettings = (
  settings: SettingsLike,
  badgeId: string,
  patch: { featured?: boolean; hidden?: boolean },
): Record<string, unknown> => {
  const base = isObject(settings) ? { ...settings } : {};
  const current = getPublicBadgesFromSettings(base);
  const next = current.badges.map((b) =>
    b.id === badgeId ? { ...b, ...patch } : b,
  );
  base[KEY] = {
    enabled: next.some((b) => b.featured && !b.hidden),
    badges: next,
  };
  return base;
};

// ─────────────────────────────────────────────────────────────
// Supabase helpers — current authed user only
// ─────────────────────────────────────────────────────────────

const fetchOwnProfile = async () => {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, settings")
    .eq("user_id", uid)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const writeSettings = async (profileId: string, settings: Record<string, unknown>) => {
  const { error } = await supabase
    .from("profiles")
    .update({ settings: settings as never })
    .eq("id", profileId);
  if (error) throw error;
};

/** Persist a freshly-issued / featured badge to the user's public profile. */
export const persistBadgeToPublicProfile = async (
  badge: DemoBadge,
  patch: { featured?: boolean; hidden?: boolean } = { featured: true, hidden: false },
): Promise<void> => {
  const profile = await fetchOwnProfile();
  if (!profile) return;
  const next = mergeBadgeIntoPublicSettings(
    profile.settings as SettingsLike,
    badge,
    patch,
  );
  await writeSettings(profile.id, next);
};

export const persistBadgeVisibility = async (
  badge: DemoBadge,
  patch: { featured?: boolean; hidden?: boolean },
): Promise<void> => {
  const profile = await fetchOwnProfile();
  if (!profile) return;
  // Merge first (so the badge exists), then apply visibility patch.
  const merged = mergeBadgeIntoPublicSettings(profile.settings as SettingsLike, badge);
  const next = setBadgeVisibilityInPublicSettings(merged, badge.id, patch);
  await writeSettings(profile.id, next);
};

export const removeBadgeFromPublicProfile = async (badgeId: string): Promise<void> => {
  const profile = await fetchOwnProfile();
  if (!profile) return;
  const next = removeBadgeFromPublicSettings(profile.settings as SettingsLike, badgeId);
  await writeSettings(profile.id, next);
};
