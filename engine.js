/* ============================================================
   GAMBIT chess engine — pure JS, zero DOM. 0x88 board.
   Exposes: Game, perft(game, depth), bestMove(game), botMove(game)
   plus pure helpers: moveToUci, uciToMove, san, evaluate.

   Keep this file DOM-free: `test/perft.js` requires it directly in Node,
   which is the only guard against a movegen regression. Run the tests
   after ANY change in here:  node test/perft.js
   ============================================================ */
"use strict";

var WHITE = 1, BLACK = -1;
var PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
var FLAG_EP = 1, FLAG_DOUBLE = 2, FLAG_CASTLE = 4;

var KNIGHT_D = [33, 31, 18, 14, -33, -31, -18, -14];
var KING_D   = [17, 16, 15, 1, -17, -16, -15, -1];
var BISHOP_D = [17, 15, -15, -17];
var ROOK_D   = [16, 1, -16, -1];

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
var PIECE_CHARS = " PNBRQK";
var FILES = "abcdefgh";

/* ============================================================
   TUNING KNOBS — everything that decides how strong AL-1600 is
   lives here, one line each.
   ------------------------------------------------------------
   SEARCH
     SEARCH_DEPTH  full-width plies from the root. 3 is the minimum that can
                   see a mate delivered *against* the engine (our move, their
                   mate, our empty move list); 4 also catches mate-in-2 and
                   most one-exchange tactics. Cost roughly x4 per ply.
     QS_DEPTH      extra plies quiescence may spend resolving captures and
                   check evasions past the horizon. Stops the search from
                   scoring a position in the middle of a trade.
                   There is deliberately no delta-pruning knob here. Skipping a
                   capture because "winning the victim for free plus a slack
                   still cannot reach alpha" is not a true bound — a capture can
                   also win the NEXT piece — so a pruned node's score depends on
                   the window it was searched with. Sharing those scores through
                   the transposition table then makes the search disagree with
                   itself: measured over 1255 root moves, 12.4% of scores did not
                   match a cold re-search of the same move, some by 460cp, and
                   "exact" scores were among them. That is fatal here, because
                   BOT_MAX_LOSS is enforced by comparing scores from different
                   searches. Without it the same 1255 moves agree exactly, every
                   time, at the cost of ~40% more nodes. Raising the slack does
                   not fix it (at 1200cp, still 2 mismatches).
     MATE / MATE_MIN  mate magnitudes. Mate scores fold in the ply
                   (MATE - ply) so a faster mate beats a slower one and the
                   losing side prefers the longest resistance. MATE_MIN is
                   the "this is a mate score, not an eval" cutoff — real
                   evals never come close (a whole board is < 10000cp).

   WEAKNESS MODEL (botMove only; bestMove/Hint is always honest + deterministic)
     BOT_DEPTH     the bot searches as deep as the hint does. Its weakness
                   comes from *choosing* imperfectly, never from being blind.
     BOT_TEMP      softmax temperature in centipawns. Weight of a candidate is
                   exp((score - best) / BOT_TEMP). Lower = stronger and more
                   deterministic; higher = looser. At 260 the bot's average loss
                   against its own full-strength search measures ~46cp (median
                   40, p90 95) over 408 decisions against a depth-1 opponent,
                   and higher in sharper positions — the figure moves with the
                   opposition, so treat it as a band, not a constant. Drop it to
                   ~150 for a noticeably sharper opponent. It was
                   220 while quiescence still delta-pruned; removing that
                   pruning sharpened the scores enough to pull the average loss
                   down to ~87cp, and 260 puts the weakness back where it was
                   calibrated.
     BOT_RECAPTURE_BIAS  multiplies the weight of a move that captures on the square
                   the opponent just captured on. This is the fix for "the bot does
                   not take back", and it is a HUMAN-LIKENESS knob rather than a
                   strength one.
                   It is needed because the search is RIGHT and still looks wrong.
                   After 1.e4 e5 2.Nf3 Nc6 3.Nxe5, the moves that decline Nxe5 score
                   only 40-50cp worse — honestly so, because the knight is still
                   hanging next move too. The engine does not believe recapturing is
                   urgent, and it is correct. A 1200-rated human takes back
                   reflexively anyway, so that has to be stated, not tuned for.
                   Measured with test/recapture.js over five positions where taking
                   back IS the honest best move:
                       bias    1     6    25    60   120
                       mean  38%   61%   81%   89%   95%
                       worst  5%   22%   53%   73%   88%
                   120 is deliberately large: it means "recapture unless the safety
                   ceiling forbids it". Crucially it costs nothing elsewhere —
                   average loss 52.4cp before, 50.9 after; best-move rate 12.1%
                   before, 13.8% after. It only ever moves the decision in positions
                   where a capture just happened.
                   Accepted consequence: the bot will take back into a mildly bad
                   recapture, and can be baited by a sacrifice deeper than its
                   horizon. BOT_MAX_LOSS still filters anything catastrophic, and
                   "always takes back" is itself a very human 1200 weakness — far
                   more human than ignoring a capture altogether.
     BOT_RANK_DECAY  multiplies a move's weight by DECAY^rank — THE strength dial,
                   set to 0.74 when Alex asked the bot to play at his own rating
                   (~1600: his blitz 1542 / bullet 1665 / rapid 1716). At 0.74,
                   measured in self-play: ~14cp average loss, best move 44% of the
                   time, and it no longer sheds 300cp+ for nothing (0 of 237). That
                   sits just under its own honest search, and depth-4 + quiescence
                   on fast time controls is commonly reckoned high-1500s to 1700s —
                   "1600-ish" by construction, not a certified Elo.
                   Why the knob exists: a plain softmax has no term for HOW MANY
                   candidates there are, so in a bushy 32-move position the near-best
                   tail outvoted the best move ~20:1 and the bot played its own best
                   move only 12-14% of the time (the original AL-1200 feel).
                   Temperature cannot correct that — it scales every tail entry
                   equally. The measured dial, 240 self-play decisions per point:
                       decay        1.00  0.92  0.85  0.78  0.74  0.70  0.62
                       avg loss cp  52.4  32.9  22.0  17.4  13.6  11.6   8.1
                       plays best   12%   22%   30%   43%   44%   52%   60%
                   THE UNLOCK ECONOMY SURVIVES the buff: unlocks pay on ANY capture
                   of a bot piece, equal trades included, and a 1600 plays plenty of
                   trades — what visitors lose is free material, not captures. The
                   roll-up, the checkmate jackpot and the Unlock-everything button
                   still cover weaker visitors. Restore 1.0 for the old soft bot.
     BOT_MAX_LOSS  hard ceiling on how much worse than best a played move may
                   be. This is the whole safety story. 350 sits above a knight
                   (320) and below a rook (500): AL-1600 can drop a piece, and
                   does, but it can never shed a rook or a queen for nothing
                   and it can never walk into a mate it can see.
                   It is also the ONLY guarantee here that does not depend on the
                   knobs above: test/recapture.js keeps a position whose recapture
                   is forced by this ceiling alone and asserts it at 100%.
   Every candidate that allows a forced mate (score <= -MATE_MIN) is excluded
   outright, whatever the knobs say, and a mate the bot can see is always
   played. There is no "uniformly random legal move" path any more — that is
   what let a four-move mate work and what produced inhuman rook shuffles.
   ============================================================ */
var SEARCH_DEPTH = 4;
var QS_DEPTH = 6;
var MATE = 100000;
var MATE_MIN = MATE - 1000;

var BOT_DEPTH = 4;
var BOT_TEMP = 260;
var BOT_RANK_DECAY = 0.74;     /* the ~1600 setting — the note above is the dial */
var BOT_RECAPTURE_BIAS = 120;
var BOT_MAX_LOSS = 350;

/* Zobrist keys — two 32-bit halves per component, so a position key is a full
   64 bits and repetition detection does not collide in practice. Each half is
   drawn from its OWN fixed-seed mulberry32 stream; see initZobrist for why one
   shared stream silently halved the entropy. Fixed seeds keep bestMove()
   deterministic. Purely internal; nothing outside this file needs to know the
   hash exists. Indexed by (pieceCode + 6) * 128 + square, where pieceCode is
   the signed board value (-6..6). */
var Z_LO = new Int32Array(13 * 128), Z_HI = new Int32Array(13 * 128);
var Z_CASTLE_LO = new Int32Array(16), Z_CASTLE_HI = new Int32Array(16);
var Z_EP_LO = new Int32Array(8), Z_EP_HI = new Int32Array(8);
var Z_TURN_LO = 0, Z_TURN_HI = 0;
(function initZobrist() {
  /* Two INDEPENDENT streams, one per half. Drawing both halves from a single
     xorshift32 made each high word a deterministic function of the low word it
     followed, so the "64-bit" key really carried 32 bits of entropy — which is
     what repetition detection and the transposition table are keyed on.
     mulberry32 also avalanches far better than raw xorshift. Seeds are fixed,
     so the tables are identical on every run and bestMove stays deterministic. */
  function mulberry(seed) {
    var s = seed | 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return (t ^ (t >>> 14)) | 0;
    };
  }
  var rndLo = mulberry(0x9e3779b9), rndHi = mulberry(0x85ebca6b);
  var i;
  for (i = 0; i < Z_LO.length; i++) { Z_LO[i] = rndLo(); Z_HI[i] = rndHi(); }
  for (i = 0; i < 16; i++) { Z_CASTLE_LO[i] = rndLo(); Z_CASTLE_HI[i] = rndHi(); }
  for (i = 0; i < 8; i++) { Z_EP_LO[i] = rndLo(); Z_EP_HI[i] = rndHi(); }
  Z_TURN_LO = rndLo(); Z_TURN_HI = rndHi();
})();

/* castling-rights mask per square: rights &= mask[from] & mask[to] */
var CASTLE_MASK = (function () {
  var m = new Array(128);
  for (var i = 0; i < 128; i++) m[i] = 15;
  m[0x00] = 13;  /* a1: clear white Q (bit 2) */
  m[0x07] = 14;  /* h1: clear white K (bit 1) */
  m[0x04] = 12;  /* e1: clear both white     */
  m[0x70] = 7;   /* a8: clear black q (bit 8) */
  m[0x77] = 11;  /* h8: clear black k (bit 4) */
  m[0x74] = 3;   /* e8: clear both black      */
  return m;
})();

function fileOf(s) { return s & 7; }
function rankOf(s) { return s >> 4; }
function onBoard(s) { return (s & 0x88) === 0; }
function algebraic(s) { return FILES[fileOf(s)] + (rankOf(s) + 1); }
function fromAlgebraic(a) { return (a.charCodeAt(1) - 49) * 16 + (a.charCodeAt(0) - 97); }

class Game {
  constructor(fen) { this.load(fen || START_FEN); }

  reset() { this.load(START_FEN); }

  load(fen) {
    var parts = fen.trim().split(/\s+/);
    this.board = new Int8Array(128);
    this.kings = [-1, -1];               /* [white king sq, black king sq] */
    var rows = parts[0].split("/");
    for (var r = 0; r < 8; r++) {
      var f = 0;
      for (var k = 0; k < rows[r].length; k++) {
        var ch = rows[r][k];
        if (ch >= "1" && ch <= "8") { f += +ch; continue; }
        var pt = PIECE_CHARS.indexOf(ch.toUpperCase());
        var color = (ch === ch.toLowerCase()) ? BLACK : WHITE;
        var s = (7 - r) * 16 + f;
        this.board[s] = pt * color;
        if (pt === KING) this.kings[color === WHITE ? 0 : 1] = s;
        f++;
      }
    }
    this.turn = parts[1] === "b" ? BLACK : WHITE;
    this.castling = 0;
    var c = parts[2] || "-";
    if (c.indexOf("K") >= 0) this.castling |= 1;
    if (c.indexOf("Q") >= 0) this.castling |= 2;
    if (c.indexOf("k") >= 0) this.castling |= 4;
    if (c.indexOf("q") >= 0) this.castling |= 8;
    this.ep = (parts[3] && parts[3] !== "-") ? fromAlgebraic(parts[3]) : -1;
    this.halfmove = parts[4] ? +parts[4] : 0;
    this.fullmove = parts[5] ? +parts[5] : 1;
    this.hist = [];
    this.rehash();
    return this;
  }

  /* Recompute the position key from scratch. Only load() needs this; make()
     and unmake() keep the key up to date incrementally. */
  rehash() {
    var lo = 0, hi = 0, s, p, zi;
    for (s = 0; s < 128; s++) {
      if (s & 0x88) { s += 7; continue; }
      p = this.board[s];
      if (p === 0) continue;
      zi = (p + 6) * 128 + s;
      lo ^= Z_LO[zi]; hi ^= Z_HI[zi];
    }
    lo ^= Z_CASTLE_LO[this.castling]; hi ^= Z_CASTLE_HI[this.castling];
    if (this.ep >= 0) { lo ^= Z_EP_LO[fileOf(this.ep)]; hi ^= Z_EP_HI[fileOf(this.ep)]; }
    if (this.turn === BLACK) { lo ^= Z_TURN_LO; hi ^= Z_TURN_HI; }
    this.hashLo = lo | 0; this.hashHi = hi | 0;
  }

  fen() {
    var out = "";
    for (var r = 7; r >= 0; r--) {
      var empty = 0;
      for (var f = 0; f < 8; f++) {
        var p = this.board[r * 16 + f];
        if (p === 0) { empty++; continue; }
        if (empty) { out += empty; empty = 0; }
        var ch = PIECE_CHARS[p > 0 ? p : -p];
        out += p > 0 ? ch : ch.toLowerCase();
      }
      if (empty) out += empty;
      if (r) out += "/";
    }
    out += " " + (this.turn === WHITE ? "w" : "b");
    var c = "";
    if (this.castling & 1) c += "K";
    if (this.castling & 2) c += "Q";
    if (this.castling & 4) c += "k";
    if (this.castling & 8) c += "q";
    out += " " + (c || "-");
    out += " " + (this.ep >= 0 ? algebraic(this.ep) : "-");
    out += " " + this.halfmove + " " + this.fullmove;
    return out;
  }

  attacked(s, by) {
    var b = this.board, d, t, q, i;
    if (by === WHITE) {
      if (onBoard(s - 15) && b[s - 15] === PAWN) return true;
      if (onBoard(s - 17) && b[s - 17] === PAWN) return true;
    } else {
      if (onBoard(s + 15) && b[s + 15] === -PAWN) return true;
      if (onBoard(s + 17) && b[s + 17] === -PAWN) return true;
    }
    for (i = 0; i < 8; i++) { t = s + KNIGHT_D[i]; if (onBoard(t) && b[t] === KNIGHT * by) return true; }
    for (i = 0; i < 8; i++) { t = s + KING_D[i];   if (onBoard(t) && b[t] === KING * by)   return true; }
    for (i = 0; i < 4; i++) {
      d = BISHOP_D[i]; t = s + d;
      while (onBoard(t)) {
        q = b[t];
        if (q !== 0) { if (q === BISHOP * by || q === QUEEN * by) return true; break; }
        t += d;
      }
    }
    for (i = 0; i < 4; i++) {
      d = ROOK_D[i]; t = s + d;
      while (onBoard(t)) {
        q = b[t];
        if (q !== 0) { if (q === ROOK * by || q === QUEEN * by) return true; break; }
        t += d;
      }
    }
    return false;
  }

  inCheck() { return this.attacked(this.kings[this.turn === WHITE ? 0 : 1], -this.turn); }

  /* Pseudo-legal move generation.
     `loud` is an optimisation for quiescence, which throws away everything that
     is not a capture or a queen promotion anyway: with it set, the quiet moves
     are never built in the first place. The kept set is exactly the set
     quiescence keeps — every capture, with all four promotion choices, plus the
     quiet queen promotion — so search scores are unaffected; it only stops the
     allocation of a few dozen throw-away move objects per quiescence node,
     which is most of the nodes in the tree. Called with no argument (perft,
     legal(), negamax) it generates everything, exactly as before. */
  moves(loud) {
    var list = [], b = this.board, us = this.turn, them = -us;
    var s, p, pt, i, d, t, q, promoRank, startRank, fwd, PR = [QUEEN, ROOK, BISHOP, KNIGHT];
    for (s = 0; s < 128; s++) {
      if (s & 0x88) { s += 7; continue; }
      p = b[s];
      if (p === 0 || (p > 0 ? WHITE : BLACK) !== us) continue;
      pt = p > 0 ? p : -p;
      if (pt === PAWN) {
        fwd = 16 * us;
        promoRank = us === WHITE ? 7 : 0;
        startRank = us === WHITE ? 1 : 6;
        t = s + fwd;
        if (b[t] === 0) {
          if (rankOf(t) === promoRank) {
            if (loud) list.push({ from: s, to: t, piece: p, captured: 0, promo: QUEEN, flags: 0 });
            else for (i = 0; i < 4; i++) list.push({ from: s, to: t, piece: p, captured: 0, promo: PR[i], flags: 0 });
          } else if (!loud) {
            list.push({ from: s, to: t, piece: p, captured: 0, promo: 0, flags: 0 });
            if (rankOf(s) === startRank && b[s + 2 * fwd] === 0)
              list.push({ from: s, to: s + 2 * fwd, piece: p, captured: 0, promo: 0, flags: FLAG_DOUBLE });
          }
        }
        for (d = -1; d <= 1; d += 2) {
          t = s + fwd + d;
          if (!onBoard(t)) continue;
          q = b[t];
          if (q !== 0 && (q > 0 ? WHITE : BLACK) === them) {
            if (rankOf(t) === promoRank) {
              for (i = 0; i < 4; i++) list.push({ from: s, to: t, piece: p, captured: q, promo: PR[i], flags: 0 });
            } else list.push({ from: s, to: t, piece: p, captured: q, promo: 0, flags: 0 });
          } else if (t === this.ep && q === 0) {
            list.push({ from: s, to: t, piece: p, captured: PAWN * them, promo: 0, flags: FLAG_EP });
          }
        }
      } else if (pt === KNIGHT || pt === KING) {
        var dirs = pt === KNIGHT ? KNIGHT_D : KING_D;
        for (i = 0; i < 8; i++) {
          t = s + dirs[i];
          if (!onBoard(t)) continue;
          q = b[t];
          if (q === 0 ? !loud : (q > 0 ? WHITE : BLACK) === them)
            list.push({ from: s, to: t, piece: p, captured: q, promo: 0, flags: 0 });
        }
      } else {
        var sdirs = pt === BISHOP ? BISHOP_D : (pt === ROOK ? ROOK_D : KING_D);
        for (i = 0; i < sdirs.length; i++) {
          d = sdirs[i]; t = s + d;
          while (onBoard(t)) {
            q = b[t];
            if (q === 0) { if (!loud) list.push({ from: s, to: t, piece: p, captured: 0, promo: 0, flags: 0 }); }
            else {
              if ((q > 0 ? WHITE : BLACK) === them)
                list.push({ from: s, to: t, piece: p, captured: q, promo: 0, flags: 0 });
              break;
            }
            t += d;
          }
        }
      }
    }
    if (loud) return list;                 /* castling is never a capture */
    /* castling — king not in check, path empty, transit squares not attacked */
    if (us === WHITE) {
      if ((this.castling & 1) && b[0x05] === 0 && b[0x06] === 0 && b[0x07] === ROOK &&
          !this.attacked(0x04, them) && !this.attacked(0x05, them) && !this.attacked(0x06, them))
        list.push({ from: 0x04, to: 0x06, piece: KING, captured: 0, promo: 0, flags: FLAG_CASTLE });
      if ((this.castling & 2) && b[0x03] === 0 && b[0x02] === 0 && b[0x01] === 0 && b[0x00] === ROOK &&
          !this.attacked(0x04, them) && !this.attacked(0x03, them) && !this.attacked(0x02, them))
        list.push({ from: 0x04, to: 0x02, piece: KING, captured: 0, promo: 0, flags: FLAG_CASTLE });
    } else {
      if ((this.castling & 4) && b[0x75] === 0 && b[0x76] === 0 && b[0x77] === -ROOK &&
          !this.attacked(0x74, them) && !this.attacked(0x75, them) && !this.attacked(0x76, them))
        list.push({ from: 0x74, to: 0x76, piece: -KING, captured: 0, promo: 0, flags: FLAG_CASTLE });
      if ((this.castling & 8) && b[0x73] === 0 && b[0x72] === 0 && b[0x71] === 0 && b[0x70] === -ROOK &&
          !this.attacked(0x74, them) && !this.attacked(0x73, them) && !this.attacked(0x72, them))
        list.push({ from: 0x74, to: 0x72, piece: -KING, captured: 0, promo: 0, flags: FLAG_CASTLE });
    }
    return list;
  }

  legal() {
    var out = [], ms = this.moves(), us = this.turn, ki = us === WHITE ? 0 : 1;
    for (var i = 0; i < ms.length; i++) {
      this.make(ms[i]);
      if (!this.attacked(this.kings[ki], -us)) out.push(ms[i]);
      this.unmake();
    }
    return out;
  }

  make(m) {
    var us = this.turn, b = this.board;
    var lo = this.hashLo, hi = this.hashHi, zi, landed, rook, csq;
    /* the pre-move key rides along in the history entry: unmake() restores it
       verbatim, and repetitionCount() reads the entries as a list of the
       positions this game has actually stood in. */
    this.hist.push({ m: m, castling: this.castling, ep: this.ep, halfmove: this.halfmove,
                     hashLo: lo, hashHi: hi });
    landed = m.promo ? m.promo * us : m.piece;
    zi = (m.piece + 6) * 128 + m.from; lo ^= Z_LO[zi]; hi ^= Z_HI[zi];
    if (m.captured) {
      csq = (m.flags & FLAG_EP) ? m.to - 16 * us : m.to;
      zi = (m.captured + 6) * 128 + csq; lo ^= Z_LO[zi]; hi ^= Z_HI[zi];
    }
    zi = (landed + 6) * 128 + m.to; lo ^= Z_LO[zi]; hi ^= Z_HI[zi];
    b[m.from] = 0;
    b[m.to] = landed;
    if (m.flags & FLAG_EP) b[m.to - 16 * us] = 0;
    if (m.flags & FLAG_CASTLE) {
      rook = ROOK * us;
      if (m.to === m.from + 2) {
        b[m.from + 1] = b[m.from + 3]; b[m.from + 3] = 0;
        zi = (rook + 6) * 128 + (m.from + 3); lo ^= Z_LO[zi]; hi ^= Z_HI[zi];
        zi = (rook + 6) * 128 + (m.from + 1); lo ^= Z_LO[zi]; hi ^= Z_HI[zi];
      } else {
        b[m.from - 1] = b[m.from - 4]; b[m.from - 4] = 0;
        zi = (rook + 6) * 128 + (m.from - 4); lo ^= Z_LO[zi]; hi ^= Z_HI[zi];
        zi = (rook + 6) * 128 + (m.from - 1); lo ^= Z_LO[zi]; hi ^= Z_HI[zi];
      }
    }
    if ((m.piece > 0 ? m.piece : -m.piece) === KING) this.kings[us === WHITE ? 0 : 1] = m.to;
    lo ^= Z_CASTLE_LO[this.castling]; hi ^= Z_CASTLE_HI[this.castling];
    this.castling &= CASTLE_MASK[m.from] & CASTLE_MASK[m.to];
    lo ^= Z_CASTLE_LO[this.castling]; hi ^= Z_CASTLE_HI[this.castling];
    if (this.ep >= 0) { lo ^= Z_EP_LO[fileOf(this.ep)]; hi ^= Z_EP_HI[fileOf(this.ep)]; }
    this.ep = (m.flags & FLAG_DOUBLE) ? m.from + 16 * us : -1;
    if (this.ep >= 0) { lo ^= Z_EP_LO[fileOf(this.ep)]; hi ^= Z_EP_HI[fileOf(this.ep)]; }
    lo ^= Z_TURN_LO; hi ^= Z_TURN_HI;
    this.hashLo = lo | 0; this.hashHi = hi | 0;
    this.halfmove = (m.captured !== 0 || (m.piece > 0 ? m.piece : -m.piece) === PAWN) ? 0 : this.halfmove + 1;
    if (us === BLACK) this.fullmove++;
    this.turn = -us;
  }

  unmake() {
    var h = this.hist.pop();
    if (!h) return null;
    var m = h.m;
    this.turn = -this.turn;
    var us = this.turn, b = this.board;
    b[m.from] = m.piece;
    b[m.to] = 0;
    if (m.flags & FLAG_EP) b[m.to - 16 * us] = -us * PAWN;
    else if (m.captured) b[m.to] = m.captured;
    if (m.flags & FLAG_CASTLE) {
      if (m.to === m.from + 2) { b[m.from + 3] = b[m.from + 1]; b[m.from + 1] = 0; }
      else { b[m.from - 4] = b[m.from - 1]; b[m.from - 1] = 0; }
    }
    if ((m.piece > 0 ? m.piece : -m.piece) === KING) this.kings[us === WHITE ? 0 : 1] = m.from;
    this.castling = h.castling;
    this.ep = h.ep;
    this.halfmove = h.halfmove;
    this.hashLo = h.hashLo; this.hashHi = h.hashHi;
    if (us === BLACK) this.fullmove--;
    return m;
  }

  /* ---------------- draw detection (pure; never touches movegen) -----------
     These read state only. moves()/legal() are deliberately untouched: a
     draw is a property of the game, not of the move list, and folding it into
     generation would break perft. */

  /* How many times the current position has occurred, this one included.
     Only positions since the last irreversible move can match, and only every
     second ply has the same side to move. `maxBack` caps how far to look —
     the search passes a small cap to stay cheap; isDraw() scans everything. */
  repetitionCount(maxBack) {
    var n = this.hist.length, back = this.halfmove;
    if (maxBack !== undefined && maxBack < back) back = maxBack;
    var lo = n - back; if (lo < 0) lo = 0;
    var c = 1, i, h;
    for (i = n - 2; i >= lo; i -= 2) {
      h = this.hist[i];
      if (h.hashLo === this.hashLo && h.hashHi === this.hashHi) c++;
    }
    return c;
  }

  /* K vs K, K+minor vs K, and same-coloured K+B vs K+B: positions where no
     sequence of legal moves can mate. Anything with a pawn, rook or queen on
     the board is playable, and so is K+N+N (mate is possible there, merely
     unforceable). */
  insufficientMaterial() {
    var b = this.board, s, p, pt, i;
    var minors = [[], []];          /* [white, black] square colours of B/N */
    var knights = [0, 0], bishops = [0, 0];
    for (s = 0; s < 128; s++) {
      if (s & 0x88) { s += 7; continue; }
      p = b[s];
      if (p === 0) continue;
      pt = p > 0 ? p : -p;
      if (pt === PAWN || pt === ROOK || pt === QUEEN) return false;
      if (pt === KING) continue;
      i = p > 0 ? 0 : 1;
      if (pt === KNIGHT) knights[i]++; else bishops[i]++;
      minors[i].push((fileOf(s) + rankOf(s)) & 1);
    }
    var nw = knights[0] + bishops[0], nb = knights[1] + bishops[1];
    if (nw === 0 && nb === 0) return true;                       /* K vs K */
    if (nw + nb === 1) return true;                              /* K+minor vs K */
    /* K+N+N vs K is deliberately NOT here: mate with two knights is possible
       (just not forceable), so it is not a dead position under FIDE and must
       not be auto-drawn. */
    if (bishops[0] === 1 && bishops[1] === 1 && nw === 1 && nb === 1 &&
        minors[0][0] === minors[1][0]) return true;              /* same-colour bishops */
    return false;
  }

  /** Why this position is a draw, or null. Does NOT consider checkmate or
      stalemate — the caller checks the move list first (see app.js checkEnd). */
  isDraw() {
    if (this.repetitionCount() >= 3) return "threefold repetition";
    if (this.halfmove >= 100) return "fifty-move rule";
    if (this.insufficientMaterial()) return "insufficient material";
    return null;
  }
}

function perft(game, depth) {
  if (depth === 0) return 1;
  var nodes = 0, ms = game.moves(), us = game.turn, ki = us === WHITE ? 0 : 1;
  for (var i = 0; i < ms.length; i++) {
    game.make(ms[i]);
    if (!game.attacked(game.kings[ki], -us)) nodes += perft(game, depth - 1);
    game.unmake();
  }
  return nodes;
}

/* ---------------- evaluation (Michniewski simplified tables) --------------- */
var PIECE_VAL = [0, 100, 320, 330, 500, 900, 0];
var PST = [null,
  /* pawn */ [
    0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10,
    5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5,
    5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  /* knight */ [
    -50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30,
    -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30,
    -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  /* bishop */ [
    -20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10,
    -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10,
    -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  /* rook */ [
    0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5,
    -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
    -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  /* queen */ [
    -20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10,
    -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10,
    -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  /* king (midgame) */ [
    -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10,
    20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]
];

/* score from the side-to-move's perspective (for negamax) */
function evaluate(game) {
  var score = 0, b = game.board, r, f, p, pt;
  for (r = 0; r < 8; r++) {
    for (f = 0; f < 8; f++) {
      p = b[r * 16 + f];
      if (p === 0) continue;
      if (p > 0) score += PIECE_VAL[p] + PST[p][(7 - r) * 8 + f];
      else { pt = -p; score -= PIECE_VAL[pt] + PST[pt][r * 8 + f]; }
    }
  }
  return game.turn === WHITE ? score : -score;
}

/* ---------------- move ordering ----------------
   Alpha-beta only pays if the best move is tried first. Order:
   captures by MVV-LVA (grab the fattest victim with the cheapest attacker),
   then promotions, then the killer moves that refuted a sibling at this ply,
   then everything else in generation order. */
var MVV = [0, 100, 320, 330, 500, 900, 20000];
var KILL_A = [], KILL_B = [];          /* per-ply killer slots, keyed by ply */

/* History heuristic: a quiet move that has caused beta cutoffs elsewhere in
   this search is worth trying early here too, indexed by (piece, destination).
   Ordering only — it cannot change a score, it only changes how fast the search
   proves one, which is why the values stay reproducible. Cleared per search so
   bestMove() remains deterministic. Bumped by depth*depth so a cutoff found
   deep (where it saved more work) counts for more. */
var HIST = new Int32Array(13 * 128);

/* ---------------- transposition table ----------------
   The same position is reached by many move orders; without this the deeper
   search costs several times more. Flat typed arrays, no objects. Entries are
   stamped with a generation counter, so starting a new search invalidates the
   whole table in one increment instead of zeroing 64k slots — which also keeps
   bestMove() deterministic: every search sees a logically empty table.
   Stored score is mate-distance-corrected to be root-independent. */
var TT_BITS = 16, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
var TT_LO = new Int32Array(TT_SIZE), TT_HI = new Int32Array(TT_SIZE);
var TT_SCORE = new Int32Array(TT_SIZE), TT_META = new Int32Array(TT_SIZE);
var TT_FROM = new Int32Array(TT_SIZE), TT_TO = new Int32Array(TT_SIZE), TT_PROMO = new Int32Array(TT_SIZE);
var TT_GEN = 1;
var TT_EXACT = 0, TT_LOWER = 1, TT_UPPER = 2;

function newSearchGeneration() {
  TT_GEN++;
  if (TT_GEN > 0x1fffff) {             /* only after ~2M searches */
    TT_META.fill(0);
    TT_GEN = 1;
  }
  KILL_A.length = 0; KILL_B.length = 0;
  HIST.fill(0);
}

function storeKiller(ply, m) {
  var a = KILL_A[ply];
  if (a && a.from === m.from && a.to === m.to) return;
  KILL_B[ply] = a;
  KILL_A[ply] = m;
}

function orderScore(m, ply, hintFrom, hintTo, hintPromo) {
  var s = 0, vic, att;
  if (m.from === hintFrom && m.to === hintTo && m.promo === hintPromo) return 2000000;
  if (m.captured) {
    vic = m.captured > 0 ? m.captured : -m.captured;
    att = m.piece > 0 ? m.piece : -m.piece;
    s = 1000000 + MVV[vic] * 16 - MVV[att];
    if (m.promo) s += PIECE_VAL[m.promo];
    return s;
  }
  if (m.promo) return 900000 + PIECE_VAL[m.promo];
  var k = KILL_A[ply];
  if (k && k.from === m.from && k.to === m.to && k.promo === m.promo) return 800000;
  k = KILL_B[ply];
  if (k && k.from === m.from && k.to === m.to && k.promo === m.promo) return 799000;
  /* capped well below the killer band so it only ever breaks ties among the
     genuinely quiet moves */
  s = HIST[(m.piece + 6) * 128 + m.to];
  return s > 700000 ? 700000 : s;
}

/* insertion sort: stable (so ordering is reproducible) and faster than
   Array#sort at these list lengths */
function orderMoves(ms, ply, hintFrom, hintTo, hintPromo) {
  var n = ms.length, sc = new Array(n), i, j, s, m;
  if (hintFrom === undefined) { hintFrom = -1; hintTo = -1; hintPromo = -1; }
  for (i = 0; i < n; i++) sc[i] = orderScore(ms[i], ply, hintFrom, hintTo, hintPromo);
  for (i = 1; i < n; i++) {
    s = sc[i]; m = ms[i]; j = i - 1;
    while (j >= 0 && sc[j] < s) { sc[j + 1] = sc[j]; ms[j + 1] = ms[j]; j--; }
    sc[j + 1] = s; ms[j + 1] = m;
  }
}

/**
 * Quiescence: never evaluate in the middle of an exchange. Stand pat on the
 * static score, then keep resolving captures (and queen promotions) until the
 * position is quiet. When in check we search every evasion instead, so a mate
 * one ply past the horizon is still a mate and not a stand-pat score.
 * `qleft` bounds the extension — a check-for-check sequence cannot run away.
 *
 * Every capture is searched. No delta pruning: see the QS_DEPTH note in the
 * tuning block for why a heuristic cutoff here poisons the whole safety model.
 * Given the same position and window this returns the same score no matter what
 * was searched before it, which is the property botMove's ceiling rests on.
 */
function quiesce(game, alpha, beta, ply, qleft) {
  var inChk = game.inCheck(), stand, i, m, v;
  if (inChk) {
    if (qleft <= 0) return evaluate(game);
    stand = -Infinity;
  } else {
    stand = evaluate(game);
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    if (qleft <= 0) return stand;
  }
  /* in check we need every evasion, quiet ones included; otherwise only the
     loud moves exist to begin with (see Game#moves) */
  var cand = inChk ? game.moves() : game.moves(true);
  orderMoves(cand, ply);
  var us = game.turn, ki = us === WHITE ? 0 : 1, best = stand, legalCount = 0;
  for (i = 0; i < cand.length; i++) {
    m = cand[i];
    game.make(m);
    if (game.attacked(game.kings[ki], -us)) { game.unmake(); continue; }
    legalCount++;
    v = -quiesce(game, -beta, -alpha, ply + 1, qleft - 1);
    game.unmake();
    if (v > best) {
      best = v;
      if (v > alpha) { alpha = v; if (alpha >= beta) break; }
    }
  }
  /* in check with no evasion at all: mate, scored by distance */
  if (inChk && legalCount === 0) return -(MATE - ply);
  return best;
}

/**
 * Negamax with alpha-beta. `ply` is the distance from the root and exists so
 * mate scores carry it: being mated at ply p scores -(MATE - p), so the engine
 * takes the fastest mate when winning and the slowest when losing.
 * Repetition and the fifty-move rule score 0 — the search is allowed to steer
 * into a draw when it is losing and away from one when it is winning.
 */
function negamax(game, depth, alpha, beta, ply) {
  /* Repetition is safe to claim before generating moves: a mated position can
     never be a repeat, because the game would already have ended the first
     time it appeared. The fifty-move rule is NOT safe here — checkmate takes
     precedence over it — so that test waits until we know a legal move exists
     (see the legalCount check below). */
  if (ply > 0 && game.repetitionCount(24) >= 2) return 0;
  if (depth <= 0) return quiesce(game, alpha, beta, ply, QS_DEPTH);

  var alphaOrig = alpha;
  var ti = game.hashLo & TT_MASK, meta = TT_META[ti];
  var hintFrom = -1, hintTo = -1, hintPromo = -1, ts;
  if ((meta >> 10) === TT_GEN && TT_LO[ti] === game.hashLo && TT_HI[ti] === game.hashHi) {
    hintFrom = TT_FROM[ti]; hintTo = TT_TO[ti]; hintPromo = TT_PROMO[ti];
    if (((meta >> 2) & 0xff) >= depth) {
      ts = TT_SCORE[ti];
      if (ts >= MATE_MIN) ts -= ply; else if (ts <= -MATE_MIN) ts += ply;
      var fl = meta & 3;
      if (fl === TT_EXACT) return ts;
      if (fl === TT_LOWER && ts >= beta) return ts;
      if (fl === TT_UPPER && ts <= alpha) return ts;
    }
  }

  var ms = game.moves(), us = game.turn, ki = us === WHITE ? 0 : 1;
  orderMoves(ms, ply, hintFrom, hintTo, hintPromo);
  var best = -Infinity, legalCount = 0, i, m, v, bm = null;
  for (i = 0; i < ms.length; i++) {
    m = ms[i];
    game.make(m);
    if (game.attacked(game.kings[ki], -us)) { game.unmake(); continue; }
    legalCount++;
    if (legalCount === 1 || alpha === -Infinity) {
      v = -negamax(game, depth - 1, -beta, -alpha, ply + 1);
    } else {
      /* PVS: once we have a principal variation, later moves only have to be
         proved worse — a null window does that far cheaper. Re-search in full
         only when one actually beats it. */
      v = -negamax(game, depth - 1, -alpha - 1, -alpha, ply + 1);
      if (v > alpha && v < beta) v = -negamax(game, depth - 1, -beta, -alpha, ply + 1);
    }
    game.unmake();
    if (v > best) {
      best = v; bm = m;
      if (v > alpha) {
        alpha = v;
        if (alpha >= beta) {
          if (!m.captured && !m.promo) {
            storeKiller(ply, m);
            HIST[(m.piece + 6) * 128 + m.to] += depth * depth;
          }
          break;
        }
      }
    }
  }
  if (legalCount === 0) return game.inCheck() ? -(MATE - ply) : 0;
  /* now that a legal move is known to exist, the fifty-move rule can be
     claimed without masking a mate that lands on the hundredth half-move */
  if (ply > 0 && game.halfmove >= 100) return 0;

  /* depth-preferred replacement: a deeper result is worth more than a newer one */
  if ((meta >> 10) !== TT_GEN || ((meta >> 2) & 0xff) <= depth) {
    ts = best;
    if (ts >= MATE_MIN) ts += ply; else if (ts <= -MATE_MIN) ts -= ply;
    TT_LO[ti] = game.hashLo; TT_HI[ti] = game.hashHi;
    TT_SCORE[ti] = ts;
    TT_META[ti] = (TT_GEN << 10) | ((depth & 0xff) << 2) |
                  (best <= alphaOrig ? TT_UPPER : (best >= beta ? TT_LOWER : TT_EXACT));
    TT_FROM[ti] = bm ? bm.from : -1;
    TT_TO[ti] = bm ? bm.to : -1;
    TT_PROMO[ti] = bm ? bm.promo : -1;
  }
  return best;
}

/* stable insertion sort of the root list, high score first: the next iteration
   searches the previous iteration's best move first, which is where the
   alpha-beta savings are. Stable, so equal scores keep generation order and the
   result is reproducible. */
function sortRoot(scored, n) {
  var i, j, tmp;
  for (i = 1; i < n; i++) {
    tmp = scored[i]; j = i - 1;
    while (j >= 0 && scored[j].v < tmp.v) { scored[j + 1] = scored[j]; j--; }
    scored[j + 1] = tmp;
  }
}

var ROOT_NARROW = 64;                  /* pass-1 root window, in centipawns */

/**
 * Score every legal root move, best first, by iterative deepening.
 *
 * `margin` is the only subtlety. Callers need a *score per move*, not just the
 * best one, so the root cannot take a plain alpha cutoff. Instead each move
 * after the first is searched with alpha = bestSoFar - margin: anything whose
 * true score is within `margin` of the final best is returned exactly, and
 * anything worse fails low and comes back as an upper bound that is already
 * below the threshold. Since alpha never rises above (finalBest - margin),
 * every move a caller could legitimately pick has an exact score, and the
 * rest are provably not worth picking. That keeps the full pruning benefit at
 * the root while still ranking the candidate pool honestly.
 *
 * `exact` on each entry says which of the two a score is: a true score, or an
 * upper bound that fell short of its own alpha. botMove leans on that flag to
 * avoid asking for a wide band at all — see refineRootMove.
 *
 * Cost scales with `margin`, and steeply: beta at the root is +Infinity, so the
 * child of a root move is searched with the window [-Inf, margin-above-best],
 * and with no alpha at the child there is no PVS and almost no cutoff one ply
 * down. margin 351 costs roughly 4x margin 64 on a dense position. Callers that
 * only need to *choose* a move should not pay that (again: see refineRootMove);
 * this wide form is for callers that genuinely want the whole band priced, and
 * for auditing what the search believed about every move.
 *
 * Fully deterministic: fixed depth, no clock, no randomness, killers reset per
 * call, stable sort.
 */
function searchRoot(game, maxDepth, margin) {
  var ms = game.legal(), n = ms.length;
  if (n === 0) return [];
  newSearchGeneration();
  var scored = new Array(n), i, d, v, best, alpha;
  for (i = 0; i < n; i++) scored[i] = { m: ms[i], v: 0, exact: false };
  for (d = 1; d <= maxDepth; d++) {
    /* only the final iteration's scores are returned; the earlier ones exist
       to order the move list, and ordering does not need a wide window */
    var m2 = (d === maxDepth) ? margin : ROOT_NARROW;
    best = -Infinity;
    for (i = 0; i < n; i++) {
      /* Every move after the first is searched with alpha = bestSoFar - margin
         (see the margin argument above), and with beta left open. Testing each
         move against the threshold with a null window instead is faster and
         wrong: see refineRootMove for what a finite beta does to a bound here. */
      alpha = (best === -Infinity) ? -Infinity : best - m2;
      game.make(scored[i].m);
      v = -negamax(game, d - 1, -Infinity, -alpha, 1);
      game.unmake();
      scored[i].v = v;
      /* a value that beat its own alpha (or was searched on an open window) is
         a true score; anything else is only an upper bound on one */
      scored[i].exact = (alpha === -Infinity) || (v > alpha);
      if (v > best) best = v;
    }
    sortRoot(scored, n);
  }
  return scored;
}

/**
 * Price ONE root move against a threshold, in the band (lo, +inf).
 *
 * This is the unit of work botMove buys on demand instead of paying for the
 * whole band up front. Returns a score > lo (a true score; entry.exact becomes
 * true) or <= lo (an upper bound — the move is outside the band and its exact
 * value is nobody's business; entry.exact stays false). Exactly the question
 * "is this move within BOT_MAX_LOSS of the best one, and if so by how much",
 * for one move.
 *
 * The window is deliberately [lo, +Infinity), the same shape searchRoot uses,
 * and NOT the tighter [lo, best + 1] that `best` would justify. A finite beta
 * here is measurably faster and quietly wrong: quiescence prunes against alpha
 * (QS_DELTA) and the transposition table is shared across windows, so a bound
 * proved under one beta is not always valid under another. With a finite beta
 * this search reported a 620cp upper bound for a move genuinely worth 900cp —
 * i.e. it excluded a good move — and the same instability could just as easily
 * admit a bad one. Same window shape as searchRoot, same answer as searchRoot.
 *
 * Must be called while the transposition generation of the searchRoot() call
 * that produced `entry` is still current — i.e. with no other search in
 * between — so the refinement reuses that search's table and ordering.
 */
function refineRootMove(game, entry, depth, lo) {
  game.make(entry.m);
  var v = -negamax(game, depth - 1, -Infinity, -lo, 1);
  game.unmake();
  entry.v = v;
  entry.exact = (v > lo);
  return v;
}

/** The honest best move — used by Hint, so the player's help is real help.
    Deterministic by construction (see searchRoot). */
function bestMove(game) {
  var scored = searchRoot(game, SEARCH_DEPTH, ROOT_NARROW);
  return scored.length ? scored[0].m : null;
}

/* Softmax weight of a root score, times a per-candidate multiplier that carries the
   rank decay and any recapture bias. The exponential is still clamped at `best` so a
   transposition-table inconsistency can never manufacture a weight above `mult`.
   `mult` is fixed per index BEFORE any sampling (see botMove), which is what keeps
   the rejection sampling below exact: it appears identically in the envelope and in
   the acceptance test, so it cancels out of the accept ratio. */
function botWeight(v, best, mult) {
  return mult * Math.exp(((v < best ? v : best) - best) / BOT_TEMP);
}

/* The square the opponent just captured on, or -1. Read off the move stack rather
   than tracked separately so it cannot desync from the board — takebacks included. */
function lastCaptureSquare(game) {
  var h = game.hist;
  if (!h || h.length === 0) return -1;
  var m = h[h.length - 1].m;
  return m.captured ? m.to : -1;
}

/* draw an index from a weight array holding total mass `tot` */
function sampleWeighted(w, n, tot) {
  var r = Math.random() * tot, i;
  for (i = 0; i < n; i++) { r -= w[i]; if (r <= 0) return i; }
  for (i = n - 1; i >= 0; i--) if (w[i] > 0) return i;   /* rounding tail */
  return -1;
}

/* refinement budget per move. Reaching it is a ~1-in-10^3 event (see the
   acceptance rate in the comment below); the fallback is still safe. */
var BOT_TRIES = 8;

/**
 * AL-1600's move: a full-strength search, then a deliberately fallible choice.
 *
 * The old model rolled a 20% chance of a uniformly random legal move, which is
 * how a four-move mate worked on it and why it sometimes parked a rook on a
 * meaningless square. This one keeps the same "beatable by a club player"
 * feel without the suicide: throw away everything that allows a forced mate or
 * bleeds more than BOT_MAX_LOSS centipawns, then softmax-sample the survivors.
 * Near-best moves dominate; a knight-sized mistake is uncommon but very
 * possible; walking into mate is impossible inside the search horizon.
 *
 * The sampling is done WITHOUT pricing the whole BOT_MAX_LOSS band exactly,
 * because that costs about four times a narrow search (see searchRoot) and
 * botMove runs on the browser's main thread between the player's click and the
 * piece sliding. Instead:
 *
 *   - the narrow search gives an exact score for every move near the best one
 *     and an upper bound for the rest;
 *   - exp(upper bound) is an over-estimate of a move's true softmax weight, so
 *     it is a valid rejection-sampling envelope;
 *   - a move drawn from that envelope is accepted immediately if its weight was
 *     already exact, otherwise its true score is bought with ONE extra search
 *     (refineRootMove) and it is accepted with probability trueWeight/envelope;
 *   - a rejected move keeps its now-exact weight, so the envelope only ever
 *     tightens and the next draw is better informed.
 *
 * That last step is what makes this exact rather than approximate: replacing an
 * envelope entry with its true weight leaves the target distribution unchanged
 * (induction on the number of loose entries), so this samples from precisely
 * the same softmax over exact depth-BOT_DEPTH scores as the old code did —
 * for about one extra search instead of forty. Observed acceptance is ~0.6, so
 * the typical cost is one or two refinements.
 *
 * Safety is unchanged and does not depend on the sampling at all: a move is
 * only ever played if an exact score proved it is inside the band, and a move
 * that allows a forced mate scores below every band, so it can never be played.
 */
/* The opening book: TheFaix's own 2025+ chess.com games, generated by
   tools/make-book.mjs into book.js (loaded before app.js in the page; injected
   as a global by tests). This is what makes "tailored to Alex's playstyle"
   literally true — while the game stays inside positions Alex has reached, the
   bot plays a move ALEX played there, weighted by how often he chose it.
   Probed before the search, so in book the bot answers instantly and in
   character; the first move outside the book drops it into the weakness model
   above. Every entry was replay-validated at generation AND is re-validated by
   test/book.js, and the lookup still filters against legal() here — three
   fences, because a stale book playing an illegal move would corrupt the game
   state silently. bestMove() never reads it: the Hint stays honest search. */
function bookMove(game) {
  if (typeof GAMBIT_BOOK === "undefined") return null;
  var h = game.hist, parts = [], i;
  for (i = 0; i < h.length; i++) parts.push(moveToUci(h[i].m));
  var entry = GAMBIT_BOOK[parts.join(" ")];
  if (!entry) return null;
  var legal = game.legal(), byUci = {}, tot = 0, cand = [];
  for (i = 0; i < legal.length; i++) byUci[moveToUci(legal[i])] = legal[i];
  for (i = 0; i < entry.length; i++) {
    if (byUci[entry[i][0]]) { cand.push([byUci[entry[i][0]], entry[i][1]]); tot += entry[i][1]; }
  }
  if (!tot) return null;
  var r = Math.random() * tot;
  for (i = 0; i < cand.length; i++) { r -= cand[i][1]; if (r <= 0) return cand[i][0]; }
  return cand[cand.length - 1][0];
}

function botMove(game) {
  var bm = bookMove(game);
  if (bm) return bm;
  var scored = searchRoot(game, BOT_DEPTH, ROOT_NARROW), n = scored.length;
  if (n === 0) return null;
  var best = scored[0].v;
  /* a mate it can see is a mate it plays — and mate-distance scoring means
     scored[0] is the *fastest* one. Mated whatever it plays: scored[0] is the
     longest resistance, for the same reason. */
  if (best >= MATE_MIN || best <= -MATE_MIN) return scored[0].m;

  /* everything at or below `lo` is excluded: a catastrophic material drop, or
     (far below any eval) a move that allows a forced mate */
  var lo = best - BOT_MAX_LOSS - 1;
  /* Per-candidate multipliers, fixed here and never touched again — the two knobs
     that shape the mistake, kept out of the sampling loop so the loop stays exact.
       DECAY^i   flattens the influence of a long tail of near-equal moves, which is
                 what previously outvoted the best move ~20:1
       BIAS      pulls taking-back back up to something a human would recognise */
  var recapSq = lastCaptureSquare(game);
  var MULT = new Array(n), W = new Array(n), tot = 0, i, s, v, e;
  for (i = 0; i < n; i++) {
    s = scored[i];
    MULT[i] = Math.pow(BOT_RANK_DECAY, i);
    if (recapSq >= 0 && s.m.captured && s.m.to === recapSq) MULT[i] *= BOT_RECAPTURE_BIAS;
    /* a fail-low bound at or under the cut is proof enough to drop the move */
    W[i] = (s.v <= lo) ? 0 : botWeight(s.v, best, MULT[i]);
    tot += W[i];
  }

  var tries = BOT_TRIES;
  while (tot > 0) {
    i = sampleWeighted(W, n, tot);
    if (i < 0) break;
    s = scored[i];
    if (s.exact) return s.m;                    /* envelope was the true weight */
    if (tries-- <= 0) break;
    v = refineRootMove(game, s, BOT_DEPTH, lo);
    e = s.exact ? botWeight(v, best, MULT[i]) : 0;   /* not exact => outside the band */
    if (Math.random() * W[i] < e) return s.m;
    tot += e - W[i];                            /* envelope tightens to the truth */
    W[i] = e;
  }

  /* Budget spent, or every move is excluded. Fall back to the entries whose
     scores are exact — scored[0] always is, so this always returns a legal
     move, and it can only ever return a move already proven inside the band. */
  tot = 0;
  for (i = 0; i < n; i++) {
    if (!scored[i].exact || scored[i].v <= lo) W[i] = 0;
    else { W[i] = botWeight(scored[i].v, best, MULT[i]); tot += W[i]; }
  }
  i = tot > 0 ? sampleWeighted(W, n, tot) : 0;
  return scored[i < 0 ? 0 : i].m;
}

/* ---------------- pure notation helpers ---------------- */
function moveToUci(m) {
  return algebraic(m.from) + algebraic(m.to) + (m.promo ? PIECE_CHARS[m.promo].toLowerCase() : "");
}

function uciToMove(game, uci) {
  if (!uci || uci.length < 4) return null;
  var from = fromAlgebraic(uci.slice(0, 2)), to = fromAlgebraic(uci.slice(2, 4));
  var promoCh = uci.length > 4 ? uci[4].toUpperCase() : "";
  var wantPromo = promoCh ? PIECE_CHARS.indexOf(promoCh) : 0;
  var ms = game.legal(), fallback = null;
  for (var i = 0; i < ms.length; i++) {
    var m = ms[i];
    if (m.from !== from || m.to !== to) continue;
    if (m.promo === wantPromo) return m;
    if (!wantPromo && m.promo === QUEEN) fallback = m;   /* auto-queen */
  }
  return fallback;
}

/* SAN for a move that is legal in the current position (does not mutate). */
function san(game, move) {
  var s, pt = move.piece > 0 ? move.piece : -move.piece;
  if (move.flags & FLAG_CASTLE) {
    s = move.to > move.from ? "O-O" : "O-O-O";
  } else if (pt === PAWN) {
    s = move.captured ? FILES[fileOf(move.from)] + "x" : "";
    s += algebraic(move.to);
    if (move.promo) s += "=" + PIECE_CHARS[move.promo];
  } else {
    s = PIECE_CHARS[pt];
    var ms = game.legal(), sameFile = false, sameRank = false, amb = false;
    for (var i = 0; i < ms.length; i++) {
      var o = ms[i];
      if (o.to !== move.to || o.from === move.from) continue;
      if ((o.piece > 0 ? o.piece : -o.piece) !== pt) continue;
      amb = true;
      if (fileOf(o.from) === fileOf(move.from)) sameFile = true;
      if (rankOf(o.from) === rankOf(move.from)) sameRank = true;
    }
    if (amb) {
      if (!sameFile) s += FILES[fileOf(move.from)];
      else if (!sameRank) s += String(rankOf(move.from) + 1);
      else s += algebraic(move.from);
    }
    if (move.captured) s += "x";
    s += algebraic(move.to);
  }
  game.make(move);
  if (game.inCheck()) s += (game.legal().length === 0 ? "#" : "+");
  game.unmake();
  return s;
}

/* Dual-mode: a plain <script> in the browser (globals for app.js), and a
   CommonJS module under Node so test/perft.js can exercise it directly. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    Game: Game, perft: perft, bestMove: bestMove, botMove: botMove,
    evaluate: evaluate, san: san, moveToUci: moveToUci, uciToMove: uciToMove,
    WHITE: WHITE, BLACK: BLACK, PAWN: PAWN, KNIGHT: KNIGHT, BISHOP: BISHOP,
    ROOK: ROOK, QUEEN: QUEEN, KING: KING,
    /* internals, exported only so test/tactics.js can assert the safety
       invariant on the exact numbers the search produced rather than guessing
       at it from the outside. app.js does not use these. */
    searchRoot: searchRoot, MATE: MATE, MATE_MIN: MATE_MIN,
    SEARCH_DEPTH: SEARCH_DEPTH, BOT_DEPTH: BOT_DEPTH, BOT_MAX_LOSS: BOT_MAX_LOSS
  };
}
