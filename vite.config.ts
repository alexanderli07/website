import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pre-bundle transformers.js together with onnxruntime-web/-common so esbuild
  // wires up the CJS interop in one unit. Force-include onnxruntime-web too —
  // otherwise the dev optimizer externalises its UMD bundle and onnxruntime-common's
  // `registerBackend` resolves to undefined (dev-only crash; Rollup handles prod).
  // The model weights + WASM still stream from the HF/CDN at runtime.
  optimizeDeps: { include: ["@xenova/transformers", "onnxruntime-web"] },
  build: {
    target: "esnext",
    cssMinify: true,
  },
});
