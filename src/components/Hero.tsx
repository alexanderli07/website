import { motion } from "framer-motion";
import { useWorld } from "../world/WorldContext";
import { profile, contact } from "../data/content";

export function Hero() {
  const { world } = useWorld();
  const h = profile.headline[world];
  const chips = profile.chips;

  return (
    <section className="hero container" id="top">
      <div className="hero-single">
        {/* enter-only (keyed by world): the new copy mounts immediately and fades in
            behind the reveal overlay — no exit gap, so the headline is never briefly blank */}
        <motion.p
          key={`eyebrow-${world}`}
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {profile.eyebrow[world]}
        </motion.p>

        <h1 className="display">
          <motion.span
            key={world}
            initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block" }}
          >
            {h.map((line, i) => (
              <span className="hl-line" key={i}>
                {line.map((seg, j) =>
                  seg.a ? (
                    <span key={j} className="gradient-text">
                      {seg.t}
                    </span>
                  ) : (
                    <span key={j}>{seg.t}</span>
                  ),
                )}
              </span>
            ))}
          </motion.span>
        </h1>

        <p className="hero-meta">{profile.subhead}</p>

        <div className="hero-chips">
          {chips.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>

        <div className="hero-actions">
          <a href="#work" className="btn btn-primary">
            See the work
          </a>
          <a href={contact.resumeHref} target="_blank" rel="noopener" className="btn btn-ghost">
            Résumé ↗
          </a>
          <span className="font-mono" style={{ alignSelf: "center", fontSize: "0.78rem", color: "var(--muted)" }}>
            flip the switch&nbsp;↗
          </span>
        </div>
      </div>

      <div className="hero-hint" aria-hidden="true">
        <span>scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
          ↓
        </motion.span>
      </div>
    </section>
  );
}
