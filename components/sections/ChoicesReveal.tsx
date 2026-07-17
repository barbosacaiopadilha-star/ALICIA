"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useSectionProgress } from "@/hooks/useSectionProgress";

const lines = [
  "Pedimos indicação.",
  "Pesquisamos no Google.",
  "Lemos avaliações.",
  "Escolhemos pelo convênio.",
  "Pela agenda.",
  "Pela proximidade.",
];

function Line({
  text,
  index,
  total,
  progress,
}: {
  text: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const segment = 0.72 / total;
  const start = index * segment;
  const opacity = useTransform(
    progress,
    [start, start + segment * 0.4, start + segment * 0.85, start + segment],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    [start, start + segment * 0.4],
    [16, 0]
  );

  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute font-display text-2xl font-normal text-ink-soft sm:text-3xl"
    >
      {text}
    </motion.p>
  );
}

export function ChoicesReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useSectionProgress(containerRef);

  const finalOpacity = useTransform(scrollYProgress, [0.8, 0.92], [0, 1]);
  const finalY = useTransform(scrollYProgress, [0.8, 0.92], [16, 0]);

  if (prefersReducedMotion) {
    return (
      <section className="section gap-6 text-center" aria-label="Como costumamos escolher">
        <span className="eyebrow">Quando precisamos de um médico…</span>
        <ul className="flex flex-col gap-3 font-display text-2xl text-ink-soft sm:text-3xl">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-6 max-w-xl font-display text-2xl italic text-ink sm:text-3xl">
          Mas será que isso basta para escolher quem irá conduzir seu
          tratamento?
        </p>
      </section>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[320vh]" aria-label="Como costumamos escolher">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6">
        <span className="eyebrow absolute top-24">Quando precisamos de um médico…</span>
        <div className="relative flex h-24 w-full max-w-2xl items-center justify-center text-center">
          {lines.map((line, i) => (
            <Line key={line} text={line} index={i} total={lines.length} progress={scrollYProgress} />
          ))}
          <motion.p
            style={{ opacity: finalOpacity, y: finalY }}
            className="absolute max-w-xl text-balance font-display text-2xl italic text-ink sm:text-3xl"
          >
            Mas será que isso basta para escolher quem irá conduzir seu
            tratamento?
          </motion.p>
        </div>
      </div>
    </div>
  );
}
