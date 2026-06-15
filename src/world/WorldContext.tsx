import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { World } from "../data/content";
import { useReducedMotion } from "./useReducedMotion";
import { lenisRef } from "./lenis";

// Sections in document order — used to keep you in the same section across a flip,
// since the two worlds have different amounts of content (and thus different heights).
const SECTION_IDS = ["top", "bridge", "experience", "work", "signal", "skills", "voices", "contact"];
const NAV_OFFSET = 84;

interface Anchor {
  id: string;
  offset: number;
}

function docTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

/** Which section currently sits at the top of the viewport, and how far into it. */
function captureAnchor(): Anchor | null {
  const probe = window.scrollY + NAV_OFFSET + 2;
  let chosen: { id: string; top: number } | null = null;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = docTop(el);
    if (top <= probe) chosen = { id, top };
  }
  if (!chosen) return null;
  return { id: chosen.id, offset: window.scrollY - chosen.top };
}

interface WorldContextValue {
  world: World;
  /** Toggle worlds. Pass the originating pointer event to anchor the circular reveal. */
  toggle: (e?: { clientX: number; clientY: number }) => void;
  setWorld: (w: World, e?: { clientX: number; clientY: number }) => void;
  reduced: boolean;
}

const Ctx = createContext<WorldContextValue | null>(null);
const STORAGE_KEY = "two-worlds:world";

function initialWorld(): World {
  if (typeof window === "undefined") return "day";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "day" || saved === "night") return saved;
  return "day"; // builder-first by default
}

interface Flip {
  id: number;
  next: World;
  x: number;
  y: number;
  r: number;
}

export function WorldProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [world, setWorldState] = useState<World>(initialWorld);
  const [flip, setFlip] = useState<Flip | null>(null);
  const flipId = useRef(0);
  const anchorRef = useRef<Anchor | null>(null);

  // Apply the world to <html> FIRST — fonts (Space Grotesk vs Fraunces) and colours
  // that affect layout go live — THEN re-anchor scroll using the fully-settled layout.
  // Both happen in one layout effect, before paint, so there's no post-swap shift that
  // knocks you out of your section. (Different worlds have different content heights.)
  useLayoutEffect(() => {
    document.documentElement.dataset.world = world;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", world === "day" ? "#ffe7cf" : "#070b18");

    const a = anchorRef.current;
    if (!a) return;
    anchorRef.current = null;
    const el = document.getElementById(a.id);
    if (!el) return;
    // reading layout here forces the new fonts to apply before we measure
    const newTop = docTop(el);
    // keep the same depth into the section, clamped so a shorter section can't overshoot
    const off = Math.max(0, Math.min(a.offset, Math.max(0, el.offsetHeight - 40)));
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const target = Math.max(0, Math.min(newTop + off, maxScroll));
    if (lenisRef.current) {
      // recompute Lenis' cached scroll limit first — night->day makes the page
      // taller, and a stale (shorter) limit would clamp the jump and under-scroll.
      lenisRef.current.resize();
      lenisRef.current.scrollTo(target, { immediate: true, force: true });
    } else {
      window.scrollTo(0, target);
    }
  }, [world]);

  // Persist the choice (non-layout) separately.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, world);
  }, [world]);

  const setWorld = useCallback(
    (next: World, e?: { clientX: number; clientY: number }) => {
      if (next === world) return;
      if (flip) return; // ignore toggles while a reveal is in flight (deterministic)
      // remember the section we're in so we can land back in it after the swap
      anchorRef.current = captureAnchor();
      // Reduced motion (or no coordinates): swap instantly, no reveal.
      if (reduced || !e) {
        setWorldState(next);
        return;
      }
      const x = e.clientX;
      const y = e.clientY;
      // radius must reach the farthest corner of the viewport
      const r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      setFlip({ id: ++flipId.current, next, x, y, r });
    },
    [world, reduced, flip],
  );

  const toggle = useCallback(
    (e?: { clientX: number; clientY: number }) => {
      setWorld(world === "day" ? "night" : "day", e);
    },
    [world, setWorld],
  );

  const value = useMemo(
    () => ({ world, toggle, setWorld, reduced }),
    [world, toggle, setWorld, reduced],
  );

  return (
    <Ctx.Provider value={value}>
      {children}

      {/* Circular reveal of the next world, anchored at the toggle. */}
      <AnimatePresence>
        {flip && (
          <motion.div
            key={`flip-${flip.id}`}
            className="flip-overlay"
            data-world={flip.next}
            initial={{ clipPath: `circle(0px at ${flip.x}px ${flip.y}px)` }}
            animate={{ clipPath: `circle(${flip.r}px at ${flip.x}px ${flip.y}px)` }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={(definition) => {
              // Only the expand (enter) carries clipPath — ignore the exit fade,
              // otherwise we'd re-commit a stale world on overlay removal.
              if (
                definition &&
                typeof definition === "object" &&
                "clipPath" in definition
              ) {
                // commit the real world; overlay already fully covers the screen
                setWorldState(flip.next);
                // next frame, remove the overlay (page underneath now matches)
                requestAnimationFrame(() => setFlip(null));
              }
            }}
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorld(): WorldContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorld must be used within <WorldProvider>");
  return ctx;
}
