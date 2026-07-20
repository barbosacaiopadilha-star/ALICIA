import { iniciais } from "@/lib/alicia/texto";

interface PerfilMedicoHeaderProps {
  fullName: string;
  especialidadeNome: string;
  cidade?: string;
  estadoSigla?: string;
  instituicaoPrincipal?: string;
  verificado: boolean;
  bioCurta?: string;
}

export function PerfilMedicoHeader({
  fullName,
  especialidadeNome,
  cidade,
  estadoSigla,
  instituicaoPrincipal,
  verificado,
  bioCurta,
}: PerfilMedicoHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <div
        aria-hidden="true"
        className="flex h-20 w-20 items-center justify-center rounded-full border border-hairline bg-canvas text-xl font-medium text-ink-soft"
      >
        {iniciais(fullName)}
      </div>

      <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">{fullName}</h1>

      {cidade && estadoSigla && (
        <p className="text-sm text-ink-soft">
          {especialidadeNome} · {cidade}, {estadoSigla}
        </p>
      )}

      {instituicaoPrincipal && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-wide text-ink-faint">Instituição principal</span>
          <p className="text-sm text-ink">{instituicaoPrincipal}</p>
        </div>
      )}

      {verificado && (
        <span className="inline-flex w-fit items-center gap-1 text-xs font-medium uppercase tracking-wide text-gold">
          Formação verificada
        </span>
      )}

      {bioCurta && (
        <p className="max-w-editorial text-sm text-ink-soft">{bioCurta}</p>
      )}
    </header>
  );
}
