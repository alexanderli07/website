import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "../world/useReducedMotion";

type CSSVars = CSSProperties & Record<string, string | number>;

/* deterministic PRNG so particle fields are stable across renders */
function makeRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function Sun({ reduced }: { reduced: boolean }) {
  const rays = useMemo(() => {
    const out: string[] = [];
    const cx = 100, cy = 100, inner = 52, outer = 84, half = 6.5;
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 * Math.PI) / 180;
      const aL = a - (half * Math.PI) / 180;
      const aR = a + (half * Math.PI) / 180;
      const tip = [cx + Math.cos(a) * outer, cy + Math.sin(a) * outer];
      const bL = [cx + Math.cos(aL) * inner, cy + Math.sin(aL) * inner];
      const bR = [cx + Math.cos(aR) * inner, cy + Math.sin(aR) * inner];
      out.push(`${tip[0].toFixed(1)},${tip[1].toFixed(1)} ${bL[0].toFixed(1)},${bL[1].toFixed(1)} ${bR[0].toFixed(1)},${bR[1].toFixed(1)}`);
    }
    return out;
  }, []);

  return (
    <svg className="sun-svg" viewBox="0 0 200 200" aria-hidden>
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd27a" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#ffb703" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunCore" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#fff6d6" />
          <stop offset="55%" stopColor="#ffc23d" />
          <stop offset="100%" stopColor="#ff8a1e" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#sunGlow)" />
      <g className={reduced ? "" : "sun-rays"} style={{ transformOrigin: "100px 100px" }}>
        {rays.map((p, i) => (
          <polygon key={i} points={p} fill="url(#sunCore)" opacity="0.95" />
        ))}
      </g>
      <circle cx="100" cy="100" r="46" fill="url(#sunCore)" />
      <circle cx="100" cy="100" r="46" fill="none" stroke="#fff2cf" strokeOpacity="0.5" strokeWidth="1.5" />
    </svg>
  );
}

const CRATERS = [
  { cx: 74, cy: 76, r: 12 },
  { cx: 122, cy: 64, r: 8 },
  { cx: 132, cy: 112, r: 15 },
  { cx: 86, cy: 130, r: 9 },
  { cx: 60, cy: 110, r: 6 },
  { cx: 106, cy: 96, r: 5 },
  { cx: 96, cy: 58, r: 4.5 },
];

function Moon() {
  return (
    <svg className="moon-svg" viewBox="0 0 200 200" aria-hidden>
      <defs>
        <radialGradient id="moonGlowOuter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#cdd9ff" stopOpacity="0.19" />
          <stop offset="40%" stopColor="#a9bbf2" stopOpacity="0.11" />
          <stop offset="72%" stopColor="#9fb0e8" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#9fb0e8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eef3ff" stopOpacity="0.42" />
          <stop offset="38%" stopColor="#ccd8fb" stopOpacity="0.27" />
          <stop offset="62%" stopColor="#aec0f6" stopOpacity="0.15" />
          <stop offset="82%" stopColor="#9fb0e8" stopOpacity="0.055" />
          <stop offset="100%" stopColor="#9fb0e8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonBody" cx="40%" cy="36%" r="78%">
          <stop offset="0%" stopColor="#f2f6ff" />
          <stop offset="52%" stopColor="#d6def6" />
          <stop offset="100%" stopColor="#abb8dc" />
        </radialGradient>
        <clipPath id="moonClip">
          <circle cx="100" cy="100" r="58" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="188" fill="url(#moonGlowOuter)" />
      <circle cx="100" cy="100" r="140" fill="url(#moonGlow)" />
      <circle cx="100" cy="100" r="58" fill="url(#moonBody)" />
      <g clipPath="url(#moonClip)">
        {CRATERS.map((c, i) => (
          <g key={i}>
            <circle cx={c.cx} cy={c.cy} r={c.r} fill="#9aa6cc" fillOpacity="0.55" />
            <circle cx={c.cx - c.r * 0.18} cy={c.cy - c.r * 0.18} r={c.r * 0.82} fill="#c8d0ec" fillOpacity="0.6" />
            <circle cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke="#7e8ab4" strokeOpacity="0.4" strokeWidth="0.8" />
          </g>
        ))}
        <circle cx="118" cy="118" r="58" fill="#8b97c4" fillOpacity="0.18" />
      </g>
      <circle cx="100" cy="100" r="58" fill="none" stroke="#eef1ff" strokeOpacity="0.35" strokeWidth="1" />
    </svg>
  );
}

/* ---- CLOUDS (both worlds) — REVERTIBLE: remove <Clouds/> below to drop ---- */
const CLOUDS = [
  { top: "13%", scale: 1.0, dur: 95, delay: -10, op: 1 },
  { top: "28%", scale: 0.65, dur: 130, delay: -55, op: 0.85 },
  { top: "47%", scale: 1.25, dur: 165, delay: -90, op: 0.9 },
  { top: "66%", scale: 0.55, dur: 115, delay: -130, op: 0.7 },
];
function Clouds({ reduced }: { reduced: boolean }) {
  return (
    <div className="clouds" aria-hidden>
      {CLOUDS.map((c, i) => {
        const style: CSSVars = {
          top: c.top,
          opacity: c.op,
          transform: `scale(${c.scale})`, // resting state (reduced motion); keyframe takes over otherwise
          "--s": c.scale,
          animation: reduced ? "none" : `cloud-drift ${c.dur}s linear ${c.delay}s infinite`,
        };
        return (
        <div key={i} className="cloud" style={style}>
          <svg viewBox="0 0 200 90" width="200" height="90">
            {/* opaque fill + group opacity (.cloud-body) => overlaps merge seamlessly, no dark seams */}
            <g className="cloud-body" fill="var(--cloud)">
              <ellipse cx="60" cy="58" rx="40" ry="26" />
              <ellipse cx="104" cy="46" rx="46" ry="32" />
              <ellipse cx="146" cy="60" rx="36" ry="24" />
              <rect x="34" y="56" width="128" height="28" rx="14" />
            </g>
          </svg>
        </div>
        );
      })}
    </div>
  );
}

/* ---- BIRDS (day only) — REVERTIBLE: remove <Birds/> below to drop ---- */
const FLOCKS = [
  { top: "18%", dur: 38, delay: 0, scale: 1 },
  { top: "30%", dur: 52, delay: -18, scale: 0.7 },
];
function Birds() {
  return (
    <div className="birds" aria-hidden>
      {FLOCKS.map((f, i) => {
        const style: CSSVars = { top: f.top, "--fs": f.scale, animation: `bird-fly ${f.dur}s linear ${f.delay}s infinite` };
        return (
        <div key={i} className="flock" style={style}>
          {[0, 1, 2, 3, 4].map((b) => (
            <svg key={b} className="bird" viewBox="0 0 40 20" width="34" height="17" style={{ left: `${b * 46}px`, top: `${(b % 2) * 16}px`, animationDelay: `${b * 0.18}s` }}>
              <path d="M2 14 Q11 3 20 12 Q29 3 38 14" fill="none" stroke="var(--bird)" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          ))}
        </div>
        );
      })}
    </div>
  );
}

/**
 * Fixed background atmosphere: a detailed sun (day) / moon (night), particle
 * fields (stars at night, warm motes by day), drifting clouds, day birds, and
 * the celestial body that travels down on scroll but stops above the footer.
 */
export function Atmosphere() {
  const reduced = useReducedMotion();
  const [vp, setVp] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  }));

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Celestial size + start fraction must MATCH the CSS (incl. the mobile media query),
  // so the scroll travel lands its BOTTOM edge at the SAME ~79% of viewport height
  // (just above the footer) on every screen: travel = target - start - size.
  const isMobile = vp.w <= 767;
  const size = isMobile
    ? Math.min(165, Math.max(130, vp.w * 0.36))
    : Math.min(440, Math.max(190, vp.w * 0.3));
  const startFrac = isMobile ? 0.06 : 0.15;
  const travel = Math.max(80, vp.h * 0.79 - vp.h * startFrac - size);

  const { scrollYProgress } = useScroll();
  const yRaw = useTransform(scrollYProgress, [0, 1], [0, travel]);
  const y = reduced ? 0 : yRaw;

  const stars = useMemo(() => {
    const rand = makeRand(9176);
    return Array.from({ length: 90 }, () => ({ x: rand() * 100, y: rand() * 100, s: rand() * 1.6 + 0.4, o: rand() * 0.7 + 0.3 }));
  }, []);
  const motes = useMemo(() => {
    const rand = makeRand(4242);
    return Array.from({ length: 26 }, () => ({ x: rand() * 100, y: rand() * 100, s: rand() * 5 + 2, o: rand() * 0.35 + 0.12, d: rand() * 6 + 7 }));
  }, []);

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="stars">
        <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          {stars.map((st, i) => (
            <circle key={i} cx={`${st.x}%`} cy={`${st.y}%`} r={st.s} fill="#dfe6ff" opacity={st.o}>
              {!reduced && <animate attributeName="opacity" values={`${st.o};${st.o * 0.3};${st.o}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" />}
            </circle>
          ))}
        </svg>
      </div>

      <div className="motes">
        <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          {motes.map((m, i) => (
            <circle key={i} cx={`${m.x}%`} cy={`${m.y}%`} r={m.s} fill="#ffb259" opacity={m.o}>
              {!reduced && <animate attributeName="cy" values={`${m.y}%;${Math.max(0, m.y - 8)}%;${m.y}%`} dur={`${m.d}s`} repeatCount="indefinite" />}
            </circle>
          ))}
        </svg>
      </div>

      <Clouds reduced={reduced} />

      <motion.div className="celestial" style={{ y }}>
        <Sun reduced={reduced} />
        <Moon />
      </motion.div>

      {!reduced && <Birds />}
    </div>
  );
}
