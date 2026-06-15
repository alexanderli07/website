import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "../world/useReducedMotion";

interface RevealProps {
  children: ReactNode;
  /** stagger delay in seconds */
  delay?: number;
  /** translate distance in px */
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}

const MOTION_TAGS = {
  div: motion.div,
  li: motion.li,
  section: motion.section,
  article: motion.article,
} as const;

/** Fades + lifts content into view once. Becomes a no-op under reduced motion. */
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: RevealProps) {
  const reduced = useReducedMotion();
  // Narrow to a single concrete component type so JSX doesn't choke on the union.
  const MotionTag = MOTION_TAGS[as] as typeof motion.div;

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
