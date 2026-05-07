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
 * Foundation pitch mode:
 *
 * The current Sport Lifestyle Engine demo does not need live XION/Burnt provider
 * plumbing. Keeping the heavy wallet SDK out of the default app shell makes the
 * pitch build faster and removes registry/install fragility from the demo path.
 *
 * Reintroduce a dedicated provider shell later when the Foundation explicitly
 * validates the XION/Burnt verification integration scope.
 */
if (import.meta.env.VITE_ENABLE_XION_PROVIDER === "true") {
  // Soft notice only: the pitch build intentionally does not mount the provider.
  // Avoid blocking the app or importing private/unstable SDK packages here.
  console.info("XION provider flag detected; live provider is deferred for the post-pitch integration phase.");
}

createRoot(document.getElementById("root")!).render(<App />);
