import { lazy, Suspense, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// XIONID is dark-mode by default — ensure `dark:` utilities apply consistently across the app.
document.documentElement.classList.add("dark");
document.documentElement.style.colorScheme = "dark";

// Swallow noisy errors originating from browser extensions (e.g. wallet extensions
// like Keplr) that inject scripts into every page. When the extension reloads,
// it throws "Extension context invalidated." which is unrelated to our app but
// would otherwise surface as an unhandled rejection / blank-screen overlay.
const isExtensionNoise = (value: unknown): boolean => {
  const msg = value instanceof Error ? `${value.message}\n${value.stack ?? ""}` : String(value ?? "");
  return /Extension context invalidated/i.test(msg) || /chrome-extension:\/\//i.test(msg);
};
window.addEventListener("unhandledrejection", (e) => {
  if (isExtensionNoise(e.reason)) e.preventDefault();
});
window.addEventListener("error", (e) => {
  if (isExtensionNoise(e.error ?? e.message) || (e.filename && e.filename.startsWith("chrome-extension://"))) {
    e.preventDefault();
  }
});

/**
 * Pitch-safe loading rule:
 *
 * The Sport Lifestyle Engine pilot does not require live XION/Burnt provider
 * plumbing. Keep the heavy Abstraxion SDK completely out of the default first
 * paint unless the developer explicitly opts in with VITE_ENABLE_XION_PROVIDER.
 *
 * This preserves the existing integration path for later, but keeps Foundation
 * demo routes fast and avoids blocking the app on Burnt SDK/CSS during pitch.
 */
const ENABLE_XION_PROVIDER = import.meta.env.VITE_ENABLE_XION_PROVIDER === "true";

const LazyXionProvider = lazy(async () => {
  const [{ XION_CONFIG }, { AbstraxionProvider }] = await Promise.all([
    import("@/lib/xion"),
    import("@burnt-labs/abstraxion"),
    import("@burnt-labs/ui/dist/index.css"),
  ]);
  const config = {
    chainId: XION_CONFIG.chainId,
    treasury: XION_CONFIG.treasury,
    rpcUrl: XION_CONFIG.rpcUrl,
    restUrl: XION_CONFIG.restUrl,
    gasPrice: XION_CONFIG.gasPrice,
    authentication: {
      type: "auto" as const,
      authAppUrl: XION_CONFIG.authAppUrl,
    },
  } as Parameters<typeof AbstraxionProvider>[0]["config"];
  return {
    default: ({ children }: { children: ReactNode }) => (
      <AbstraxionProvider config={config}>{children}</AbstraxionProvider>
    ),
  };
});

const Root = () => {
  if (!ENABLE_XION_PROVIDER) return <App />;

  return (
    <Suspense fallback={<App />}>
      <LazyXionProvider>
        <App />
      </LazyXionProvider>
    </Suspense>
  );
};

createRoot(document.getElementById("root")!).render(<Root />);
