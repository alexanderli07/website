/**
 * Generates the 1200×630 social-share card (Open Graph / Twitter
 * "summary_large_image").
 *
 *   node scripts/make-og-card.mjs   ->  assets/og-card.png
 *
 * Pure SVG rasterised with sharp — no design tool, no network, reproducible.
 * Colours are the site's tokens. Text uses SYSTEM fonts (Georgia / Consolas)
 * rather than the Google webfonts, so it renders the same without installing
 * anything; Playfair and IBM Plex Mono are not available to the rasteriser.
 *
 * The pieces on the board are NOT hand-placed. The position is played out
 * through the project's own engine and read back off `game.board`, so the card
 * can only ever show a legal position — a wrong one is the sort of detail a
 * chess player notices immediately. See POSITION below.
 *
 * The "I" in GAMBIT is a pawn glyph. Chess glyphs rasterise fine here (verified
 * across every candidate family — fontconfig resolves them all to one fallback
 * that has the pieces), unlike at favicon sizes where the shapes are too small
 * to read.
 *
 * sharp is only needed to regenerate this card; see the resolution note below.
 * Re-run only when the card changes.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "assets");
const OUT = join(OUT_DIR, "og-card.png");
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
const engine = require(join(HERE, "..", "engine.js"));

const PAPER = "#f4ecd9";
const BOARD_DARK = "#c8a878";
const BOARD_LIGHT = "#f3e8cf";
const WALNUT = "#5b3a24";
const WALNUT_3 = "#9a7a52";
const INK = "#241a0f";
const RED = "#a4211b";

const COPY = {
  eyebrow: "ALEXANDERLI.DEV",
  /* Deliberately plain. This is the surface a recruiter meets in a LinkedIn or
     Slack preview, where "beat AL-1200 at chess to read the file" asked them to
     get the joke before knowing what the link even was. The board art already
     says chess; the words don't need to. */
  tagline: "Personal portfolio.",
  foot: "Alexander Li  ·  CFM @ Waterloo",
};

/* The Ruy López, 1.e4 e5 2.Nf3 Nc6 3.Bb5 — a real opening rather than a cute
   mate, and one any player recognises at a glance. Played through the engine
   below so the drawn position is legal by construction. */
const POSITION = ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"];

const PIECE_GLYPH = {          /* the solid (black-piece) glyphs for both sides; */
  1: "♟", 2: "♞",    /* White is the same shape in paper with an ink   */
  3: "♝", 4: "♜",    /* outline, which is how pieces are drawn on      */
  5: "♛", 6: "♚",    /* paper anyway.                                  */
};
const GLYPH_FONT = "'Segoe UI Symbol', 'Noto Sans Symbols 2', 'DejaVu Sans', serif";

/** Play POSITION through the engine and return [{file, rank, type, white}]. */
function position() {
  const game = new engine.Game();
  for (const uci of POSITION) {
    const move = engine.uciToMove(game, uci);
    if (!move) throw new Error(`illegal move in POSITION: ${uci}`);
    game.make(move);
  }
  const out = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const p = game.board[rank * 16 + file];   /* 0x88: square = rank*16+file */
      if (p === 0) continue;
      out.push({ file, rank, type: Math.abs(p), white: p > 0 });
    }
  }
  return out;
}

/* an 8×8 board sitting off the right edge, angled like a sheet on a desk */
const CELL = 62;
function board() {
  let out = "";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const light = (r + c) % 2 === 0;
      out += `<rect x="${c * CELL}" y="${r * CELL}" width="${CELL}" height="${CELL}" ` +
             `fill="${light ? BOARD_LIGHT : BOARD_DARK}"/>`;
    }
  }
  return out;
}

/**
 * Both sides use the same (black) glyph, distinguished by fill — but a fill
 * alone is not enough. The font that resolves here draws its "black" pieces as
 * outline line-art rather than solid silhouettes, so an ink-filled black pawn
 * measured exactly as light as a paper-filled white one (mean grey 194 vs 191)
 * and the two sides were indistinguishable. Stroking the black pieces in their
 * OWN colour closes up the internal detail into a solid mass, which is what
 * separates them. Don't raise it much further: at ~6px the shapes bloat and the
 * queen's crown merges into a blob.
 */
function pieces() {
  const fs = CELL * 0.86;
  let out = "";
  for (const { file, rank, type, white } of position()) {
    const cx = file * CELL + CELL / 2;
    /* rank 0 is White's home rank and belongs at the BOTTOM of the drawn board */
    const cy = (7 - rank) * CELL + CELL / 2;
    const paint = white
      ? `fill="${BOARD_LIGHT}" stroke="${INK}" stroke-width="${(fs * 0.023).toFixed(2)}"`
      : `fill="${INK}" stroke="${INK}" stroke-width="${(fs * 0.075).toFixed(2)}"`;
    out += `<text x="${cx}" y="${cy + CELL * 0.34}" text-anchor="middle" ` +
           `font-family="${GLYPH_FONT}" font-size="${fs}" stroke-linejoin="round" ` +
           `${paint}>${PIECE_GLYPH[type]}</text>`;
  }
  return out;
}

/* Wordmark: GAMB(pawn)T. Three things the plain "I" did not need:
   - the pawn is set smaller than the caps, because the glyph's design height
     runs taller than a serif cap and matching font-size leaves it towering;
   - it is pulled in with dx on both sides, because the glyph's side bearings
     are far wider than an "I"'s, which otherwise reads as "GAMB _ T";
   - there is no red full stop after the T any more. The pawn already carries
     the one red accent, and at this width the stop landed on the board's
     leading edge.
   Clearance to the board is ~45px at the cap line. It is the tightest thing on
   the card, so re-render and look at it if you retune the size. */
const wordmark =
  `<text x="70" y="300" font-family="Georgia, 'Times New Roman', serif" font-weight="700" ` +
  `font-size="140" letter-spacing="-1" fill="${INK}">GAMB` +
  `<tspan font-family="${GLYPH_FONT}" font-size="124" font-weight="400" fill="${RED}" ` +
  `dx="-22">${PIECE_GLYPH[1]}</tspan>` +
  `<tspan dx="-22">T</tspan></text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="warm" cx="0.28" cy="0.1" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect width="1200" height="630" fill="url(#warm)"/>

  <!-- the board, rotated, bleeding off the right edge -->
  <g transform="translate(742 96) rotate(-9)" opacity="0.97">
    ${board()}
    ${pieces()}
    <rect x="0" y="0" width="${CELL * 8}" height="${CELL * 8}" fill="none" stroke="${WALNUT}" stroke-width="5"/>
  </g>

  <!-- ruled left column, like the scoresheet -->
  <line x1="74" y1="150" x2="620" y2="150" stroke="${WALNUT}" stroke-width="3"/>
  <line x1="74" y1="536" x2="620" y2="536" stroke="${WALNUT}" stroke-width="3"/>

  <text x="74" y="126" font-family="Consolas, 'Courier New', monospace" font-size="23"
        letter-spacing="7" fill="${WALNUT_3}">${COPY.eyebrow}</text>

  ${wordmark}

  <!-- one line now, so it is centred in the band between the wordmark and the
       footer rather than left hanging where the first of two used to sit -->
  <text x="74" y="415" font-family="Georgia, 'Times New Roman', serif" font-style="italic"
        font-size="44" fill="${WALNUT}">${COPY.tagline}</text>

  <text x="74" y="514" font-family="Consolas, 'Courier New', monospace" font-size="22"
        letter-spacing="2" fill="${WALNUT_3}">${COPY.foot}</text>

  <!-- No SEALED stamp. With the tagline plain, it was the last thing on the card
       asking to be decoded — and "sealed" reads as "this link is locked". -->
</svg>`;

mkdirSync(OUT_DIR, { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);
console.log("Wrote", OUT);
