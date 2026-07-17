import { LimiteMetodologia } from "@/types/alicia/metodologia";

export function LimitesMetodologia({ limites }: { limites: LimiteMetodologia[] }) {
  return (
    <section aria-labelledby="limites-heading" className="flex w-full max-w-2xl flex-col gap-4">
      <h2 id="limites-heading" className="font-display text-2xl font-normal text-ink">
        Limites e responsabilidade
      </h2>
      <ul className="flex flex-col gap-3">
        {limites.map((limite) => (
          <li key={limite.id} className="border-l-2 border-hairline py-1 pl-4">
            <h3 className="text-base font-medium text-ink">{limite.titulo}</h3>
            <p className="mt-1 text-sm text-ink-soft">{limite.descricao}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
