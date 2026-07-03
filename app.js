(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* content.ts copy contains quotes and ampersands; everything below builds
     markup by concatenation, so anything interpolated goes through this */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* =============== authoritative content (from content.ts) =============== */
  var WINS = [
    { tier: "Best Quant Trading Bot", ev: "Hack the 6ix '26", flag: true, short: "HT6 '26" },
    { tier: "1st Place", ev: "Formula Null '25", short: "Formula Null '25" },
    { tier: "1st Place", ev: "DeltaHacks X '24", short: "DeltaHacks X '24" },
    { tier: "1st Place", ev: "RythmHacks '23", short: "RythmHacks '23" },
    { tier: "1st Place", ev: "MayfieldHacks '23", short: "MayfieldHacks '23" },
    { tier: "2nd Place", ev: "Ignition Hacks v4 '24", short: "Ignition v4 '24" },
    { tier: "3rd Place", ev: "WolfHacks '24", short: "WolfHacks '24" },
    { tier: "Best AR/VR", ev: "Incubator Hacks '24", short: "Incubator '24" },
    { tier: "Best AI/ML", ev: "Hack the Valley 9 '24", short: "HTV9 '24" },
    { tier: "Best Game Mechanic", ev: "AngelHacks '23", short: "AngelHacks '23" }
  ];
  var PROJECTS = [
    { title: "SnaipShot", yr: "Oct 2024",
      blurb: "A memory-support wearable for people with dementia — smart glasses that read your surroundings and daily summaries aloud, so there's no screen to check.",
      hl: "Best Use of AI — Hack the Valley 9", quiet: false,
      tags: ["ESP32 / Arduino", "OpenAI", "Text-to-Speech"],
      img: "assets/images/snaipshot.webp", links: [{ l: "GitHub", h: "https://github.com/SpiritByte/Hack-The-Valley" }, { l: "Demo", h: "https://hack-the-valley.streamlit.app/" }, { l: "Devpost", h: "https://devpost.com/software/snaipshot" }],
      problem: "For someone with cognitive decline, a screen full of information is overload, not help. How do you give context without demanding attention?",
      approach: "Paired ESP32 / Arduino smart glasses with a Streamlit dashboard: it pulls live data, has OpenAI turn it into plain-language summaries, and reads them aloud via text-to-speech. A 'HELP' trigger delivers on-demand environmental context — all audio, no screen.",
      outcome: "Won Best Use of AI at Hack the Valley 9 — assistive hardware + LLM summarization that lifts cognitive load instead of piling onto it." },
    { title: "saight", yr: "Jan 2024",
      blurb: "Hands-free assistive vision: a CV model that recognizes objects and answers spoken queries about your surroundings — ~91% recognition accuracy.",
      hl: "1st Place — DeltaHacks X", quiet: false,
      tags: ["Python", "OpenCV", "TensorFlow"],
      img: "assets/images/saight.webp", links: [{ l: "GitHub", h: "https://github.com/HetavP2/saight-public" }, { l: "Video", h: "https://youtu.be/SYaEiVhIqtg" }, { l: "Devpost", h: "https://devpost.com/software/saight" }],
      problem: "Could a camera + a voice be eyes for someone who can't rely on their own?",
      approach: "Implemented a computer-vision model with TensorFlow and OpenCV, with offline speech-to-text so it works hands-free via voice commands.",
      outcome: "~91% object-recognition accuracy, end-to-end latency cut by ~35%, supporting 100+ unique object queries on stage — and 1st place at DeltaHacks X." },
    { title: "dragonfl.ai", yr: "Sep 2023",
      blurb: "An ML system helping blind users perceive their surroundings — object, face and text recognition on one dashboard.",
      hl: "1st Overall — RythmHacks 2023", quiet: false,
      tags: ["Machine Learning", "Computer Vision", "OCR"],
      img: "assets/images/dragonflai.webp", links: [{ l: "GitHub", h: "https://github.com/SpiritByte/dragonfl.ai" }, { l: "Devpost", h: "https://devpost.com/software/dragonfl-ai" }],
      problem: "How much of the world is closed off if you can't see it? We set out to give blind users a real-time sense of what's around them.",
      approach: "Built an image-recognition device with object, face and text recognition; all readings stream to a dashboard accessible through a frontend website.",
      outcome: "Won 1st overall at RythmHacks 2023 — the project that turned ML from a buzzword into something I wanted to truly understand." },
    { title: "reMindA", yr: "Aug 2024",
      blurb: "Smart glasses for Alzheimer's patients — facial recognition surfaces a loved one's name and relationship on a discreet display the moment they're seen.",
      hl: "2nd Overall — Ignition Hacks 2024", quiet: false,
      tags: ["Facial Recognition", "ESP32", "Flask"],
      img: "assets/images/reminda.webp", links: [{ l: "GitHub", h: "https://github.com/DevTechJr/reminda" }, { l: "Video", h: "https://youtu.be/jonY-y7NVz0" }, { l: "Devpost", h: "https://devpost.com/software/reminda" }],
      problem: "Alzheimer's slowly erases the faces of the people you love most. Could a wearable quietly hand those names back, right when they're needed?",
      approach: "Paired an ESP32-CAM and LCD on an Arduino R4 with an OpenCV facial-recognition model trained on a family-uploaded database, plus a Flask dashboard for managing faces, relationships and settings.",
      outcome: "2nd Place Overall at Ignition Hacks 2024 — assistive hardware and ML that puts a name to a face in real time, easing the load on patients and families alike." },
    { title: "invīsibilis", yr: "2022 – present",
      blurb: "A horror game where an invisible maze is only revealed through a lidar gun — built in Roblox Studio with Lua. 10,000+ players.",
      hl: "Best Game Mechanic — AngelHacks 2023", quiet: false,
      tags: ["Roblox Studio", "Lua", "Game Mechanic"],
      img: "assets/images/invisibilis.webp", links: [{ l: "Play on Roblox", h: "https://www.roblox.com/games/13512108865/inv-sibilis" }],
      problem: "What if you couldn't see the level at all, and seeing it was the gameplay?",
      approach: "Engineered lidar-based visibility mechanics in Lua, optimizing game logic and rendering loops so the maze and monsters only exist for a moment after each scan.",
      outcome: "10,000+ players on this prototype alone — part of 1,000,000+ visits across my games — and Best Game Mechanic at AngelHacks. Its reveal mechanic is the metaphor behind this site." },
    { title: "Opposite Odyssey", yr: "Dec 2023",
      blurb: "A platformer where switching between night and day reveals different paths up the mountain.",
      hl: "1st Place + Most Creative — MayfieldHacks", quiet: false,
      tags: ["Game Dev", "Level Design"],
      img: "assets/images/OppositeOdyssey.webp", links: [],
      problem: "The theme was \"opposites attract\" — so the opposite of light became a different version of the world.",
      approach: "Players toggle night/day to reveal paths that exist in only one state, across parkour and boss fights.",
      outcome: "Most Creative and 1st individually at MayfieldHacks — and the day/night idea behind this whole portfolio." },
    { title: "ServiceSwap", yr: "Jul 2025",
      blurb: "A peer-to-peer marketplace where people trade skills instead of cash — semantic matching pairs what you need with whoever can offer it.",
      hl: "Built at Hack404 2025", quiet: true,
      tags: ["Marketplace", "NLP / Embeddings", "Flask", "Socket.IO"],
      img: "assets/images/serviceswap.svg", links: [{ l: "Video", h: "https://youtu.be/0sAJfKkeAMY" }, { l: "Devpost", h: "https://devpost.com/software/serviceswap" }],
      problem: "Plenty of people can't afford services but hold skills worth trading. A market only works if supply and demand can actually find each other.",
      approach: "Built a two-sided marketplace on Flask with real-time chat (Socket.IO), geolocation filtering (Haversine), and a sentence-transformers model that matches listings by semantic similarity (cosine distance) — the matching engine at the core of the market.",
      outcome: "Built at Hack404 2025 — a study in market mechanics: matching, trust via ratings, and liquidity without a dollar changing hands." },
    { title: "Min-Volatility Portfolio Optimizer", yr: "Dec 2025",
      blurb: "A Python engine that builds a defensive, low-volatility equity portfolio — screening by liquidity and volatility, then weighting under real diversification limits.",
      hl: "CFM 101 portfolio competition — Waterloo", quiet: true,
      tags: ["Portfolio Optimization", "Python / pandas", "yfinance"],
      img: "assets/images/cfm101.svg", links: [{ l: "GitHub", h: "https://github.com/alexanderli07/CFM101" }],
      problem: "Build a $1M book that barely flinches over a volatile week — maximum stability, hard real-world constraints, and no hand-picking your favourites.",
      approach: "Pulls price and volume history with yfinance, screens candidates for liquidity (minimum average volume, full trading months) and 30-day volatility, then scores each on volatility, liquidity and market cap — with a Groq LLM tuning the metric weights. The optimizer forces one large-cap and one small-cap, caps any position at 15% and any sector at 40%, and clips weights for diversification across 10–25 names, all inside a $1,000,000 CAD budget." },
    { title: "Brampton Arts & Culture Coin", yr: "May 2024",
      blurb: "Upload original art, an AI detector verifies it, and every view earns $BAC — a culture currency redeemable for tax rebates or NFTs.",
      hl: "3rd Place — WolfHacks · tokenomics", quiet: false,
      tags: ["Tokenomics", "Crypto", "AI"],
      img: "assets/images/BAC.webp", links: [{ l: "GitHub", h: "https://github.com/alexanderli07/Brampton-Arts-and-Culture-Coin" }],
      problem: "The theme was \"AI takeover.\" We flipped it: what if AI rewarded human creativity with real economic value?",
      approach: "Designed the token economy ($BAC): an AI art detector verifies originality, views mint coins, and coins trade for tax rebates or buy pieces as NFTs — a full incentive + payments loop.",
      outcome: "3rd at WolfHacks — and my first build where the interesting part was the economics, not just the code." },
    { title: "ecoin", yr: "Jul 2024",
      blurb: "A climate-action reward currency — verified green purchases and recycling mint ecoin, redeemable with eco-conscious partners.",
      hl: "Built at StarterHacks 2024", quiet: true,
      tags: ["Incentive Design", "Flask", "SQLAlchemy"],
      img: "assets/images/ecoin.webp", links: [{ l: "GitHub", h: "https://github.com/HetavP2/Ecoin" }, { l: "Devpost", h: "https://devpost.com/software/ecoin-p0t9l1" }],
      problem: "Climate anxiety stalls action. What if sustainable choices paid you back — a currency that turns good habits into spendable value and links people to greener businesses?",
      approach: "Designed a points-based reward economy on a Flask + SQLAlchemy backend: green transactions (sustainable purchases, recycling) mint ecoin, which connects consumers to partner companies — a closed incentive loop tying behaviour to value.",
      outcome: "Built at StarterHacks 2024 — my first real go at incentive design: modelling how a currency reshapes what people choose to do." }
  ];
  var JOBS = [
    { role: "Finance Developer", org: "Quintessence Wealth",
      period: "May 2026 – Present", loc: "Toronto, ON · Hybrid", live: true,
      bullets: ["Optimizing internal infrastructure for the trades team — improving the reliability and execution efficiency of trading workflows.", "Building quantitative tools on the Bloomberg Terminal to support investment research and decision-making."] },
    { role: "AI/ML Engineer", org: "AIQ Labs LLC",
      period: "Mar 2026 – Present", loc: "Delaware, US · Remote", live: true,
      bullets: ["Trained an AI model on user preferences to recommend quizzes, improving content relevance and engagement.", "Integrated asynchronous REST APIs to fetch dynamic question banks and synchronize user streak data."] },
    { role: "Software Engineer", org: "ZMC",
      period: "Jul 2024 – Dec 2024", loc: "Vaughan, ON · Remote", live: false,
      bullets: ["Designed and built a SwiftUI iOS app serving 100+ customers with 6,000+ impressions.", "Rebuilt the app for Android with Node.js, extending the platform's reach to a broader user base.", "Worked weekly sprint cycles, resolving 95%+ of reported issues before release milestones."] },
    { role: "STEAM Instructor", org: "City of Brampton",
      period: "Oct 2022 – Sep 2025", loc: "Brampton, ON · On site", live: false,
      bullets: ["Taught coding and engineering to 20–30 students per class across 100+ instructional hours.", "Built curriculum to spark interest in STEM and mentored students through debugging."] },
    { role: "President / VP of Information Technology", org: "JA Company Program",
      period: "Oct 2021 – Jun 2025", loc: "Brampton, ON · On site", live: false,
      bullets: ["Led the team through the full business lifecycle — managing the company website and technical support.", "Generated $1,000+ in revenue and repaid investors with interest after the term.", "Resolved site-functionality and payment-processing issues for customers."] },
    { role: "Founder & President", org: "Robotics Club & Team",
      period: "Sep 2023 – Jun 2025", loc: "Brampton, ON · On site", live: false,
      bullets: ["Founded the school robotics club to foster interest in engineering and compete in VEX robotics.", "Managed 10+ executive members through the planning of a full robotics season."] }
  ];
  /* cumulative reveal counts per capture */
  var PAWN_CUM = [1, 2, 3, 4, 5, 6, 8, 10];
  var MINOR_CUM = [2, 4, 7, 10];
  var ROOK_CUM = [3, 6];
  /* The pawn carries U+FE0E, the text-presentation selector, written as an escape
     so it is visible in source. U+265F is the only piece with an emoji form, and
     without this an iPhone can still resolve it to Apple Color Emoji — a colour
     bitmap font, which ignores `color`, so both sides came out identical. The
     other five have no emoji form and need nothing. */
  var GLYPH = { 1: "\u265F\uFE0E", 2: "♞", 3: "♝", 4: "♜", 5: "♛", 6: "♚" };

  /* =============== unlock state (persists) =============== */
  var LS_KEY = "gambit-unlocks";
  function blankState() { return { pawns: 0, minors: 0, rooks: 0, queen: 0, mate: false, all: false }; }
  function loadState() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw), d = blankState();
      for (var k in d) if (Object.prototype.hasOwnProperty.call(s, k)) d[k] = s[k];
      return d;
    } catch (e) { return null; }
  }
  function saveState() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
  var state = loadState() || blankState();

  function counts() {
    var all = state.all || state.mate;
    return {
      wins: all ? 10 : (state.pawns ? PAWN_CUM[Math.min(state.pawns, 8) - 1] : 0),
      projects: all ? 10 : (state.minors ? MINOR_CUM[Math.min(state.minors, 4) - 1] : 0),
      jobs: all ? 6 : (state.rooks ? ROOK_CUM[Math.min(state.rooks, 2) - 1] : 0),
      /* the file — résumé AND contact, one card, carried by the queen */
      resume: all || state.queen > 0,
      /* checkmate is no longer a gate of its own: it is the catch-all that
         opens anything still sealed, which `all` already expresses */
      everything: all
    };
  }

  /* =============== build sealed sections =============== */
  function sealedBack(need) {
    return '<div class="u-back"><span class="lock">&#128274;</span>' +
      '<span class="sealed-lbl">Sealed</span><span class="need">' + need + '</span></div>';
  }
  (function buildCards() {
    var i, html = "";
    for (i = 0; i < WINS.length; i++) {
      var w = WINS[i];
      html += '<div class="cap ucard' + (w.flag ? ' cap-flag' : '') + '" id="win-' + i + '">' +
        sealedBack('falls with a <span class="bgx">&#9823;</span> pawn') +
        /* counted down, not up: WINS is newest-first, so the most recent win is
           the 10th won and carries 010 */
        '<div class="u-front"><span class="pn">' + String(WINS.length - i).padStart(3, "0") + '.</span>' +
        (w.flag ? '<span class="ribbon">Latest capture — the 10th win</span>' : '') +
        /* every win is paid for by a pawn, so every win shows a pawn */
        '<span class="pg">&#9823;</span>' +
        '<span class="tier">' + w.tier + '</span><span class="ev">' + w.ev + '</span></div></div>';
    }
    $("wins-grid").innerHTML = html;
    html = "";
    for (i = 0; i < PROJECTS.length; i++) {
      var p = PROJECTS[i];
      var shot = p.img
        ? '<div class="dshot"><img src="' + p.img + '" alt="' + p.title +
          '" loading="lazy" decoding="async"></div>'
        : "";
      /* the links live in the case sheet now, not on the card face */
      var nlinks = (p.links && p.links.length) ? p.links.length : 0;
      var cue = '<span class="dopen">Read the case sheet' +
        (nlinks ? ' &middot; ' + nlinks + (nlinks === 1 ? ' link' : ' links') : '') +
        ' &#8594;</span>';
      html += '<article class="dcard ucard" id="proj-' + i + '">' +
        sealedBack('falls with a <span class="bgx">&#9822;</span> knight or <span class="bgx">&#9821;</span> bishop') +
        '<div class="u-front">' + shot +
        '<div class="dbody"><div class="dmove"><span class="mv-no">' + String(i + 1).padStart(2, "0") + '.</span>' +
        '<span class="yr">' + p.yr + '</span></div><h3>' + p.title + '</h3>' +
        '<p class="blurb">' + p.blurb + '</p>' +
        '<p class="dhl' + (p.quiet ? ' quiet' : '') + '">' + p.hl + '</p>' +
        '<div class="dtags">' + p.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
        cue +
        '</div></div></article>';
    }
    $("proj-grid").innerHTML = html;
    html = "";
    for (i = 0; i < JOBS.length; i++) {
      var j = JOBS[i];
      /* two columns: the dates and place on the left, the role and what it
         actually involved on the right — the résumé shape, not a run-on line */
      html += '<li class="move ucard" id="job-' + i + '">' +
        sealedBack('falls with a <span class="bgx">&#9820;</span> rook') +
        '<div class="u-front"><div class="jrow">' +
          '<div class="jmeta">' +
            '<span class="jperiod">' + esc(j.period) + '</span>' +
            (j.live ? '<span class="jnow">in play</span>' : '') +
            '<span class="jloc">' + esc(j.loc) + '</span>' +
          '</div>' +
          '<div class="jbody">' +
            '<h3 class="jrole">' + esc(j.role) + '</h3>' +
            '<div class="jorg">' + esc(j.org) + '</div>' +
            '<ul class="jbullets">' +
              j.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') +
            '</ul>' +
          '</div>' +
        '</div></div></li>';
    }
    $("jobs-list").innerHTML = html;
  })();

  /* =============== apply unlocks to the DOM =============== */
  var revealTimers = [];             /* pending cascade timers — cancelled by resealAll */
  /* true once nothing anywhere is still sealed. Set by applyUnlocks(); read by
     the index-bar button, which becomes its own undo at that point. */
  var allDone = false;
  /* The win modal's own timer, deliberately NOT in revealTimers: that array is
     only emptied by resealAll(), which runs on a hard reset. A modal queued for
     2.2s after mate has to be cancellable by "New game" and "Takeback" too, or
     it lands on a game that is already over and gone. */
  var mateModalTimer = 0;
  function clearMateModalTimer() {
    if (mateModalTimer) { clearTimeout(mateModalTimer); mateModalTimer = 0; }
  }
  function openAt(el, delay) {
    if (!el || el.classList.contains("open")) return false;
    if (delay > 0 && !reduced) revealTimers.push(setTimeout(function () { el.classList.add("open"); }, delay));
    else el.classList.add("open");
    return true;
  }
  function applyUnlocks(cascade) {
    var c = counts(), delay = 0, step = cascade && !reduced ? 70 : 0, i;
    for (i = 0; i < 10; i++) if (i < c.wins && openAt($("win-" + i), delay)) delay += step;
    for (i = 0; i < 10; i++) if (i < c.projects && openAt($("proj-" + i), delay)) delay += step;
    for (i = 0; i < 6; i++) if (i < c.jobs && openAt($("job-" + i), delay)) delay += step;
    if (c.resume) openAt($("resume-card"), delay);
    $("prog-wins").textContent = c.wins + "/10";
    $("prog-proj").textContent = c.projects + "/10";
    $("prog-jobs").textContent = c.jobs + "/6";
    $("prog-resume").textContent = c.resume ? "open" : "sealed";
    /* the mate bonus: reads "checkmate" until nothing is left sealed */
    var everythingOpen = c.wins === 10 && c.projects === 10 && c.jobs === 6 && c.resume;
    $("prog-contact").textContent = everythingOpen ? "open" : "checkmate";
    /* once nothing is left sealed, the shortcut stops shouting */
    var ua = $("btn-unlock-all");
    var uaLabel = ua && ua.querySelector(".nub-label");
    var uaKey = ua && ua.querySelector(".nub-key");
    if (ua && uaLabel && uaKey) {
      /* The same button turns into its own undo once there is nothing left to
         unlock — a second control would only be dead weight for the entire
         first visit. `allDone` is the single source of truth for the label, the
         glyph, the quiet styling AND what the click does, so they cannot drift. */
      allDone = c.wins === 10 && c.projects === 10 && c.jobs === 6 && c.resume;
      ua.classList.toggle("is-done", allDone);
      uaLabel.textContent = allDone ? "Reset unlocks" : "Unlock everything";
      uaKey.textContent = allDone ? "↺" : "⚿";   /* ↺ reset / ⚿ key */
    }
    /* Only an unsealed project card is a control — a sealed one must not be
       focusable or announced as something you can open. Driven by the unlock
       COUNT, not the .open class: during a cascade the class arrives on a
       stagger timer, so reading it here would see the pre-cascade state. */
    var pcards = document.querySelectorAll("#proj-grid .dcard");
    for (i = 0; i < pcards.length; i++) {
      var open = i < c.projects;
      if (open) {
        pcards[i].setAttribute("tabindex", "0");
        pcards[i].setAttribute("role", "button");
        pcards[i].setAttribute("aria-label",
          (PROJECTS[i] ? PROJECTS[i].title : "Project") + " — open the case sheet");
      } else {
        pcards[i].removeAttribute("tabindex");
        pcards[i].removeAttribute("role");
        pcards[i].removeAttribute("aria-label");
      }
    }
  }
  /* Cancel a reseal that is still running, without closing anything. Used before
     unlocking, so clicking "unlock everything" mid-reset doesn't leave stale
     timers that would slam cards shut again a beat later. */
  function stopSealing() {
    for (var t = 0; t < revealTimers.length; t++) clearTimeout(revealTimers[t]);
    revealTimers = [];
    var s = document.querySelectorAll(".ucard.sealing");
    for (var i = 0; i < s.length; i++) s[i].classList.remove("sealing");
  }
  /**
   * Put every seal back.
   * @param cascade animate it — the unlock's 70ms beat, run in reverse. Without
   *   this every card simply lost .open in one frame, which read as the page
   *   blinking rather than as the opposite of unsealing. Programmatic callers
   *   (the QA hook) leave it off and get the instant version, so tests stay
   *   synchronous; only the two user-facing controls animate.
   */
  function resealAll(cascade) {
    stopSealing();
    clearMateModalTimer();
    var els = [].slice.call(document.querySelectorAll(".ucard.open"));
    if (!cascade || reduced) {
      for (var i = 0; i < els.length; i++) els[i].classList.remove("open");
      return;
    }
    /* reversed: the last seal broken is the first one put back */
    els.reverse();
    els.forEach(function (el, i) {
      revealTimers.push(setTimeout(function () {
        el.classList.add("sealing");
        revealTimers.push(setTimeout(function () {
          el.classList.remove("open", "sealing");
        }, 300));                        /* matches flipOut's duration */
      }, i * 40));
    });
  }
  /* reseal only what the current counts no longer cover (used by takeback refunds) */
  function resealBeyond() {
    var c = counts(), i, el;
    for (i = c.wins; i < 10; i++) { el = $("win-" + i); if (el) el.classList.remove("open"); }
    for (i = c.projects; i < 10; i++) { el = $("proj-" + i); if (el) el.classList.remove("open"); }
    for (i = c.jobs; i < 6; i++) { el = $("job-" + i); if (el) el.classList.remove("open"); }
    if (!c.resume) $("resume-card").classList.remove("open");
  }

  /* =============== game state =============== */
  var game = new Game();
  var sans = [];                 /* SAN strings, parallel to game.hist */
  var sel = -1;
  var legalCache = [];
  var gameOver = null;           /* null | {text, kind} */
  var botTimer = 0;
  var hintSquares = null, hintTimer = 0;
  var botCapsSinceToast = 3;     /* first bot capture shows the toast */
  var trayP = [], trayB = [];    /* {glyph, label} */

  /* =============== board DOM =============== */
  var boardEl = $("board"), sqEls = [], pcEls = [];
  (function buildBoard() {
    for (var vr = 0; vr < 8; vr++) {
      for (var vf = 0; vf < 8; vf++) {
        var s = (7 - vr) * 16 + vf;
        var d = document.createElement("button");
        d.type = "button";
        d.dataset.s = s;
        d.setAttribute("aria-label", "abcdefgh"[vf] + (8 - vr));
        if (vf === 0) { var rr = document.createElement("span"); rr.className = "coord rank"; rr.textContent = 8 - vr; d.appendChild(rr); }
        if (vr === 7) { var ff = document.createElement("span"); ff.className = "coord file"; ff.textContent = "abcdefgh"[vf]; d.appendChild(ff); }
        var g = document.createElement("span"); g.className = "pc"; d.appendChild(g);
        d.addEventListener("click", onSquareClick);
        boardEl.appendChild(d);
        sqEls[s] = d; pcEls[s] = g;
      }
    }
  })();

  function renderBoard() {
    var lastM = game.hist.length ? game.hist[game.hist.length - 1].m : null;
    var checkSq = game.inCheck() ? game.kings[game.turn === WHITE ? 0 : 1] : -1;
    var targets = {};
    if (sel >= 0) {
      for (var t = 0; t < legalCache.length; t++) {
        if (legalCache[t].from === sel) targets[legalCache[t].to] = legalCache[t].captured ? 2 : 1;
      }
    }
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        var s = r * 16 + f, p = game.board[s];
        var cls = "sq " + ((((7 - r) + f) % 2 === 0) ? "light" : "dark");
        if (lastM && (lastM.from === s || lastM.to === s)) cls += " last";
        if (s === sel) cls += " sel";
        if (targets[s]) cls += targets[s] === 2 ? " dot take" : " dot";
        if (s === checkSq) cls += " check";
        if (hintSquares && (hintSquares[0] === s || hintSquares[1] === s)) cls += " hint";
        sqEls[s].className = cls;
        pcEls[s].textContent = p ? GLYPH[p > 0 ? p : -p] : "";
        pcEls[s].className = p ? "pc " + (p > 0 ? "w" : "b") : "pc";
      }
    }
  }

  function renderMoves() {
    var html = "";
    for (var i = 0; i < sans.length; i += 2) {
      html += '<div class="mrow"><span class="mno">' + (i / 2 + 1) + '.</span><span class="mw">' + sans[i] +
        '</span><span class="mb">' + (sans[i + 1] || "") + '</span></div>';
    }
    var ml = $("movelist");
    /* leading dash only — a trailing one broke onto a line of its own in the
       narrow rail. Non-breaking space keeps it welded to the first word. */
    ml.innerHTML = html || '<div class="mrow empty">&mdash;&nbsp;the game has not begun; the file stays shut</div>';
    ml.scrollTop = ml.scrollHeight;
  }

  /* Just the pieces — no "You took:" caption, no per-capture caption. What each
     one unsealed still lives in the chip's title, so the information survives
     without cluttering the board. */
  /* Append-only on purpose. Rebuilding innerHTML re-created every chip on every
     render, which re-fired the chipIn entrance animation on the whole tray each
     time anyone moved — captured pieces popped again on every single move. Only
     genuinely new chips are appended, so only they animate. Captures append and
     takebacks pop from the end, so index-wise reuse stays correct. */
  function renderTray(el, arr) {
    while (el.children.length > arr.length) el.removeChild(el.lastChild);
    for (var i = 0; i < arr.length; i++) {
      var chip = el.children[i];
      if (!chip) {
        chip = document.createElement("span");
        chip.className = "t-pc";
        el.appendChild(chip);
      }
      if (chip.textContent !== arr[i].glyph) chip.textContent = arr[i].glyph;
      var label = arr[i].label ? arr[i].label.replace(/^→\s*/, "") : "";
      if (label) chip.title = label; else chip.removeAttribute("title");
    }
  }

  /* Only says something when there is something to say — an idle
     "White to move" line is noise next to a board that already shows it. */
  function statusHTML() {
    if (gameOver) return gameOver.text;
    if (game.turn === BLACK) return "<b>AL-1200</b> is thinking&hellip;";
    if (game.inCheck()) return '<span class="chk">Check</span> &mdash; get out of it.';
    return "";
  }

  /* Nothing about the game was ever announced, so a screen-reader user had no
     way to follow it — the status line only speaks up for check and game over,
     and moves land silently. This says who played what and whose turn it is,
     into a visually-hidden live region. Kept separate from #status so the
     visible line can stay as sparse as it is. */
  var lastAnnounced = "";
  function announce() {
    var el = $("announce");
    if (!el) return;
    var n = sans.length, msg = "";
    /* index 0 is White's first move, so an odd count means White moved last */
    if (n) msg += (n % 2 === 1 ? "You played " : "AL-1200 played ") + sans[n - 1] + ". ";
    if (gameOver) msg += gameOver.text.replace(/<[^>]*>/g, "");
    else if (game.turn === BLACK) msg += "AL-1200 is thinking.";
    else if (game.inCheck()) msg += "You are in check.";
    else msg += "Your move.";
    if (msg === lastAnnounced) return;      /* don't re-announce an unchanged state */
    lastAnnounced = msg;
    el.textContent = msg;
  }

  function render() {
    legalCache = (!gameOver && game.turn === WHITE) ? game.legal() : [];
    renderBoard();
    renderMoves();
    renderTray($("tray-player"), trayP);
    renderTray($("tray-bot"), trayB);
    $("status").innerHTML = statusHTML();
    /* The disabled styling existed but was unreachable — nothing ever set the
       property. Takeback with no history and Hint on the bot's turn both did
       nothing while still looking pressable. */
    $("btn-take").disabled = !game.hist.length;
    $("btn-hint").disabled = !!gameOver || game.turn !== WHITE;
    announce();
  }

  /* =============== piece movement (FLIP) =============== */
  /* render() has already drawn the piece on its destination square; we offset
     the glyph back to where it came from and release it, so it slides. Castling
     moves two pieces, so the rook gets the same treatment. */
  var slidingEls = [];
  /* Snapping a glyph home takes more than clearing the inline transform: by
     then the inline value is already gone and it is the *pending transition*
     that is still rendering the old offset. Killing the transition for one
     frame is what actually cancels it. */
  function settleGlyph(el) {
    if (!el) return;
    el.classList.remove("moving", "landed");
    el.style.transition = "none";
    el.style.transform = "";
    void el.offsetWidth;
    el.style.transition = "";
  }
  function clearSlides() {
    for (var i = 0; i < slidingEls.length; i++) settleGlyph(slidingEls[i]);
    slidingEls = [];
  }
  /* every glyph, tracked or not — used on resize, where stale pixel deltas
     from the old square size would otherwise persist */
  function settleAllGlyphs() {
    for (var s = 0; s < 128; s++) if (pcEls[s]) settleGlyph(pcEls[s]);
    slidingEls = [];
  }
  function slide(from, to, settle) {
    var el = pcEls[to];
    if (!el || !el.textContent) return;
    var a = sqEls[from].getBoundingClientRect();
    var b = sqEls[to].getBoundingClientRect();
    var dx = Math.round(a.left - b.left);
    var dy = Math.round(a.top - b.top);
    if (dx === 0 && dy === 0) return;
    el.classList.remove("moving", "landed");
    /* keep the glyph's own -2% lift so it doesn't hop when the slide ends */
    el.style.transform = "translate(" + dx + "px," + dy + "px) translateY(-2%)";
    void el.offsetWidth;                       /* commit the start frame */
    el.classList.add("moving");
    el.style.transform = "";
    slidingEls.push(el);
    if (settle) {
      window.setTimeout(function () {
        el.classList.remove("moving");
        el.classList.add("landed");
      }, 200);
    }
  }
  function animateMove(m) {
    if (reduced) return;
    clearSlides();
    slide(m.from, m.to, !!m.captured);
    if (m.flags & FLAG_CASTLE) {
      var kingside = m.to > m.from;
      slide(kingside ? m.from + 3 : m.from - 4, kingside ? m.to - 1 : m.to + 1, false);
    }
  }

  /* The intro curtain's markup, kept so it can be replayed. The whole thing is
     over in 1.6s and then deleted, which is exactly how a feature like this
     rots — __gambit.replayIntro() is how you look at it again. */
  var introHTML = "";

  /* How long to leave the curtain in the DOM. The CSS already made it inert at 3.15s
     via introDone; this is only the tidy-up afterwards, so it has to be LATER than
     that mark and is not otherwise load-bearing. Kept next to the markup it serves
     rather than inline at both call sites, because the choreography's last travel
     ends at 3.08s and a stale copy of this number is how the node would get pulled
     out from under a parting that had not finished. */
  var INTRO_MS = 3300;

  /* Set on <html> by the inline head script when the visitor has seen the curtain
     before; the stylesheet uses it to suppress the whole thing with nothing painted. */
  var INTRO_KEY = "gambit-intro-seen";
  var SEEN_CLASS = "seen-intro";

  /* Pure CSS, so re-inserting the node is the whole trick: every animation starts
     over from its declared delay.
     Dropping the class matters — on a return visit the stylesheet is hiding .intro, so
     without this the replay would insert a node that is display:none and appear to do
     nothing at all. It is not persisted, so it only affects this page view. */
  function replayIntro() {
    if (!introHTML) return false;
    document.documentElement.classList.remove(SEEN_CLASS);
    var old = $("intro");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    document.body.insertAdjacentHTML("afterbegin", introHTML);
    var el = $("intro");
    /* Marks this curtain as asked for, which is what lets it through the
       prefers-reduced-motion rule that hides the automatic one. */
    if (el) el.classList.add("forced");
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, INTRO_MS);
    return true;
  }

  /* =============== the board settles =============== */
  /* The pieces sit down rank by rank once the board is live. Waits on nothing —
     no timer, no font, no image, no network. The intro curtain is pure CSS and
     needs no help from here. */
  var setupRun = false;

  /* The set is a reward for arriving, never a tax: it runs AFTER the one gate
     this page has, over a board that is already live and already correct.
     Removing one class cancels all four beats in a single frame, which is exactly
     what the first click does. */
  function startSetup() {
    if (setupRun || reduced) return;      /* once per load, whichever path wins */
    setupRun = true;
    boardEl.classList.add("setting");
    setTimeout(endSetup, 520);            /* the last beat ends at 430ms */
  }
  /* MUST run before any slide(): there is no fill-mode, so nothing holds a
     transform after the 220ms — but a landTap still LIVE outranks the inline
     transform slide() is about to write, and settleGlyph clears transition and
     transform, never animation. */
  function endSetup() {
    boardEl.classList.remove("setting");
  }

  /* =============== capture -> unlock plumbing =============== */
  /* black pawns still standing — drives the promotion top-up below */
  function blackPawnsLeft() {
    var n = 0;
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) if (game.board[r * 16 + f] === -PAWN) n++;
    }
    return n;
  }

  /* The four unlock tracks, in the order a capture pays into them, with what
     each one holds. A capture pays its own track first; TRACKS order is only
     used for the roll-up below. */
  var TRACKS = ["pawns", "minors", "rooks", "queen"];
  var TRACK_CAP = { pawns: 8, minors: 4, rooks: 2, queen: 1 };
  /* what the reveal card says: the piece paid its own track, or rolled up */
  var PLAIN_KICKER = {
    pawns: "a pawn falls — the record grows",
    minors: "a minor piece falls — projects unsealed",
    rooks: "a rook falls — the employment record opens",
    queen: "the queen falls — the file is yours"
  };
  var ROLL_KICKER = {
    minors: "every win is already in — this capture pays into the projects",
    rooks: "every project is already in — this capture opens the employment record",
    queen: "everything below is open — this capture takes the file"
  };
  function trackFull(t) { return state[t] >= TRACK_CAP[t]; }
  function trackOfPiece(pt) {
    return pt === PAWN ? "pawns"
         : (pt === KNIGHT || pt === BISHOP) ? "minors"
         : pt === ROOK ? "rooks" : "queen";
  }

  function handlePlayerCapture(m, sqTo) {
    var pt = m.captured > 0 ? m.captured : -m.captured;   /* real piece — drives the tray glyph */
    var track = trackOfPiece(pt);                         /* which unlock track it pays into */
    var before = counts(), items = [], label = "", muted = false, kicker = "";
    /* AL-1200 can't hide wins by promoting: once no black pawn is left standing
       (all captured or promoted away), any further capture tops up the wins queue.
       Derived from the board, so takebacks can't desync it. */
    var toppedUp = false;
    if (track !== "pawns" && !trackFull("pawns") && blackPawnsLeft() === 0) {
      track = "pawns";
      toppedUp = true;
    }
    /* ROLL-UP. A capture whose own track is already full pays into the next one
       up instead of being wasted. Without this the top two tiers are effectively
       unreachable for a player who only takes what is offered, because the
       engine's safety ceiling (BOT_MAX_LOSS) forbids AL-1200 from ever shedding
       a rook or a queen for less than its value: measured over 100 games, a
       purely greedy White wins 5.4 pawns and 2.4 minors per game but only 0.33
       rooks and 0.06 queens, so the résumé took ~17 games to unseal and the
       employment record ~8. The bot cannot be made to gift heavy pieces without
       breaking the "never hands over a queen" invariant — raising the ceiling to
       a queen's worth restores 0.53 queens/game but also gives the queen away
       for free in 12% of sampled positions — so the reveal pays out on the
       running total instead. Order is preserved: nothing rolls up until every
       cheaper seal is already open, so a queen capture still opens the résumé
       first and fastest. */
    var rolled = false, nx;
    while (trackFull(track)) {
      nx = TRACKS[TRACKS.indexOf(track) + 1];
      if (!nx) break;                          /* nothing left that a capture buys */
      track = nx;
      rolled = true;
    }
    /* m._unl records which track this capture banked, so takeback can refund it */
    if (!trackFull(track)) { state[track]++; m._unl = track; }
    kicker = rolled ? ROLL_KICKER[track] : (
      track === "pawns"
        ? (toppedUp ? "a promoted pawn falls — the record grows"
                    : "a pawn falls — the record grows")
        : PLAIN_KICKER[track]);
    saveState();
    var after = counts(), i;
    for (i = before.wins; i < after.wins; i++) items.push("<b>" + WINS[i].tier + "</b> — " + WINS[i].ev);
    for (i = before.projects; i < after.projects; i++) items.push("<b>" + PROJECTS[i].title + "</b> (" + PROJECTS[i].yr + ")");
    for (i = before.jobs; i < after.jobs; i++) items.push("<b>" + JOBS[i].role + "</b> — " + JOBS[i].org);
    if (!before.resume && after.resume) items.push("<b>THE FILE</b> — résumé (PDF), email &amp; socials");
    /* short tray label */
    if (items.length === 0) { label = "already unsealed"; muted = true; }
    else if (track === "pawns") {
      var names = [];
      for (i = before.wins; i < after.wins; i++) names.push(WINS[i].short);
      label = "→ " + names.join(" + ");
    }
    else if (track === "minors") label = "→ " + (after.projects - before.projects) + " projects";
    else if (track === "rooks") label = "→ " + (after.jobs - before.jobs) + " roles";
    else label = "→ the résumé";
    trayP.push({ glyph: GLYPH[pt], label: label, muted: muted });
    applyUnlocks(false);
    captureFx(sqTo);
    if (items.length) showReveal(kicker, items, false);
  }

  function handleBotCapture(m) {
    var pt = m.captured > 0 ? m.captured : -m.captured;
    trayB.push({ glyph: GLYPH[pt], label: "" });
    botCapsSinceToast++;
    if (botCapsSinceToast >= 3) {
      botCapsSinceToast = 0;
      showToast("AL-1200 defends his secrets.");
    }
  }

  /* =============== move flow =============== */
  function afterPlayerMove(m, instantBot) {
    endSetup();          /* a live landTap would outrank slide()'s inline transform */
    clearHint();
    sel = -1;
    sans.push(san(game, m));
    game.make(m);
    render();
    animateMove(m);
    /* en passant: the captured pawn stood behind the landing square */
    if (m.captured) {
      handlePlayerCapture(m, (m.flags & FLAG_EP) ? m.to - 16 * (m.piece > 0 ? 1 : -1) : m.to);
    }
    if (checkEnd()) return;
    if (instantBot) botReply();
    else botTimer = setTimeout(botReply, 420);
  }

  function botReply() {
    botTimer = 0;
    if (gameOver || game.turn !== BLACK) return;
    var m = botMove(game);
    if (!m) { checkEnd(); return; }
    sans.push(san(game, m));
    game.make(m);
    if (m.captured) handleBotCapture(m);
    render();
    animateMove(m);
    checkEnd();
  }

  /* Honest wording for each way a game can peter out. The engine reports the
     reason; we only phrase it. */
  var DRAW_COPY = {
    "threefold repetition": {
      status: "<b>Draw</b> — threefold repetition.",
      title: "Threefold repetition.",
      note: "The same position three times over. Drawn — the remaining seals hold. Run it back, or open the portfolio anyway."
    },
    "fifty-move rule": {
      status: "<b>Draw</b> — fifty-move rule.",
      title: "Fifty moves, no progress.",
      note: "Fifty moves each without a capture or a pawn push. Drawn by rule — rematch, or just read everything below."
    },
    "insufficient material": {
      status: "<b>Draw</b> — insufficient material.",
      title: "Nothing left to mate with.",
      note: "Neither side has the material to force a mate. Drawn — rematch, or open the portfolio anyway."
    }
  };

  function checkEnd() {
    if (gameOver) return true;
    if (game.legal().length) {
      /* Not mate or stalemate — but the game can still be over. The isDraw
         guard is for the returning visitor whose browser still has an older
         engine.js cached: no draw detection is a worse game, a hard TypeError
         on every move is a broken page. */
      var reason = game.isDraw ? game.isDraw() : null;
      if (!reason) return false;
      var copy = DRAW_COPY[reason] || {
        status: "<b>Draw</b> — " + reason + ".",
        title: "Drawn.",
        note: "A draw by " + reason + ". The remaining seals hold — rematch, or open the portfolio anyway."
      };
      gameOver = { text: copy.status, kind: "draw" };
      showGameOver("½–½", copy.title, copy.note);
      $("status").innerHTML = gameOver.text;
      return true;
    }
    if (game.inCheck()) {
      if (game.turn === BLACK) {          /* White delivered mate */
        gameOver = { text: '<span class="chk">Checkmate.</span> <b>You win — full disclosure.</b>', kind: "win" };
        onPlayerMate();
      } else {
        gameOver = { text: '<span class="chk">Checkmate.</span> AL-1200 wins — the file stays shut&hellip; for now.', kind: "loss" };
        showGameOver("0–1", "Checkmated.", "AL-1200 keeps his secrets — this round. You can run it back, or just read everything.");
      }
    } else {
      gameOver = { text: "<b>Stalemate.</b> Drawn — the seals hold.", kind: "draw" };
      showGameOver("½–½", "Stalemate.", "A draw. The remaining seals hold — rematch, or open the portfolio anyway.");
    }
    /* no further moves will land, so nothing will clear a slide that is still
       in flight — settle the board now (the mate overlay is its own element) */
    setTimeout(clearSlides, 260);
    $("status").innerHTML = gameOver.text;
    return true;
  }

  /* =============== the win modal's execution =============== */
  /* The piece that actually delivered mate runs the king through, inside the
     result card. Only the attacker's glyph varies; the choreography is fixed.
     REVERT: delete this block, its call in showGameOver(), #go-slice in
     index.html and the .gs CSS block. */
  var matePieceType = 0;              /* set on mate, consumed by the modal */

  function matingPieceOf(m) {
    if (!m) return QUEEN;
    /* castling can only ever mate with the rook it moved */
    if (m.flags & FLAG_CASTLE) return ROOK;
    return m.promo ? m.promo : (m.piece > 0 ? m.piece : -m.piece);
  }

  function buildWinSlice(pt) {
    var st = $("go-slice");
    if (!st) return;
    st.innerHTML = "";
    function part(cls, ch) {
      var e = document.createElement("span");
      e.className = cls;
      if (ch) e.textContent = ch;
      return e;
    }
    /* Reduced motion still gets the handshake — that is the closing note, not
       decoration. Only the strike itself is skipped. */
    if (reduced) {
      var still = part("gs-gg");
      still.appendChild(part("gg-hands", "🤝"));
      still.appendChild(part("gg-text", "good game"));
      st.appendChild(still);
      return;
    }
    st.appendChild(part("gs-burst"));
    st.appendChild(part("gs-half gs-top", GLYPH[KING]));
    st.appendChild(part("gs-half gs-bot", GLYPH[KING]));
    st.appendChild(part("gs-slash"));
    st.appendChild(part("gs-piece", GLYPH[pt || QUEEN]));
    /* the game ends with a handshake, so the stage isn't empty afterwards */
    var gg = part("gs-gg");
    gg.appendChild(part("gg-hands", "🤝"));
    gg.appendChild(part("gg-text", "good game"));
    st.appendChild(gg);
  }

  function onPlayerMate() {
    state.mate = true;
    saveState();
    /* remember what delivered mate; the win modal stages it */
    matePieceType = matingPieceOf(game.hist.length ? game.hist[game.hist.length - 1].m : null);
    applyUnlocks(true);
    showReveal("checkmate — full disclosure", [
      "<b>Every seal you missed</b> is open below",
      "<b>Nothing left hidden</b> — the whole file is yours"
    ], true);
    /* the win deserves the same modal the loss gets — after the cascade lands */
    clearMateModalTimer();
    mateModalTimer = setTimeout(function () {
      mateModalTimer = 0;
      showGameOver("1–0", "Checkmate — you win.",
        "AL-1200 resigns the file. Everything below is unsealed: run it back, or go read it.");
    }, reduced ? 0 : 2200);
  }

  function onSquareClick(e) {
    endSetup();          /* first touch cancels all four beats in one frame */
    var s = +e.currentTarget.dataset.s;
    if (gameOver || game.turn !== WHITE) return;
    if (sel >= 0) {
      var m = findMove(sel, s);
      if (m) { afterPlayerMove(m, false); return; }
    }
    var p = game.board[s];
    sel = (p > 0 && s !== sel) ? s : -1;
    renderBoard();
  }

  function findMove(from, to) {
    var fallback = null;
    for (var i = 0; i < legalCache.length; i++) {
      var m = legalCache[i];
      if (m.from !== from || m.to !== to) continue;
      if (m.promo === 0) return m;
      if (m.promo === QUEEN) fallback = m;   /* auto-queen */
    }
    return fallback;
  }

  /* =============== buttons =============== */
  function undoOne() {
    var m = game.unmake();
    if (!m) return;
    sans.pop();
    if (m.captured) {
      var arr = m.piece > 0 ? trayP : trayB;
      arr.pop();
    }
    if (m._unl) {                     /* refund the unlock this capture banked */
      if (m._unl === "queen") state.queen = 0;
      else state[m._unl]--;
      delete m._unl;
      saveState();
      resealBeyond();
      applyUnlocks(false);
    }
    gameOver = null;
  }
  function takeback() {
    if (botTimer) { clearTimeout(botTimer); botTimer = 0; }
    clearMateModalTimer();
    if (!game.hist.length) return;
    clearHint(); clearSlides(); sel = -1;
    undoOne();
    if (game.turn === BLACK && game.hist.length) undoOne();
    hideGameOver();
    render();
  }
  function newGame() {
    if (botTimer) { clearTimeout(botTimer); botTimer = 0; }
    clearMateModalTimer();
    game.reset();
    sans = []; trayP = []; trayB = [];
    sel = -1; gameOver = null;
    clearHint(); clearSlides();
    hideGameOver();
    hideReveal();
    render();
  }
  function showHint() {
    if (gameOver || game.turn !== WHITE) return;
    var m = bestMove(game);        /* the real best move, not AL-1200's fallible pick */
    if (!m) return;
    hintSquares = [m.from, m.to];
    renderBoard();
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(clearHint, 2600);
  }
  function clearHint() {
    if (hintTimer) { clearTimeout(hintTimer); hintTimer = 0; }
    if (hintSquares) { hintSquares = null; renderBoard(); }
  }
  function unlockAll() {
    stopSealing();          /* a reset may still be closing cards */
    state.all = true;
    saveState();
    applyUnlocks(true);
  }
  function hardReset(cascade) {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    state = blankState();
    resealAll(cascade);
    applyUnlocks(false);
    newGame();
  }

  /* =============== fx: paper-burst particles + stamp =============== */
  var wrap = document.querySelector(".board-wrap");
  var fx = $("fx"), fctx = fx.getContext("2d");
  var parts = [], fxRaf = 0;
  function sizeFx() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = Math.round(fx.clientWidth * dpr);
    fx.height = Math.round(fx.clientHeight * dpr);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function squareCenter(s) {
    var sr = sqEls[s].getBoundingClientRect(), wr = fx.getBoundingClientRect();
    return { x: sr.left - wr.left + sr.width / 2, y: sr.top - wr.top + sr.height / 2, w: sr.width };
  }
  function captureFx(s) {
    if (reduced) return;
    var c = squareCenter(s);
    sizeFx();
    var colors = ["#f4ecd9", "#ede1c4", "#a4211b", "#5b3a24", "#e4d5b2"];
    for (var i = 0; i < 26; i++) {
      var a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 260;
      parts.push({
        x: c.x, y: c.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120,
        rot: Math.random() * Math.PI, vr: (Math.random() - .5) * 10,
        sz: 2 + Math.random() * 4.5,
        col: colors[(Math.random() * colors.length) | 0],
        life: .55 + Math.random() * .35, t: 0
      });
    }
    if (!fxRaf) { var last = performance.now(); fxRaf = requestAnimationFrame(function tick(now) {
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      fctx.clearRect(0, 0, fx.clientWidth, fx.clientHeight);
      var alive = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.t += dt;
        if (p.t >= p.life) continue;
        p.vy += 800 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        var al = 1 - p.t / p.life;
        fctx.save();
        fctx.translate(p.x, p.y); fctx.rotate(p.rot);
        fctx.globalAlpha = al;
        fctx.fillStyle = p.col;
        fctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz * .7);
        fctx.restore();
        alive.push(p);
      }
      parts = alive;
      if (parts.length) fxRaf = requestAnimationFrame(tick);
      else { fxRaf = 0; fctx.clearRect(0, 0, fx.clientWidth, fx.clientHeight); }
    }); }
    /* red CAPTURED stamp over the square */
    var st = document.createElement("span");
    st.className = "sq-stamp";
    st.textContent = "CAPTURED";
    st.style.left = (c.x + 8) + "px";
    st.style.top = (c.y + 8) + "px";
    wrap.appendChild(st);
    setTimeout(function () { if (st.parentNode) st.parentNode.removeChild(st); }, 900);
  }

  /* =============== reveal card =============== */
  var rvTimer = 0;
  function showReveal(kicker, items, fd) {
    var rv = $("reveal");
    rv.classList.toggle("fd", !!fd);
    $("rv-kicker").textContent = kicker;
    $("rv-items").innerHTML = items.map(function (i) { return '<div class="rv-item">' + i + '</div>'; }).join("");
    rv.classList.add("show");
    if (rvTimer) clearTimeout(rvTimer);
    rvTimer = setTimeout(hideReveal, 7000);
  }
  function hideReveal() {
    if (rvTimer) { clearTimeout(rvTimer); rvTimer = 0; }
    $("reveal").classList.remove("show");
  }
  (function wireRevealDismiss() {
    var card = $("reveal-card");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Dismiss this reveal");
    card.addEventListener("click", hideReveal);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hideReveal(); }
    });
  })();

  /* =============== dialog scroll lock =============== */
  /* One switch for all three dialogs — checked rather than counted, so an
     overlapping open/close can't leave the page permanently frozen. */
  function syncScrollLock() {
    var open = !$("case").hidden ||
               !$("cover").hidden ||
               $("gameover").classList.contains("show");
    document.documentElement.classList.toggle("dialog-open", open);
  }

  /* =============== project case sheet =============== */
  /* An unsealed project card opens its full write-up — the deeper problem /
     approach / outcome text plus every external link. Sealed cards are inert:
     the whole point is that the content is still hidden. */
  var casePrev = null, caseClosing = false;

  function openCase(i) {
    var p = PROJECTS[i];
    if (!p) return;
    $("case-shot").innerHTML = p.img
      ? '<img src="' + p.img + '" alt="' + esc(p.title) + '" decoding="async">'
      : "";
    $("case-no").textContent = "No. " + String(i + 1).padStart(2, "0");
    $("case-yr").textContent = p.yr;
    $("case-title").textContent = p.title;
    var hl = $("case-hl");
    hl.textContent = p.hl || "";
    hl.className = "case-hl" + (p.quiet ? " quiet" : "");
    hl.hidden = !p.hl;

    var clauses = "", n = 0;
    [["Problem", p.problem], ["Approach", p.approach], ["Outcome", p.outcome]]
      .forEach(function (pair) {
        if (!pair[1]) return;                 /* omitted where the source has none */
        n++;
        clauses += '<div class="case-clause"><span class="cc-lbl">' +
          '<i>' + String(n).padStart(2, "0") + '</i>' + pair[0] + '</span>' +
          '<p>' + esc(pair[1]) + '</p></div>';
      });
    $("case-clauses").innerHTML = clauses;
    $("case-tags").innerHTML = p.tags.map(function (t) {
      return '<span>' + esc(t) + '</span>';
    }).join("");
    $("case-links").innerHTML = (p.links && p.links.length)
      ? p.links.map(function (l) {
          return '<a href="' + l.h + '" target="_blank" rel="noreferrer">' +
            esc(l.l) + ' &#8599;</a>';
        }).join("")
      : '<span class="case-nolinks">No public link for this one.</span>';

    casePrev = document.activeElement;
    var el = $("case");
    el.classList.remove("closing");
    el.hidden = false;
    var x = $("case-x");
    if (x && x.focus) x.focus();
    syncScrollLock();
  }

  function hideCase() {
    var el = $("case");
    if (el.hidden || caseClosing) return;
    var finish = function () {
      el.classList.remove("closing");
      el.hidden = true;
      caseClosing = false;
      if (casePrev && casePrev.focus) casePrev.focus();
      casePrev = null;
      syncScrollLock();
    };
    if (reduced) { finish(); return; }
    caseClosing = true;
    el.classList.add("closing");
    var card = el.querySelector(".case-card");
    var done = false;
    var once = function () { if (!done) { done = true; finish(); } };
    card.addEventListener("animationend", once, { once: true });
    setTimeout(once, 380);
  }

  /* a card is openable once its content is unsealed — same count the attribute
     sync uses, so the two can't disagree mid-cascade */
  function projectOpen(i) { return i < counts().projects; }

  /* one delegated listener, so it keeps working as cards unseal */
  $("proj-grid").addEventListener("click", function (e) {
    if (e.target.closest("a")) return;              /* let real links win */
    var card = e.target.closest(".dcard");
    if (!card) return;
    var i = +card.id.slice(5);
    if (!projectOpen(i)) return;                    /* sealed = inert */
    openCase(i);
  });
  $("proj-grid").addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var card = e.target.closest(".dcard");
    if (!card) return;
    var i = +card.id.slice(5);
    if (!projectOpen(i)) return;
    e.preventDefault();
    openCase(i);
  });
  $("case-x").addEventListener("click", hideCase);
  $("case").addEventListener("click", function (e) { if (e.target === this) hideCase(); });

  /* =============== cover / rules dialog =============== */
  /* Shown once per visitor (first load), then only on demand via Rules — a
     returning player with unlocks shouldn't have to dismiss the pitch again. */
  var COVER_KEY = "gambit-cover-seen";
  var coverPrev = null;
  function showCover() {
    coverPrev = document.activeElement;
    $("cover").hidden = false;
    var x = $("cover-x");
    if (x && x.focus) x.focus();
    syncScrollLock();
  }
  var coverClosing = false;
  function hideCover() {
    var c = $("cover");
    if (c.hidden || coverClosing) return;
    try { localStorage.setItem(COVER_KEY, "1"); } catch (e) {}
    var finish = function () {
      c.classList.remove("closing");
      c.hidden = true;
      coverClosing = false;
      if (coverPrev && coverPrev.focus) coverPrev.focus();
      coverPrev = null;
      syncScrollLock();
      startSetup();      /* the sheet lifts; the position is set underneath */
    };
    if (reduced) { finish(); return; }
    /* let the sheet lift away before it leaves the DOM flow */
    coverClosing = true;
    c.classList.add("closing");
    var card = c.querySelector(".cover-card");
    var done = false;
    var once = function () { if (!done) { done = true; finish(); } };
    card.addEventListener("animationend", once, { once: true });
    setTimeout(once, 420);   /* fallback if the animation never fires */
  }
  $("cover-x").addEventListener("click", hideCover);
  $("cover-play").addEventListener("click", hideCover);
  $("cover").addEventListener("click", function (e) { if (e.target === this) hideCover(); });
  $("btn-rules").addEventListener("click", showCover);
  (function maybeShowCover() {
    var seen = false;
    try { seen = localStorage.getItem(COVER_KEY) === "1"; } catch (e) {}
    if (!seen) showCover();
  })();

  /* =============== game-over modal =============== */
  function showGameOver(res, title, note) {
    var el = $("gameover");
    $("go-res").textContent = res;
    $("go-title").textContent = title;
    $("go-note").textContent = note;
    /* a win gets the stamped entrance and staggered lines; everything else is
       dealt in plainly. Restart the animation if the modal is somehow already
       up, so the class change always plays. */
    el.classList.remove("show", "closing", "is-win");
    var win = res === "1–0";
    /* stage the execution before the class lands, so it animates on the same
       frame the card stamps in */
    if (win) buildWinSlice(matePieceType);
    else if ($("go-slice")) $("go-slice").innerHTML = "";
    void el.offsetWidth;
    el.classList.toggle("is-win", win);
    el.classList.add("show");
    syncScrollLock();
  }
  var goClosing = false;
  function hideGameOver() {
    var el = $("gameover");
    if (!el.classList.contains("show") || goClosing) return;
    var finish = function () {
      el.classList.remove("show", "closing", "is-win");
      if ($("go-slice")) $("go-slice").innerHTML = "";   /* don't leave it staged */
      goClosing = false;
      syncScrollLock();
    };
    if (reduced) { finish(); return; }
    goClosing = true;
    el.classList.add("closing");
    var card = el.querySelector(".modal-card");
    var done = false;
    var once = function () { if (!done) { done = true; finish(); } };
    card.addEventListener("animationend", once, { once: true });
    setTimeout(once, 360);        /* fallback if the animation never fires */
  }
  $("go-rematch").addEventListener("click", function () { hideGameOver(); newGame(); });
  $("go-open").addEventListener("click", function () {
    hideGameOver();
    unlockAll();
    document.getElementById("spoils").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  });
  $("gameover").addEventListener("click", function (e) { if (e.target === this) hideGameOver(); });

  /* =============== toast =============== */
  var toastTimer = 0;
  function showToast(msg) {
    var t = $("toast");
    t.textContent = "⌖ " + msg;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* =============== wiring =============== */
  $("btn-new").addEventListener("click", newGame);
  $("btn-take").addEventListener("click", takeback);
  $("btn-hint").addEventListener("click", showHint);
  /* Index links only navigate — they never unseal anything. */
  function jumpTo(id) {
    var target = document.getElementById(id);
    if (!target) return false;
    hideCover();
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    return true;
  }
  var navLinks = document.querySelectorAll(".nav-jump");
  for (var n = 0; n < navLinks.length; n++) {
    navLinks[n].addEventListener("click", function (e) {
      if (jumpTo(this.getAttribute("href").slice(1))) e.preventDefault();
    });
  }

  /* Unsealing everything is its own explicit button — and once everything is
     open, the same button is how you put it all back. Branches on the same flag
     applyUnlocks() uses to set the label, so the two can never disagree. */
  $("btn-unlock-all").addEventListener("click", function () {
    if (allDone) { hardReset(true); return; }
    unlockAll();
    jumpTo("spoils");
  });

  $("reset-link").addEventListener("click", function (e) { e.preventDefault(); hardReset(true); });
  /* Deliberately does not clear gambit-intro-seen: this replays the curtain for the
     one page view, it does not re-arm it for future loads. Same reasoning as reset
     unlocks leaving gambit-cover-seen alone. */
  $("intro-link").addEventListener("click", function (e) { e.preventDefault(); replayIntro(); });
  /* =============== focus trap =============== */
  /* All three panels are aria-modal="true", which tells a screen reader that
     nothing outside them exists — but Tab still walked the whole page behind
     them (87 tabbable elements with the case sheet open). Keep Tab inside
     whichever one is showing, so the promise aria-modal makes is true. */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]),' +
                  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function openDialog() {
    if (!$("case").hidden) return $("case");
    if (!$("cover").hidden) return $("cover");
    if ($("gameover").classList.contains("show")) return $("gameover");
    return null;
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { hideCase(); hideReveal(); hideGameOver(); hideCover(); return; }
    if (e.key !== "Tab") return;
    var d = openDialog();
    if (!d) return;
    var f = [].filter.call(d.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetWidth || el.offsetHeight || el === document.activeElement;
    });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1], here = document.activeElement;
    var outside = !d.contains(here);
    if (e.shiftKey && (here === first || outside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (here === last || outside)) { e.preventDefault(); first.focus(); }
  });
  window.addEventListener("resize", function () {
    sizeFx();
    /* Slide offsets are pixel deltas measured against the old square size, so a
       resize mid-slide would leave a piece parked at a stale offset — which can
       even poke outside the viewport. Settle every glyph, not just the tracked
       ones: a transition from an earlier move can still be pending. */
    settleAllGlyphs();
  });

  /* =============== QA hooks =============== */
  window.__gambit = {
    fen: function () { return game.fen(); },
    turn: function () { return game.turn === WHITE ? "w" : "b"; },
    legal: function () { return game.legal().map(moveToUci); },
    move: function (uci) {
      if (gameOver || game.turn !== WHITE) return false;
      var m = uciToMove(game, uci);
      if (!m) return false;
      afterPlayerMove(m, true);   /* plays the move AND the bot reply, with reveal side-effects */
      return true;
    },
    unlocked: function () {
      var c = counts();
      return {
        pawns: state.pawns, minors: state.minors, rooks: state.rooks,
        queen: !!state.queen, mate: !!state.mate, all: !!state.all,
        wins: c.wins, projects: c.projects, experience: c.jobs,
        resume: c.resume, everything: c.everything
      };
    },
    unlockAll: unlockAll,
    /* Replay the set on demand. On a warm cache it is over in 430ms and the
       plaque never paints at all, which is exactly how it rots. To see the
       PLAQUE, throttle to slow 4G with the cache off, or block app.js. */
    replayIntro: replayIntro,
    setBoard: function () {
      boardEl.classList.remove("setting");
      void boardEl.offsetWidth;        /* commit, so the beat restarts */
      setupRun = false;
      startSetup();
      return true;
    },
    /* instant, not the animated reseal: callers assert straight after */
    reset: function () { hardReset(false); }
  };

  /* =============== init =============== */
  applyUnlocks(false);
  sizeFx();
  render();
  /* No cover means no gate, so settle the board now. With a cover, hideCover owns
     the call — the settle lives AFTER the only gate, never before it. */
  if ($("cover").hidden) startSetup();
  /* The intro curtain is pure CSS and has already made itself inert at 2.85s; this
     only takes the node out of the DOM afterwards so nothing is left lying over
     the page. Guarded because it is scenery: if it is already gone, fine.
     It also decides whether the curtain was allowed to play at all. The markup is
     always served, so the outerHTML is captured FIRST and unconditionally — that is
     what lets the footer link replay it even on a visit where it never ran. */
  (function dropIntro() {
    var el = $("intro");
    if (!el) return;
    introHTML = el.outerHTML;                     /* so replayIntro() can put it back */
    /* Suppressed by the head script (seen before), or motion is off: straight out.
       Reduced motion deliberately does NOT record a viewing — turn the preference off
       later and the curtain is still owed once. */
    if (document.documentElement.classList.contains(SEEN_CLASS) || reduced) {
      if (el.parentNode) el.parentNode.removeChild(el);
      return;
    }
    /* Written as it starts, not when it ends: a visitor who navigates away mid-curtain
       has still seen it, and a half-played curtain is not worth replaying at them. */
    try { localStorage.setItem(INTRO_KEY, "1"); } catch (e) {}
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, INTRO_MS);
  })();
})();
