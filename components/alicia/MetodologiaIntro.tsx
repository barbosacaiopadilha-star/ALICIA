interface MetodologiaIntroProps {
  versao: string;
  atualizadoEm: string;
  resumo: string;
}

export function MetodologiaIntro({ versao, atualizadoEm, resumo }: MetodologiaIntroProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-10">
      <header className="flex flex-col gap-3 text-center">
        <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">
          Como a AliCIA analisa a formação médica
        </h1>
        <p className="text-base text-ink-soft">
          Conheça os critérios, as fontes e os limites utilizados para organizar as informações
          acadêmicas dos perfis.
        </p>
        <p className="text-xs uppercase tracking-wide text-ink-faint">
          Versão {versao} · Atualizado em {atualizadoEm}
        </p>
        <p className="text-xs font-medium uppercase tracking-wide text-gold">
          Metodologia em evolução
        </p>
      </header>

      <div className="border border-hairline bg-canvas px-6 py-6 text-center">
        <h2 className="font-display text-xl font-normal text-ink">Formação não é uma nota</h2>
        <p className="mt-2 text-sm text-ink-soft">{resumo}</p>
      </div>
    </div>
  );
}
