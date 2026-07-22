import type {
  CasoDeCuradoria,
  ConjuntoElegivel,
  FichaDeCompatibilidade,
  SnapshotDePublicacao,
} from "@/domain/curadoria";
import { avaliarCompatibilidade } from "./avaliarCompatibilidade.ts";
import { filtrarElegibilidade } from "./filtrarElegibilidade.ts";
import type { AvaliadorDeCriterio } from "./AvaliadorDeCriterio.ts";

/**
 * Serviço ponta a ponta da elegibilidade (Epic C2, etapas "Pesquisa" e
 * "Filtragem" do fluxo do CURADORIA_MODEL.md §1): avalia todos os
 * membros do snapshot e produz o conjunto elegível com as fichas.
 *
 * Guardas de estado:
 * - o caso precisa estar em análise ("em_analise") — a extração de
 *   critérios já ocorreu e a curadoria humana ainda não começou;
 * - o snapshot precisa ser exatamente o registrado no caso.
 *
 * O resultado é determinístico e integralmente categórico; a
 * composição do trio a partir do conjunto pertence à Wave C3 (humana).
 */
export interface ResultadoDeElegibilidade {
  readonly fichas: ReadonlyArray<FichaDeCompatibilidade>;
  readonly conjunto: ConjuntoElegivel;
}

export function executarElegibilidade(props: {
  caso: CasoDeCuradoria;
  snapshot: SnapshotDePublicacao;
  avaliadores: ReadonlyArray<AvaliadorDeCriterio>;
}): ResultadoDeElegibilidade {
  const { caso, snapshot, avaliadores } = props;

  if (caso.status !== "em_analise") {
    throw new Error(
      `executarElegibilidade: caso em "${caso.status}" — elegibilidade só roda em "em_analise".`
    );
  }
  if (!caso.snapshotId) {
    throw new Error(
      "executarElegibilidade: caso sem snapshot registrado — registrarSnapshot antes."
    );
  }
  if (caso.snapshotId !== snapshot.id) {
    throw new Error(
      `executarElegibilidade: snapshot "${snapshot.id}" não é o registrado no caso ("${caso.snapshotId}").`
    );
  }

  const fichas = snapshot.professionalIds.map((professionalId) =>
    avaliarCompatibilidade({ caso, professionalId, avaliadores })
  );

  const conjunto = filtrarElegibilidade({ caso, snapshot, fichas });

  return { fichas: Object.freeze(fichas), conjunto };
}
