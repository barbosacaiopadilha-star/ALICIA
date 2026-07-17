import Link from "next/link";
import { Medico } from "@/types/alicia/medico";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${primeira}${ultima}`.toUpperCase();
}

interface MedicoCardProps {
  medico: Medico;
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
          <p className="text-sm text-ink-soft">
            {especialidadeNome} · {medico.cidade}
          </p>
        </div>

        <p className="text-sm text-ink-soft">{medico.instituicaoPrincipal}</p>
        <p className="text-sm text-ink-faint">{medico.formacaoResumo}</p>

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
