import { Reveal } from "./Reveal";
import { contact, socials } from "../data/content";

export function Contact() {
  return (
    <section className="section container" id="contact">
      <Reveal>
        <div className="card contact-card">
          <span className="section-kicker" style={{ justifyContent: "center" }}>
            Say hello
          </span>
          <h2 className="display" style={{ fontSize: "clamp(2rem,6vw,4rem)" }}>
            Let's build <span className="gradient-text">something</span>.
          </h2>
          <p className="section-lead" style={{ marginInline: "auto" }}>
            I'm always up for a good problem, a hackathon team, or just a hello. Fastest way to reach me is email.
          </p>

          <div className="hero-actions" style={{ justifyContent: "center", marginTop: "2rem" }}>
            <a href={`mailto:${contact.email}`} className="btn btn-primary">
              {contact.email}
            </a>
            <a href={contact.resumeHref} target="_blank" rel="noopener" className="btn btn-ghost">
              Résumé ↗
            </a>
          </div>

          <div className="contact-socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener" className="btn btn-ghost">
                {s.label} <span style={{ color: "var(--muted)" }}>@{s.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
