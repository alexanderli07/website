import { AnimatePresence, motion } from "framer-motion";
import { MLDemo } from "./MLDemo";
import { LiveMarkets } from "./LiveMarkets";
import { useWorld } from "../world/WorldContext";
import { nightThesis } from "../data/content";

const COPY = {
  day: {
    kicker: "☀ Live — run a model",
    title: "Try the AI, right here.",
    body: "The other half of the work is machine learning. This is a real sentiment model running entirely in your browser — no server, no API. Type something and run it.",
  },
  night: {
    kicker: "☾ Live — the markets",
    title: nightThesis.title,
    body: nightThesis.body,
  },
};

export function Signal() {
  const { world } = useWorld();
  const copy = COPY[world];

  return (
    <section className="section container" id="signal">
      <div className="thesis-grid">
        <AnimatePresence mode="wait">
          <motion.div
            key={`copy-${world}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="section-kicker">{copy.kicker}</span>
            <h2 className="section-title">{copy.title}</h2>
            <p className="section-lead">{copy.body}</p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`viz-${world}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {world === "night" ? <LiveMarkets /> : <MLDemo />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
