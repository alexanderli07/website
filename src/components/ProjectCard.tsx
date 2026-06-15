import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { Project } from "../data/content";

interface Props {
  project: Project;
  size?: "feature" | "wide" | "normal";
  onOpen: (p: Project) => void;
}

// forwardRef so <AnimatePresence mode="popLayout"> can measure/animate the card.
export const ProjectCard = forwardRef<HTMLElement, Props>(function ProjectCard(
  { project, size = "normal", onOpen },
  ref,
) {
  const cls = size === "feature" ? "feature" : size === "wide" ? "wide" : "";
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className={`card proj-card ${cls}`}
      onClick={() => onOpen(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(project);
        }
      }}
      aria-label={`Open case study: ${project.title}`}
    >
      <div className="proj-media">
        {project.highlight && (
          <span className="chip chip-accent proj-highlight">{project.highlight}</span>
        )}
        {project.image ? (
          <img src={project.image} alt={project.title} loading="lazy" decoding="async" />
        ) : (
          <div className="proj-placeholder" aria-hidden="true">
            <span className="proj-mono">{project.title.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)}</span>
            <span className="proj-mono-tag">{project.tags[0]}</span>
          </div>
        )}
      </div>
      <div className="proj-body">
        <h3 className="proj-title">{project.title}</h3>
        <p className="proj-blurb">{project.blurb}</p>
        <div className="proj-tags">
          {project.tags.slice(0, 4).map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <span className="proj-open">read the story →</span>
      </div>
    </motion.article>
  );
});
