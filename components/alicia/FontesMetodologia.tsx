import { FonteMetodologia } from "@/types/alicia/metodologia";

export function FontesMetodologia({ fontes }: { fontes: FonteMetodologia[] }) {
  return (
    <section aria-labelledby="fontes-heading" className="flex w-full max-w-2xl flex-col gap-4">
      <h2 id="fontes-heading" className="font-display text-2xl font-normal text-ink">
        Fontes das informações
      </h2>
      <ul className="flex flex-col gap-3">
        {fontes.map((fonte) => (
          <li key={fonte.id} className="border border-hairline bg-paper p-4">
            <h3 className="text-base font-medium text-ink">{fonte.nome}</h3>
            <p className="mt-1 text-sm text-ink-soft">{fonte.descricao}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
