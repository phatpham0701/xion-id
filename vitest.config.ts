import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    // Stub Supabase env vars so the client initialises without real credentials
    // in test environments (mirrors the CI step env block in ci.yml).
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://placeholder.supabase.co"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("placeholder-anon-key"),
    "import.meta.env.VITE_ENABLE_XION_PROVIDER": JSON.stringify("false"),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
