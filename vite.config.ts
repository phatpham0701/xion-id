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
    rollupOptions: {
      output: {
        // Split heavy/optional dependencies into their own chunks so the
        // landing page does not need to download/parse them up-front.
        // This dramatically improves Speed Index by shrinking the initial JS.
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
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react-dom")) return "react-dom";
          if (id.includes("/react/") || id.endsWith("/react")) return "react";
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
