import { Reveal } from "./Reveal";
import { WorldToggle } from "./WorldToggle";
import { bridgeCopy, stats, profile } from "../data/content";

export function Bridge() {
  return (
    <section className="section container" id="bridge">
      <Reveal>
        <span className="section-kicker">{bridgeCopy.kicker}</span>
        <h2 className="section-title" style={{ maxWidth: "20ch" }}>
          {bridgeCopy.title}
        </h2>
        <p className="section-lead" style={{ maxWidth: "62ch" }}>
          {bridgeCopy.body}
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="about-portrait">
          <img src={profile.portrait} alt={profile.name} width={96} height={96} loading="lazy" />
          <div>
            <div className="who-name">{profile.name}</div>
            <div className="who-sub">{profile.school}</div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.8rem" }}>
          <WorldToggle compact />
          <span className="font-mono" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            try it — the work changes with the world
          </span>
        </div>
      </Reveal>

      <div className="stats" style={{ marginTop: "3rem" }}>
        {stats.map((s, i) => (
          <Reveal key={s.label} as="div" delay={i * 0.06} className="stat">
            <div className="num gradient-text">{s.value}</div>
            <div className="lbl">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
