import { AnimatePresence, motion } from "framer-motion";
import { useWorld } from "../world/WorldContext";
import { experience } from "../data/content";

const COPY = {
  day: { kicker: "☀ On the clock — engineering", title: "Where I've built software." },
  night: { kicker: "☾ On the clock — finance", title: "Where I've worked in finance." },
};

export function Experience() {
  const { world } = useWorld();
  const jobs = experience.filter((j) => j.world === world);
  const copy = COPY[world];

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
                <div className="exp-period">{job.period}</div>
                {job.current && <div className="exp-current">currently</div>}
                <div className="exp-loc">{job.location}</div>
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
    </section>
  );
}
