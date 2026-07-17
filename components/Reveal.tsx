"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span";
}

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];

  if (prefersReducedMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}
