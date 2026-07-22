import { renderToString } from "react-dom/server";
import { App } from "./App";

/**
 * Render the app to a static HTML string at build time (driven by
 * scripts/prerender.mjs). `window` is undefined here, so every browser-only
 * effect (the field canvas, the market-data fetch, the ML demo) simply never
 * runs — renderToString only produces markup, not effects. The result is the
 * full ledger as real, crawlable content inside #root instead of an empty
 * SPA shell.
 */
export function render(): string {
  return renderToString(<App />);
}
