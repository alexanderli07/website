/**
 * GAMBIT engine tests — run with:  node test/perft.js
 *
 * perft counts every leaf node of the move tree to a given depth. The numbers
 * below are the published, independently-verified counts for these positions,
 * so any disagreement means move generation is broken — usually castling
 * rights, en-passant edge cases, promotions, or pinned-piece legality.
 * Run this after ANY edit to engine.js.
 */
const E = require("../engine.js");

const POSITIONS = [
  {
    name: "startpos",
    fen: null,
    expect: [20, 400, 8902, 197281],
  },
  {
    name: "kiwipete (castling + pins)",
    fen: "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -",
    expect: [48, 2039, 97862],
  },
  {
    name: "promotions",
    fen: "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8",
    expect: [44, 1486, 62379],
  },
  {
    name: "en passant / discovered check traps",
    fen: "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -",
    expect: [14, 191, 2812, 43238],
  },
  {
    name: "promotion + castling traps",
    fen: "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
    expect: [6, 264, 9467],
  },
];

/* Positions used for the colour-mirror check below. No published counts are
   needed: mirroring a position (flip the ranks, swap the colours, swap the
   side to move) must yield an identical node count, which catches any
   white/black asymmetry in generation — pawn direction, castling masks,
   en-passant ranks. */
const MIRROR_POSITIONS = [
  { name: "startpos", fen: null, depth: 4 },
  { name: "kiwipete", fen: "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -", depth: 3 },
  { name: "dense middlegame", fen: "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P3/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10", depth: 3 },
  { name: "en-passant available", fen: "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -", depth: 4 },
];

function mirrorFen(fen) {
  const p = fen.trim().split(/\s+/);
  const swap = (ch) => (ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase());
  const board = p[0].split("/").reverse()
    .map((row) => row.split("").map((c) => (/[a-zA-Z]/.test(c) ? swap(c) : c)).join(""))
    .join("/");
  const turn = p[1] === "w" ? "b" : "w";
  const castling = (p[2] && p[2] !== "-")
    ? p[2].split("").map(swap).sort().join("")
    : "-";
  const ep = (p[3] && p[3] !== "-") ? p[3][0] + (9 - Number(p[3][1])) : "-";
  return `${board} ${turn} ${castling} ${ep} ${p[4] || 0} ${p[5] || 1}`;
}

let failures = 0;

function fresh(fen) {
  const g = new E.Game();
  if (fen) g.load(fen); else g.reset();
  return g;
}

console.log("perft\n-----");
for (const pos of POSITIONS) {
  for (let depth = 1; depth <= pos.expect.length; depth++) {
    const want = pos.expect[depth - 1];
    const got = E.perft(fresh(pos.fen), depth);
    const ok = got === want;
    if (!ok) failures++;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${pos.name} d${depth}: ${got}` +
        (ok ? "" : ` (expected ${want})`)
    );
  }
}

console.log("\ncolour-mirror symmetry\n----------------------");
for (const pos of MIRROR_POSITIONS) {
  const plain = fresh(pos.fen);
  const baseFen = plain.fen();
  const mirrored = fresh(mirrorFen(baseFen));
  const a = E.perft(fresh(pos.fen), pos.depth);
  const b = E.perft(mirrored, pos.depth);
  const ok = a === b;
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${pos.name} d${pos.depth}: ${a} vs mirrored ${b}`);
}

/* --- invariants over random self-play: the engine must never produce an
   illegal position, and unmake() must restore state exactly. --------------- */
console.log("\nself-play invariants\n--------------------");
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

for (const seed of [1, 42, 0xbeef, 0xc0ffee]) {
  const rnd = lcg(seed);
  const g = fresh(null);
  const startFen = g.fen();
  let plies = 0;
  let problem = null;
  for (let i = 0; i < 220; i++) {
    const ms = g.legal();
    if (ms.length === 0) break;
    if (ms.length > 218) { problem = `absurd move count ${ms.length}`; break; }
    // the side to move must never be able to leave its own king capturable
    for (const m of ms) {
      g.make(m);
      const movedIntoCheck = g.attacked(g.kings[g.turn === E.WHITE ? 1 : 0], g.turn);
      g.unmake();
      if (movedIntoCheck) { problem = "legal() returned a king-exposing move"; break; }
    }
    if (problem) break;
    const before = g.fen();
    const m = ms[Math.floor(rnd() * ms.length)];
    g.make(m);
    g.unmake();
    if (g.fen() !== before) { problem = "make/unmake did not restore the position"; break; }
    g.make(m);
    plies++;
  }
  // unwinding the whole game must land exactly back on the start position
  while (g.hist.length) g.unmake();
  if (!problem && g.fen() !== startFen) problem = "full unwind did not restore startpos";
  if (problem) failures++;
  console.log(`${problem ? "FAIL" : "ok  "} seed ${seed}: ${plies} plies${problem ? " — " + problem : ""}`);
}

/* --- the two search entry points must always return a playable move ------ */
console.log("\nsearch\n------");
const g = fresh(null);
const best = E.bestMove(g);
const bot = E.botMove(g);
const legalUci = g.legal().map(E.moveToUci);
for (const [label, mv] of [["bestMove", best], ["botMove", bot]]) {
  const ok = mv && legalUci.includes(E.moveToUci(mv));
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label} returned a legal move`);
}
// bestMove is deterministic (no jitter) — Hint must not wobble between clicks
const repeat = new Set();
for (let i = 0; i < 6; i++) repeat.add(E.moveToUci(E.bestMove(fresh(null))));
const deterministic = repeat.size === 1;
if (!deterministic) failures++;
console.log(`${deterministic ? "ok  " : "FAIL"} bestMove is deterministic (${[...repeat].join(", ")})`);

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
