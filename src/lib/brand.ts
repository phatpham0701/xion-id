// Centralized brand constants — change here to rebrand globally.
export const BRAND = {
  name: "XionID",
  // The two-tone wordmark splits at this index for the gradient half.
  wordmarkPrefix: "Xion",
  wordmarkSuffix: "ID",
  domain: "xionid.app",
  twitter: "@XionID",
} as const;

export const profileUrl = (username: string) =>
  `${BRAND.domain}/${username}`;

// Routes & system handles that must NOT be claimable as a username,
// because the public profile lives at "/:username".
export const RESERVED_USERNAMES = new Set<string>([
  "auth", "dashboard", "editor", "templates", "preview", "admin", "api", "settings",
  "login", "logout", "signup", "signin", "register",
  "about", "help", "support", "terms", "privacy", "legal",
  "home", "explore", "discover", "search", "new", "create",
  "xion", "xionid", "profile", "profiles", "user", "users",
  "app", "www", "mail", "static", "assets", "public",
  "404", "500", "_", "-",
]);
