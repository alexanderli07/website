/**
 * GAMBIT — the opening book stays honest.  run with:  node test/book.js
 *
 * book.js is generated from real games (tools/make-book.mjs) and consumed by
 * botMove(). Three things can rot independently — the artifact, the engine's
 * move generation, and the seam between them — so this validates the SHIPPED
 * book against the SHIPPED engine:
 *   1. every key replays from the start position;
 *   2. every stored move is legal in its position, weights are positive ints;
 *   3. with the book present, the bot actually plays from it (root + as Black);
 *   4. without it, botMove still works — the book is an upgrade, not a crutch;
 *   5. bestMove (the Hint) never reads it: honest search, book or no book.
 */
const E = require("../engine.js");
const BOOK = require("../book.js");

let failures = 0;
function ok(cond, label) {
  console.log((cond ? "ok   " : "FAIL ") + label);
  if (!cond) failures++;
}

/* ---- 1 + 2: the artifact ---- */
let keys = Object.keys(BOOK), badKey = null, badMove = null, badWeight = null;
for (const key of keys) {
  const g = new E.Game();
  let fine = true;
  if (key) for (const uci of key.split(" ")) {
    const mv = g.legal().find((m) => E.moveToUci(m) === uci);
    if (!mv) { fine = false; break; }
    g.make(mv);
  }
  if (!fine) { badKey = key; continue; }
  const legal = new Set(g.legal().map((m) => E.moveToUci(m)));
  for (const [uci, w] of BOOK[key]) {
    if (!legal.has(uci)) badMove = key + " -> " + uci;
    if (!(Number.isInteger(w) && w > 0)) badWeight = key + " -> " + uci + " @" + w;
  }
}
ok(keys.length >= 100, "book has real coverage (" + keys.length + " positions)");
ok(badKey === null, "every key replays from the start" + (badKey ? " (bad: " + badKey + ")" : ""));
ok(badMove === null, "every book move is legal in its position" + (badMove ? " (bad: " + badMove + ")" : ""));
ok(badWeight === null, "every weight is a positive integer" + (badWeight ? " (bad: " + badWeight + ")" : ""));

/* ---- 3: the bot plays the repertoire ---- */
global.GAMBIT_BOOK = BOOK;
const rootMoves = new Set(BOOK[""].map(([u]) => u));
let inBook = true;
for (let i = 0; i < 25; i++) {
  const m = E.botMove(new E.Game());
  if (!rootMoves.has(E.moveToUci(m))) inBook = false;
}
ok(inBook, "as White the bot opens from the book, 25/25 (the Queen's Gambit: " + [...rootMoves] + ")");

const replies = BOOK["d2d4"];
ok(!!replies, "the book answers 1.d4 as Black");
if (replies) {
  const rep = new Set(replies.map(([u]) => u));
  let inBookB = true;
  for (let i = 0; i < 25; i++) {
    const g = new E.Game();
    g.make(g.legal().find((m) => E.moveToUci(m) === "d2d4"));
    if (!rep.has(E.moveToUci(E.botMove(g)))) inBookB = false;
  }
  ok(inBookB, "as Black the bot answers 1.d4 from the book, 25/25");
}

/* ---- 5: the Hint stays honest search (never the book) ---- */
const hint = E.bestMove(new E.Game());
ok(E.moveToUci(hint) === "b1c3", "bestMove ignores the book (still the search's b1c3, not the book's d2d4)");

/* ---- 4: and the page degrades to search if book.js ever fails to load ---- */
delete global.GAMBIT_BOOK;
const noBook = E.botMove(new E.Game());
ok(!!noBook && new E.Game().legal().some((m) => m.from === noBook.from && m.to === noBook.to),
   "without the book, botMove falls back to a legal searched move");

console.log(failures ? "\n" + failures + " FAILURE(S)" : "\nALL TESTS PASSED");
process.exit(failures ? 1 : 0);
