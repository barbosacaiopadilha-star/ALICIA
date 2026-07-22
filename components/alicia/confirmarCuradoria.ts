import { MotivoDaEscolha } from "../../domain/curadoria/MotivoDaEscolha.ts";
import { SessaoDeCuradoria } from "../../domain/curadoria/SessaoDeCuradoria.ts";
import type { CasoDeCuradoria } from "../../domain/curadoria/CasoDeCuradoria.ts";
import type { ConjuntoElegivel } from "../../domain/curadoria/ConjuntoElegivel.ts";

/**
 * Confirmação da curadoria (PRODUCT-WAVE-P2): transforma o que o
 * curador preencheu na tela em uma SessaoDeCuradoria decidida e
 * encerrada, usando EXCLUSIVAMENTE o domínio existente.
 *
 * O fluxo é o do agregado: criar → iniciar → aguardando_decisao →
 * registrarDecisao (valida exatamente três, um motivo por médico,
 * evidências em todos, só elegíveis; grava auditoria; encerra).
 * Nada aqui escolhe, ordena ou sugere.
 */
export interface EscolhaDoCurador {
  readonly professionalId: string;
  readonly justificativa: string;
  readonly evidenciaIds: ReadonlyArray<string>;
}

export function confirmarCuradoria(props: {
  caso: CasoDeCuradoria;
  conjunto: ConjuntoElegivel;
  escolhas: ReadonlyArray<EscolhaDoCurador>;
  autor: string;
  em?: Date;
}): SessaoDeCuradoria {
  const { caso, conjunto, escolhas, autor } = props;
  const em = props.em ?? new Date();

  if (!caso.snapshotId) {
    throw new Error(
      "confirmarCuradoria: caso sem snapshot registrado — não há fotografia avaliada para decidir."
    );
  }

  const motivos = escolhas.map((escolha) =>
    MotivoDaEscolha.create({
      casoId: caso.id.value,
      professionalId: escolha.professionalId,
      texto: escolha.justificativa,
      evidenciaIds: escolha.evidenciaIds,
      autorId: autor,
      registradoEm: em,
    })
  );

  const sessao = SessaoDeCuradoria.criar({
    id: `sessao-${caso.id.value}`,
    casoId: caso.id.value,
    snapshotId: caso.snapshotId,
    conjuntoElegivel: conjunto,
    iniciadoPor: autor,
    createdAt: em,
  });
  sessao.iniciar({ autor, em });
  sessao.alterarStatus("aguardando_decisao", { autor, em });
  sessao.registrarDecisao({ autor, motivos, em });

  return sessao;
}
