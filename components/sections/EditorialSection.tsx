import { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

interface EditorialSectionProps {
  eyebrow?: string;
  headline: string;
  children: ReactNode;
  id?: string;
  align?: "center" | "left";
}

export function EditorialSection({
  eyebrow,
  headline,
  children,
  id,
  align = "center",
}: EditorialSectionProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section id={id} className={`section gap-8 ${alignment}`}>
      <div className={`flex max-w-editorial flex-col gap-8 ${alignment}`}>
        {eyebrow && (
          <Reveal>
            <span className="eyebrow">{eyebrow}</span>
          </Reveal>
        )}
        <Reveal delay={0.05} as="h2" className="font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          {headline}
        </Reveal>
        <Reveal delay={0.15} className="flex flex-col gap-4 text-base leading-relaxed text-ink-soft sm:text-lg">
          {children}
        </Reveal>
      </div>
    </section>
  );
}
