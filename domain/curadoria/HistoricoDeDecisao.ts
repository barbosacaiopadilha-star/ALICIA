import {
  MotivoDaEscolha,
  deserializarMotivoDaEscolha,
} from "./MotivoDaEscolha.ts";
import {
  MotivoDaExclusao,
  deserializarMotivoDaExclusao,
} from "./MotivoDaExclusao.ts";

/**
 * Histórico de decisão (Epic C3): sequência append-only dos atos
 * humanos de escolha e exclusão de um caso.
 *
 * Nenhuma alteração pode apagar histórico: a classe é imutável e
 * registrar devolve uma NOVA instância com o ato acrescentado — a
 * instância anterior permanece intacta e não existe método de remoção
 * ou edição. A ordem das decisões é a ordem de registro (cronologia
 * auditável), nunca mérito.
 */
export interface DecisaoRegistrada {
  readonly tipo: "escolha" | "exclusao";
  readonly motivo: MotivoDaEscolha | MotivoDaExclusao;
}

export class HistoricoDeDecisao {
  readonly casoId: string;
  private readonly _decisoes: ReadonlyArray<DecisaoRegistrada>;

  private constructor(casoId: string, decisoes: ReadonlyArray<DecisaoRegistrada>) {
    this.casoId = casoId;
    this._decisoes = decisoes;
  }

  static vazio(casoId: string): HistoricoDeDecisao {
    const trimmed = casoId?.trim();
    if (!trimmed) {
      throw new Error("HistoricoDeDecisao: casoId é obrigatório e não pode ser vazio.");
    }
    return new HistoricoDeDecisao(trimmed, Object.freeze([]));
  }

  private exigirProfissionalSemDecisao(professionalId: string): void {
    const existente = this._decisoes.find(
      (decisao) => decisao.motivo.professionalId === professionalId
    );
    if (existente) {
      throw new Error(
        `HistoricoDeDecisao: "${professionalId}" já tem ${existente.tipo} registrada — decisões não são sobrescritas.`
      );
    }
  }

  private acrescentar(decisao: DecisaoRegistrada): HistoricoDeDecisao {
    if (decisao.motivo.casoId !== this.casoId) {
      throw new Error(
        `HistoricoDeDecisao: motivo pertence ao caso "${decisao.motivo.casoId}", não a "${this.casoId}".`
      );
    }
    this.exigirProfissionalSemDecisao(decisao.motivo.professionalId);
    return new HistoricoDeDecisao(
      this.casoId,
      Object.freeze([...this._decisoes, Object.freeze(decisao)])
    );
  }

  registrarEscolha(motivo: MotivoDaEscolha): HistoricoDeDecisao {
    return this.acrescentar({ tipo: "escolha", motivo });
  }

  registrarExclusao(motivo: MotivoDaExclusao): HistoricoDeDecisao {
    return this.acrescentar({ tipo: "exclusao", motivo });
  }

  get decisoes(): ReadonlyArray<DecisaoRegistrada> {
    return this._decisoes;
  }

  get escolhas(): ReadonlyArray<MotivoDaEscolha> {
    return Object.freeze(
      this._decisoes
        .filter((decisao) => decisao.tipo === "escolha")
        .map((decisao) => decisao.motivo as MotivoDaEscolha)
    );
  }

  get exclusoes(): ReadonlyArray<MotivoDaExclusao> {
    return Object.freeze(
      this._decisoes
        .filter((decisao) => decisao.tipo === "exclusao")
        .map((decisao) => decisao.motivo as MotivoDaExclusao)
    );
  }

  /** Serialização determinística: decisões na ordem de registro. */
  serializar(): string {
    return JSON.stringify({
      casoId: this.casoId,
      decisoes: this._decisoes.map((decisao) => ({
        tipo: decisao.tipo,
        motivo: JSON.parse(decisao.motivo.serializar()) as unknown,
      })),
    });
  }
}

export function deserializarHistoricoDeDecisao(json: string): HistoricoDeDecisao {
  const parsed = JSON.parse(json) as {
    casoId: string;
    decisoes: ReadonlyArray<{ tipo: "escolha" | "exclusao"; motivo: unknown }>;
  };
  // Reconstrução por REPLAY dos registros na ordem original: o
  // histórico desserializado é uma reprodução do histórico vivido,
  // com todas as invariantes revalidadas.
  return (parsed.decisoes ?? []).reduce((historico, decisao) => {
    const motivoJson = JSON.stringify(decisao.motivo);
    if (decisao.tipo === "escolha") {
      return historico.registrarEscolha(deserializarMotivoDaEscolha(motivoJson));
    }
    if (decisao.tipo === "exclusao") {
      return historico.registrarExclusao(deserializarMotivoDaExclusao(motivoJson));
    }
    throw new Error(`HistoricoDeDecisao: tipo de decisão desconhecido "${String(decisao.tipo)}".`);
  }, HistoricoDeDecisao.vazio(parsed.casoId));
}
