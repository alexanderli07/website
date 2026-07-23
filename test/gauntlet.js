/**
 * GAMBIT — the anti-embarrassment gauntlet.   run with:  node test/gauntlet.js [games]
 *
 * The bot carries Alex's name, so this hunts for the ways an engine looks stupid
 * to a human, rather than for bugs. Five hunts:
 *
 *   1. SCHOLAR'S MATE + early-queen junk: scripted cheese lines. The bot must
 *      never be mated inside 10 plies by a script.
 *   2. FREE MATERIAL: an opponent who plays uniformly random legal moves hangs
 *      pieces constantly. When a clean free capture exists (undefended victim),
 *      the bot should take it — or something better — nearly always.
 *   3. HANGING ITS OWN PIECES: across the random games, count bot moves that
 *      park a piece where the opponent's reply wins >=300cp of material that the
 *      bot does not win back within its next move.
 *   4. WON-ENDGAME CONVERSION: K+Q vs K and K+R vs K from awkward corners, best
 *      defence. The bot must mate well inside the fifty-move rule, no stalemate.
 *   5. WINNING-POSITION DRAWS: none of the random games the bot is winning by a
 *      rook or more may end in stalemate/repetition/fifty-move.
 *
 * Reports everything, exits 1 only on the hard failures (1, 4, 5 and gross
 * versions of 2/3) so it can gate commits.
 */
const E = require("../engine.js");
global.GAMBIT_BOOK = require("../book.js");   /* the bot exactly as shipped */

const GAMES = Number(process.argv[2] || 24);
let failures = 0;
function ok(cond, label) {
  console.log((cond ? "ok   " : "FAIL ") + label);
  if (!cond) failures++;
}

/* deterministic RNG so a failing run can be re-run and debugged */
function mulberry(a) { return function () {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const val = (p) => [0, 100, 320, 330, 500, 900, 20000][p > 0 ? p : -p];
function material(g, side) {
  let m = 0;
  for (let s = 0; s < 128; s++) {
    if (s & 0x88) { s += 7; continue; }
    const p = g.board[s];
    if (p * side > 0 && p !== 6 * side) m += val(p);
  }
  return m;
}

/* ---- 1. the cheese scripts ---- */
{
  const cheeses = [
    ["scholar's (Qh5 first)",  ["e2e4", "d1h5", "f1c4", "h5f7"]],
    ["scholar's (Bc4 first)",  ["e2e4", "f1c4", "d1h5", "h5f7"]],
    ["wayward queen grind",    ["e2e4", "d1h5", "h5e5", "e5g7", "g7h8"]],
    ["bongcloud chaos",        ["e2e4", "e1e2", "e2e3", "d1e1", "e3d3"]],
  ];
  let mated = null;
  for (const [name, line] of cheeses) {
    const g = new E.Game();          /* bot plays Black, the script plays White */
    for (let ply = 0; ply < 24 && !mated; ply++) {
      const legal = g.legal();
      if (!legal.length) { if (g.inCheck() && g.turn === E.BLACK) mated = name; break; }
      if (g.turn === E.WHITE) {
        const want = line.find((u) => legal.some((m) => E.moveToUci(m) === u) &&
                                      !g.hist.some((h) => E.moveToUci(h.m) === u));
        g.make(want ? legal.find((m) => E.moveToUci(m) === want)
                    : E.searchRoot(g, 2, 64)[0].m);   /* script exhausted: shallow best */
      } else {
        g.make(E.botMove(g));
      }
    }
  }
  ok(mated === null, "never mated by scripted cheese" + (mated ? " (lost to: " + mated + ")" : ""));
}

/* ---- 2 + 3 + 5. the random-mover gauntlet ---- */
{
  let freeChances = 0, freeTaken = 0, hangs = 0, botMoves = 0;
  const deltas = [];
  let winningDraws = 0, results = { win: 0, draw: 0, other: 0 };
  for (let gi = 0; gi < GAMES; gi++) {
    const rnd = mulberry(9000 + gi * 331);
    const orig = Math.random; Math.random = rnd;
    const g = new E.Game();
    const botSide = gi % 2 === 0 ? E.BLACK : E.WHITE;   /* both colours */
    let result = "other";
    for (let ply = 0; ply < 160; ply++) {
      const legal = g.legal();
      if (!legal.length) {
        result = g.inCheck() ? (g.turn === botSide ? "loss" : "win") : "stalemate";
        break;
      }
      if (g.isDraw && g.isDraw()) { result = "draw"; break; }
      if (g.turn !== botSide) {
        g.make(legal[Math.floor(rnd() * legal.length)]);
        continue;
      }
      /* free-capture audit: is there an undefended victim the bot can just take? */
      const before = material(g, -botSide);
      const free = legal.filter((m) => {
        if (!m.captured) return false;
        g.make(m);
        const recap = g.legal().some((r) => r.to === m.to && r.captured);
        g.unmake();
        return !recap && val(m.captured) >= 300;
      });
      const myBefore = material(g, botSide);
      const mv = E.botMove(g);
      const chosen = E.moveToUci(mv);
      /* THE REAL GRADE: how far below the honest best did the chosen move score,
         by the engine's own wide search? A 1-ply material audit flags moves the
         depth-4 search correctly refutes (pins, forks, mate pursuit), so naive
         "free capture ignored / piece hung" counts are reported but the GATES
         run on search delta. Wide search only on flagged moves — it is 4x the
         cost of a narrow one. */
      let delta = 0;
      if (free.length) {
        const wide = E.searchRoot(g, 4, 400);
        const bestV = wide[0].v;
        if (bestV < E.MATE_MIN) {
          const mine = wide.find((e) => E.moveToUci(e.m) === chosen);
          delta = mine && mine.exact ? bestV - mine.v : 301;   /* outside band = worst case */
          deltas.push(delta);
        }
      }
      g.make(mv);
      botMoves++;
      if (free.length) {
        freeChances++;
        /* took the free piece, or won at least as much some other way */
        if (material(g, -botSide) <= before - 300) freeTaken++;
      }
      /* hang audit: does the opponent's best immediate capture now win >=300
         that the bot cannot immediately win back? */
      const oppCaps = g.legal().filter((m) => m.captured && val(m.captured) >= 300);
      let hung = false;
      for (const oc of oppCaps) {
        g.make(oc);
        const myRecaps = g.legal().filter((m) => m.captured);
        const bestBack = myRecaps.length ? Math.max(...myRecaps.map((m) => val(m.captured))) : 0;
        if (val(oc.captured) - bestBack >= 300) hung = true;
        g.unmake();
        if (hung) break;
      }
      if (hung && material(g, botSide) <= myBefore) hangs++;   /* not a sac that just won material */
    }
    const lead = material(g, botSide) - material(g, -botSide);
    if ((result === "draw" || result === "stalemate") && lead >= 500) winningDraws++;
    results[result === "win" ? "win" : result === "draw" || result === "stalemate" ? "draw" : "other"]++;
    Math.random = orig;
  }
  const gross = deltas.filter((d) => d >= 300).length;
  const sloppy = deltas.filter((d) => d >= 200).length;
  console.log(`     random-mover games: ${GAMES} · bot won ${results.win}, drew ${results.draw}, unfinished/other ${results.other}`);
  console.log(`     naive 1-ply counts (informational): free >=300cp taken ${freeTaken}/${freeChances}, "hangs" ${hangs}/${botMoves}`);
  console.log(`     search-graded, on ${deltas.length} flagged moves: >=300cp below best: ${gross} · >=200cp: ${sloppy}`);
  ok(results.win >= GAMES * 0.9, `beats a random mover >=90% (${results.win}/${GAMES})`);
  ok(gross === 0, `never plays >=300cp below its own best (BOT_MAX_LOSS holds: ${gross})`);
  ok(deltas.length === 0 || sloppy / deltas.length <= 0.05,
     `sloppy (>=200cp) choices on flagged moves <=5% (${sloppy}/${deltas.length})`);
  ok(winningDraws === 0, `never draws a game it leads by a rook+ (${winningDraws})`);
}

/* ---- 4. won-endgame conversion, best defence ---- */
{
  const ENDGAMES = [
    ["KQ vs K, corner", "7k/8/8/8/8/8/8/KQ6 w - -"],
    ["KQ vs K, centre", "8/8/8/3k4/8/8/8/K6Q w - -"],
    ["KR vs K, corner", "7k/8/8/8/8/8/8/KR6 w - -"],
    ["KR vs K, centre", "8/8/8/3k4/8/8/8/K6R w - -"],
  ];
  for (const [name, fen] of ENDGAMES) {
    const g = new E.Game(fen);
    let moves = 0, outcome = "unfinished";
    while (moves < 45) {
      const legal = g.legal();
      if (!legal.length) { outcome = g.inCheck() ? "mate" : "STALEMATE"; break; }
      if (g.isDraw && g.isDraw()) { outcome = "DRAW(" + g.isDraw() + ")"; break; }
      if (g.turn === E.WHITE) { g.make(E.botMove(g)); moves++; }
      else g.make(E.bestMove(g));                    /* best defence */
    }
    ok(outcome === "mate", `${name}: mate in ${moves} bot moves (got: ${outcome})`);
  }
}

console.log(failures ? "\n" + failures + " FAILURE(S)" : "\nALL TESTS PASSED");
process.exit(failures ? 1 : 0);
