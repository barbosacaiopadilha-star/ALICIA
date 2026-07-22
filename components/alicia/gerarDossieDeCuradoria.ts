import { violaGramaticaRestrita } from "../../domain/curadoria/JustificativaDeSelecao.ts";
import type { RegistroDeDecisao } from "../../domain/curadoria/RegistroDeDecisao.ts";
import type { WorkspaceDoCaso } from "./montarCasoControlado.ts";
import { ordenarPorNome } from "./montarCasoControlado.ts";

/**
 * Dossiê de Curadoria (PRODUCT-WAVE-P3): o primeiro produto visível ao
 * paciente. Estrutura FIXA de cinco seções; conteúdo integralmente
 * categórico e verificável.
 *
 * O que o dossiê NUNCA contém, por construção (e por teste):
 * - identificação do paciente ou do curador;
 * - exclusões, auditoria, histórico ou qualquer dado interno;
 * - números, posições, notas ou pesos;
 * - comparativos — a gramática restrita é reaplicada em todo o
 *   conteúdo na geração;
 * - afirmações negativas sobre qualquer profissional (só critérios
 *   ATENDIDOS aparecem; o que não se sabe vira Limitação honesta).
 *
 * Os três médicos são apresentados em ordem alfabética — igual
 * dignidade, nunca mérito. Sem URLs: as referências são registros
 * verificáveis (tipo + identificação da fonte), nunca links.
 */
export const CHAVE_DECISAO_DA_CURADORIA = "alicia.curadoria.decisao";

export interface FatoDoDossie {
  readonly texto: string;
  readonly evidencias: ReadonlyArray<FonteDoDossie>;
}

export interface FonteDoDossie {
  readonly id: string;
  readonly tipo: string;
  readonly registro: string;
  readonly descricao: string;
}

export interface MedicoDoDossie {
  readonly nome: string;
  readonly especialidade: string;
  readonly cidade: string;
  readonly formacao: ReadonlyArray<string>;
  readonly experiencia: ReadonlyArray<string>;
  readonly criteriosAtendidos: ReadonlyArray<string>;
  readonly fatos: ReadonlyArray<FatoDoDossie>;
}

export interface DossieDeCuradoria {
  readonly resumoDoCaso: {
    readonly contextoClinico: ReadonlyArray<string>;
    readonly criteriosUtilizados: ReadonlyArray<string>;
    readonly limitacoesConhecidas: ReadonlyArray<string>;
  };
  readonly medicos: ReadonlyArray<MedicoDoDossie>;
  readonly limitacoes: ReadonlyArray<string>;
  readonly referencias: {
    readonly fontes: ReadonlyArray<FonteDoDossie>;
    readonly verificacao: string;
    readonly snapshot: { readonly id: string; readonly criadoEm: string };
  };
}

const LIMITACOES_FIXAS = [
  "A AliCIA não avalia resultados clínicos individuais nem opiniões de pacientes — opinião não é evidência.",
  "Disponibilidade de agenda, valores e cobertura de convênio ainda precisam ser confirmados diretamente com cada médico.",
  "A verificação é categórica e datada: reflete o que estava documentado na data da fotografia, não uma garantia permanente.",
];

function congelarProfundo<T>(valor: T): T {
  if (Array.isArray(valor)) {
    for (const item of valor) congelarProfundo(item);
    return Object.freeze(valor);
  }
  if (valor !== null && typeof valor === "object") {
    for (const filho of Object.values(valor)) congelarProfundo(filho);
    return Object.freeze(valor);
  }
  return valor;
}

function exigirGramaticaRestrita(textos: ReadonlyArray<string>): void {
  for (const texto of textos) {
    const termo = violaGramaticaRestrita(texto);
    if (termo) {
      throw new Error(
        `gerarDossieDeCuradoria: gramática restrita violada — termo proibido "${termo}" em "${texto}".`
      );
    }
  }
}

export function gerarDossieDeCuradoria(props: {
  workspace: WorkspaceDoCaso;
  decisao: RegistroDeDecisao;
}): DossieDeCuradoria {
  const { workspace, decisao } = props;
  const { caso, snapshot, conjunto, fichas, medicosPorId, evidenciasPorId, criteriosPorId } =
    workspace;

  if (decisao.casoId !== caso.id.value) {
    throw new Error(
      `gerarDossieDeCuradoria: decisão pertence ao caso "${decisao.casoId}", não a "${caso.id.value}".`
    );
  }
  if (decisao.snapshotId !== snapshot.id) {
    throw new Error(
      `gerarDossieDeCuradoria: decisão referencia o snapshot "${decisao.snapshotId}", não "${snapshot.id}".`
    );
  }
  for (const professionalId of decisao.trioSelecionado) {
    if (!conjunto.contem(professionalId)) {
      throw new Error(
        `gerarDossieDeCuradoria: "${professionalId}" não pertence ao conjunto elegível do caso.`
      );
    }
  }

  const fonte = (evidenciaId: string): FonteDoDossie => {
    const evidencia = evidenciasPorId.get(evidenciaId);
    if (!evidencia) {
      throw new Error(`gerarDossieDeCuradoria: evidência "${evidenciaId}" desconhecida.`);
    }
    return {
      id: evidencia.id,
      tipo: evidencia.tipo,
      registro: evidencia.referencia,
      descricao: evidencia.descricao,
    };
  };

  // Seção 1 — critérios utilizados: obrigatórios e preferenciais.
  // Excludentes são filtros internos de proteção; indeterminados viram
  // limitação honesta (nunca falsa certeza).
  const criteriosUtilizados = caso.criterios
    .filter((c) => c.categoria === "obrigatorio" || c.categoria === "preferencial")
    .map((c) =>
      c.categoria === "obrigatorio"
        ? `${c.descricao} (obrigatório, comprovado com evidência)`
        : `${c.descricao} (preferencial)`
    );
  const limitacoesConhecidas = caso.criterios
    .filter((c) => c.categoria === "indeterminado")
    .map((c) => c.descricao);

  // Seção 2 e 3 — os três médicos, em ordem alfabética (igual
  // dignidade), cada um com fatos, evidências, formação, experiência e
  // critérios atendidos. Nenhum resultado negativo aparece.
  const trio = ordenarPorNome(
    decisao.trioSelecionado.map((professionalId) => {
      const medico = medicosPorId.get(professionalId);
      if (!medico) {
        throw new Error(`gerarDossieDeCuradoria: médico "${professionalId}" desconhecido.`);
      }
      return medico;
    })
  );

  const medicos: MedicoDoDossie[] = trio.map((medico) => {
    const ficha = fichas.find((f) => f.professionalId === medico.id);
    const criteriosAtendidos = (ficha?.celulas ?? [])
      .filter((celula) => {
        const criterio = criteriosPorId.get(celula.criterioId);
        return (
          celula.resultado === "atende" &&
          (criterio?.grupo === "obrigatorio" || criterio?.grupo === "preferencial")
        );
      })
      .map((celula) => criteriosPorId.get(celula.criterioId)?.descricao ?? celula.criterioId);
    const motivo = decisao.motivoPara(medico.id);
    if (!motivo) {
      throw new Error(`gerarDossieDeCuradoria: motivo ausente para "${medico.id}".`);
    }
    return {
      nome: medico.nome,
      especialidade: medico.especialidade,
      cidade: medico.cidade,
      formacao: [...medico.formacao],
      experiencia: [...medico.experiencia],
      criteriosAtendidos,
      fatos: [
        {
          texto: motivo.texto,
          evidencias: motivo.evidenciaIds.map(fonte),
        },
      ],
    };
  });

  // Seção 5 — todas as fontes citadas no dossiê, sem repetição, mais a
  // verificação e a fotografia (snapshot) que dataram a curadoria.
  const idsDeFontes = Array.from(
    new Set(medicos.flatMap((m) => m.fatos.flatMap((f) => f.evidencias.map((e) => e.id))))
  ).sort((a, b) => a.localeCompare(b));

  const dossie: DossieDeCuradoria = {
    resumoDoCaso: {
      contextoClinico: [...workspace.historia],
      criteriosUtilizados,
      limitacoesConhecidas,
    },
    medicos,
    limitacoes: [...limitacoesConhecidas, ...LIMITACOES_FIXAS],
    referencias: {
      fontes: idsDeFontes.map(fonte),
      verificacao:
        "Cada fato deste dossiê está ancorado em uma fonte verificável listada acima. A verificação é documental e categórica, sem qualquer forma de pontuação ou ordenação entre os médicos.",
      snapshot: { id: snapshot.id, criadoEm: snapshot.criadoEm.toISOString() },
    },
  };

  // Gramática restrita reaplicada sobre TODO o conteúdo textual.
  exigirGramaticaRestrita([
    ...dossie.resumoDoCaso.contextoClinico,
    ...dossie.resumoDoCaso.criteriosUtilizados,
    ...dossie.resumoDoCaso.limitacoesConhecidas,
    ...dossie.limitacoes,
    dossie.referencias.verificacao,
    ...dossie.medicos.flatMap((m) => [
      m.nome,
      m.especialidade,
      m.cidade,
      ...m.formacao,
      ...m.experiencia,
      ...m.criteriosAtendidos,
      ...m.fatos.flatMap((f) => [f.texto, ...f.evidencias.map((e) => e.descricao)]),
    ]),
  ]);

  return congelarProfundo(dossie);
}
