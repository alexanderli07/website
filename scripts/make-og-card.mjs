/**
 * Generates the 1200x630 social-share card (Open Graph / Twitter "summary_large_image").
 *
 *   node scripts/make-og-card.mjs   ->  public/assets/images/og-card.png
 *
 * Pure SVG rasterised with sharp — no design tool, no network, fully reproducible.
 * Colours mirror the site's day/night tokens (src/styles/global.css). Edit the
 * COPY block below to retune the text. Uses system fonts (Segoe UI / Georgia /
 * Consolas) so it renders identically without installing the Google webfonts.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..", "public", "assets", "images", "og-card.png",
);

// ---- copy (edit me) --------------------------------------------------------
const COPY = {
  eyebrow: "alexanderli.dev",
  name: "Alexander Li",
  day: "Builder by day,",
  night: "quant by night.",
  line1: "CFM @ Waterloo · Finance Developer @ Quintessence Wealth",
  line2: "1,000,000+ game visits · 9× hackathon wins · ML + full-stack",
};

// ---- sun rays (computed) ---------------------------------------------------
const sun = { cx: 178, cy: 162, r1: 60, r2: 86 };
let rays = "";
for (let i = 0; i < 8; i++) {
  const a = (Math.PI / 4) * i;
  const x1 = (sun.cx + Math.cos(a) * sun.r1).toFixed(1);
  const y1 = (sun.cy + Math.sin(a) * sun.r1).toFixed(1);
  const x2 = (sun.cx + Math.cos(a) * sun.r2).toFixed(1);
  const y2 = (sun.cy + Math.sin(a) * sun.r2).toFixed(1);
  rays += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
}

// ---- stars (top-right night sky) -------------------------------------------
const stars = [
  [770, 175, 2.4], [880, 220, 1.8], [712, 255, 1.6], [965, 170, 2.0],
  [1150, 250, 2.2], [1085, 320, 1.7], [1010, 285, 1.5], [905, 360, 2.1],
]
  .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#cfe0ff" opacity="0.85"/>`)
  .join("");

// ---- clouds (puff of overlapping circles on a flat ellipse base) -----------
function cloud(x, y, s, fill, op) {
  const r = (n) => (n * s).toFixed(1);
  return `<g fill="${fill}" opacity="${op}">`
    + `<ellipse cx="${x}" cy="${y}" rx="${r(62)}" ry="${r(20)}"/>`
    + `<circle cx="${(x - 32 * s).toFixed(1)}" cy="${(y - 4 * s).toFixed(1)}" r="${r(20)}"/>`
    + `<circle cx="${x}" cy="${(y - 16 * s).toFixed(1)}" r="${r(27)}"/>`
    + `<circle cx="${(x + 34 * s).toFixed(1)}" cy="${(y - 5 * s).toFixed(1)}" r="${r(21)}"/>`
    + `</g>`;
}
// warm white on the day band; faint blue-grey in the night sky (mirrors the site's --cloud tokens)
const dayClouds = cloud(450, 98, 1.0, "#ffffff", 0.85) + cloud(740, 70, 0.66, "#ffffff", 0.7);
const nightClouds = cloud(1055, 360, 0.95, "#b8c4e6", 0.16) + cloud(905, 250, 0.7, "#b8c4e6", 0.14);

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="night" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f1733"/>
      <stop offset="1" stop-color="#070b18"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.86" cy="0.08" r="0.85">
      <stop offset="0" stop-color="#6ee7ff" stop-opacity="0.20"/>
      <stop offset="0.55" stop-color="#6ee7ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="day" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff6ec"/>
      <stop offset="1" stop-color="#ffe2c4"/>
    </linearGradient>
    <radialGradient id="sunglow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffb703" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#ffb703" stop-opacity="0"/>
    </radialGradient>
    <mask id="crescent">
      <circle cx="1055" cy="236" r="64" fill="#fff"/>
      <circle cx="1085" cy="218" r="56" fill="#000"/>
    </mask>
  </defs>

  <!-- night base + cyan glow -->
  <rect width="1200" height="630" fill="url(#night)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- day band: full-width diagonal across the top (sun side); text + moon sit below it -->
  <polygon points="0,0 1200,0 0,310" fill="url(#day)"/>
  <line x1="1200" y1="0" x2="0" y2="310" stroke="#ffb703" stroke-width="3" stroke-opacity="0.45"/>

  <!-- day clouds -->
  ${dayClouds}

  <!-- sun -->
  <circle cx="${sun.cx}" cy="${sun.cy}" r="118" fill="url(#sunglow)"/>
  <g stroke="#ff7a33" stroke-width="7" stroke-linecap="round">${rays}</g>
  <circle cx="${sun.cx}" cy="${sun.cy}" r="46" fill="#ff6b35"/>

  <!-- stars, night clouds, moon (moon sits lower than the sun) -->
  ${stars}
  ${nightClouds}
  <circle cx="1055" cy="236" r="64" fill="#e8eeff" mask="url(#crescent)"/>

  <!-- text -->
  <text x="80" y="332" font-family="Consolas, 'Courier New', monospace" font-size="26" letter-spacing="5" fill="#6ee7ff">${COPY.eyebrow}</text>
  <text x="76" y="426" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="106" letter-spacing="-2" fill="#f4f7ff">${COPY.name}</text>
  <text x="80" y="504" font-family="'Segoe UI', Arial, sans-serif" font-size="48">
    <tspan fill="#ff9a4d" font-weight="600">${COPY.day}</tspan><tspan dx="18" fill="#7fe9ff" font-style="italic" font-family="Georgia, 'Times New Roman', serif">${COPY.night}</tspan>
  </text>
  <text x="80" y="566" font-family="Consolas, 'Courier New', monospace" font-size="25" fill="#b9c4e8">${COPY.line1}</text>
  <text x="80" y="600" font-family="Consolas, 'Courier New', monospace" font-size="25" fill="#8f9cc6">${COPY.line2}</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(OUT);
console.log("Wrote", OUT);
