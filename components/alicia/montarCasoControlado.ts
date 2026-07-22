import { CasoDeCuradoria } from "../../domain/curadoria/CasoDeCuradoria.ts";
import { CasoId } from "../../domain/curadoria/CasoId.ts";
import { PacienteId } from "../../domain/curadoria/PacienteId.ts";
import { Observacao } from "../../domain/curadoria/Observacao.ts";
import {
  CriterioExcludente,
  CriterioIndeterminado,
  CriterioObrigatorio,
  CriterioPreferencial,
  type Criterio,
} from "../../domain/curadoria/Criterio.ts";
import { SnapshotDePublicacao } from "../../domain/curadoria/SnapshotDePublicacao.ts";
import { EvidenceReference } from "../../domain/curadoria/EvidenceReference.ts";
import type { ConjuntoElegivel } from "../../domain/curadoria/ConjuntoElegivel.ts";
import type { FichaDeCompatibilidade } from "../../domain/curadoria/FichaDeCompatibilidade.ts";
import { executarElegibilidade } from "../../application/alicia/curadoria/executarElegibilidade.ts";
import type { AvaliadorDeCriterio } from "../../application/alicia/curadoria/AvaliadorDeCriterio.ts";
import {
  CASO_CONTROLADO,
  type CriterioControlado,
  type EvidenciaControlada,
  type MedicoControlado,
} from "../../mocks/alicia/caso-controlado.ts";

/**
 * Montagem do caso controlado (PRODUCT-WAVE-P1): reconstrói o caso no
 * domínio REAL (C1) e executa a elegibilidade REAL (C2) sobre a
 * tabela determinística de avaliações do mock. Nada aqui decide nada:
 * a saída é o material de trabalho do curador.
 *
 * Sem "use client", sem React: módulo puro, testável com o test
 * runner nativo do Node.
 */
export interface WorkspaceDoCaso {
  readonly caso: CasoDeCuradoria;
  readonly snapshot: SnapshotDePublicacao;
  readonly historia: ReadonlyArray<string>;
  readonly fichas: ReadonlyArray<FichaDeCompatibilidade>;
  readonly conjunto: ConjuntoElegivel;
  readonly medicosPorId: ReadonlyMap<string, MedicoControlado>;
  readonly evidenciasPorId: ReadonlyMap<string, EvidenciaControlada>;
  readonly criteriosPorId: ReadonlyMap<string, CriterioControlado>;
  /** Elegíveis em ordem alfabética de NOME — apresentação neutra, sem mérito. */
  readonly elegiveisPorNome: ReadonlyArray<MedicoControlado>;
}

function criarCriterio(spec: CriterioControlado): Criterio {
  const props = { id: spec.id, descricao: spec.descricao, origem: spec.origem };
  switch (spec.grupo) {
    case "obrigatorio":
      return CriterioObrigatorio.create(props);
    case "preferencial":
      return CriterioPreferencial.create(props);
    case "excludente":
      return CriterioExcludente.create(props);
    case "indeterminado":
      return CriterioIndeterminado.create(props);
  }
}

export function ordenarPorNome(
  medicos: ReadonlyArray<MedicoControlado>
): ReadonlyArray<MedicoControlado> {
  return Object.freeze(
    [...medicos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  );
}

export function montarCasoControlado(): WorkspaceDoCaso {
  const abertoEm = new Date(CASO_CONTROLADO.abertoEm);

  const caso = CasoDeCuradoria.criar({
    id: CasoId.create(CASO_CONTROLADO.casoId),
    pacienteId: PacienteId.create(CASO_CONTROLADO.pacienteId),
    createdAt: abertoEm,
  });
  for (const texto of CASO_CONTROLADO.historia) {
    caso.adicionarObservacao(Observacao.create(texto, abertoEm), abertoEm);
  }
  for (const spec of CASO_CONTROLADO.criterios) {
    caso.adicionarCriterio(criarCriterio(spec), abertoEm);
  }
  caso.registrarSnapshot(CASO_CONTROLADO.snapshotId, abertoEm);
  caso.alterarStatus("em_analise", abertoEm);

  const snapshot = SnapshotDePublicacao.create({
    id: CASO_CONTROLADO.snapshotId,
    criadoEm: abertoEm,
    professionalIds: CASO_CONTROLADO.medicos.map((medico) => medico.id),
  });

  // Valida as evidências controladas contra o domínio (tipos fechados).
  for (const evidencia of CASO_CONTROLADO.evidencias) {
    EvidenceReference.create({
      id: evidencia.id,
      tipo: evidencia.tipo,
      referencia: evidencia.referencia,
    });
  }

  const criteriosAvaliaveis = Array.from(
    new Set(CASO_CONTROLADO.avaliacoes.map((linha) => linha.criterioId))
  );
  const avaliadores: AvaliadorDeCriterio[] = criteriosAvaliaveis.map(
    (criterioId) => ({
      criterioId,
      avaliar: (professionalId) => {
        const linha = CASO_CONTROLADO.avaliacoes.find(
          (avaliacao) =>
            avaliacao.criterioId === criterioId &&
            avaliacao.professionalId === professionalId
        );
        if (!linha) {
          return { resultado: "indeterminado", evidenciaIds: [] };
        }
        return { resultado: linha.resultado, evidenciaIds: [...linha.evidenciaIds] };
      },
    })
  );

  const { fichas, conjunto } = executarElegibilidade({ caso, snapshot, avaliadores });

  const medicosPorId = new Map(
    CASO_CONTROLADO.medicos.map((medico) => [medico.id, medico])
  );
  const evidenciasPorId = new Map(
    CASO_CONTROLADO.evidencias.map((evidencia) => [evidencia.id, evidencia])
  );
  const criteriosPorId = new Map(
    CASO_CONTROLADO.criterios.map((criterio) => [criterio.id, criterio])
  );

  const elegiveisPorNome = ordenarPorNome(
    conjunto.elegiveis.map((professionalId) => {
      const medico = medicosPorId.get(professionalId);
      if (!medico) {
        throw new Error(
          `montarCasoControlado: elegível "${professionalId}" sem dados controlados.`
        );
      }
      return medico;
    })
  );

  return {
    caso,
    snapshot,
    historia: CASO_CONTROLADO.historia,
    fichas,
    conjunto,
    medicosPorId,
    evidenciasPorId,
    criteriosPorId,
    elegiveisPorNome,
  };
}
