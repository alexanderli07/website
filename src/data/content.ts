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
  // short status chips shown in the hero (replace the old portrait), per world
  chips: {
    day: ["🎮 100,000+ game visits", "🥇 4× 1st-place hackathons", "📱 shipped iOS apps"],
    night: ["💼 Finance Dev @ Quintessence Wealth", "🎓 CFM @ Waterloo", "📊 Bloomberg Terminal"],
  },
};

/** Headline stats (Alexander's own claims, from the résumé). */
export const stats = [
  { value: "100K+", label: "visits across games I've shipped" },
  { value: "4×", label: "1st-place hackathon wins" },
  { value: "100+", label: "students taught to code" },
  { value: "$1K+", label: "revenue from a venture I led" },
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
    id: "alphia",
    title: "Alphia",
    blurb:
      "A Chrome extension that reads any store's products and uses AI to generate realistic outfit previews on your own photo.",
    highlight: "Sub-300 ms AI previews",
    problem:
      "Online shopping makes you imagine how something looks on you. I wanted to remove the imagining.",
    approach:
      "Built a Manifest Chrome extension that scrapes product metadata from arbitrary e-commerce sites via dynamic DOM parsing, with an Express.js proxy securely calling the Gemini API to compose your photo with product images.",
    outcome:
      "AI outfit previews and styling feedback in the browser — and after optimizing data flow across extension, frontend and backend, sub-300 ms latency.",
    tags: ["JavaScript", "React", "Vite", "Express.js", "Gemini API"],
    year: "2026 – present",
    image: "", // TODO: add a screenshot / demo GIF
    links: [], // TODO: add repo / demo
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
    image: "/assets/images/dragonflai.png",
    links: [],
    world: "day",
  },
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
    links: [],
    world: "day",
  },
  {
    id: "mediscan",
    title: "MediScan",
    blurb:
      "A free web tool that flags possible pneumonia from chest X-rays using a model trained on collected scans.",
    highlight: "ML on medical imaging",
    problem:
      "Radiology isn't equally accessible everywhere. Could a model give a fast, free first-pass read of a chest X-ray?",
    approach:
      "Users sign up and upload an X-ray; a model trained on collected chest scans returns real-time analysis and highlights areas to check.",
    outcome:
      "A working, accessible classifier — and my first lesson in the discipline ML really demands. [TODO: add your real test accuracy / AUC.]",
    tags: ["Machine Learning", "Medical Imaging", "Classification"],
    year: "Dec 2022",
    image: "/assets/images/MediScan.png",
    links: [],
    world: "day",
  },
  {
    id: "freshvision",
    title: "FreshVision",
    blurb:
      "Cameras in your fridge photograph produce on a schedule; an ML model flags ripeness and suggests recipes before food is wasted.",
    highlight: "Cuts food waste with CV",
    problem: "Food goes bad at the back of the fridge because we forget it's there. What if the fridge kept watch?",
    approach:
      "Cameras photograph produce every few hours and send images to an ML model and web app that determine ripeness and suggest recipes.",
    outcome:
      "An end-to-end system on a real, global problem — sensing, a model, and an app that turns a prediction into an action.",
    tags: ["Machine Learning", "Computer Vision", "IoT"],
    year: "Aug 2023",
    image: "/assets/images/FreshVision.png",
    links: [],
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
      "10,000+ players on this prototype alone — part of 100,000+ visits across my games — and Best Game Mechanic at AngelHacks. Its reveal mechanic is the metaphor behind this site.",
    tags: ["Roblox Studio", "Lua", "Game Mechanic"],
    year: "2022 – present",
    image: "/assets/images/invisibilis.png",
    links: [],
    world: "day",
  },
  {
    id: "opposite-odyssey",
    title: "Opposite Odyssey",
    blurb: "A platformer where switching between night and day reveals different paths up the mountain.",
    highlight: "🏆 Most Creative + 1st Individual — MayfieldHacks",
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
    id: "journeymate",
    title: "JourneyMate",
    blurb: "A Discord bot that plans whole trips — destinations, hotels, attractions and budget — via the GPT API.",
    highlight: "GPT-powered trip planning",
    problem: "Planning a trip means juggling a dozen tabs. I wanted it to be one conversation where people already hang out.",
    approach: "Built with JavaScript and Discord.js, wired to OpenAI's GPT API to turn preferences into a full itinerary and budget.",
    outcome: "Turns a vague 'somewhere warm, not too pricey' into an actual plan.",
    tags: ["JavaScript", "Discord.js", "OpenAI API", "LLM"],
    year: "Apr 2023",
    image: "/assets/images/JourneyMate.png",
    links: [],
    world: "day",
  },
  {
    id: "hopelink",
    title: "HopeLink",
    blurb: "A low-bandwidth communication system for disaster zones — locate food, water and safe areas when infrastructure is gone.",
    highlight: "Engineering under hard constraints",
    problem: "How do people coordinate when the network is barely there?",
    approach: "Built a system using minimal data services so users anywhere can find resources, flag safe/unsafe areas, and chat on almost no bandwidth.",
    outcome: "A study in designing for the worst case: graceful degradation and resilience as a first-class feature.",
    tags: ["Systems", "Networking", "Full-stack"],
    year: "May 2023",
    image: "/assets/images/HopeLink.png",
    links: [],
    world: "day",
  },
  {
    id: "turner-fenton-sac",
    title: "Turner Fenton SAC",
    blurb: "The official website for my school's Student Activity Council — team, events, gallery and applications.",
    highlight: "Shipped & maintained for the school",
    problem: "Our Student Activity Council had no central home — events and applications were scattered.",
    approach: "As an exec I designed and built the site: team intro, events, photo gallery, contact and an application section.",
    outcome: "A live product the whole school uses, which I still manage and update.",
    tags: ["Web Development", "Frontend"],
    year: "2022 – present",
    image: "/assets/images/Turner-Fenton-SAC.png",
    links: [],
    world: "day",
  },
  {
    id: "nova",
    title: "Nova — The Book Suggester",
    blurb: "My very first hackathon project: book recommendations from your borrowing history.",
    highlight: "Where it started — 2020",
    problem: "My first hackathon, and my first taste of using data about the past to suggest something for the future.",
    approach: "Built a recommender that suggests books from a reader's borrow history.",
    outcome: "Modest — but the origin point of everything that followed.",
    tags: ["Recommendation", "Data", "First Project"],
    year: "Aug 2020",
    image: "/assets/images/nova.png",
    links: [],
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
    links: [],
    world: "night",
  },
  {
    id: "snaipshot",
    title: "SnaipShot",
    blurb:
      "A real-time data dashboard aggregating live API streams and structured datasets for analysis and visualization.",
    highlight: "🏆 Best Use of AI — Hack the Valley 9",
    problem:
      "Decisions need signal pulled from noisy, real-time data — fast. That's as true on a trading desk as anywhere.",
    approach:
      "Built a data-driven dashboard aggregating real-time API streams and structured datasets, with low-latency text-to-speech and ML-based summarization (sub-500 ms).",
    outcome:
      "Evaluated outputs across 50+ scenarios at ~85% contextual accuracy, and won Best Use of AI — the closest thing yet to the data tooling I want to build in finance.",
    tags: ["Python", "Streamlit", "Data Pipelines", "ML"],
    year: "Oct 2024",
    image: "",
    links: [],
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
  body: "By day I'm a builder — full-stack apps, AI/ML, and games 100,000+ people have played. By night I'm in finance — a Finance Developer at Quintessence Wealth and a CFM student chasing the quant side. Flip the switch; both halves are real.",
};
