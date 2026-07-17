import { Reveal } from "@/components/Reveal";

export function FinalCta() {
  return (
    <section className="section gap-8 text-center">
      <div className="flex max-w-editorial flex-col items-center gap-6">
        <Reveal as="h2" className="font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          Sua saúde merece mais do que uma indicação.
        </Reveal>
        <Reveal delay={0.08} as="p" className="text-base leading-relaxed text-ink-soft sm:text-lg">
          Merece uma escolha consciente.
        </Reveal>
        <Reveal delay={0.16}>
          <a
            href="#curadoria"
            className="mt-4 inline-flex items-center justify-center border border-gold px-8 py-4 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
          >
            Começar minha Curadoria Médica
          </a>
        </Reveal>
      </div>
    </section>
  );
}
