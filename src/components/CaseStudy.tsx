import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "../data/content";
import { lenisRef } from "../world/lenis";

interface Props {
  project: Project | null;
  onClose: () => void;
}

export function CaseStudy({ project, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;

    // Remember what had focus, then move focus into the dialog.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"]), input, textarea',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));

    modalRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Trap Tab within the dialog.
      if (e.key === "Tab") {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === modalRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // The fixed nav lives outside <main>'s stacking context, so it would otherwise
    // float over the dialog — hide it while open (CSS slides it away).
    document.body.dataset.modalOpen = "true";
    // Lenis hijacks wheel events on the window and ignores `body { overflow }`,
    // so freeze it while the dialog is open — otherwise the page scrolls behind.
    // (The modal itself is tagged data-lenis-prevent so it still scrolls natively.)
    lenisRef.current?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      delete document.body.dataset.modalOpen;
      lenisRef.current?.start();
      previouslyFocused?.focus?.(); // restore focus to the card that opened it
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="modal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} case study`}
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            className="modal"
            data-lenis-prevent
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", outline: "none" }}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
            <div className="modal-media">
              {project.image ? (
                <img src={project.image} alt={project.title} />
              ) : (
                <div className="proj-placeholder" aria-hidden="true">
                  <span className="proj-mono">{project.title.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)}</span>
                  <span className="proj-mono-tag">{project.tags[0]}</span>
                </div>
              )}
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                {project.highlight && <span className="chip chip-accent">{project.highlight}</span>}
                <span className="chip">{project.year}</span>
              </div>
              <h3 className="display" style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)", marginTop: "0.9rem" }}>
                {project.title}
              </h3>

              <div className="cs-block">
                <h4>The problem</h4>
                <p>{project.problem}</p>
              </div>
              <div className="cs-block">
                <h4>What I built</h4>
                <p>{project.approach}</p>
              </div>
              <div className="cs-block">
                <h4>The outcome</h4>
                <p>{project.outcome}</p>
              </div>

              <div className="proj-tags" style={{ marginTop: "1.5rem" }}>
                {project.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>

              <div className="cs-links">
                {project.links.length > 0 ? (
                  project.links.map((l, i) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener" className={`btn ${i === 0 ? "btn-primary" : "btn-ghost"}`}>
                      {l.label} ↗
                    </a>
                  ))
                ) : (
                  <span className="cs-todo">
                    TODO — add a live demo / GitHub link for this project in src/data/content.ts
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
