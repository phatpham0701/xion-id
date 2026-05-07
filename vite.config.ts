import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split heavy/optional dependencies into their own chunks so the
        // landing page and Sport Lifestyle pilot do not need to download/parse
        // them up-front. This keeps the Foundation demo fast while preserving
        // the existing XION integration path for later.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@burnt-labs") || id.includes("abstraxion")) return "xion";
          if (
            id.includes("@cosmjs") ||
            id.includes("cosmjs") ||
            id.includes("cosmwasm") ||
            id.includes("protobufjs") ||
            id.includes("long") ||
            id.includes("bn.js") ||
            id.includes("elliptic")
          ) {
            return "cosmos";
          }
          // Keep React + anything that depends on React (lucide-react, radix, etc.)
          // in the default vendor chunk so initialization order is guaranteed.
          // Only split heavy, independent libraries.
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          // Only split the pure-JS qrcode generator. react-qr-code depends on
          // React and must stay in the vendor chunk to avoid TDZ errors.
          if (id.includes("/qrcode/") || id.includes("node_modules/qrcode")) return "qrcode";
          if (id.includes("@supabase")) return "supabase";
          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
