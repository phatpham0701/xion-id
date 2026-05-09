import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Public Lovable Cloud (Supabase) values for this project. These are the
// `publishable` URL + anon key — safe to ship in the client bundle (protected
// by RLS). They are used as a fallback ONLY when the build pipeline fails to
// inject the corresponding `VITE_SUPABASE_*` env vars, which would otherwise
// cause `createClient` to throw "supabaseUrl is required." and blank-screen
// the production site (observed on xionid.com).
const FALLBACK_SUPABASE_URL = "https://knqietfivamqskcxfpru.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucWlldGZpdmFtcXNrY3hmcHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjY3ODksImV4cCI6MjA5MzA0Mjc4OX0.uzt4V4RHqwBEs5n-Gtqrs46D5uN6XGS9-6AV2NhdVo0";
const FALLBACK_SUPABASE_PROJECT_ID = "knqietfivamqskcxfpru";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Resolve env from process.env first (Lovable build pipeline / CI), then fall
  // back to known public values so the client never boots with an empty URL.
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_PROJECT_ID =
    process.env.VITE_SUPABASE_PROJECT_ID || FALLBACK_SUPABASE_PROJECT_ID;

  return {
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
  },
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
