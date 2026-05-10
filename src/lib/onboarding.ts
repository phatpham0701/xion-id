import type { EditableProfile } from "@/components/dashboard/ProfileEditorCard";

/**
 * Returns true only when the profile row exists and contains a non-empty username.
 * Must not read localStorage, demoMode state, or any client-side flag — the
 * database is the source of truth for onboarding completion.
 */
export const hasCompleteProfile = (profile: EditableProfile | null | undefined): boolean => {
  if (!profile) return false;
  return typeof profile.username === "string" && profile.username.trim().length > 0;
};

/**
 * Returns true when an existing authenticated user still needs to complete
 * onboarding (i.e. their profile row has no username yet).
 *
 * Returns false when:
 *   - profile is null or undefined (missing-data state — let the Dashboard's
 *     "Profile not found" fallback handle it, do not trigger destructive onboarding)
 *   - profile.username is a non-empty, non-whitespace string
 */
export const needsOnboarding = (profile: EditableProfile | null | undefined): boolean => {
  if (!profile) return false;
  return !hasCompleteProfile(profile);
};
