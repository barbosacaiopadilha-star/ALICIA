import { MotivoDaEscolha } from "../../domain/curadoria/MotivoDaEscolha.ts";
import { HistoricoDeDecisao } from "../../domain/curadoria/HistoricoDeDecisao.ts";
import { RegistroDeAlteracoes } from "../../domain/curadoria/RegistroDeAlteracoes.ts";
import type { ConjuntoElegivel } from "../../domain/curadoria/ConjuntoElegivel.ts";

/**
 * Registro da decisão do curador (PRODUCT-WAVE-P1): compõe o trio com
 * EXCLUSIVAMENTE o domínio existente — MotivoDaEscolha (autor +
 * evidências + gramática restrita), HistoricoDeDecisao (append-only)
 * e RegistroDeAlteracoes (trilha auditável).
 *
 * O sistema não sugere, não ordena e não completa: recebe exatamente
 * o que o humano escolheu e recusa qualquer coisa diferente de três.
 */
export interface EscolhaDoCurador {
  readonly professionalId: string;
  readonly texto: string;
  readonly evidenciaIds: ReadonlyArray<string>;
}

export interface DecisaoRegistrada {
  readonly historico: HistoricoDeDecisao;
  readonly registro: RegistroDeAlteracoes;
}

export function registrarDecisaoDoTrio(props: {
  casoId: string;
  conjunto: ConjuntoElegivel;
  escolhas: ReadonlyArray<EscolhaDoCurador>;
  autor: string;
  em: Date;
}): DecisaoRegistrada {
  const { casoId, conjunto, escolhas, autor, em } = props;

  if (escolhas.length !== 3) {
    throw new Error(
      `registrarDecisaoDoTrio: o trio tem exatamente três médicos — foram selecionados ${escolhas.length}.`
    );
  }
  const ids = new Set(escolhas.map((escolha) => escolha.professionalId));
  if (ids.size !== escolhas.length) {
    throw new Error(
      "registrarDecisaoDoTrio: o mesmo médico não pode ocupar duas vagas do trio."
    );
  }
  for (const escolha of escolhas) {
    if (!conjunto.contem(escolha.professionalId)) {
      throw new Error(
        `registrarDecisaoDoTrio: "${escolha.professionalId}" não está no conjunto elegível — só elegíveis podem ser escolhidos.`
      );
    }
  }

  let historico = HistoricoDeDecisao.vazio(casoId);
  let registro = RegistroDeAlteracoes.vazio(casoId);

  for (const escolha of escolhas) {
    const motivo = MotivoDaEscolha.create({
      casoId,
      professionalId: escolha.professionalId,
      texto: escolha.texto,
      evidenciaIds: escolha.evidenciaIds,
      autorId: autor,
      registradoEm: em,
    });
    historico = historico.registrarEscolha(motivo);
    registro = registro.registrar({
      tipo: "escolha_registrada",
      autorId: autor,
      em,
      dados: {
        professionalId: escolha.professionalId,
        evidencias: motivo.evidenciaIds.join(", "),
      },
    });
  }

  return { historico, registro };
}
