import { useEffect, useRef } from "react";
import { useMarketPulse } from "../lib/useMarketPulse";
import { useReducedMotion } from "../lib/useReducedMotion";

/**
 * The hero is a drawing, not a section: a field of flowing lines whose
 * turbulence is set by real BTC volatility (see useMarketPulse). The markets
 * supply the physics; the code supplies the pen. One line — and only one —
 * is drawn in signal blue.
 *
 * Interactions: cursor bends the field locally; click (or Enter) reseeds it.
 * prefers-reduced-motion: a single static draw, no pointer physics.
 */

const LINES = 52;
const STEP = 3; // px between sampled points along a line

interface FieldState {
  seed: number;
  phases: Array<[number, number, number]>;
  amps: number[];
  bandC: number; // where the disturbance sits (reseeds move it)
  turb: number; // volatility → turbulence multiplier (eased)
  turbTarget: number; // where turb is heading (new data eases in, no pop)
  px: number; // pointer (eased toward tx/ty)
  py: number;
  tx: number; // raw pointer target
  ty: number;
  inside: boolean; // cursor over the field → dent is HELD, not decayed
  strength: number; // pointer influence 0..1, eased toward inside ? 1 : 0
}

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildLines(state: FieldState) {
  const rnd = seededRandom(state.seed);
  state.phases = [];
  state.amps = [];
  for (let i = 0; i < LINES; i++) {
    state.phases.push([rnd() * 6.283, rnd() * 6.283, rnd() * 6.283]);
    state.amps.push(0.6 + rnd() * 0.8);
  }
  state.bandC = 0.34 + rnd() * 0.32; // each seed moves the disturbance
}

/** map σ% (or |Δ24h|%) onto how wild the field is */
function turbulence(valuePct: number | null): number {
  if (valuePct === null) return 1; // offline: the field at rest
  return Math.min(3.4, Math.max(0.7, 0.9 + valuePct / 1.6));
}

const BLUE_LINE = Math.floor(LINES * 0.58);

function draw(cv: HTMLCanvasElement, state: FieldState) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  if (w === 0 || h === 0) return;
  if (cv.width !== w * dpr || cv.height !== h * dpr) {
    cv.width = w * dpr;
    cv.height = h * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const bandW = 0.34;
  const { px, py, strength, turb, bandC } = state;

  for (let i = 0; i < LINES; i++) {
    const y0 = h * 0.09 + h * 0.82 * (i / (LINES - 1));
    const isBlue = i === BLUE_LINE;
    const p = state.phases[i];
    const amp = state.amps[i];
    ctx.beginPath();
    ctx.lineWidth = isBlue ? 1.6 : 0.7;
    ctx.strokeStyle = isBlue ? "#1F3BB3" : "rgba(34,33,30,0.72)";

    for (let x = 0; x <= w; x += STEP) {
      const t = x / w;
      const g = (t - bandC) / (bandW * 0.5);
      const band = Math.exp(-g * g);
      const wave =
        Math.sin(t * 11 + p[0]) * 6.4 +
        Math.sin(t * 23 + p[1]) * 4.2 +
        Math.sin(t * 47 + p[2]) * 2.2;
      let yy = y0 + wave * amp * (0.25 + band * (isBlue ? 1.3 : 1) * turb);

      // pointer: a smooth local lens. Displacement is proportional to dy so
      // it fades continuously to zero at the cursor's own height — a hard
      // sign flip here produces vertical cliffs on lines crossing the cursor.
      if (strength > 0.004) {
        const dx = x - px;
        const dy = yy - py;
        const d2 = dx * dx + dy * dy;
        const R = 110;
        if (d2 < R * R * 9) {
          const fall = Math.exp(-d2 / (R * R));
          yy += dy * fall * 0.6 * strength;
        }
      }
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

export function Field() {
  const pulse = useMarketPulse();
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<FieldState>({
    seed: 7,
    phases: [],
    amps: [],
    bandC: 0.52,
    turb: 1,
    turbTarget: 1,
    px: -9999,
    py: -9999,
    tx: -9999,
    ty: -9999,
    inside: false,
    strength: 0,
  });
  const rafRef = useRef(0);
  const kickRef = useRef<(() => void) | null>(null);

  // (re)draw on mount, resize, reseed, and whenever the data pulse changes
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const state = stateRef.current;
    const target = turbulence(pulse.value);
    if (state.phases.length === 0) buildLines(state);
    state.turbTarget = target;
    if (reduced || !kickRef.current) {
      // no animation loop available — apply instantly
      state.turb = target;
      draw(cv, state);
    } else {
      // ease the field toward the new volatility (no pop when data lands)
      kickRef.current();
    }
    // belt-and-braces: retry until the canvas has real dimensions. The first
    // draw can race layout (the canvas measures 0×0), and the usual recovery
    // paths are unreliable in background tabs — rAF is suspended there and
    // ResizeObserver only delivers with the render pipeline. setTimeout still
    // fires (throttled), so poll briefly until a sized draw lands.
    let tries = 0;
    let t = 0;
    const ensureDrawn = () => {
      draw(cv, state);
      if (cv.clientWidth === 0 && tries++ < 40) {
        t = window.setTimeout(ensureDrawn, 250);
      }
    };
    t = window.setTimeout(ensureDrawn, 80);

    const ro = new ResizeObserver(() => draw(cv, state));
    ro.observe(cv);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [pulse.value, reduced]);

  // pointer + settle physics (skipped entirely under reduced motion).
  // One loop eases everything toward its target: while the cursor rests on
  // the field the dent is HELD; it only relaxes when the cursor leaves.
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || reduced) return;
    const state = stateRef.current;

    const loop = () => {
      // smooth pointer follow (fast flicks don't teleport the dent)
      state.px += (state.tx - state.px) * 0.22;
      state.py += (state.ty - state.py) * 0.22;
      // dent eases toward held (1) or released (0)
      const targetS = state.inside ? 1 : 0;
      state.strength += (targetS - state.strength) * 0.1;
      // turbulence eases toward the latest data
      state.turb += (state.turbTarget - state.turb) * 0.06;

      draw(cv, state);

      const settled =
        !state.inside &&
        state.strength < 0.004 &&
        Math.abs(state.turb - state.turbTarget) < 0.004;
      if (settled) {
        state.strength = 0;
        state.turb = state.turbTarget;
        draw(cv, state);
        rafRef.current = 0;
      } else {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    const kick = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
    };
    kickRef.current = kick;

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      state.tx = e.clientX - r.left;
      state.ty = e.clientY - r.top;
      if (!state.inside && state.strength < 0.05) {
        // fresh entry: dent fades in AT the cursor, no sweep from stale spot
        state.px = state.tx;
        state.py = state.ty;
      }
      state.inside = true;
      kick();
    };
    const onLeave = () => {
      state.inside = false; // loop keeps running until the field settles
      kick();
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    return () => {
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      kickRef.current = null;
      state.inside = false;
    };
  }, [reduced]);

  const reseed = () => {
    const state = stateRef.current;
    state.seed = Math.floor(Math.random() * 2147483000) + 1;
    buildLines(state);
    const cv = canvasRef.current;
    if (cv) draw(cv, state);
  };

  const readout =
    pulse.mode === "vol"
      ? `σ 24h = ${pulse.value!.toFixed(2)}% · live`
      : pulse.mode === "chg"
        ? `Δ24h = ${pulse.value!.toFixed(2)}% · live`
        : pulse.mode === "loading"
          ? "connecting …"
          : "offline · field at rest";

  return (
    <header
      className="field"
      role="img"
      aria-label="A field of fine flowing lines drawn across the page. Real Bitcoin volatility sets how turbulent the lines are; one line is drawn in signal blue. Click to redraw."
      tabIndex={0}
      onClick={reseed}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          reseed();
        }
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="tag f-tl">Alexander Li — software &#215; markets</span>
      <span className="tag dim f-tr hide-sm">Toronto, Canada</span>
      <span className="tag dim f-bl hide-sm">field turbulence &#8592; btc volatility &#183; click to reseed</span>
      <span className={`tag f-br ${pulse.mode === "vol" || pulse.mode === "chg" ? "live" : "dim"}`}>
        {readout}
      </span>
      <a className="f-index" href="#index" onClick={(e) => e.stopPropagation()}>
        Index &#8595;
      </a>
    </header>
  );
}
