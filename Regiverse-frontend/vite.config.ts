import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

export default defineConfig({
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
  },

  plugins: [
    tsconfigPaths(),
    react(),
    tagger(),
  ],

  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
});