import { motion } from "framer-motion";
import { useMemo } from "react";
import { useReducedMotion } from "../world/useReducedMotion";

/**
 * A thematic "noise -> signal" chart. This is an illustration of the idea, not a
 * claim about a specific model's results — so it never misrepresents a metric.
 * When you have a real eval to show (e.g. a model's ROC / accuracy curve), swap this for it.
 */
export function SignalChart() {
  const reduced = useReducedMotion();
  const W = 520;
  const H = 280;

  const { noisy, trend } = useMemo(() => {
    let seed = 4242;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff - 0.5;
    };
    const n = 60;
    const noisyPts: string[] = [];
    const trendPts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * W;
      const base = H * 0.78 - (i / n) * H * 0.5; // rising trend
      const noise = rand() * (H * 0.34) * (1 - i / n); // noise shrinks toward signal
      noisyPts.push(`${x.toFixed(1)},${(base + noise).toFixed(1)}`);
      trendPts.push(`${x.toFixed(1)},${base.toFixed(1)}`);
    }
    return {
      noisy: "M" + noisyPts.join(" L"),
      trend: "M" + trendPts.join(" L"),
    };
  }, []);

  const draw = reduced
    ? {}
    : {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true },
        transition: { duration: 1.6, ease: "easeInOut" as const },
      };

  return (
    <div className="data-card">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Illustration: noisy data resolving into a clear upward signal">
        <defs>
          <linearGradient id="sig" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-2)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" y1={H * g} x2={W} y2={H * g} stroke="var(--border)" strokeWidth="1" />
        ))}
        {/* noise */}
        <motion.path d={noisy} fill="none" stroke="var(--muted)" strokeWidth="1.4" strokeOpacity="0.5" {...draw} />
        {/* signal */}
        <motion.path
          d={trend}
          fill="none"
          stroke="url(#sig)"
          strokeWidth="3.5"
          strokeLinecap="round"
          {...(reduced ? {} : { ...draw, transition: { duration: 1.8, ease: "easeInOut" as const, delay: 0.2 } })}
        />
      </svg>
    </div>
  );
}
