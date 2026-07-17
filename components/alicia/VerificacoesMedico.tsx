import { VerificacaoMedico } from "@/types/alicia/trajetoria-medica";

export function VerificacoesMedico({ verificacoes }: { verificacoes: VerificacaoMedico[] }) {
  return (
    <section aria-labelledby="verificacoes-heading" className="flex w-full max-w-2xl flex-col gap-3">
      <h2 id="verificacoes-heading" className="font-display text-2xl font-normal text-ink">
        Verificações do perfil
      </h2>

      {verificacoes.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {verificacoes.map((verificacao) => (
            <li key={verificacao.id} className="flex flex-col gap-1 border border-hairline bg-paper p-4">
              <h3 className="text-base font-medium text-ink">{verificacao.titulo}</h3>
              <p className="text-sm text-ink-soft">{verificacao.descricao}</p>
              <span
                className={
                  verificacao.status === "verificado"
                    ? "text-xs font-medium uppercase tracking-wide text-gold"
                    : "text-xs font-medium uppercase tracking-wide text-ink-faint"
                }
              >
                {verificacao.status === "verificado" ? "Verificada" : "Ainda não verificada"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-faint">Nenhuma verificação registrada ainda para este perfil.</p>
      )}
    </section>
  );
}
