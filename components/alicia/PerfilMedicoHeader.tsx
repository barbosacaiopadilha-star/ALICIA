import { Medico } from "@/types/alicia/medico";
import { iniciais } from "@/lib/alicia/texto";

interface PerfilMedicoHeaderProps {
  medico: Medico;
  especialidadeNome: string;
}

export function PerfilMedicoHeader({ medico, especialidadeNome }: PerfilMedicoHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <div
        aria-hidden="true"
        className="flex h-20 w-20 items-center justify-center rounded-full border border-hairline bg-canvas text-xl font-medium text-ink-soft"
      >
        {iniciais(medico.nome)}
      </div>

      <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">{medico.nome}</h1>

      <p className="text-sm text-ink-soft">
        {especialidadeNome} · {medico.cidade}, {medico.estadoSigla}
      </p>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-faint">Instituição principal</span>
        <p className="text-sm text-ink">{medico.instituicaoPrincipal}</p>
      </div>

      {medico.verificado && (
        <span className="inline-flex w-fit items-center gap-1 text-xs font-medium uppercase tracking-wide text-gold">
          Formação verificada
        </span>
      )}

      {medico.bioCurta && (
        <p className="max-w-editorial text-sm text-ink-soft">{medico.bioCurta}</p>
      )}
    </header>
  );
}
