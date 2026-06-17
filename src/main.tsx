import React from "react";
import ReactDOM from "react-dom/client";
import { inject } from "@vercel/analytics";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { App } from "./App";
import "./styles/global.css";

inject();

const container = document.getElementById("root") as HTMLElement;
const tree = (
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>
);

// In production the HTML is pre-rendered (scripts/prerender.mjs injects the
// app's markup into #root) so crawlers see real content — hydrate that markup.
// In dev (and as a safe fallback) #root is empty, so render fresh.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, tree);
} else {
  ReactDOM.createRoot(container).render(tree);
}
