import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { skills } from "../data/content";
import { useWorld } from "../world/WorldContext";

export function Skills() {
  const { world } = useWorld();
  const groups = skills.filter((g) => g.world === world);

  return (
    <section className="section container" id="skills">
      <Reveal>
        <span className="section-kicker">The toolkit</span>
        <h2 className="section-title">
          {world === "day" ? "What I build with." : "What I analyze with."}
        </h2>
      </Reveal>

      <motion.div layout className="skills-grid" style={{ marginTop: "2.5rem" }}>
        <AnimatePresence mode="popLayout">
          {groups.map((g, i) => (
            <motion.div
              key={g.label}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="skill-col"
            >
              <h4>{g.label}</h4>
              <ul>
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
