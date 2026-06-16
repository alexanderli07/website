/**
 * One-shot image optimizer (run once, re-runnable when you add new art).
 *
 *   node scripts/optimize-images.mjs
 *
 * Re-encodes the raster images in public/assets/images to right-sized WebP:
 *  - project art        -> max 1200px wide  (cards + the case-study modal)
 *  - testimonial avatars-> 160px            (rendered ~46px, 3x for retina)
 *  - hero/about portrait-> 256px            (rendered 96px)
 *
 * The full-resolution OG share image (AlexanderLi.png) is left untouched — social
 * scrapers (LinkedIn/Slack/X) are happiest with a real PNG/JPG, not WebP.
 *
 * SVGs (cfm101, serviceswap) are already vector — nothing to do.
 */
import sharp from "sharp";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets", "images");

/** [sourceFile, outputFile, maxWidth, quality] */
const JOBS = [
  // project art
  ["dragonflai.png", "dragonflai.webp", 1200, 80],
  ["invisibilis.png", "invisibilis.webp", 1200, 80],
  ["OppositeOdyssey.png", "OppositeOdyssey.webp", 1200, 80],
  ["saight.png", "saight.webp", 1200, 80],
  ["reminda.png", "reminda.webp", 1200, 80],
  ["snaipshot.jpg", "snaipshot.webp", 1200, 80],
  ["BAC.png", "BAC.webp", 1200, 80],
  ["ecoin.png", "ecoin.webp", 1200, 80],
  // testimonial avatars
  ["Roosevelt.png", "Roosevelt.webp", 160, 82],
  ["Darren.png", "Darren.webp", 160, 82],
  ["CarolTaverner.png", "CarolTaverner.webp", 160, 82],
  // hero / about portrait (OG image AlexanderLi.png is intentionally kept as PNG)
  ["AlexanderLi.png", "AlexanderLi-portrait.webp", 256, 82],
];

let saved = 0;
for (const [src, out, width, quality] of JOBS) {
  const inPath = join(DIR, src);
  const outPath = join(DIR, out);
  if (!existsSync(inPath)) {
    console.warn(`skip (missing source): ${src}`);
    continue;
  }
  const before = statSync(inPath).size;
  await sharp(inPath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);
  const after = statSync(outPath).size;
  saved += before - after;
  const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
  console.log(`${src} ${kb(before)} -> ${out} ${kb(after)}`);
}
console.log(`\nTotal recovered: ${(saved / 1024 / 1024).toFixed(2)}MB`);
