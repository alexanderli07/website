import { AnimatePresence, motion } from "framer-motion";
import { useWorld } from "../world/WorldContext";
import { experience } from "../data/content";

const COPY = {
  day: { kicker: "☀ On the clock — engineering", title: "Where I've built software.", otherSide: "finance", flipTo: "night" },
  night: { kicker: "☾ On the clock — finance", title: "Where I've worked in finance.", otherSide: "engineering", flipTo: "day" },
};

export function Experience() {
  const { world, toggle } = useWorld();
  const jobs = experience.filter((j) => j.world === world);
  const copy = COPY[world];
  const otherCount = experience.filter((j) => j.world !== world).length;

  return (
    <section className="section container" id="experience">
      <AnimatePresence mode="wait">
        <motion.header
          key={world}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <span className="section-kicker">{copy.kicker}</span>
          <h2 className="section-title">{copy.title}</h2>
        </motion.header>
      </AnimatePresence>

      <motion.ul layout className="exp-list">
        <AnimatePresence mode="popLayout">
          {jobs.map((job) => (
            <motion.li
              key={`${job.org}-${job.role}`}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="exp-item"
            >
              <div>
                <div className="exp-period">
                  {job.period}
                  {job.arrangement && (
                    <span className="exp-arrangement"> · {job.arrangement}</span>
                  )}
                </div>
                {job.current && <div className="exp-current">current</div>}
                <div className="exp-loc">{job.location}</div>
                {job.arrangement && (
                  <div className="exp-arrangement" data-mode={job.arrangement}>
                    {job.arrangement}
                  </div>
                )}
              </div>
              <div>
                <h3 className="exp-role">{job.role}</h3>
                <div className="exp-org">{job.org}</div>
                <ul className="exp-bullets">
                  {job.bullets.map((b, i) => (
                    <li key={i} className={b.startsWith("TODO") ? "exp-todo" : undefined}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <button
        type="button"
        className="exp-flip-hint font-mono"
        onClick={(e) => toggle({ clientX: e.clientX, clientY: e.clientY })}
        aria-label={`Flip to the ${copy.flipTo} world to see ${otherCount} more roles`}
      >
        <span className="exp-flip-icon" aria-hidden>⇄</span>
        {otherCount} more {otherCount === 1 ? "role" : "roles"} on the {copy.otherSide} side — flip to {copy.flipTo}
      </button>
    </section>
  );
}
