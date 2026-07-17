"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { ScrollIndicator } from "@/components/ScrollIndicator";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="section !justify-center gap-10 text-center" aria-label="Introdução">
      <motion.div
        variants={prefersReducedMotion ? undefined : staggerChildren(0.18)}
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
        className="flex max-w-3xl flex-col items-center gap-8"
      >
        <motion.h1
          variants={prefersReducedMotion ? undefined : fadeUp}
          className="font-display text-4xl font-normal leading-[1.15] text-ink sm:text-5xl md:text-6xl"
        >
          Todo tratamento começa com uma escolha.
        </motion.h1>

        <motion.p
          variants={prefersReducedMotion ? undefined : fadeUp}
          className="max-w-xl text-balance text-base leading-relaxed text-ink-soft sm:text-lg"
        >
          Mas a maioria de nós nunca aprendeu a escolher o médico que irá
          conduzir essa jornada.
        </motion.p>

        <motion.a
          variants={prefersReducedMotion ? undefined : fadeUp}
          href="#curadoria"
          className="group mt-2 inline-flex items-center gap-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:text-gold"
        >
          Descobrir uma nova forma de escolher
          <span
            aria-hidden="true"
            className="h-px w-8 bg-gold transition-all duration-300 group-hover:w-12"
          />
        </motion.a>
      </motion.div>
      <ScrollIndicator />
    </section>
  );
}
