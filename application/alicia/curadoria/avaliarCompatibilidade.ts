import type { CasoDeCuradoria } from "@/domain/curadoria";
import { FichaDeCompatibilidade } from "../../../domain/curadoria/FichaDeCompatibilidade.ts";
import type { AvaliadorDeCriterio } from "./AvaliadorDeCriterio.ts";

/**
 * Produz a FichaDeCompatibilidade de um profissional para um caso
 * (CURADORIA_MODEL.md §4).
 *
 * Regras:
 * - critério do grupo "indeterminado" nunca é avaliado: célula
 *   `indeterminado` por definição (o dado necessário não existe);
 * - avaliador ausente para um critério ⇒ `indeterminado` — NUNCA
 *   `nao_atende`: ausência de avaliação não é falha (§2);
 * - o resultado é integralmente categórico; a validação da própria
 *   Ficha garante ausência de números e determinismo da serialização.
 */
export function avaliarCompatibilidade(props: {
  caso: CasoDeCuradoria;
  professionalId: string;
  avaliadores: ReadonlyArray<AvaliadorDeCriterio>;
}): FichaDeCompatibilidade {
  const professionalId = props.professionalId?.trim();
  if (!professionalId) {
    throw new Error("avaliarCompatibilidade: professionalId é obrigatório.");
  }

  const avaliadorPorCriterio = new Map<string, AvaliadorDeCriterio>();
  for (const avaliador of props.avaliadores) {
    if (avaliadorPorCriterio.has(avaliador.criterioId)) {
      throw new Error(
        `avaliarCompatibilidade: avaliador duplicado para o critério "${avaliador.criterioId}".`
      );
    }
    avaliadorPorCriterio.set(avaliador.criterioId, avaliador);
  }

  const celulas = props.caso.criterios.map((criterio) => {
    if (criterio.categoria === "indeterminado") {
      return { criterioId: criterio.id, resultado: "indeterminado" as const, evidenciaIds: [] };
    }
    const avaliador = avaliadorPorCriterio.get(criterio.id);
    if (!avaliador) {
      return { criterioId: criterio.id, resultado: "indeterminado" as const, evidenciaIds: [] };
    }
    const avaliacao = avaliador.avaliar(professionalId);
    return {
      criterioId: criterio.id,
      resultado: avaliacao.resultado,
      evidenciaIds: avaliacao.evidenciaIds,
    };
  });

  return FichaDeCompatibilidade.create({
    casoId: props.caso.id.value,
    professionalId,
    celulas,
  });
}
