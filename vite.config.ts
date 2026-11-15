/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    // Embedded fonts are fetched at export time; never inline them into JS.
    assetsInlineLimit: 0,
  },
  test: {
    // Node by default; files that validate SVG opt into jsdom for DOMParser.
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
  },
});
