import { Reveal } from "./Reveal";
import { testimonials, awards } from "../data/content";

export function Voices() {
  return (
    <section className="section container" id="voices">
      <Reveal>
        <span className="section-kicker">In other words</span>
        <h2 className="section-title">What people who've worked with me say.</h2>
      </Reveal>

      <div className="testi-grid" style={{ marginTop: "2.5rem" }}>
        {testimonials.map((t, i) => (
          <Reveal key={t.name} as="div" delay={i * 0.08} className="testimonial">
            <p>&ldquo;{t.quote}&rdquo;</p>
            <div className="who">
              <img src={t.avatar} alt={t.name} loading="lazy" width={46} height={46} />
              <div>
                <b>{t.name}</b>
                <span>{t.role}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <h3
          className="font-mono"
          style={{ marginTop: "3.5rem", fontSize: "0.85rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)" }}
        >
          Awards & honours
        </h3>
      </Reveal>
      <div className="awards-grid">
        {awards.map((a, i) => (
          <Reveal key={a.tier} as="div" delay={i * 0.06} className="award-col">
            <h4>{a.tier}</h4>
            <ul>
              {a.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
