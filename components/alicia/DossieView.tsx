import type { DossieDeCuradoria, MedicoDoDossie } from "@/components/alicia/gerarDossieDeCuradoria";

// Apresentação do Dossiê de Curadoria (PRODUCT-WAVE-P3). Os três
// médicos são renderizados pelo MESMO cartão, na ordem alfabética do
// dossiê — nenhuma variação de destaque, tamanho ou posição de mérito.

function CartaoDeMedico({ medico }: { medico: MedicoDoDossie }) {
  return (
    <article className="flex flex-col gap-3 border border-hairline bg-paper p-5">
      <header className="flex flex-col gap-1">
        <h3 className="font-display text-xl text-ink">{medico.nome}</h3>
        <p className="text-sm text-ink-soft">
          {medico.especialidade} · {medico.cidade}
        </p>
      </header>
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-ink-faint">Formação</h4>
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
          {medico.formacao.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-ink-faint">Experiência</h4>
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
          {medico.experiencia.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Critérios atendidos
        </h4>
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
          {medico.criteriosAtendidos.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Por que este médico está no seu dossiê
        </h4>
        <ul className="mt-1 flex flex-col gap-2 text-sm text-ink-soft">
          {medico.fatos.map((fato) => (
            <li key={fato.texto} className="flex flex-col gap-1">
              <span>{fato.texto}</span>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-xs text-ink-faint">
                {fato.evidencias.map((evidencia) => (
                  <li key={evidencia.id}>
                    {evidencia.descricao} ({evidencia.tipo} · {evidencia.registro})
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function DossieView({ dossie }: { dossie: DossieDeCuradoria }) {
  return (
    <div className="flex flex-col gap-10">
      <section aria-label="Resumo do caso" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Resumo do caso</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
          {dossie.resumoDoCaso.contextoClinico.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="text-sm font-medium text-ink">Critérios utilizados</h3>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
          {dossie.resumoDoCaso.criteriosUtilizados.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="text-sm font-medium text-ink">Limitações conhecidas</h3>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
          {dossie.resumoDoCaso.limitacoesConhecidas.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Os três médicos" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Os três médicos</h2>
        <p className="text-xs text-ink-faint">
          Apresentados em ordem alfabética, com igual destaque. A escolha é sua.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {dossie.medicos.map((medico) => (
            <CartaoDeMedico key={medico.nome} medico={medico} />
          ))}
        </div>
      </section>

      <section aria-label="Limitações" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Limitações</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
          {dossie.limitacoes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Referências" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Referências</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
          {dossie.referencias.fontes.map((fonte) => (
            <li key={fonte.id}>
              {fonte.descricao} ({fonte.tipo} · {fonte.registro})
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-soft">{dossie.referencias.verificacao}</p>
        <p className="text-xs text-ink-faint">
          Fotografia da curadoria: {dossie.referencias.snapshot.id} ·{" "}
          {dossie.referencias.snapshot.criadoEm}
        </p>
      </section>
    </div>
  );
}
