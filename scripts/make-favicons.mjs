/**
 * Generates the favicon / app-icon set into public/ (root), from a single SVG mark:
 * a mini black hole (dark event horizon + warm accretion ring + slanted disk streak),
 * matching the 404 page style.
 *
 *   node scripts/make-favicons.mjs
 *
 * Outputs: favicon.svg, favicon-16.png, favicon-32.png, apple-touch-icon.png,
 *          icon-192.png, icon-512.png, favicon.ico
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PUB = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const DEFS = `
    <radialGradient id="sbg" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="#0d1734"/><stop offset="1" stop-color="#060912"/></radialGradient>
    <radialGradient id="ring" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.40" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.455" stop-color="#ff8a2e"/>
      <stop offset="0.49" stop-color="#ffd27a"/>
      <stop offset="0.52" stop-color="#fff3df"/>
      <stop offset="0.57" stop-color="#ff8f2c"/>
      <stop offset="0.72" stop-color="#b5380c"/>
      <stop offset="0.86" stop-color="#5e1d05" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="streak" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.1" stop-color="#fff3df"/><stop offset="0.4" stop-color="#ffb24a"/><stop offset="0.7" stop-color="#c5400e"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hole" cx="0.5" cy="0.44" r="0.55"><stop offset="0.62" stop-color="#04060e"/><stop offset="1" stop-color="#0a1226"/></radialGradient>
    <filter id="b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="b2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11"/></filter>`;

// scene centered at 256,256 (512 master)
const SCENE = `
    <rect width="512" height="512" fill="url(#sbg)"/>
    <g transform="rotate(-20 256 256)"><ellipse cx="256" cy="256" rx="250" ry="24" fill="url(#streak)" filter="url(#b2)"/></g>
    <circle cx="256" cy="256" r="232" fill="url(#ring)" filter="url(#b1)"/>
    <circle cx="256" cy="256" r="104" fill="url(#hole)"/>
    <ellipse cx="256" cy="256" rx="107" ry="106" fill="none" stroke="#ffe9c8" stroke-width="4" stroke-opacity="0.85"/>`;

const rounded = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs>${DEFS}<clipPath id="sq"><rect width="512" height="512" rx="116"/></clipPath></defs><g clip-path="url(#sq)">${SCENE}</g></svg>`;
const fullbleed = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs>${DEFS}</defs>${SCENE}</svg>`;

writeFileSync(join(PUB, "favicon.svg"), rounded);
await sharp(Buffer.from(rounded)).resize(32, 32).png().toFile(join(PUB, "favicon-32.png"));
await sharp(Buffer.from(rounded)).resize(16, 16).png().toFile(join(PUB, "favicon-16.png"));
await sharp(Buffer.from(fullbleed)).resize(180, 180).png().toFile(join(PUB, "apple-touch-icon.png"));
await sharp(Buffer.from(fullbleed)).resize(192, 192).png().toFile(join(PUB, "icon-192.png"));
await sharp(Buffer.from(fullbleed)).resize(512, 512).png().toFile(join(PUB, "icon-512.png"));

const png32 = await sharp(Buffer.from(rounded)).resize(32, 32).png().toBuffer();
const ico = Buffer.alloc(22 + png32.length);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png32.length, 14); ico.writeUInt32LE(22, 18);
png32.copy(ico, 22);
writeFileSync(join(PUB, "favicon.ico"), ico);

console.log("black-hole favicons written to public/");
