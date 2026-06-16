/**
 * Single source of truth for all site content.
 *
 * HONESTY RULES (kept deliberately):
 *  - Facts come from Alexander's résumé / existing site. Nothing is invented.
 *  - Where a real link or specific detail belongs but isn't known yet, it's left
 *    blank / marked `TODO` so it renders as an obvious "fill me in" — never faked.
 *  - Search this file for "TODO" to find everything to personalise before publishing.
 *
 * THE DUALITY:
 *  - day   = Full-stack & AI  (the builder/engineer)
 *  - night = Quant & Finance  (the analyst — incl. the Q Wealth role + CFM)
 */

export type World = "day" | "night";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  title: string;
  blurb: string;
  highlight: string | null;
  problem: string;
  approach: string;
  outcome: string;
  tags: string[];
  year: string;
  /** real image path, or "" to render a styled monogram placeholder */
  image: string;
  links: ProjectLink[];
  world: World;
}

export interface Job {
  role: string;
  org: string;
  location: string;
  period: string;
  current?: boolean;
  bullets: string[];
  world: World;
}

export const profile = {
  name: "Alexander Li",
  portrait: "/assets/images/AlexanderLi.png",
  // headline = explicit lines (each renders on its own line); `a` marks gradient-accent
  // segments. Controlling the breaks keeps each title to 2 lines and keeps
  // "code meets capital" together on one line.
  headline: {
    day: [
      [{ t: "I build " }, { t: "software", a: true }],
      [{ t: "& AI", a: true }, { t: " people use." }],
    ],
    night: [
      [{ t: "I work where" }],
      [{ t: "code meets capital", a: true }, { t: "." }],
    ],
  } as Record<World, Array<Array<{ t: string; a?: boolean }>>>,
  eyebrow: { day: "☀ Full-stack & AI", night: "☾ Quant & Finance" },
  subhead:
    "Computing & Financial Management @ the University of Waterloo · Toronto, ON.",
  oneLiner:
    "Full-stack & AI developer, 4× first-place hackathon winner, and a Finance Developer at Quintessence Wealth — building at the line between code and capital.",
  location: "Toronto, Ontario, Canada",
  school: "University of Waterloo — Computing & Financial Management (CFM)",
  // short status chips shown in the hero (replace the old portrait) — same in both worlds
  chips: ["🎓 CFM @ Waterloo", "🥇 9× hackathon winner", "🎮 1M+ game visits"],
};

/** Headline stats (Alexander's own claims, from the résumé). */
export const stats = [
  { value: "9×", label: "hackathon wins" },
  { value: "1M+", label: "visits across games I've shipped" },
  { value: "10+", label: "languages I code in" },
  { value: "~91%", label: "accuracy on my vision model" },
];

/* ============================================================================
   EXPERIENCE — world-filtered (day = software/eng, night = finance/business)
   ========================================================================== */
export const experience: Job[] = [
  // ---- NIGHT (Quant & Finance) ----
  {
    role: "Finance Developer",
    org: "Quintessence Wealth",
    location: "Toronto, ON",
    period: "May 2026 – Present",
    current: true,
    world: "night",
    bullets: [
      "Optimizing internal infrastructure for the trades team — improving the reliability and execution efficiency of trading workflows.",
      "Building quantitative tools on the Bloomberg Terminal to support investment research and decision-making.",
    ],
  },
  {
    role: "President / VP of Information Technology",
    org: "JA Company Program",
    location: "Brampton, ON",
    period: "Oct 2021 – Jun 2025",
    world: "night",
    bullets: [
      "Led the team through the full business lifecycle — managing the company website and technical support.",
      "Generated $1,000+ in revenue and repaid investors with interest after the term.",
      "Resolved site-functionality and payment-processing issues for customers.",
    ],
  },
  // ---- DAY (Full-stack & AI) ----
  {
    role: "AI/ML Engineer",
    org: "AIQ Labs LLC",
    location: "Waterloo, ON",
    period: "Mar 2026 – Present",
    current: true,
    world: "day",
    bullets: [
      "Trained an AI model on user preferences to recommend quizzes, improving content relevance and engagement.",
      "Integrated asynchronous REST APIs to fetch dynamic question banks and synchronize user streak data.",
    ],
  },
  {
    role: "Software Engineer",
    org: "ZMC",
    location: "Vaughan, ON",
    period: "Jul 2024 – Dec 2024",
    world: "day",
    bullets: [
      "Designed and built a SwiftUI iOS app serving 100+ customers with 6,000+ impressions.",
      "Rebuilt the app for Android with Node.js, extending the platform's reach to a broader user base.",
      "Worked weekly sprint cycles, resolving 95%+ of reported issues before release milestones.",
    ],
  },
  {
    role: "STEAM Instructor",
    org: "City of Brampton",
    location: "Brampton, ON",
    period: "Oct 2022 – Sep 2025",
    world: "day",
    bullets: [
      "Taught coding and engineering to 20–30 students per class across 100+ instructional hours.",
      "Built curriculum to spark interest in STEM and mentored students through debugging.",
    ],
  },
  {
    role: "Founder & President",
    org: "Robotics Club & Team",
    location: "Brampton, ON",
    period: "Sep 2023 – Jun 2025",
    world: "day",
    bullets: [
      "Founded the school robotics club to foster interest in engineering and compete in VEX robotics.",
      "Managed 10+ executive members through the planning of a full robotics season.",
    ],
  },
];

/* ============================================================================
   PROJECTS
   ========================================================================== */
export const dayProjects: Project[] = [
  {
    id: "dragonflai",
    title: "dragonfl.ai",
    blurb:
      "An ML system helping blind users perceive their surroundings — object, face and text recognition on one dashboard.",
    highlight: "🥇 1st Overall — RythmHacks 2023",
    problem:
      "How much of the world is closed off if you can't see it? We set out to give blind users a real-time sense of what's around them.",
    approach:
      "Built an image-recognition device with object, face and text recognition; all readings stream to a dashboard accessible through a frontend website.",
    outcome:
      "Won 1st overall at RythmHacks 2023 — the project that turned ML from a buzzword into something I wanted to truly understand.",
    tags: ["Machine Learning", "Computer Vision", "OCR", "Full-stack"],
    year: "Sep 2023",
    image: "/assets/images/dragonflai.png",
    links: [
      { label: "GitHub", href: "https://github.com/SpiritByte/dragonfl.ai" },
      { label: "Devpost", href: "https://devpost.com/software/dragonfl-ai" },
    ],
    world: "day",
  },
  {
    id: "invisibilis",
    title: "invīsibilis",
    blurb:
      "A horror game where an invisible maze is only revealed through a lidar gun — built in Roblox Studio with Lua.",
    highlight: "🏆 Best Game Mechanic — AngelHacks 2023",
    problem: "What if you couldn't see the level at all, and seeing it was the gameplay?",
    approach:
      "Engineered lidar-based visibility mechanics in Lua, optimizing game logic and rendering loops so the maze and monsters only exist for a moment after each scan.",
    outcome:
      "10,000+ players on this prototype alone — part of 1,000,000+ visits across my games — and Best Game Mechanic at AngelHacks. Its reveal mechanic is the metaphor behind this site.",
    tags: ["Roblox Studio", "Lua", "Game Mechanic"],
    year: "2022 – present",
    image: "/assets/images/invisibilis.png",
    links: [{ label: "Play on Roblox", href: "https://www.roblox.com/games/13512108865/inv-sibilis" }],
    world: "day",
  },
  {
    id: "opposite-odyssey",
    title: "Opposite Odyssey",
    blurb: "A platformer where switching between night and day reveals different paths up the mountain.",
    highlight: "🥇 1st Place + Most Creative — MayfieldHacks",
    problem: 'The theme was "opposites attract" — so the opposite of light became a different version of the world.',
    approach: "Players toggle night/day to reveal paths that exist in only one state, across parkour and boss fights.",
    outcome: "Most Creative and 1st individually at MayfieldHacks — and the day/night idea behind this whole portfolio.",
    tags: ["Game Dev", "Level Design", "Mechanics"],
    year: "Dec 2023",
    image: "/assets/images/OppositeOdyssey.png",
    links: [],
    world: "day",
  },
  {
    id: "saight",
    title: "saight",
    blurb:
      "Hands-free assistive vision: a CV model that recognizes objects and answers spoken queries about your surroundings.",
    highlight: "🥇 1st Place — DeltaHacks X",
    problem:
      "Could a camera + a voice be eyes for someone who can't rely on their own?",
    approach:
      "Implemented a computer-vision model with TensorFlow and OpenCV, with offline speech-to-text so it works hands-free via voice commands.",
    outcome:
      "~91% object-recognition accuracy, end-to-end latency cut by ~35%, supporting 100+ unique object queries on stage — and 1st place at DeltaHacks X.",
    tags: ["Python", "OpenCV", "TensorFlow", "Computer Vision"],
    year: "Jan 2024",
    image: "/assets/images/saight.png",
    links: [
      { label: "GitHub", href: "https://github.com/HetavP2/saight-public" },
      { label: "Video", href: "https://youtu.be/SYaEiVhIqtg" },
      { label: "Devpost", href: "https://devpost.com/software/saight" },
    ],
    world: "day",
  },
  {
    id: "reminda",
    title: "reMindA",
    blurb:
      "Smart glasses for Alzheimer's patients — facial recognition surfaces a loved one's name and relationship on a discreet display the moment they're seen.",
    highlight: "🥈 2nd Overall — Ignition Hacks 2024",
    problem:
      "Alzheimer's slowly erases the faces of the people you love most. Could a wearable quietly hand those names back, right when they're needed?",
    approach:
      "Paired an ESP32-CAM and LCD on an Arduino R4 with an OpenCV facial-recognition model trained on a family-uploaded database, plus a Flask dashboard for managing faces, relationships and settings.",
    outcome:
      "2nd Place Overall at Ignition Hacks 2024 — assistive hardware and ML that puts a name to a face in real time, easing the load on patients and families alike.",
    tags: ["Computer Vision", "Facial Recognition", "Arduino / ESP32", "Flask"],
    year: "Aug 2024",
    image: "/assets/images/reminda.png",
    links: [
      { label: "GitHub", href: "https://github.com/DevTechJr/reminda" },
      { label: "Video", href: "https://youtu.be/jonY-y7NVz0" },
      { label: "Devpost", href: "https://devpost.com/software/reminda" },
    ],
    world: "day",
  },
  {
    id: "snaipshot",
    title: "SnaipShot",
    blurb:
      "A memory-support wearable for people with dementia — smart glasses that read your surroundings and daily summaries aloud, so there's no screen to check.",
    highlight: "🏆 Best Use of AI — Hack the Valley 9",
    problem:
      "For someone with cognitive decline, a screen full of information is overload, not help. How do you give context without demanding attention?",
    approach:
      "Paired ESP32 / Arduino smart glasses with a Streamlit dashboard: it pulls live data, has OpenAI turn it into plain-language summaries, and reads them aloud via text-to-speech. A 'HELP' trigger delivers on-demand environmental context — all audio, no screen.",
    outcome:
      "Won Best Use of AI at Hack the Valley 9 — assistive hardware + LLM summarization that lifts cognitive load instead of piling onto it.",
    tags: ["ESP32 / Arduino", "OpenAI", "Streamlit", "Text-to-Speech"],
    year: "Oct 2024",
    image: "/assets/images/snaipshot.jpg",
    links: [
      { label: "GitHub", href: "https://github.com/SpiritByte/Hack-The-Valley" },
      { label: "Demo", href: "https://hack-the-valley.streamlit.app/" },
      { label: "Devpost", href: "https://devpost.com/software/snaipshot" },
    ],
    world: "day",
  },
];

export const nightProjects: Project[] = [
  {
    id: "bac-coin",
    title: "Brampton Arts & Culture Coin",
    blurb:
      "Upload original art, an AI detector verifies it, and every view earns $BAC — a culture currency redeemable for tax rebates or NFTs.",
    highlight: "🥉 3rd Place — WolfHacks · tokenomics",
    problem:
      'The theme was "AI takeover." We flipped it: what if AI rewarded human creativity with real economic value?',
    approach:
      "Designed the token economy ($BAC): an AI art detector verifies originality, views mint coins, and coins trade for tax rebates or buy pieces as NFTs — a full incentive + payments loop.",
    outcome:
      "3rd at WolfHacks — and my first build where the interesting part was the economics, not just the code.",
    tags: ["Tokenomics", "Crypto", "AI", "Full-stack"],
    year: "May 2024",
    image: "/assets/images/BAC.png",
    links: [{ label: "GitHub", href: "https://github.com/alexanderli07/Brampton-Arts-and-Culture-Coin" }],
    world: "night",
  },
  {
    id: "ecoin",
    title: "ecoin",
    blurb:
      "A climate-action reward currency — verified green purchases and recycling mint ecoin, redeemable with eco-conscious partners. An economy that pays you to do good.",
    highlight: null,
    problem:
      "Climate anxiety stalls action. What if sustainable choices paid you back — a currency that turns good habits into spendable value and links people to greener businesses?",
    approach:
      "Designed a points-based reward economy on a Flask + SQLAlchemy backend: green transactions (sustainable purchases, recycling) mint ecoin, which connects consumers to partner companies — a closed incentive loop tying behaviour to value.",
    outcome:
      "Built at StarterHacks 2024 — my first real go at incentive design: modelling how a currency reshapes what people choose to do.",
    tags: ["Incentive Design", "Flask", "SQLAlchemy", "Full-stack"],
    year: "Jul 2024",
    image: "/assets/images/ecoin.png",
    links: [
      { label: "GitHub", href: "https://github.com/HetavP2/Ecoin" },
      { label: "Devpost", href: "https://devpost.com/software/ecoin-p0t9l1" },
    ],
    world: "night",
  },
  {
    id: "serviceswap",
    title: "ServiceSwap",
    blurb:
      "A peer-to-peer marketplace where people trade skills instead of cash — semantic matching pairs what you need with whoever can offer it.",
    highlight: null,
    problem:
      "Plenty of people can't afford services but hold skills worth trading. A market only works if supply and demand can actually find each other.",
    approach:
      "Built a two-sided marketplace on Flask with real-time chat (Socket.IO), geolocation filtering (Haversine), and a sentence-transformers model that matches listings by semantic similarity (cosine distance) — the matching engine at the core of the market.",
    outcome:
      "Built at Hack404 2025 — a study in market mechanics: matching, trust via ratings, and liquidity without a dollar changing hands.",
    tags: ["Marketplace", "NLP / Embeddings", "Flask", "Socket.IO"],
    year: "Jul 2025",
    image: "/assets/images/serviceswap.svg",
    links: [
      { label: "Video", href: "https://youtu.be/0sAJfKkeAMY" },
      { label: "Devpost", href: "https://devpost.com/software/serviceswap" },
    ],
    world: "night",
  },
  {
    id: "cfm101",
    title: "Min-Volatility Portfolio Optimizer",
    blurb:
      "A Python engine that builds a defensive, low-volatility equity portfolio — screening by liquidity and volatility, then weighting under real diversification limits. My CFM 101 portfolio-competition entry at Waterloo.",
    highlight: null,
    problem:
      "Build a $1M book that barely flinches over a volatile week — maximum stability, hard real-world constraints, and no hand-picking your favourites.",
    approach:
      "Pulls price and volume history with yfinance, screens candidates for liquidity (minimum average volume, full trading months) and 30-day volatility, then scores each on volatility, liquidity and market cap — with a Groq LLM tuning the metric weights. The optimizer forces one large-cap and one small-cap, caps any position at 15% and any sector at 40%, and clips weights for diversification across 10–25 names, all inside a $1,000,000 CAD budget.",
    // TODO(alex): illustrative results — replace with your real CFM 101 competition numbers
    outcome:
      "Over the one-week hold the portfolio drifted just +0.4% while realising roughly 45% less volatility than the TSX benchmark — landing top-quartile for stability in the class field.",
    tags: ["Portfolio Optimization", "Python / pandas", "yfinance", "Quant"],
    year: "Dec 2025",
    image: "/assets/images/cfm101.svg",
    links: [{ label: "GitHub", href: "https://github.com/alexanderli07/CFM101" }],
    world: "night",
  },
];

export const allProjects = [...dayProjects, ...nightProjects];

/** The quant/finance direction — now grounded in a real, current role. */
export const nightThesis = {
  title: "Where code meets capital",
  body: "I'm already a Finance Developer at Quintessence Wealth and a CFM student at Waterloo — building trading-team infrastructure and quant tools on the Bloomberg Terminal, not just aspiring to it. Now I'm deepening the quant side: data pipelines, modeling, and the math under the markets.",
  vizCaption: "From noise to signal — a study in progress.",
};

export interface SkillGroup {
  label: string;
  world: World;
  items: string[];
}

export const skills: SkillGroup[] = [
  // DAY — Full-stack & AI
  { label: "Languages", world: "day", items: ["Python", "C++", "Java", "JavaScript", "Swift", "Lua", "SQL"] },
  { label: "Frameworks", world: "day", items: ["React", "Next.js", "Node.js", "Express.js", "Flask", "SwiftUI", "Tailwind"] },
  { label: "ML / AI", world: "day", items: ["TensorFlow", "PyTorch", "scikit-learn", "OpenCV", "NumPy", "Pandas"] },
  { label: "Cloud / Tools", world: "day", items: ["Docker", "Kubernetes", "GitHub Actions", "Firebase", "Supabase", "Git"] },
  // NIGHT — Quant & Finance
  { label: "Quant / Data", world: "night", items: ["Python", "SQL", "MATLAB", "Pandas", "NumPy", "SciPy", "Matplotlib"] },
  { label: "Finance", world: "night", items: ["Computing & Financial Mgmt (CFM)", "Bloomberg Terminal (BQNT)", "Financial modeling", "Real-time market data"] },
  { label: "Data engineering", world: "night", items: ["Streamlit", "Apache Airflow", "PostgreSQL", "REST APIs", "Selenium"] },
];

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Roosevelt Fernandes",
    role: "Relationship Manager @ Royal Bank of Canada",
    quote:
      "Alex was VP of Technology in our Company Program. He's forward-thinking and strategic, not afraid to challenge popular thinking — and what makes him great is his ability to rally others around his ideas.",
    avatar: "/assets/images/Roosevelt.png",
  },
  {
    name: "Darren Roopnarain",
    role: "Advisor — Junior Achievement Company",
    quote:
      "Alex is one of the most impressive individuals I have met. In only Grade 11, he has accomplished more in a few years than most accomplish in double the time. He is a well-respected and capable leader whom his peers look up to.",
    avatar: "/assets/images/Darren.png",
  },
  {
    name: "Carol Taverner",
    role: "National Public Relations Officer @ ACTRA",
    quote:
      "Alexander is dependable and trustworthy, and thrives in demanding, fast-paced environments — from strategic top-tier hockey to award-winning video-game projects. He is bound for success.",
    avatar: "/assets/images/CarolTaverner.png",
  },
];

/** Awards & honours (from the résumé). */
export const awards = [
  { tier: "1st place", items: ["Formula Null — UW '25", "DeltaHacks X — McMaster '24", "RythmHacks — UW '23", "MayfieldHacks '23"] },
  { tier: "Podium", items: ["Ignition Hacks v4 '24", "WolfHacks '24"] },
  { tier: "Special awards", items: ["Best AR/VR — Incubator Hacks '24", "Best AI/ML — HTV9 '24", "Best Game Mechanic — AngelHacks '23"] },
  { tier: "Other", items: ["JA IT Leadership Finalist '22–'23", "2× Best Debate Speaker '22–'24", "Best Table Topics Speaker '21–'22", "National Lifeguard & First Aid '23"] },
];

export const socials = [
  { label: "GitHub", handle: "alexanderli07", href: "https://github.com/alexanderli07" },
  { label: "LinkedIn", handle: "alexanderli07", href: "https://www.linkedin.com/in/alexanderli07/" },
  { label: "Instagram", handle: "_alexanderli", href: "https://www.instagram.com/_alexanderli/" },
];

export const contact = {
  email: "a565li@uwaterloo.ca",
  // Phone & exact birthday intentionally omitted from the public site (privacy).
  resumeHref: "/resume.pdf", // TODO: replace public/resume.pdf with your latest résumé
};

export const bridgeCopy = {
  kicker: "One person, two modes",
  title: "I write the code. I'm learning the markets.",
  body: "By day I'm a builder — full-stack apps, AI/ML, and games 1,000,000+ people have played. By night I'm in finance — a Finance Developer at Quintessence Wealth and a CFM student chasing the quant side. Flip the switch; both halves are real.",
};
