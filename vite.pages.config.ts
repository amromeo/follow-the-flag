import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/follow-the-flag/",
  build: {
    outDir: "pages-dist",
    emptyOutDir: true,
  },
  plugins: [mdx(), react()],
});
