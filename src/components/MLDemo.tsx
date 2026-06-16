import { useRef, useState } from "react";

type Phase = "idle" | "loading" | "running" | "done" | "error";
interface Result {
  label: string;
  score: number;
}

// Minimal shape of the transformers.js pipeline we use.
type Classifier = (text: string) => Promise<Array<{ label: string; score: number }>>;

const SAMPLES = [
  "Alex ships polished, creative software fast.",
  "This portfolio is unbelievably boring and slow.",
  "I built a game 1,000,000 people actually played.",
];

/**
 * A real machine-learning demo that runs ENTIRELY in the browser — no server.
 * The model (DistilBERT SST-2 sentiment) is lazy-loaded from the Hugging Face
 * CDN via transformers.js only when you press the button, so it never weighs
 * down the initial page load. Honest about what it is and degrades gracefully.
 */
export function MLDemo() {
  const [text, setText] = useState(SAMPLES[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const pipeRef = useRef<Classifier | null>(null);

  async function ensurePipe(): Promise<Classifier> {
    if (pipeRef.current) return pipeRef.current;
    setPhase("loading");
    setProgress(0);
    const { pipeline, env } = await import("@xenova/transformers");
    // Don't look for the model on our own origin (would 404) — fetch from the HF CDN.
    env.allowLocalModels = false;
    if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.proxy = false;
    const pipe = (await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
      {
        // report download progress of the (one-time, cached) model files
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p?.status === "progress" && typeof p.progress === "number") {
            setProgress(Math.min(100, Math.round(p.progress)));
          }
        },
      },
    )) as unknown as Classifier;
    pipeRef.current = pipe;
    return pipe;
  }

  async function analyze() {
    if (phase === "loading" || phase === "running") return;
    try {
      const pipe = await ensurePipe();
      setPhase("running");
      const out = await pipe(text);
      const r = Array.isArray(out) ? out[0] : (out as Result);
      setResult({ label: r.label, score: r.score });
      setPhase("done");
    } catch (e) {
      console.error("ML demo failed:", e);
      setPhase("error");
    }
  }

  const positive = result?.label?.toUpperCase() === "POSITIVE";
  const pct = result ? Math.round(result.score * 100) : 0;

  const btnLabel =
    phase === "loading"
      ? `Loading model… ${progress || ""}${progress ? "%" : ""}`
      : phase === "running"
        ? "Analyzing…"
        : "Analyze sentiment";

  return (
    <div className="data-card ml-demo">
      <div className="ml-head">
        <span className="ml-live">
          <span className="ml-chip-dot" /> ON-DEVICE ML
        </span>
        <span className="ml-src">DistilBERT · transformers.js</span>
      </div>

      <textarea
        className="ml-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        aria-label="Text to analyze for sentiment"
        spellCheck={false}
      />

      <div className="ml-samples">
        {SAMPLES.map((s, i) => (
          <button key={i} className="ml-sample" onClick={() => setText(s)} title={s}>
            sample {i + 1}
          </button>
        ))}
      </div>

      <button className="btn btn-primary ml-run" onClick={analyze} disabled={phase === "loading" || phase === "running" || !text.trim()}>
        {btnLabel}
      </button>

      {phase === "loading" && (
        <div className="ml-progress" aria-hidden>
          <div className="ml-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {phase === "done" && result && (
        <div className={`ml-result ${positive ? "pos" : "neg"}`}>
          <div className="ml-verdict">
            {positive ? "▲ Positive" : "▼ Negative"} <span className="ml-conf">{pct}% confident</span>
          </div>
          <div className="ml-bar">
            <div className="ml-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {phase === "error" && (
        <p className="ml-fallback">Couldn't load the model just now — it streams from the Hugging Face CDN and runs locally when reachable.</p>
      )}

      <p className="ml-note">Runs 100% in your browser!</p>
    </div>
  );
}
