import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // transformers.js (onnxruntime-web) is loaded dynamically + fetches its WASM/model
  // from a CDN at runtime; keep Vite from trying to pre-bundle it.
  optimizeDeps: { exclude: ["@xenova/transformers"] },
  build: {
    target: "esnext",
    cssMinify: true,
  },
});
