// Build-time prerender: render <App/> to an HTML string and inject it into the
// built dist/index.html, so search-engine crawlers (and link-preview bots) get
// real, fully-rendered content instead of an empty <div id="root"></div>.
//
// Runs after `vite build` (see package.json "build"). Uses Vite's own module
// loader in middleware mode so TS/JSX/CSS/asset imports resolve exactly as they
// do in the app — no separate SSR bundle to keep in sync.

import { createServer } from "vite";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distIndex = resolve(root, "dist", "index.html");
const ROOT_DIV = '<div id="root"></div>';

const vite = await createServer({
  root,
  logLevel: "error",
  // No HTTP server — we only need Vite's on-the-fly module transform/loader.
  appType: "custom",
  server: { middlewareMode: true },
});

try {
  const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
  const appHtml = render();

  const html = readFileSync(distIndex, "utf8");
  if (!html.includes(ROOT_DIV)) {
    throw new Error(
      `[prerender] expected ${ROOT_DIV} in dist/index.html — did the markup change?`,
    );
  }

  writeFileSync(
    distIndex,
    html.replace(ROOT_DIV, `<div id="root">${appHtml}</div>`),
  );
  console.log(
    `[prerender] injected ${appHtml.length.toLocaleString()} chars of pre-rendered HTML into dist/index.html`,
  );
} finally {
  await vite.close();
}
