# GAMBIT

A playable portfolio. The visitor takes White against **AL-1200**, a chess bot
guarding the record; every black piece they capture unseals real content.

| capture | unseals |
| --- | --- |
| pawn ×8 | the 10 hackathon wins, revealed newest first (first pawn = Best Quant Trading Bot, Hack the 6ix '26) |
| knight / bishop ×4 | the 10 projects |
| rook ×2 | the 6 roles |
| queen | **the file** — résumé, email and socials, all one card |
| **checkmate** | opens anything still sealed anywhere on the page |

Checkmate is not a gate of its own; it is the catch-all for whatever you missed.
Anyone who would rather read than play can hit **Unlock everything** in the index
bar — the section links there only navigate. Unlocks persist in `localStorage`
(`gambit-unlocks`); a new game keeps them, and "reset unlocks" in the footer
clears them.

## Files

    index.html          markup only (every section body is injected by app.js)
    styles.css          all styling
    engine.js           chess engine — pure, DOM-free, also a CommonJS module
    app.js              UI, content, unlock plumbing, animations
    site.webmanifest    icon + theme metadata
    favicon.svg         icon mark — a chessboard stamped AL; favicon-16/32,
                        apple-touch-icon, icon-192/512 alongside
    assets/og-card.png  1200×630 social preview
    assets/images/      project screenshots
    resume.pdf          the résumé, served at /resume.pdf
    404.html            self-contained; no stylesheet, no webfonts
    robots.txt          points at sitemap.xml
    vercel.json         security headers; explicitly NO build step
    scripts/            regenerate the icons and the social card (see below)
    test/perft.js       move-generation test suite
    test/tactics.js     search, weakness-model and draw test suite

Content lives in `app.js` (`WINS`, `PROJECTS`, `JOBS`). It was copied verbatim
from the previous React site's `src/data/content.ts`, which this replaced — see
the git history for it. Nothing here is invented; where the old source marked a
figure as a placeholder it is omitted rather than shown.

## Running

No build step. Open `index.html`, or serve the folder:

    python -m http.server 5191

## Deploying

This repo *is* alexanderli.dev. It is served static on Vercel straight from
the root — `vercel.json` sets `framework: null` and no build command, so a
push to `main` is the whole deployment. There is nothing to compile.

`index.html` hard-codes `https://alexanderli.dev/` in its canonical URL,
`og:url`, `og:image`, `twitter:image` and the JSON-LD. **All five must agree
with whatever the host actually serves** — one choice of www vs non-www, one
trailing-slash form. A wrong `og:image` host means no preview at all when the
link is shared.

## Regenerating the icons and the social card

    node scripts/make-icons.mjs      # favicon.svg + the PNG icon set
    node scripts/make-og-card.mjs    # assets/og-card.png

Both rasterise inline SVG with `sharp`. The site itself has no dependencies and
nothing sharp produces is needed to serve the page — it is only for regenerating
this artwork by hand, so it is deliberately not in a `package.json`:

    npm i --no-save sharp

Only re-run them when the artwork changes. The card's text uses system fonts
(Georgia / Consolas), not the Google webfonts, because the rasteriser cannot see
those.

Neither script prints anything useful about how the art came out, and both have
been wrong in ways only a look would catch — so **render and look at the output**
after changing either. Two things in particular:

- The icon is sized off *measured* Georgia metrics ("AL" inks 1.47× the
  font-size wide). Guessing that number is what once made the letters burst out
  through the frame.
- On the card, the wordmark clears the board by ~45px and nothing else is close.
  A pawn glyph is much wider than the "I" it replaces, so resizing the wordmark
  is the one edit that can push type onto the board.

The card's position is played through `engine.js` rather than hand-placed, so it
cannot show an illegal board. Both sides use the same glyphs distinguished by
fill — and the black ones also carry a same-colour stroke, because the font that
resolves here draws its "black" pieces as outlines, which left an ink-filled
black pawn measuring exactly as light as a white one.

`index.html` hard-codes `https://alexanderli.dev/` in its canonical URL and
`og:image`. **Change those if it is served anywhere else** — a wrong `og:image`
host means no preview at all when the link is shared.

## Testing

    node test/perft.js
    node test/tactics.js

`engine.js` must stay DOM-free so Node can require it. **Run both after any
engine edit.**

`perft.js` guards move *generation*: published perft counts for five positions
(startpos, kiwipete, promotion and en-passant traps), colour-mirror symmetry,
make/unmake invariants over random self-play, and that `bestMove` stays
deterministic. A movegen regression is otherwise invisible until someone plays
an illegal game.

`tactics.js` guards what the *search* understands: that it sees mates delivered
against it, that mate scores carry their distance, that quiescence resolves
exchanges instead of scoring mid-trade, that the weakness model never walks
into a mate or gives away a rook, that draws are detected without movegen
noticing, that the incremental Zobrist key never drifts from a recomputation,
and that a search stays inside its time budget.

## Piece glyphs, and one iOS trap

Both sides use the same chess characters, tinted by CSS: White is the glyph
filled light with a dark stroke, Black is the same glyph in ink. That only
works while the glyph comes from a TEXT font.

U+265F, the pawn, is the one piece with an emoji presentation. Every family in
the `--pieces` stack was Windows- or Linux-only, so an iPhone fell through to
system fallback and resolved the pawn to Apple Color Emoji — a colour bitmap
font, which ignores `color` and `-webkit-text-stroke`. Result: both sides drew
the same dark pawn, and only the pawn. Two things prevent it, and both matter:

- `"Apple Symbols"` is in the `--pieces` stack, so iOS has a text font that
  actually contains these glyphs.
- The pawn carries `U+FE0E`, the text-presentation selector (written as an
  escape in `app.js` so it is visible), as do the arrow, envelope and scales in
  the markup. `font-variant-emoji: text` covers the same ground in CSS.

The lock and the win-screen handshake are deliberately left as colour emoji —
they are pictures, not type.

If a pawn ever renders as an empty box instead, no available text font has the
glyph: give White the outline codepoints (U+2654–2659) instead of tinting the
solid ones, so the two sides differ in shape rather than only in colour.

## Search

`bestMove()` is a 4-ply negamax with alpha-beta, PVS, quiescence (captures,
queen promotions and check evasions), MVV-LVA + killer + history +
transposition-table move ordering, and mate-distance-aware scores. It contains
no randomness and no clock, so the Hint button is real advice and never wobbles.
Draw detection (threefold repetition via Zobrist keys, the fifty-move rule,
insufficient material) is exposed as `Game#isDraw()` and scored as 0 inside the
search; it deliberately does **not** touch `moves()`/`legal()`, so perft is
unaffected.

Quiescence searches **every** capture — there is no delta pruning. That cutoff
is not a true bound (a capture can also win the next piece), so a pruned score
depends on the window it was searched under, and the transposition table then
spreads that inconsistency: 12.4% of root-move scores disagreed with a cold
re-search of the same move, some by 460cp. Since `BOT_MAX_LOSS` is enforced by
comparing scores from *different* searches, that had to go; without it the same
1255 root moves agree exactly, every time.

Measured in Node: botMove ~4ms median from the opening, ~90ms p95 in a dense
middlegame, 167ms worst observed across deliberately hostile positions — and
within a few percent of `bestMove` on the same position, because choosing weakly
no longer costs extra search. It runs synchronously on the main thread, so that
matters.

## Difficulty

Every knob is at the top of `engine.js` with a comment. The search depth is
`SEARCH_DEPTH`; how badly AL-1200 plays is `BOT_TEMP` (softmax temperature —
lower is stronger) and `BOT_MAX_LOSS` (the hard ceiling on how much worse than
best a played move may be).

AL-1200 searches at full strength and is weak only in how it *chooses*: it
softmax-samples among its scored moves, after hard-excluding anything that
allows a forced mate or loses more than `BOT_MAX_LOSS` centipawns. Its average
loss against its own best move measures ~46cp against a shallow opponent and
rises in sharper positions, so treat it as a band rather than a constant — the
figure moves with the opposition. Either way it can never shed a rook or a queen
for nothing, and it can never walk into a mate it can see. It always plays a
mate it does see.

**Estimated strength: ~1200**, hence the name. Measured on a self-consistent
ladder (fixed-depth opponents built from the same `searchRoot`): it beats a
random mover 30–0, scores 12% against its own depth-1+quiescence search, and 0%
against depth 2 and above. It only drops a piece outright on 0.2% of moves. So:
tactically safe in the ways that punish beginners, positionally thin (the
evaluation is material + piece-square tables, with no king safety, pawn
structure or mobility term), and it folds against any consistent searcher.
Engine-vs-engine scores do not map cleanly onto human ratings, and centipawn
loss measured against its *own* weak evaluation understates its true error, so
1200 is a defensible estimate rather than a measured Elo.

The sampling never prices the whole `BOT_MAX_LOSS` band, because a wide root
window costs about four times a narrow one. It samples from an envelope built
out of the narrow search's upper bounds and buys the true score of the one move
it drew, accepting it with probability true/envelope; a rejected move keeps its
now-exact weight, which leaves the distribution untouched and costs one or two
extra single-move searches instead of forty.

Because that ceiling also forbids AL-1200 from ever handing over a rook or a
queen, a player who only takes what is offered will rarely capture one: over 100
games a purely greedy White wins 5.4 pawns and 2.0 minors per game but only 0.47
rooks and 0.09 queens. So captures **roll up** (`app.js`): once a tier is full,
the next capture pays into the tier above it, and every tier opens within two or
three games for any playstyle. Order is preserved — nothing rolls up until every
cheaper seal is already open, so taking the queen still opens the file first.

Do not "fix" the queen drought by raising `BOT_MAX_LOSS` to a queen's value: it
restores the captures but also gives the queen away for free in ~12% of sampled
positions, which reads as a broken opponent rather than a beatable one.
