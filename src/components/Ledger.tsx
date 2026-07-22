import { Fragment, Suspense, lazy, useState } from "react";
import {
  experience,
  allProjects,
  awards,
  skills,
  testimonials,
  socials,
  contact,
  profile,
  type Job,
  type Project,
} from "../data/content";

// The ML demo stays code-split: its chunk (and the model, from the HF CDN)
// only loads when its row is opened.
const MLDemo = lazy(() => import("./MLDemo").then((m) => ({ default: m.MLDemo })));

/* ----------------------------------------------------------------------------
   Presentation-layer metadata: short type/stack labels for the index columns.
   Facts live in content.ts; these are just column-width abbreviations.
---------------------------------------------------------------------------- */
const JOB_META: Record<string, { type: string; stack: string }> = {
  "Quintessence Wealth": { type: "FINANCE DEV", stack: "BLOOMBERG · PYTHON" },
  "AIQ Labs LLC": { type: "AI/ML ENG", stack: "ML · REST APIS" },
  ZMC: { type: "SOFTWARE ENG", stack: "SWIFTUI · NODE" },
  "City of Brampton": { type: "INSTRUCTOR", stack: "STEM CURRICULUM" },
  "Robotics Club & Team": { type: "FOUNDER", stack: "VEX ROBOTICS" },
  "JA Company Program": { type: "PRESIDENT / VP IT", stack: "WEB · PAYMENTS" },
};
const JOB_ORDER = [
  "Quintessence Wealth",
  "AIQ Labs LLC",
  "City of Brampton",
  "JA Company Program",
  "Robotics Club & Team",
  "ZMC",
];

const PROJECT_META: Record<string, { type: string; stack: string }> = {
  cfm101: { type: "QUANT", stack: "PYTHON · YFINANCE" },
  serviceswap: { type: "MARKETPLACE", stack: "FLASK · EMBEDDINGS" },
  snaipshot: { type: "HW + LLM", stack: "ESP32 · OPENAI" },
  reminda: { type: "HW + CV", stack: "ESP32 · OPENCV" },
  ecoin: { type: "INCENTIVES", stack: "FLASK · SQL" },
  "bac-coin": { type: "TOKENOMICS", stack: "AI · CRYPTO" },
  saight: { type: "CV + VOICE", stack: "TENSORFLOW · OPENCV" },
  "opposite-odyssey": { type: "GAME", stack: "LEVEL DESIGN" },
  dragonflai: { type: "ML SYSTEM", stack: "CV · OCR" },
  invisibilis: { type: "GAME · LIVE", stack: "LUA · ROBLOX" },
};
const PROJECT_ORDER = [
  "cfm101",
  "serviceswap",
  "snaipshot",
  "reminda",
  "ecoin",
  "bac-coin",
  "saight",
  "opposite-odyssey",
  "dragonflai",
  "invisibilis",
];

/** "May 2026 – Present" → "26—", "Oct 2022 – Sep 2025" → "22–25" */
function shortYears(period: string): string {
  const years = period.match(/\d{4}/g) ?? [];
  const first = years[0];
  const last = years[years.length - 1];
  if (!first) return period;
  const yy = (y: string) => y.slice(2);
  if (/present/i.test(period)) return `${yy(first)}—`;
  if (last && last !== first) return `${yy(first)}–${yy(last)}`;
  return yy(first);
}

/** project year field → right column ("Dec 2025" → "25", "2022 – present" → "22—") */
function shortProjectYear(year: string): string {
  const years = year.match(/\d{4}/g) ?? [];
  const first = years[0];
  const last = years[years.length - 1];
  if (/present/i.test(year) && first) return `${first.slice(2)}—`;
  if (last) return last.slice(2);
  return year;
}

/** strip the leading emoji from résumé-era highlight strings */
function honorText(h: string): string {
  return h.replace(/^[^0-9A-Za-z]+/, "");
}

const num = (n: number) => String(n).padStart(3, "0");

/* ---------------------------------------------------------------------------- */

interface RowShellProps {
  id: string;
  no: string;
  title: React.ReactNode;
  type: string;
  stack: string;
  yr: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode; // sheet content
}

function Row({ id, no, title, type, stack, yr, open, onToggle, children }: RowShellProps) {
  const sheetId = `sheet-${id}`;
  return (
    <Fragment>
      <tr className={open ? "is-open" : undefined}>
        <td className="c-no">{no}</td>
        <td className="c-title">
          <button
            className="row-btn"
            aria-expanded={open}
            aria-controls={sheetId}
            onClick={() => onToggle(id)}
          >
            {title}
          </button>
        </td>
        <td className="c-meta hide-sm">{type}</td>
        <td className="c-meta hide-sm">{stack}</td>
        <td className="c-meta c-yr">{yr}</td>
        <td className="c-x" aria-hidden="true">{open ? "−" : "+"}</td>
      </tr>
      {open && (
        <tr className="sheet-row" id={sheetId}>
          <td colSpan={6}>{children}</td>
        </tr>
      )}
    </Fragment>
  );
}

function JobSheet({ job }: { job: Job }) {
  return (
    <div className="sheet">
      <div>
        <span className="lbl">Scope</span>
        <ul>
          {job.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
      <div className="side">
        <div className="kv"><span>Role</span><span>{job.role}</span></div>
        <div className="kv"><span>Period</span><span>{job.period}</span></div>
        <div className="kv"><span>Location</span><span>{job.location}</span></div>
        {job.arrangement && (
          <div className="kv"><span>Mode</span><span>{job.arrangement}</span></div>
        )}
      </div>
    </div>
  );
}

function ProjectSheet({ p }: { p: Project }) {
  return (
    <div className="sheet">
      {p.highlight && <span className="honor">{honorText(p.highlight)}</span>}
      <div>
        <span className="lbl">Problem</span>
        <p>{p.problem}</p>
        <span className="lbl">Approach</span>
        <p>{p.approach}</p>
        <span className="lbl">Outcome</span>
        <p>{p.outcome}</p>
      </div>
      <div className="side">
        <div className="kv"><span>Year</span><span>{p.year}</span></div>
        <div className="kv"><span>Tags</span><span>{p.tags.join(" · ")}</span></div>
        {p.links.length > 0 && (
          <div className="links">
            {p.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IndexHead() {
  return (
    <thead>
      <tr>
        <th scope="col">No</th>
        <th scope="col">Work</th>
        <th scope="col" className="hide-sm">Type</th>
        <th scope="col" className="hide-sm">Stack</th>
        <th scope="col" style={{ textAlign: "right" }}>Yr</th>
        <th scope="col"><span className="sr-only">Expand</span></th>
      </tr>
    </thead>
  );
}

export function Ledger() {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const jobs = [...experience].sort(
    (a, b) =>
      (JOB_ORDER.indexOf(a.org) + 100) % 100 - (JOB_ORDER.indexOf(b.org) + 100) % 100,
  );
  const projects = PROJECT_ORDER.map((id) => allProjects.find((p) => p.id === id)).filter(
    (p): p is Project => Boolean(p),
  );

  let counter = 0;

  return (
    <div className="ledger" id="index">
      {/* ---------------- title block ---------------- */}
      <div className="tb">
        <h1 className="tb-name" aria-label="Alexander Li">
          <span aria-hidden="true">
            Alexander
            <br />
            Li
          </span>
        </h1>
        <div className="tb-doc">
          DOC AL-2026-02
          <br />
          REV 02 · SHEET 1/1
          <br />
          TORONTO, ON · CFM @ UWATERLOO
          <br />
          <b>SEEKING 2026–27 INTERNSHIPS</b>
        </div>
      </div>
      <p className="tb-roles">Full-stack &amp; AI &nbsp;⁄&nbsp; Quant &amp; Finance</p>
      <p className="tb-brief">{profile.oneLiner}</p>

      {/* ---------------- experience ---------------- */}
      <section className="lsec" aria-labelledby="sec-exp">
        <div className="lsec-head">
          <h2 id="sec-exp">Experience</h2>
          <span className="count">{jobs.length} entries</span>
        </div>
        <table className="idx">
          <IndexHead />
          <tbody>
            {jobs.map((job) => {
              counter += 1;
              const meta = JOB_META[job.org] ?? { type: "", stack: "" };
              const id = `job-${job.org.replace(/\W+/g, "-").toLowerCase()}`;
              return (
                <Row
                  key={id}
                  id={id}
                  no={num(counter)}
                  title={`${job.org}`}
                  type={meta.type}
                  stack={meta.stack}
                  yr={shortYears(job.period)}
                  open={open.has(id)}
                  onToggle={toggle}
                >
                  <JobSheet job={job} />
                </Row>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ---------------- work ---------------- */}
      <section className="lsec" aria-labelledby="sec-work">
        <span className="redpen" aria-hidden="true">1,000,000+ plays live in these rows ↓</span>
        <div className="lsec-head">
          <h2 id="sec-work">Selected work</h2>
          <span className="count">{projects.length + 1} entries</span>
        </div>
        <table className="idx">
          <IndexHead />
          <tbody>
            {(() => {
              counter += 1;
              return (
                <Row
                  id="ml-live"
                  no={num(counter)}
                  title={
                    <>
                      Sentiment, in-browser<span className="chip-live">live</span>
                    </>
                  }
                  type="ML DEMO"
                  stack="DISTILBERT · WASM"
                  yr="now"
                  open={open.has("ml-live")}
                  onToggle={toggle}
                >
                  <div className="sheet">
                    <div>
                      <p>
                        A real DistilBERT sentiment model running entirely in your browser —
                        the weights stream from the Hugging Face CDN on demand and inference
                        happens on your device. No server, no API key.
                      </p>
                      <Suspense
                        fallback={<p className="tag">loading module …</p>}
                      >
                        <MLDemo />
                      </Suspense>
                    </div>
                    <div className="side">
                      <div className="kv"><span>Model</span><span>DistilBERT SST-2</span></div>
                      <div className="kv"><span>Runtime</span><span>transformers.js · WASM</span></div>
                      <div className="kv"><span>Server</span><span>none</span></div>
                    </div>
                  </div>
                </Row>
              );
            })()}
            {projects.map((p) => {
              counter += 1;
              const meta = PROJECT_META[p.id] ?? {
                type: p.world === "night" ? "FINANCE" : "SOFTWARE",
                stack: (p.tags[0] ?? "").toUpperCase(),
              };
              return (
                <Row
                  key={p.id}
                  id={p.id}
                  no={num(counter)}
                  title={p.title}
                  type={meta.type}
                  stack={meta.stack}
                  yr={shortProjectYear(p.year)}
                  open={open.has(p.id)}
                  onToggle={toggle}
                >
                  <ProjectSheet p={p} />
                </Row>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ---------------- awards ---------------- */}
      <section className="lsec" aria-labelledby="sec-awards">
        <div className="lsec-head">
          <h2 id="sec-awards">Awards</h2>
          <span className="count">9× hackathon wins</span>
        </div>
        <dl className="flatlist">
          {awards.map((a) => (
            <div key={a.tier}>
              <dt>{a.tier}</dt>
              <dd>
                {a.items.map((item, i) => (
                  <Fragment key={item}>
                    {i > 0 && " · "}
                    <b>{item}</b>
                  </Fragment>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------- skills ---------------- */}
      <section className="lsec" aria-labelledby="sec-skills">
        <div className="lsec-head">
          <h2 id="sec-skills">Skills</h2>
          <span className="count">{skills.length} groups</span>
        </div>
        <dl className="flatlist">
          {skills.map((g) => (
            <div key={g.label + g.world}>
              <dt>{g.label}</dt>
              <dd>{g.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------- references ---------------- */}
      <section className="lsec" aria-labelledby="sec-refs">
        <div className="lsec-head">
          <h2 id="sec-refs">References</h2>
          <span className="count">verbatim</span>
        </div>
        {testimonials.map((t) => (
          <details className="refq" key={t.name}>
            <summary>
              <span className="who">{t.name}</span>
              <span className="role">{t.role}</span>
            </summary>
            <blockquote>{t.quote}</blockquote>
          </details>
        ))}
      </section>

      {/* ---------------- contact ---------------- */}
      <section className="lsec" aria-labelledby="sec-contact">
        <div className="lsec-head">
          <h2 id="sec-contact">Contact</h2>
          <span className="count">replies fast</span>
        </div>
        <dl className="flatlist">
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </dd>
          </div>
          <div>
            <dt>Résumé</dt>
            <dd>
              <a href={contact.resumeHref}>resume.pdf ↗</a>
            </dd>
          </div>
          {socials.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.handle} ↗
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export function FootRule() {
  return (
    <footer className="footrule">
      <div className="inner">
        <div className="links">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
          <a href={`mailto:${contact.email}`}>Email</a>
          <a href={contact.resumeHref}>Résumé</a>
        </div>
        <span className="colophon">
          set in archivo &amp; jetbrains mono · the field is drawn from live btc volatility
        </span>
      </div>
    </footer>
  );
}
