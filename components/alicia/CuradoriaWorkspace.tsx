"use client";

import { useMemo, useState } from "react";
import { montarCasoControlado } from "@/components/alicia/montarCasoControlado";
import {
  registrarDecisaoDoTrio,
  type DecisaoRegistrada,
} from "@/components/alicia/registrarDecisaoDoTrio";

// Workspace interno do curador (PRODUCT-WAVE-P1). Funcional antes de
// bonito: painéis empilhados, sem navegação própria. Toda a lógica de
// negócio vive no domínio/aplicação; aqui só há estado de tela.

const GRUPOS = [
  { categoria: "obrigatorio", titulo: "Obrigatórios" },
  { categoria: "preferencial", titulo: "Preferenciais" },
  { categoria: "excludente", titulo: "Excludentes" },
  { categoria: "indeterminado", titulo: "Indeterminados" },
] as const;

const RESULTADO_LABEL: Record<string, string> = {
  atende: "Atende",
  nao_atende: "Não atende",
  indeterminado: "Indeterminado",
};

export function CuradoriaWorkspace() {
  const workspace = useMemo(() => montarCasoControlado(), []);
  const { caso, conjunto, fichas, medicosPorId, evidenciasPorId, criteriosPorId } =
    workspace;

  const [fichaAbertaId, setFichaAbertaId] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [autor, setAutor] = useState("");
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const [evidencias, setEvidencias] = useState<Record<string, string[]>>({});
  const [decisao, setDecisao] = useState<DecisaoRegistrada | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const trioCompleto = selecionados.length === 3;

  function alternarSelecao(professionalId: string) {
    if (decisao) return;
    setErro(null);
    setSelecionados((atual) =>
      atual.includes(professionalId)
        ? atual.filter((id) => id !== professionalId)
        : atual.length < 3
          ? [...atual, professionalId]
          : atual
    );
  }

  function alternarEvidencia(professionalId: string, evidenciaId: string) {
    setEvidencias((atual) => {
      const atuais = atual[professionalId] ?? [];
      return {
        ...atual,
        [professionalId]: atuais.includes(evidenciaId)
          ? atuais.filter((id) => id !== evidenciaId)
          : [...atuais, evidenciaId],
      };
    });
  }

  function evidenciasDaFicha(professionalId: string): string[] {
    const ficha = fichas.find((f) => f.professionalId === professionalId);
    if (!ficha) return [];
    return Array.from(new Set(ficha.celulas.flatMap((celula) => [...celula.evidenciaIds])));
  }

  function confirmarDecisao() {
    setErro(null);
    try {
      const resultado = registrarDecisaoDoTrio({
        casoId: caso.id.value,
        conjunto,
        escolhas: selecionados.map((professionalId) => ({
          professionalId,
          texto: motivos[professionalId] ?? "",
          evidenciaIds: evidencias[professionalId] ?? [],
        })),
        autor,
        em: new Date(),
      });
      setDecisao(resultado);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : String(excecao));
    }
  }

  function reiniciar() {
    setFichaAbertaId(null);
    setSelecionados([]);
    setAutor("");
    setMotivos({});
    setEvidencias({});
    setDecisao(null);
    setErro(null);
  }

  const fichaAberta = fichaAbertaId
    ? fichas.find((f) => f.professionalId === fichaAbertaId)
    : undefined;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-1 border-b border-hairline pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Área interna · dados controlados e fictícios
        </p>
        <h1 className="font-display text-2xl text-ink">Workspace do Curador</h1>
      </header>

      <section aria-label="Painel do caso" className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">Caso</h2>
        <dl className="flex flex-col gap-1 text-sm text-ink-soft">
          <div>
            <dt className="inline font-medium text-ink">Identificador: </dt>
            <dd className="inline">{caso.id.value}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-ink">Status: </dt>
            <dd className="inline">{caso.status}</dd>
          </div>
        </dl>
        <div>
          <h3 className="mb-2 text-sm font-medium text-ink">História</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
            {workspace.historia.map((trecho) => (
              <li key={trecho}>{trecho}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-ink">Critérios</h3>
          {GRUPOS.map((grupo) => {
            const doGrupo = caso.criterios.filter(
              (criterio) => criterio.categoria === grupo.categoria
            );
            return (
              <section key={grupo.categoria} aria-label={`Critérios ${grupo.titulo}`}>
                <h4 className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  {grupo.titulo}
                </h4>
                <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
                  {doGrupo.map((criterio) => (
                    <li key={criterio.id}>
                      {criterio.descricao}
                      <span className="text-ink-faint"> · origem: {criterio.origem}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section aria-label="Conjunto elegível" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Conjunto elegível</h2>
        <p className="text-xs text-ink-faint">
          Ordem alfabética — a posição não indica mérito. Nenhum médico é
          recomendado pelo sistema.
        </p>
        <ul className="flex flex-col divide-y divide-hairline border border-hairline">
          {workspace.elegiveisPorNome.map((medico) => {
            const selecionado = selecionados.includes(medico.id);
            return (
              <li key={medico.id} className="flex flex-wrap items-center gap-3 p-3">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={selecionado}
                    disabled={Boolean(decisao) || (!selecionado && trioCompleto)}
                    onChange={() => alternarSelecao(medico.id)}
                  />
                  <span className="font-medium">{medico.nome}</span>
                </label>
                <span className="text-xs text-ink-soft">
                  {medico.especialidade} · {medico.cidade}
                </span>
                <button
                  type="button"
                  className="ml-auto border border-hairline px-3 py-1 text-xs text-ink hover:border-gold"
                  onClick={() =>
                    setFichaAbertaId((atual) => (atual === medico.id ? null : medico.id))
                  }
                >
                  {fichaAbertaId === medico.id ? "Fechar ficha" : "Abrir ficha"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {fichaAberta ? (
        <section aria-label="Ficha de compatibilidade" className="flex flex-col gap-3 border border-hairline p-4">
          <h2 className="font-display text-lg text-ink">
            Ficha de compatibilidade — {medicosPorId.get(fichaAberta.professionalId)?.nome}
          </h2>
          <p className="text-xs text-ink-faint">
            Resultados categóricos. A ficha não soma, não pesa e não pontua.
          </p>
          <ul className="flex flex-col gap-3">
            {fichaAberta.celulas.map((celula) => {
              const criterio = criteriosPorId.get(celula.criterioId);
              return (
                <li key={celula.criterioId} className="flex flex-col gap-1 text-sm">
                  <span className="text-ink">
                    {criterio?.descricao ?? celula.criterioId}
                    <span className="text-ink-faint"> · {criterio?.grupo}</span>
                  </span>
                  <span className="text-ink-soft">
                    Resultado: {RESULTADO_LABEL[celula.resultado] ?? celula.resultado}
                  </span>
                  {celula.evidenciaIds.length > 0 ? (
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-xs text-ink-soft">
                      {celula.evidenciaIds.map((evidenciaId) => {
                        const evidencia = evidenciasPorId.get(evidenciaId);
                        return (
                          <li key={evidenciaId}>
                            {evidencia?.descricao ?? evidenciaId}
                            <span className="text-ink-faint">
                              {" "}
                              ({evidencia?.tipo} · {evidencia?.referencia})
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-label="Seleção do trio" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Seleção do trio</h2>
        <p className="text-sm text-ink-soft">
          {trioCompleto
            ? "Trio completo. Preencha a decisão abaixo para registrar."
            : "Selecione exatamente três médicos do conjunto elegível para habilitar o registro da decisão."}
        </p>
        {trioCompleto && !decisao ? (
          <div className="flex flex-col gap-4 border border-hairline p-4">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Autor da decisão (curador responsável)
              <input
                type="text"
                value={autor}
                onChange={(evento) => setAutor(evento.target.value)}
                className="border border-hairline bg-paper p-2"
                placeholder="Identificação do curador"
              />
            </label>
            {selecionados.map((professionalId) => (
              <div key={professionalId} className="flex flex-col gap-2 border-t border-hairline pt-3">
                <h3 className="text-sm font-medium text-ink">
                  {medicosPorId.get(professionalId)?.nome}
                </h3>
                <label className="flex flex-col gap-1 text-sm text-ink">
                  Motivo da escolha (fatos verificáveis; sem comparativos)
                  <textarea
                    value={motivos[professionalId] ?? ""}
                    onChange={(evento) =>
                      setMotivos((atual) => ({
                        ...atual,
                        [professionalId]: evento.target.value,
                      }))
                    }
                    className="border border-hairline bg-paper p-2"
                    rows={2}
                  />
                </label>
                <fieldset className="flex flex-col gap-1 text-xs text-ink-soft">
                  <legend className="text-sm text-ink">Evidências que sustentam o motivo</legend>
                  {evidenciasDaFicha(professionalId).map((evidenciaId) => (
                    <label key={evidenciaId} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(evidencias[professionalId] ?? []).includes(evidenciaId)}
                        onChange={() => alternarEvidencia(professionalId, evidenciaId)}
                      />
                      {evidenciasPorId.get(evidenciaId)?.descricao ?? evidenciaId}
                    </label>
                  ))}
                </fieldset>
              </div>
            ))}
            <button
              type="button"
              onClick={confirmarDecisao}
              className="self-start border border-gold px-6 py-2 text-sm font-medium text-ink hover:bg-gold hover:text-paper"
            >
              Registrar decisão
            </button>
          </div>
        ) : null}
        {erro ? (
          <p role="alert" className="border border-hairline bg-canvas p-3 text-sm text-ink">
            {erro}
          </p>
        ) : null}
      </section>

      {decisao ? (
        <section aria-label="Auditoria da decisão" className="flex flex-col gap-4 border border-gold p-4">
          <h2 className="font-display text-xl text-ink">Decisão registrada — auditoria</h2>
          <ul className="flex flex-col gap-3">
            {decisao.historico.escolhas.map((motivo) => (
              <li key={motivo.professionalId} className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ink">
                  {medicosPorId.get(motivo.professionalId)?.nome ?? motivo.professionalId}
                </span>
                <span className="text-ink-soft">Autor: {motivo.autorId}</span>
                <span className="text-ink-soft">
                  Registrado em: {motivo.registradoEm.toISOString()}
                </span>
                <span className="text-ink-soft">Motivo: {motivo.texto}</span>
                <span className="text-ink-soft">
                  Evidências:{" "}
                  {motivo.evidenciaIds
                    .map((id) => evidenciasPorId.get(id)?.descricao ?? id)
                    .join("; ")}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-ink">Trilha de alterações</h3>
            <ul className="flex flex-col gap-1 text-xs text-ink-soft">
              {decisao.registro.alteracoes.map((alteracao) => (
                <li key={alteracao.id}>
                  {alteracao.id} · {alteracao.tipo} · {alteracao.autorId} · {alteracao.em} ·{" "}
                  {alteracao.dados.professionalId}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={reiniciar}
            className="self-start border border-hairline px-4 py-2 text-xs text-ink hover:border-gold"
          >
            Reiniciar demonstração
          </button>
        </section>
      ) : null}
    </main>
  );
}
