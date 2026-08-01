/**
 * Download TheFaix's monthly PGN archives from the chess.com public API.
 *
 *   node tools/fetch-games.mjs <out-dir>
 *
 * Writes one YYYY-MM.pgn per month into <out-dir>, 2025 onward only — the
 * opening book deliberately ignores the pre-2025 archive (a different player:
 * 1.b3 Larsen, Owen's Defence; see tools/make-book.mjs). Re-downloads every
 * eligible month each run because chess.com archives GROW through the month;
 * a naive "skip existing" would freeze the current month at first sight.
 * Used by the refresh-book workflow, and works the same by hand.
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const USER = "thefaix";
const SINCE_YEAR = 2025;
const UA = "gambit-book-refresh (+https://alexanderli.dev; engine book updater)";

const dir = process.argv[2];
if (!dir) { console.error("usage: node tools/fetch-games.mjs <out-dir>"); process.exit(1); }
mkdirSync(dir, { recursive: true });

const res = await fetch(`https://api.chess.com/pub/player/${USER}/games/archives`,
  { headers: { "User-Agent": UA } });
if (!res.ok) { console.error("archive list failed:", res.status); process.exit(1); }
const { archives } = await res.json();

let saved = 0, skipped = 0;
for (const url of archives) {
  const m = url.match(/\/games\/(\d{4})\/(\d{2})$/);
  if (!m || Number(m[1]) < SINCE_YEAR) { skipped++; continue; }
  const r = await fetch(url + "/pgn", { headers: { "User-Agent": UA } });
  if (!r.ok) { console.error(`  ${m[1]}-${m[2]}: HTTP ${r.status} — skipping month`); continue; }
  const pgn = await r.text();
  if (!pgn.includes("[Event")) { console.error(`  ${m[1]}-${m[2]}: empty — skipping`); continue; }
  writeFileSync(join(dir, `${m[1]}-${m[2]}.pgn`), pgn);
  saved++;
}
console.log(`saved ${saved} months (${skipped} pre-${SINCE_YEAR} skipped) into ${dir}`);
if (saved === 0) { console.error("nothing downloaded — refusing to let the book regenerate from nothing"); process.exit(1); }
