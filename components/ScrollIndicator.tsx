"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ScrollIndicator() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
      aria-hidden="true"
    >
      <motion.div
        className="h-10 w-px bg-hairline"
        animate={
          prefersReducedMotion
            ? undefined
            : { scaleY: [0.4, 1, 0.4], opacity: [0.3, 0.8, 0.3] }
        }
        style={{ transformOrigin: "top" }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
