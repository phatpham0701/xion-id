import { createRoot } from "react-dom/client";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import App from "./App.tsx";
import "./index.css";
import "@burnt-labs/ui/dist/index.css";
import { XION_CONFIG } from "@/lib/xion";

// XIONID is dark-mode by default — ensure `dark:` utilities apply consistently across the app.
document.documentElement.classList.add("dark");
document.documentElement.style.colorScheme = "dark";

const abstraxionConfig = {
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

createRoot(document.getElementById("root")!).render(
  <AbstraxionProvider config={abstraxionConfig}>
    <App />
  </AbstraxionProvider>,
);
