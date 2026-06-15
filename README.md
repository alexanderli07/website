# Two Worlds — Alexander Li's portfolio

A personal portfolio built around a single idea: **one person, two modes.**
A sun/moon switch (and a circular reveal) flips the whole site between two worlds:

- ☀ **Day — Full-stack & AI:** the software/engineering side — apps, ML/AI, games (100,000+ visits).
- ☾ **Night — Quant & Finance:** the markets side — the Finance Developer role at Q Wealth, CFM, business/quant work.

The concept riffs on Alexander's own award-winning game *Opposite Odyssey* (the day/night
mechanic) — so it can't be mistaken for a template. Flipping the world doesn't just recolor
the page; it **switches which experience, projects and skills surface**, swaps the headline
font (geometric → editorial serif), and re-themes the atmosphere (detailed sun + warm motes ↔
cratered moon + starfield, both drifting on scroll).

## Stack

- **Vite + React + TypeScript** (single-page, static build)
- **Framer Motion** — the world-flip reveal, headline swap, scroll reveals, modal
- **Lenis** — smooth scrolling (auto-disabled under `prefers-reduced-motion`)
- **Hand-written CSS** with `data-world` theming (no UI framework, full art-direction control)
- Fonts: Space Grotesk (day), Fraunces (night), JetBrains Mono (labels) via Google Fonts

Two "live" widgets, one per world (both lazy / on-demand, both degrade gracefully):
- ☀ **Day — in-browser ML** ([`MLDemo`](src/components/MLDemo.tsx)): a real DistilBERT sentiment
  model running **100% client-side** via **`@xenova/transformers`**. Code-split into its own
  chunk and only fetched (model from the HF CDN) when you press the button — never in the
  initial load.
- ☾ **Night — live markets** ([`LiveMarkets`](src/components/LiveMarkets.tsx)): real BTC/ETH/SOL
  prices from the free, no-key **CoinGecko** API, refreshing every 60s.

No backend. All content lives in [`src/data/content.ts`](src/data/content.ts).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview     # preview the production build
```

## Deploy (Vercel + custom domain)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → **New Project** → import the repo. Vercel auto-detects
   Vite (build `npm run build`, output `dist`). Click **Deploy**.
3. **Custom domain:** buy `alexli.dev` / `alexanderli.dev` (~$10–15/yr), then in Vercel →
   Project → **Settings → Domains** → add it and follow the DNS steps. Free SSL is automatic.
4. Every push to `main` redeploys; pull requests get preview URLs.

> This replaces the old InfinityFree (`rf.gd`) host, whose anti-bot JavaScript challenge was
> slow and could break on locked-down recruiter networks.

## ⚠️ Personalize before publishing (search the code for `TODO`)

Everything below uses only facts from your existing site. These are the spots to make it fully yours:

| What | Where |
|------|-------|
| **Q Wealth role details** — add 1–2 specific accomplishments + confirm location/dates | `experience` → Finance Developer in `src/data/content.ts` |
| **Project images** — Alphia & SnaipShot use a monogram placeholder; add screenshots | `image: ""` in `src/data/content.ts` (drop files in `public/assets/images/`) |
| **Your real résumé** — replace the placeholder PDF | `public/resume.pdf` (regenerate the placeholder with `node scripts/make-placeholder-resume.mjs`) |
| **Project links** — add a live demo and/or GitHub repo per project | `links: []` in `src/data/content.ts` |
| **MediScan real metrics** — add your true test accuracy / AUC (no fabricated numbers were added) | `mediscan.outcome` in `content.ts` |
| **The "noise → signal" chart** is a *thematic illustration*, not a real result. Swap in a real eval when you have one | `src/components/SignalChart.tsx` |
| **Optimize images** — several are 2–4 MB (`BAC.png`, `CarolTaverner.png`, `OppositeOdyssey.png`). Compress/resize to keep Lighthouse green | `public/assets/images/` |
| **OG / social image** — currently your portrait | `index.html` (`og:image`) |

### Notes on what was intentionally changed
- **Privacy:** your phone number and exact birthday (both public on the old site) were **left
  out** on purpose. Add them back only if you want them public.
- **Copy was rewritten and proofread** (the old site had typos like "peices", "sigh up").
- **Accessibility:** honours `prefers-reduced-motion` (the flip becomes an instant cut, smooth
  scroll and animations are disabled), keyboard-operable cards/modal, focus styles, alt text.

## Structure

```
index.html               # meta/SEO/OG, fonts, no-JS fallback
src/
  main.tsx               # entry
  App.tsx                # composition + providers
  data/content.ts        # ← all content lives here
  styles/global.css      # design system: two-world tokens + every component style
  world/
    WorldContext.tsx     # day/night state + the circular flip reveal
    useLenis.ts          # smooth scroll (reduced-motion aware)
    useReducedMotion.ts
  components/             # Hero, Nav, WorldToggle, Work, ProjectCard, CaseStudy,
                         # Signal, SignalChart, Skills, Voices, Contact, Footer, Atmosphere, Reveal
scripts/make-placeholder-resume.mjs
```
