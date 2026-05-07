import { lazy, Suspense, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { XION_CONFIG } from "@/lib/xion";

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

// Lazy-load the XION Abstraxion provider + its CSS so the landing page does not
// pay the parse/execute cost of the wallet SDK (≈800KB+) on first paint.
// Routes that actually need the wallet (Dashboard, Editor, public profile blocks)
// are themselves lazy — by the time their chunks resolve, this provider is mounted.
const AbstraxionGate = lazy(async () => {
  const [{ AbstraxionProvider }] = await Promise.all([
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

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<App />}>
    <AbstraxionGate>
      <App />
    </AbstraxionGate>
  </Suspense>,
);
