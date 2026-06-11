import { renderToString } from "react-dom/server";
import { App } from "./App";

/**
 * Render the app to a static HTML string at build time (driven by
 * scripts/prerender.mjs). `window` is undefined here, so WorldContext's
 * initialWorld() resolves to the default "day" world and every browser-only
 * effect (Lenis, the live widgets, scroll anchoring) simply never runs —
 * renderToString only produces markup, not effects. The result is real,
 * crawlable content inside #root instead of an empty SPA shell.
 */
export function render(): string {
  return renderToString(<App />);
}
