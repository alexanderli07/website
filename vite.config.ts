import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

// Serve 404.html (with a 404 status) for unknown routes in `vite dev` and
// `vite preview`, matching how Vercel serves it in production — instead of the
// default SPA fallback to index.html (which would show the home page).
function notFound404(): Plugin {
  const handler =
    (dir: string) =>
    (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const url = (req.url || "/").split("?")[0];
      const wantsHtml = (req.headers.accept || "").includes("text/html");
      const isFile = /\.[^/]+$/.test(url);
      if (req.method === "GET" && wantsHtml && url !== "/" && !isFile) {
        try {
          const html = readFileSync(resolve(dir, "404.html"), "utf8");
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
          return;
        } catch {
          /* no 404.html yet — fall through */
        }
      }
      next();
    };
  return {
    name: "not-found-404",
    configureServer(server) {
      // dev: 404.html lives in /public
      return () => server.middlewares.use(handler(resolve(server.config.root, "public")));
    },
    configurePreviewServer(server) {
      // preview: served from the build output (dist)
      return () => server.middlewares.use(handler(resolve(server.config.root, server.config.build.outDir)));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // no SPA history-fallback: unknown routes are 404s (see notFound404 plugin), like prod
  appType: "mpa",
  plugins: [react(), notFound404()],
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
