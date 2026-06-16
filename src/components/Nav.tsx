import { WorldToggle } from "./WorldToggle";
import { SocialLinks } from "./Social";
import { contact } from "../data/content";
import { useWorld } from "../world/WorldContext";

const LINKS = [
  { href: "#bridge", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#work", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const { world } = useWorld();
  return (
    <header className="nav">
      <div className="container">
        <div className="nav-inner">
          <a href="#top" className="nav-brand" aria-label="Alexander Li — home">
            Alexander Li<span className="dot">.</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-link">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="nav-cta">
            <SocialLinks className="nav-social" />
            <a
              className="nav-link nav-resume"
              href={contact.resumeHref}
              target="_blank"
              rel="noopener"
              title="Open résumé (PDF)"
            >
              Résumé&nbsp;↗
            </a>
            <span className="font-mono nav-world-label" style={{ fontSize: "0.7rem", color: "var(--muted)" }} aria-hidden>
              {world === "day" ? "☀ day" : "☾ night"}
            </span>
            <WorldToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
