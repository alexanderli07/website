import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // Pre-bundle transformers.js together with its onnxruntime-web/-common deps so
    // esbuild wires up the CJS interop in one unit. Excluding it instead splits the
    // tree and breaks onnxruntime's `registerBackend` (undefined) in dev. The model
    // weights + WASM still stream from the HF/CDN at runtime — only the JS is bundled.
    optimizeDeps: { include: ["@xenova/transformers"] },
    build: {
        target: "esnext",
        cssMinify: true,
    },
});
