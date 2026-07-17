import { CriterioMetodologia as CriterioMetodologiaTipo } from "@/types/alicia/metodologia";

const rotulosStatus: Record<CriterioMetodologiaTipo["status"], string> = {
  ativo: "Ativo no MVP",
  em_validacao: "Em validação",
  futuro: "Previsto para uma etapa futura",
};

export function CriterioMetodologia({ criterio }: { criterio: CriterioMetodologiaTipo }) {
  return (
    <li className="flex flex-col gap-3 border border-hairline bg-paper p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-normal text-ink">{criterio.titulo}</h3>
        <p className="text-sm text-ink-soft">{criterio.descricao}</p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          O que observamos
        </span>
        <ul className="flex flex-col gap-1">
          {criterio.oQueObservamos.map((item) => (
            <li key={item} className="text-sm text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Por que importa
        </span>
        <p className="text-sm text-ink-soft">{criterio.porQueImporta}</p>
      </div>

      <span className="w-fit text-xs font-medium uppercase tracking-wide text-gold">
        {rotulosStatus[criterio.status]}
      </span>
    </li>
  );
}
