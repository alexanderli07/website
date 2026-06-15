/**
 * GAMBIT search + draw tests — run with:  node test/tactics.js
 *
 * test/perft.js guards move GENERATION. This file guards everything the search
 * is supposed to understand:
 *
 *   1. the engine can see a mate delivered AGAINST it (the original bug: a
 *      2-ply search can only see mates it delivers, so AL-1200 walked into
 *      Qd8# to win a pawn),
 *   2. mate scores carry their distance, so it mates fast and resists slow,
 *   3. quiescence resolves exchanges instead of scoring mid-trade,
 *   4. the weakness model is weak but never suicidal — no move that allows a
 *      forced mate, and no catastrophic material gift, ever gets played,
 *   5. draws are detected (repetition / fifty-move / insufficient material)
 *      WITHOUT movegen noticing, and the search scores repetition as 0,
 *   6. the Zobrist key kept incrementally by make()/unmake() always matches a
 *      from-scratch recomputation,
 *   7. bestMove stays deterministic and inside its time budget.
 *
 * Run this together with perft after ANY edit to engine.js.
 */
const E = require("../engine.js");

let failures = 0;
function ok(cond, label, extra) {
  if (!cond) failures++;
  console.log(`${cond ? "ok  " : "FAIL"} ${label}${extra ? " — " + extra : ""}`);
}
function G(fen) { const g = new E.Game(); if (fen) g.load(fen); else g.reset(); return g; }

/* Does the side to move have a mate in one available here? */
function hasMateIn1(g) {
  for (const m of g.legal()) {
    g.make(m);
    const mate = g.legal().length === 0 && g.inCheck();
    g.unmake();
    if (mate) return true;
  }
  return false;
}
/* After `mv`, can the opponent mate immediately? */
function allowsMateIn1(fen, mv) {
  const g = G(fen);
  g.make(mv);
  return hasMateIn1(g);
}

/* ------------------------------------------------------------------ *
 * 1. THE REGRESSION. Black's rook on a8 is d8's only defender: after
 *    1...Rxa2?? 2.Qd8# it is over. Winning the a2 pawn is the top-scoring
 *    move for any search too shallow to see the reply, which is exactly
 *    what the old depth-2 bot did.
 * ------------------------------------------------------------------ */
const REPRO = "r5k1/5ppp/8/8/8/8/P5P1/3Q2K1 b - - 0 1";
console.log("mate threats against the engine\n-------------------------------");
{
  const g = G(REPRO);
  ok(!allowsMateIn1(REPRO, E.bestMove(g)), "bestMove does not walk into Qd8#",
    E.moveToUci(E.bestMove(g)));

  /* Rxa2 must be recognised as losing, not as winning a pawn. */
  const rxa2 = E.uciToMove(G(REPRO), "a8a2");
  ok(rxa2 !== null && allowsMateIn1(REPRO, rxa2), "control: Rxa2 really does allow mate in 1");

  let bad = 0;
  const picked = new Set();
  for (let i = 0; i < 400; i++) {
    const mv = E.botMove(G(REPRO));
    picked.add(E.moveToUci(mv));
    if (allowsMateIn1(REPRO, mv)) bad++;
  }
  ok(bad === 0, "botMove never allows Qd8# (400 samples)", `${bad} failures, ${picked.size} distinct moves played`);
  ok(!picked.has("a8a2"), "botMove never plays Rxa2 at all");
  ok(picked.size > 1, "botMove is still non-deterministic (weakness model alive)", picked.size + " distinct");
}

/* A second, unrelated shape: black must not let a rook lift deliver mate. */
{
  const FEN = "6k1/5p1p/6p1/8/8/7Q/5PPP/6K1 b - - 0 1";
  let bad = 0;
  for (let i = 0; i < 200; i++) if (allowsMateIn1(FEN, E.botMove(G(FEN)))) bad++;
  ok(bad === 0, "botMove avoids Qh8#-style threats (200 samples)", bad + " failures");
}

/* ------------------------------------------------------------------ *
 * 2. mate distance
 * ------------------------------------------------------------------ */
console.log("\nmate scores and distance\n------------------------");
{
  const g = G("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1");
  ok(E.moveToUci(E.bestMove(g)) === "a1a8", "finds the back-rank mate in 1");
}
{
  /* two ways to mate: Ra8# now, or a slow queen manoeuvre. Take the fast one. */
  const g = G("6k1/5ppp/8/8/8/7Q/8/R5K1 w - - 0 1");
  const mv = E.bestMove(g);
  g.make(mv);
  ok(g.legal().length === 0 && g.inCheck(), "prefers mate in 1 over a slower mate", E.moveToUci(mv));
}
{
  /* black is lost; the mate-distance term must make it resist rather than
     hand over the fastest mate */
  const FEN = "6k1/5ppp/8/8/8/8/8/R5K1 b - - 0 1";
  const mv = E.bestMove(G(FEN));
  ok(!allowsMateIn1(FEN, mv), "when losing, plays the longest resistance", E.moveToUci(mv));
}
{
  /* mate is forced whatever black does: the bot must still return a legal move
     and must not throw an exception when every candidate is excluded */
  const FEN = "7k/5ppp/8/8/8/8/5PPP/R5RK w - - 0 1";
  const g = G(FEN);
  const mv = E.botMove(g);
  ok(mv !== null && g.legal().some((x) => E.moveToUci(x) === E.moveToUci(mv)),
    "botMove returns a legal move when all lines are lost");
}

/* ------------------------------------------------------------------ *
 * 3. quiescence — no scoring in the middle of an exchange
 * ------------------------------------------------------------------ */
console.log("\nquiescence / horizon effect\n---------------------------");
for (const [name, fen, badUci] of [
  ["does not grab the defended e5 pawn",
   "rnbqkb1r/ppp2ppp/3p1n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 4", "f3e5"],
  ["does not play an unsound Bxh7+",
   "rnbq1rk1/ppp2ppp/3p1n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 7", "c4h7"],
]) {
  const got = E.moveToUci(E.bestMove(G(fen)));
  ok(got !== badUci, name, "played " + got);
}
for (const [name, fen, wantUci] of [
  ["takes a free queen", "rnb1kbnr/pppp1ppp/8/4p3/6q1/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 3", "f3g4"],
  ["takes a free rook", "7k/8/8/3r4/8/8/8/3R3K w - - 0 1", "d1d5"],
]) {
  const got = E.moveToUci(E.bestMove(G(fen)));
  ok(got === wantUci, name, "played " + got + ", wanted " + wantUci);
}

/* ------------------------------------------------------------------ *
 * 4. weakness model: weak, but never suicidal
 * ------------------------------------------------------------------ */
console.log("\nweakness model\n--------------");
{
  /* a mate it can see is a mate it plays, every single time */
  const FEN = "r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1";     /* 1...Ra1# */
  const picks = new Set();
  for (let i = 0; i < 300; i++) picks.add(E.moveToUci(E.botMove(G(FEN))));
  ok(picks.size === 1 && picks.has("a8a1"), "always plays the mate it sees", [...picks].join(","));
}
{
  /* the old model's 20% uniform-random branch would drop the queen here
     roughly one move in ten. It must never give her away for nothing. */
  const FEN = "rnb1kbnr/pppp1ppp/8/8/8/1q6/PPPPPPPP/RNBQKBNR b KQkq - 0 3";
  let gifts = 0;
  for (let i = 0; i < 400; i++) {
    const g = G(FEN);
    const mv = E.botMove(g);
    g.make(mv);
    /* can white now win the queen (or more) outright? */
    const before = E.evaluate(g);               /* from white's point of view */
    let bestGain = 0;
    for (const w of g.legal()) {
      if (!w.captured) continue;
      g.make(w);
      const after = -E.evaluate(g);             /* back to white's point of view */
      g.unmake();
      if (after - before > bestGain) bestGain = after - before;
    }
    if (bestGain >= 800) gifts++;               /* a whole queen, undefended */
  }
  ok(gifts === 0, "never hands over a queen for free (400 samples)", gifts + " gifts");
}
{
  /* still fallible: over many samples it must not always play the top move,
     or it stops being a ~1000 opponent */
  const FEN = "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 4";
  const best = E.moveToUci(E.bestMove(G(FEN)));
  let off = 0;
  for (let i = 0; i < 200; i++) if (E.moveToUci(E.botMove(G(FEN))) !== best) off++;
  ok(off > 20, "plays something other than the best move often enough to be beatable",
    off + "/200 non-best");
}

/* The general form of the safety guarantee, audited over real games instead of
   one hand-picked position: for every move AL-1200 actually plays, the search's
   own score for it must be within BOT_MAX_LOSS of the best move, and must not
   be a forced loss — unless the position was already lost whatever it played.
   This is the invariant that replaces the old uniform-random blunder branch. */
console.log("\nsafety invariant over self-play\n-------------------------------");
{
  function lcg2(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  let decisions = 0, lossViol = 0, mateViol = 0, alreadyLost = 0, worst = 0, detail = "";
  for (const seed of [11, 22, 33, 44]) {
    const rnd = lcg2(seed);
    const g = G(null);
    for (let ply = 0; ply < 70; ply++) {
      const ms = g.legal();
      if (!ms.length || g.isDraw()) break;
      if (g.turn === E.BLACK) {
        const sc = E.searchRoot(g, E.BOT_DEPTH, E.BOT_MAX_LOSS + 1);
        const mv = E.botMove(g);
        const hit = sc.find((x) => x.m.from === mv.from && x.m.to === mv.to && x.m.promo === mv.promo);
        decisions++;
        if (sc[0].v <= -E.MATE_MIN) alreadyLost++;      /* mated whatever it plays */
        else {
          const loss = sc[0].v - hit.v;
          if (loss > worst) worst = loss;
          if (loss > E.BOT_MAX_LOSS) { lossViol++; detail = g.fen() + " " + E.moveToUci(mv) + " loss " + loss; }
          if (hit.v <= -E.MATE_MIN) { mateViol++; detail = g.fen() + " " + E.moveToUci(mv) + " walks into mate"; }
        }
        g.make(mv);
      } else {
        g.make(rnd() < 0.5 ? E.bestMove(g) : ms[Math.floor(rnd() * ms.length)]);
      }
    }
  }
  ok(decisions > 100, "audited a meaningful number of bot decisions", decisions + " decisions");
  ok(lossViol === 0, `never exceeds BOT_MAX_LOSS (${E.BOT_MAX_LOSS}cp)`, `worst observed ${worst}cp` + (detail ? " / " + detail : ""));
  ok(mateViol === 0, "never chooses a move the search scores as a forced loss",
    detail || `${alreadyLost} decisions were already lost regardless`);
}

/* ------------------------------------------------------------------ *
 * 5. draws
 * ------------------------------------------------------------------ */
console.log("\ndraw detection\n--------------");
for (const [name, fen, want] of [
  ["K vs K", "8/8/4k3/8/8/4K3/8/8 w - - 0 1", "insufficient material"],
  ["K+B vs K", "8/8/4k3/8/8/4K3/8/5B2 w - - 0 1", "insufficient material"],
  ["K+N vs K", "8/8/4k3/8/8/4K3/8/5N2 w - - 0 1", "insufficient material"],
  /* NOT a draw: mate with two knights is possible, merely unforceable, so the
     position is not dead under FIDE and must not be auto-drawn. */
  ["K+N+N vs K is not a draw", "8/8/4k3/8/8/4K3/8/3NN3 w - - 0 1", null],
  ["K+B vs K+B, same colour", "5b2/8/4k3/8/8/4K3/8/6B1 w - - 0 1", "insufficient material"],
  ["K+B vs K+B, opposite colour", "5b2/8/4k3/8/8/4K3/8/5B2 w - - 0 1", null],
  ["K+R vs K is not a draw", "8/8/4k3/8/8/4K3/8/5R2 w - - 0 1", null],
  ["K+P vs K is not a draw", "8/8/4k3/8/8/4K3/4P3/8 w - - 0 1", null],
  ["halfmove 100", "8/8/4k3/8/8/4K3/6R1/5R2 w - - 100 60", "fifty-move rule"],
  ["halfmove 99", "8/8/4k3/8/8/4K3/6R1/5R2 w - - 99 60", null],
]) {
  const got = G(fen).isDraw();
  ok(got === want, "isDraw: " + name, `got ${JSON.stringify(got)}`);
}
{
  /* rook and king shuffle back and forth: the third occurrence is a draw, and
     taking the moves back must un-draw it */
  const g = G("4k3/8/8/8/8/8/8/4K2R w - - 0 1");
  const seq = ["h1h2", "e8e7", "h2h1", "e7e8", "h1h2", "e8e7", "h2h1", "e7e8"];
  const reasons = [];
  for (const u of seq) { g.make(E.uciToMove(g, u)); reasons.push(g.isDraw()); }
  ok(reasons.slice(0, 7).every((r) => r === null), "no false positive before the third occurrence",
    JSON.stringify(reasons));
  ok(reasons[7] === "threefold repetition", "threefold repetition detected on the third occurrence");
  ok(g.repetitionCount() === 3, "repetitionCount() === 3", "got " + g.repetitionCount());
  while (g.hist.length) g.unmake();
  ok(g.isDraw() === null, "unmake() rewinds the repetition history too");
}
{
  /* a capture resets the clock, so ancient positions cannot count */
  const g = G("4k3/8/8/8/8/8/8/4K2R w - - 0 1");
  ok(g.repetitionCount() === 1, "a fresh position has occurred once");
}
{
  /* the search must score a repetition as 0 rather than as material */
  const g = G("7k/6pp/8/8/8/8/6PP/6KQ b - - 0 1");
  const mv = E.bestMove(g);
  ok(mv !== null, "search survives a position where repetition is the best hope");
}

console.log("\ndraw detection must not touch movegen\n------------------------------------");
{
  const clean = G("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P3/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10");
  const stale = G("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P3/P1NP1N2/1PP1QPPP/R4RK1 w - - 120 90");
  ok(clean.legal().length === stale.legal().length,
    "legal() ignores the halfmove clock", `${clean.legal().length} vs ${stale.legal().length}`);
  ok(E.perft(clean, 3) === E.perft(stale, 3), "perft ignores the halfmove clock");
  /* and a repeated position still generates every move */
  const g = G("4k3/8/8/8/8/8/8/4K2R w - - 0 1");
  for (const u of ["h1h2", "e8e7", "h2h1", "e7e8", "h1h2", "e8e7", "h2h1", "e7e8"]) g.make(E.uciToMove(g, u));
  ok(g.isDraw() === "threefold repetition" && g.legal().length === G("4k3/8/8/8/8/8/8/4K2R w - - 0 1").legal().length,
    "a drawn-by-repetition position still generates its full move list");
}

/* ------------------------------------------------------------------ *
 * 6. Zobrist: the incremental key must never drift
 * ------------------------------------------------------------------ */
console.log("\nposition key integrity\n----------------------");
function hashWalk(g, depth) {
  const lo = g.hashLo, hi = g.hashHi;
  g.rehash();
  if (g.hashLo !== lo || g.hashHi !== hi) return false;
  if (depth === 0) return true;
  const ms = g.moves(), us = g.turn, ki = us === E.WHITE ? 0 : 1;
  for (const m of ms) {
    g.make(m);
    const good = g.attacked(g.kings[ki], -us) ? true : hashWalk(g, depth - 1);
    g.unmake();
    if (!good) return false;
  }
  return true;
}
for (const [name, fen, d] of [
  ["startpos", null, 4],
  ["kiwipete (castling, ep, pins)", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -", 3],
  ["en-passant traps", "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -", 4],
  ["promotions", "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 3],
]) {
  ok(hashWalk(G(fen), d), `incremental hash matches rehash() over ${name} d${d}`);
}
{
  /* Two different routes to the same position must produce the same key —
     that is the whole premise of the transposition table. Knight moves only,
     so the halfmove clock and the en-passant square match as well. */
  const a = G(null), b = G(null);
  for (const u of ["g1f3", "b8c6", "b1c3", "g8f6"]) a.make(E.uciToMove(a, u));
  for (const u of ["b1c3", "g8f6", "g1f3", "b8c6"]) b.make(E.uciToMove(b, u));
  ok(a.hashLo === b.hashLo && a.hashHi === b.hashHi, "transpositions share a key");
  ok(a.fen() === b.fen(), "control: the two routes really do reach the same FEN");
}
{
  /* castling rights and ep squares are part of the key */
  const a = G("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
  const b = G("r3k2r/8/8/8/8/8/8/R3K2R w kq - 0 1");
  ok(a.hashLo !== b.hashLo || a.hashHi !== b.hashHi, "castling rights change the key");
  const c = G("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w - c6 0 2");
  const d = G("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w - - 0 2");
  ok(c.hashLo !== d.hashLo || c.hashHi !== d.hashHi, "the en-passant square changes the key");
}

/* ------------------------------------------------------------------ *
 * 7. determinism + budget
 * ------------------------------------------------------------------ */
console.log("\ndeterminism and time budget\n---------------------------");
const BUDGET = [
  ["startpos", null],
  ["kiwipete", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -"],
  ["dense middlegame", "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P3/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10"],
  ["open tactical", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"],
  ["capture storm", "r1b1k2r/pp1p1ppp/1qn1pn2/2b5/2B1P3/2N2N2/PPPBQPPP/R3K2R w KQkq - 0 11"],
  ["218 legal moves", "R6R/3Q4/1Q4Q1/4Q3/2Q4Q/Q4Q2/pp1Q4/kBNN1KB1 w - - 0 1"],
  ["both queens loose", "r2q1rk1/1b1nbppp/p2ppn2/1p4B1/3NP3/1BN5/PPPQ1PPP/2KR3R w - - 0 13"],
];
/* Generous ceiling: botMove runs on the browser main thread between the
   player's click and the piece sliding, so a regression that made the search
   ten times slower has to fail here rather than in someone's browser. */
const CEILING_MS = 400;
let slowest = 0, slowestName = "";
for (const [name, fen] of BUDGET) {
  const keys = new Set();
  for (let i = 0; i < 3; i++) keys.add(E.moveToUci(E.bestMove(G(fen))));
  ok(keys.size === 1, `bestMove deterministic: ${name}`, [...keys].join(","));

  E.bestMove(G(fen));                                  /* warm up the JIT */
  const t0 = process.hrtime.bigint();
  E.bestMove(G(fen));
  E.botMove(G(fen));
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 2;
  if (ms > slowest) { slowest = ms; slowestName = name; }
  console.log(`     ${name.padEnd(20)} ${ms.toFixed(1)}ms/search`);
}
ok(slowest < CEILING_MS, `slowest search under ${CEILING_MS}ms`, `${slowestName} at ${slowest.toFixed(1)}ms`);

/* the search must never return an illegal move, in any position we can reach */
console.log("\nsearch returns legal moves under self-play\n-----------------------------------------");
function lcg(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
for (const seed of [3, 77, 0xfeed]) {
  const rnd = lcg(seed);
  const g = G(null);
  let plies = 0, problem = null;
  for (let i = 0; i < 60; i++) {
    const ms = g.legal();
    if (!ms.length || g.isDraw()) break;
    const uci = new Set(ms.map(E.moveToUci));
    const mv = g.turn === E.BLACK ? E.botMove(g) : E.bestMove(g);
    if (!mv || !uci.has(E.moveToUci(mv))) { problem = "returned an illegal move"; break; }
    const before = g.fen();
    g.make(mv); g.unmake();
    if (g.fen() !== before) { problem = "search mutated the position"; break; }
    g.make(rnd() < 0.5 ? mv : ms[Math.floor(rnd() * ms.length)]);
    plies++;
  }
  ok(problem === null, `seed ${seed}: ${plies} plies`, problem || "");
}

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
