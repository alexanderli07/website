import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWorld } from "../world/WorldContext";
import { dayProjects, nightProjects, type Project } from "../data/content";
import { ProjectCard } from "./ProjectCard";
import { CaseStudy } from "./CaseStudy";

const COPY = {
  day: {
    kicker: "☀ Full-stack & AI",
    title: "Software I've built that people use.",
    lead: "Apps, AI/ML systems, and games — built fast, made to feel good, and shipped to real users.",
  },
  night: {
    kicker: "☾ Quant & Finance",
    title: "Where I put code near money.",
    lead: "Markets, currencies, and matching engines — computer science aimed at finance, alongside the role and degree behind it.",
  },
};

export function Work() {
  const { world } = useWorld();
  const [selected, setSelected] = useState<Project | null>(null);
  const projects = world === "day" ? dayProjects : nightProjects;
  const copy = COPY[world];

  return (
    <section className="section container" id="work">
      <AnimatePresence mode="wait">
        <motion.header
          key={world}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <span className="section-kicker">{copy.kicker}</span>
          <h2 className="section-title">{copy.title}</h2>
          <p className="section-lead">{copy.lead}</p>
        </motion.header>
      </AnimatePresence>

      <motion.div layout className="proj-grid">
        <AnimatePresence mode="popLayout">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              size={i === 0 ? "feature" : "normal"}
              onOpen={setSelected}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <p className="font-mono" style={{ marginTop: "1.6rem", color: "var(--muted)", fontSize: "0.85rem" }}>
        {world === "day"
          ? "→ flip to night to see the quant & finance side."
          : "→ flip to day to see the full-stack & AI work."}
      </p>

      <CaseStudy project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
