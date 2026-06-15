import { motion } from "framer-motion";
import { useWorld } from "../world/WorldContext";

function SunIcon() {
  return (
    <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
      <g>
        <line x1="12" y1="1.5" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22.5" y2="12" />
        <line x1="4.2" y1="4.2" x2="6" y2="6" />
        <line x1="18" y1="18" x2="19.8" y2="19.8" />
        <line x1="19.8" y1="4.2" x2="18" y2="6" />
        <line x1="6" y1="18" x2="4.2" y2="19.8" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="toggle-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function WorldToggle({ compact = false }: { compact?: boolean }) {
  const { world, toggle } = useWorld();
  const isDay = world === "day";

  return (
    <button
      type="button"
      className="toggle"
      onClick={(e) => toggle({ clientX: e.clientX, clientY: e.clientY })}
      aria-pressed={!isDay}
      aria-label={isDay ? "Switch to night (ML / quant) world" : "Switch to day (builder) world"}
      title={isDay ? "Go to night — ML & quant" : "Go to day — builder & games"}
      style={compact ? { width: 64, height: 34 } : undefined}
    >
      <motion.span
        className="toggle-knob"
        layout
        animate={{ x: isDay ? 0 : 36 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        style={compact ? { width: 26, height: 26 } : undefined}
      >
        <motion.span
          key={world}
          initial={{ rotate: -40, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          style={{ display: "grid", placeItems: "center" }}
        >
          {isDay ? <SunIcon /> : <MoonIcon />}
        </motion.span>
      </motion.span>
    </button>
  );
}
