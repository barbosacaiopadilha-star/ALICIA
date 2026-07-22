import type { CasoDeCuradoria, FichaDeCompatibilidade, SnapshotDePublicacao } from "@/domain/curadoria";
import { ConjuntoElegivel } from "../../../domain/curadoria/ConjuntoElegivel.ts";

/**
 * Filtragem de elegibilidade (CURADORIA_MODEL.md §1–§2, Epic C2):
 * aplica excludentes e obrigatórios sobre o snapshot e produz o
 * ConjuntoElegivel — um conjunto, nunca uma ordem.
 *
 * Regras:
 * - excludente com célula "atende" ⇒ exclusão registrada com o
 *   criterioId (motivo auditável);
 * - obrigatório só é comprovado com célula "atende" E ao menos uma
 *   evidência (ADR-031); não comprovado ⇒ exclusão registrada com o
 *   criterioId do obrigatório — registro interno de auditoria, nunca
 *   afirmação pública negativa (ADR-032);
 * - preferenciais e indeterminados NUNCA afetam elegibilidade (§2);
 * - conjunto vazio é resultado legítimo (caso especial "nenhum
 *   elegível" — a comunicação honesta pertence às camadas seguintes);
 * - toda ficha deve pertencer ao caso e ao snapshot; todo membro do
 *   snapshot precisa de ficha — avaliação parcial é erro explícito.
 */
export function filtrarElegibilidade(props: {
  caso: CasoDeCuradoria;
  snapshot: SnapshotDePublicacao;
  fichas: ReadonlyArray<FichaDeCompatibilidade>;
}): ConjuntoElegivel {
  const { caso, snapshot, fichas } = props;

  if (caso.snapshotId !== snapshot.id) {
    throw new Error(
      `filtrarElegibilidade: snapshot "${snapshot.id}" não é o registrado no caso ("${caso.snapshotId ?? "nenhum"}").`
    );
  }

  const fichaPorProfissional = new Map<string, FichaDeCompatibilidade>();
  for (const ficha of fichas) {
    if (ficha.casoId !== caso.id.value) {
      throw new Error(
        `filtrarElegibilidade: ficha de "${ficha.professionalId}" pertence a outro caso ("${ficha.casoId}").`
      );
    }
    if (!snapshot.contem(ficha.professionalId)) {
      throw new Error(
        `filtrarElegibilidade: "${ficha.professionalId}" não pertence ao snapshot "${snapshot.id}".`
      );
    }
    if (fichaPorProfissional.has(ficha.professionalId)) {
      throw new Error(
        `filtrarElegibilidade: ficha duplicada para "${ficha.professionalId}".`
      );
    }
    fichaPorProfissional.set(ficha.professionalId, ficha);
  }

  const excludentes = caso.criterios.filter((c) => c.categoria === "excludente");
  const obrigatorios = caso.criterios.filter((c) => c.categoria === "obrigatorio");

  const elegiveis: string[] = [];
  const exclusoes: Array<{ professionalId: string; criterioId: string }> = [];

  for (const professionalId of snapshot.professionalIds) {
    const ficha = fichaPorProfissional.get(professionalId);
    if (!ficha) {
      throw new Error(
        `filtrarElegibilidade: membro "${professionalId}" do snapshot está sem ficha — avaliação incompleta.`
      );
    }

    const excludenteAtendido = excludentes.find(
      (criterio) => ficha.resultadoPara(criterio.id) === "atende"
    );
    if (excludenteAtendido) {
      exclusoes.push({ professionalId, criterioId: excludenteAtendido.id });
      continue;
    }

    const obrigatorioNaoComprovado = obrigatorios.find((criterio) => {
      const celula = ficha.celulas.find((c) => c.criterioId === criterio.id);
      return !celula || celula.resultado !== "atende" || celula.evidenciaIds.length === 0;
    });
    if (obrigatorioNaoComprovado) {
      exclusoes.push({ professionalId, criterioId: obrigatorioNaoComprovado.id });
      continue;
    }

    elegiveis.push(professionalId);
  }

  return ConjuntoElegivel.create({
    casoId: caso.id.value,
    snapshotId: snapshot.id,
    elegiveis,
    exclusoes,
  });
}
