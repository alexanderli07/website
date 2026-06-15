/**
 * Generates the icon set from one SVG mark.
 *
 *   node scripts/make-icons.mjs
 *
 * Outputs: favicon.svg, favicon-16.png, favicon-32.png, apple-touch-icon.png,
 *          icon-192.png, icon-512.png
 *
 * The mark is a chessboard stamped with the initials AL, in ink, straight onto
 * the squares — see the note on the halo inside mark().
 *
 * 16px gets its OWN artwork: a 2×2 checker instead of 4×4. At that size a
 * four-square grid is 4px cells and reads as noise, which fights the letters
 * for the few pixels available. Everything 32px and up uses the 4×4, which is
 * what actually reads as "chessboard".
 *
 * No chess-piece glyph: a silhouette is unrecognisable at 16px, and glyph
 * rendering here depends on the machine's fonts. Letters in Georgia are safe —
 * every target platform has it or a metric-compatible serif.
 *
 * sharp is only needed to regenerate the icons; see the resolution note below.
 * Re-run only when the mark changes.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..");
const require = createRequire(import.meta.url);
/* sharp is not a dependency of the site — nothing it produces is needed to
   serve the page, only to regenerate this artwork by hand. Resolved from this
   file, so a plain `npm i --no-save sharp` in the repo root is enough. */
let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("sharp is not installed. It is only needed to regenerate this artwork:");
  console.error("  npm i --no-save sharp");
  process.exit(1);
}

const PAPER = "#f4ecd9";
const BOARD_LIGHT = "#f3e8cf";
const BOARD_DARK = "#c8a878";
const WALNUT = "#5b3a24";
const INK = "#241a0f";

/** an n×n checker filling `size`, offset by `inset` */
function squares(n, inset, size) {
  const cell = size / n;
  let out = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out += `<rect x="${inset + c * cell}" y="${inset + r * cell}" ` +
             `width="${cell}" height="${cell}" ` +
             `fill="${(r + c) % 2 === 0 ? BOARD_LIGHT : BOARD_DARK}"/>`;
    }
  }
  return out;
}

/* Measured, not guessed: Georgia bold "AL" inks 1.470× the font-size wide and
   0.700× tall, its optical centre sits 0.015em left of a text-anchor="middle"
   origin, and its cap centre sits 0.3533em above the baseline. Sizing off a
   guessed advance width is what made an earlier cut of this icon burst out
   through the frame. Re-measure (scripts/../measureAL) if the face changes. */
const AL_WIDTH = 1.47;
const AL_CENTRE_DX = 0.015;
const AL_BASELINE = 0.3533;

const BORDER = 16;

/**
 * @param n        checker divisions (4 normally, 2 for the 16px cut)
 * @param rounded  rounded corners, for home-screen icons
 * @param fill     how much of the width the letters take up
 */
function mark({ n = 4, rounded = false, fill = 0.8 } = {}) {
  const fs = Math.round((512 * fill) / AL_WIDTH);
  const x = Math.round(256 + fs * AL_CENTRE_DX);
  const baseline = Math.round(256 + fs * AL_BASELINE);
  const rx = rounded ? 72 : 0;

  /* No halo behind the letters. An earlier cut backed them with a fat paper
     stroke to hold them off the dark squares, but ink on this tan is already
     ~11:1 — the halo was solving a problem that did not exist, and a stroke
     that thick follows the letterforms into a lumpy scalloped edge. Straight
     ink on the board's own colours is cleaner and keeps the site's palette. */
  const letters = `<text x="${x}" y="${baseline}" text-anchor="middle" ` +
    `font-family="Georgia, 'Times New Roman', serif" font-weight="700" ` +
    `font-size="${fs}" fill="${INK}">AL</text>`;

  /* The board is full-bleed — no paper margin. It leaves the most room for the
     letters and reads as "board" at the smallest sizes, where a margin plus a
     frame plus a 4×4 grid is more edges than there are pixels. The hairline
     frame is only there to hold the shape against white browser chrome. */
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" ${rx ? `rx="${rx}"` : ""} fill="${PAPER}"/>
  <g${rx ? ` clip-path="inset(0 round ${rx})"` : ""}>${squares(n, 0, 512)}</g>
  ${letters}
  <rect x="${BORDER / 2}" y="${BORDER / 2}" width="${512 - BORDER}" height="${512 - BORDER}"
        ${rx ? `rx="${rx - BORDER / 2}"` : ""} fill="none" stroke="${WALNUT}" stroke-width="${BORDER}"/>
</svg>`;
}

/* the .svg favicon is square-cornered (browsers draw it small, in their own
   chrome); the PNG app icons get rounded corners for home screens */
writeFileSync(join(OUT, "favicon.svg"), mark({ n: 4, rounded: false }));

const targets = [
  /* name, px, checker divisions, how much width the letters take */
  ["favicon-16.png", 16, 2, 0.86],   /* simplified checker — see the note up top */
  ["favicon-32.png", 32, 4, 0.82],
  ["apple-touch-icon.png", 180, 4, 0.8],
  ["icon-192.png", 192, 4, 0.8],
  ["icon-512.png", 512, 4, 0.8],
];

for (const [name, size, n, fill] of targets) {
  await sharp(Buffer.from(mark({ n, rounded: true, fill })))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, name));
  console.log("wrote", name, `${size}×${size}`, `(${n}×${n} checker)`);
}
console.log("wrote favicon.svg");
