import Link from "next/link";
import { iniciais } from "@/lib/alicia/texto";

// View de apresentação: combina ProfessionalCatalogProjection (nome,
// localização, link) com os dois campos ainda sem representação no
// domínio (formacaoResumo, verificado) — ver
// docs/architecture/CATALOG_MIGRATION_REVIEW.md. Não pertence ao
// domínio, não é um Medico reconstruído.
export interface MedicoView {
  id: string;
  slug: string;
  nome: string;
  cidade?: string;
  instituicaoPrincipal?: string;
  estadoSigla: string;
  especialidadeId: string;
  formacaoResumo?: string;
  verificado: boolean;
}

interface MedicoCardProps {
  medico: MedicoView;
  especialidadeNome: string;
}

export function MedicoCard({ medico, especialidadeNome }: MedicoCardProps) {
  return (
    <li className="flex flex-col gap-4 border border-hairline bg-paper p-5 sm:flex-row sm:items-start">
      <div
        aria-hidden="true"
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-base font-medium text-ink-soft"
      >
        {iniciais(medico.nome)}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-normal text-ink">{medico.nome}</h3>
          {medico.cidade && (
            <p className="text-sm text-ink-soft">
              {especialidadeNome} · {medico.cidade}
            </p>
          )}
        </div>

        {medico.instituicaoPrincipal && (
          <p className="text-sm text-ink-soft">{medico.instituicaoPrincipal}</p>
        )}
        {medico.formacaoResumo && (
          <p className="text-sm text-ink-faint">{medico.formacaoResumo}</p>
        )}

        {medico.verificado && (
          <span className="inline-flex w-fit items-center gap-1 text-xs font-medium uppercase tracking-wide text-gold">
            Formação verificada
          </span>
        )}

        <Link
          href={`/alicia/${medico.estadoSigla}/${medico.especialidadeId}/${medico.slug}`}
          className="mt-2 inline-flex w-fit items-center gap-2 text-sm font-medium text-ink underline decoration-hairline underline-offset-4 transition-colors duration-300 hover:text-gold hover:decoration-gold"
        >
          Ver trajetória
        </Link>
      </div>
    </li>
  );
}
