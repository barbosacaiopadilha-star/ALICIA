import { Reveal } from "@/components/Reveal";

const steps = [
  "Paciente",
  "Entendemos seu caso",
  "Compreendemos seu momento",
  "Analisamos compatibilidade",
  "Selecionamos três médicos",
  "Você escolhe",
];

export function CurationFlow() {
  return (
    <section id="curadoria" className="section gap-12">
      <Reveal as="h2" className="max-w-editorial text-center font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Foi por isso que criamos a Curadoria Médica.
      </Reveal>

      <ol className="flex flex-col items-center gap-0">
        {steps.map((step, i) => (
          <li key={step} className="flex flex-col items-center">
            <Reveal delay={i * 0.08} className="py-2">
              <span
                className={
                  i === steps.length - 1
                    ? "font-display text-xl italic text-gold sm:text-2xl"
                    : "text-base text-ink-soft sm:text-lg"
                }
              >
                {step}
              </span>
            </Reveal>
            {i < steps.length - 1 && (
              <Reveal delay={i * 0.08 + 0.04}>
                <span aria-hidden="true" className="my-1 block h-8 w-px bg-hairline" />
              </Reveal>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
