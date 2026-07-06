import { defineConfig } from "vite";
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

function copyStaticExtensionFiles() {
  return {
    name: "copy-static-extension-files",
    closeBundle() {
      mkdirSync("dist", { recursive: true });

      copyFileSync("manifest.json", "dist/manifest.json");
      copyFileSync("src/styles/content.css", "dist/content.css");
    }
  };
}

export default defineConfig({
  plugins: [copyStaticExtensionFiles()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      input: resolve(__dirname, "src/content/index.ts"),
      output: {
        format: "iife",
        entryFileNames: "content.js",
        inlineDynamicImports: true
      }
    }
  }
});