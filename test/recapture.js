/**
 * GAMBIT — does AL-1200 take back?   run with:  node test/recapture.js [trials]
 *
 * The complaint was that the bot often just ignores a capture, pawns especially.
 * This measures it rather than guessing at it.
 *
 * Each case is a real opening line played out in UCI, ending with a CAPTURE BY
 * WHITE (the player). The square that capture landed on is the recapture square —
 * derived from the move, never hand-written, which is what went wrong in the first
 * draft of this file. Black (AL-1200) is then asked to move `trials` times and we
 * count how often it takes back.
 *
 * `honest` is what bestMove() — the full-strength, deterministic search behind
 * Hint — does in the same position. Where honest recaptures and the bot does not,
 * that gap IS the bug. Where honest declines too, taking back is genuinely not
 * best and the bot should not be judged on it.
 *
 * AL-1200 is meant to be fallible, so the target is not 100%. It is "declining a
 * sound recapture is the exception, not a coin flip".
 */
const E = require("../engine.js");

const CASES = [
  { name: "Qxd5 — queen takes back a pawn (Scandinavian)",
    line: "e2e4 d7d5 e4d5" },
  { name: "Nxe5 — knight takes back a knight",
    line: "e2e4 e7e5 g1f3 b8c6 f3e5" },
  { name: "exd5 — pawn takes back a pawn (QGD centre)",
    line: "d2d4 d7d5 c2c4 e7e6 c4d5" },
  { name: "bxc6/dxc6 — pawn takes back a bishop (Exchange Ruy)",
    line: "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5c6" },
  { name: "Qxf6/gxf6 — takes back a bishop",
    line: "d2d4 g8f6 c1g5 e7e6 g5f6" },
  { name: "cxd4 — pawn takes back a pawn (Sicilian)",
    line: "e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e6 c3d5 e6d5" },
  /* CONTROL. White's rook just took the queen on d8 and is undefended; declining
     costs 500cp, which is outside BOT_MAX_LOSS (350). The safety ceiling — not the
     softmax — should force this one, so it must sit at 100% whatever the temperature
     is. If this ever drops below 100 the ceiling itself is broken.
     Given as a FEN because a forced recapture is fiddly to reach from the start, and
     `to` is stated because there is no last move to read it from. */
  { name: "Kxd8 — ceiling-forced recapture (control, must be 100%)",
    fen: "3Rk3/8/8/8/8/8/8/4K3 b - -", to: "d8" },
];

/* 0x88 with rank index 0 = RANK 1 (white's back rank), which is what the engine
   actually uses — an earlier draft of this file assumed the opposite and mislabelled
   every square by a rank or three. */
const FILES = "abcdefgh";
const alg = (sq) => FILES[sq & 15] + (1 + (sq >> 4));
function sqIndex(a) { return (Number(a[1]) - 1) * 16 + FILES.indexOf(a[0]); }

function play(line) {
  const g = new E.Game();
  let last = null;
  for (const u of line.trim().split(/\s+/)) {
    const m = g.legal().find((x) => E.moveToUci(x) === u);
    if (!m) throw new Error(`illegal in line: ${u} (after ${last ? E.moveToUci(last) : "start"})`);
    g.make(m);
    last = m;
  }
  return { g, last };
}

const N = Number(process.argv[2] || 300);
console.log(`BOT_TEMP inside engine.js · BOT_MAX_LOSS=${E.BOT_MAX_LOSS} ` +
            `BOT_DEPTH=${E.BOT_DEPTH}  ·  ${N} trials per case\n`);

const setup = (c) => (c.fen ? { g: new E.Game(c.fen), last: null } : play(c.line));

let sumPct = 0, counted = 0, worst = null, honestGap = 0, honestCases = 0;
for (const c of CASES) {
  let g, last;
  try { ({ g, last } = setup(c)); }
  catch (e) { console.log(`  !! ${c.name} — ${e.message}`); continue; }

  if (!c.fen && !last.captured) { console.log(`  !! ${c.name} — line does not end in a capture`); continue; }
  const target = c.fen ? sqIndex(c.to) : last.to;
  const outs = g.legal().filter((m) => m.to === target);
  if (outs.length === 0) { console.log(`  !! ${c.name} — no legal recapture on ${alg(target)}`); continue; }

  const honest = E.bestMove(g);
  const honestTakes = !!honest && honest.to === target;

  let took = 0;
  for (let i = 0; i < N; i++) {
    const m = E.botMove(setup(c).g);
    if (m && m.to === target) took++;
  }
  const pct = (took / N) * 100;
  /* Only positions where the honest search recaptures are scored. Where it declines,
     taking back genuinely is not best and the bot is right not to be forced into it —
     counting those would be measuring the wrong thing. */
  if (honestTakes) {
    sumPct += pct; counted++; honestGap += 100 - pct; honestCases++;
    if (worst === null || pct < worst.pct) worst = { name: c.name, pct };
  }

  const bar = "#".repeat(Math.round(pct / 4)).padEnd(25, ".");
  console.log(`  ${bar} ${pct.toFixed(1).padStart(5)}%  on ${alg(target)}  ${c.name}`);
  console.log(`  ${" ".repeat(25)}         ${outs.length} legal recapture(s) · ` +
              `honest search ${honestTakes ? "TAKES" : "declines (" + (honest ? E.moveToUci(honest) : "-") + ")"}`);
}
console.log(`\n  over the ${honestCases} case(s) where the honest search recaptures:`);
console.log(`    mean ${(sumPct / counted).toFixed(1)}%   worst ${worst.pct.toFixed(1)}%  (${worst.name})`);
console.log(`    shortfall vs honest: ${honestGap.toFixed(0)} points across ${honestCases} cases`
          + `  (${(honestGap / honestCases).toFixed(1)} avg)`);
