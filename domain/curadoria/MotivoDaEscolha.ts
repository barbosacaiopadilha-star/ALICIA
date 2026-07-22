import { violaGramaticaRestrita } from "./JustificativaDeSelecao.ts";

/**
 * Motivo da escolha (Epic C3): registro auditável do ato HUMANO de
 * escolher um profissional dentro do conjunto elegível. Não é
 * recomendação do sistema — o sistema nunca escolhe.
 *
 * Invariantes:
 * - toda escolha tem autor (autorId obrigatório);
 * - toda escolha aponta para evidências (ao menos uma);
 * - gramática restrita: comparativos, superlativos e linguagem de
 *   ranking são rejeitados na criação;
 * - imutável após criado — corrigir é registrar novo ato, nunca editar.
 */
export interface MotivoDaEscolhaProps {
  casoId: string;
  professionalId: string;
  texto: string;
  evidenciaIds: ReadonlyArray<string>;
  autorId: string;
  registradoEm: Date;
}

export class MotivoDaEscolha {
  readonly casoId: string;
  readonly professionalId: string;
  readonly texto: string;
  readonly autorId: string;
  private readonly _evidenciaIds: ReadonlyArray<string>;
  private readonly _registradoEm: Date;

  private constructor(
    casoId: string,
    professionalId: string,
    texto: string,
    autorId: string,
    evidenciaIds: ReadonlyArray<string>,
    registradoEm: Date
  ) {
    this.casoId = casoId;
    this.professionalId = professionalId;
    this.texto = texto;
    this.autorId = autorId;
    this._evidenciaIds = evidenciaIds;
    this._registradoEm = new Date(registradoEm.getTime());
  }

  static create(props: MotivoDaEscolhaProps): MotivoDaEscolha {
    const casoId = props.casoId?.trim();
    if (!casoId) {
      throw new Error("MotivoDaEscolha: casoId é obrigatório e não pode ser vazio.");
    }
    const professionalId = props.professionalId?.trim();
    if (!professionalId) {
      throw new Error(
        "MotivoDaEscolha: professionalId é obrigatório e não pode ser vazio."
      );
    }
    const autorId = props.autorId?.trim();
    if (!autorId) {
      throw new Error(
        "MotivoDaEscolha: toda escolha exige autor — autorId não pode ser vazio."
      );
    }
    const texto = props.texto?.trim();
    if (!texto) {
      throw new Error("MotivoDaEscolha: texto do motivo não pode ser vazio.");
    }
    const termo = violaGramaticaRestrita(texto);
    if (termo) {
      throw new Error(
        `MotivoDaEscolha: gramática restrita violada — termo proibido "${termo}" em "${texto}".`
      );
    }
    const evidenciaIds = (props.evidenciaIds ?? []).map((id) => id?.trim());
    if (evidenciaIds.length === 0 || evidenciaIds.some((id) => !id)) {
      throw new Error(
        "MotivoDaEscolha: toda escolha exige ao menos uma evidência (evidenciaIds)."
      );
    }
    const evidenciasUnicas = Array.from(new Set(evidenciaIds)).sort((a, b) =>
      a.localeCompare(b)
    );
    if (!(props.registradoEm instanceof Date) || Number.isNaN(props.registradoEm.getTime())) {
      throw new Error("MotivoDaEscolha: registradoEm deve ser uma data válida.");
    }
    return new MotivoDaEscolha(
      casoId,
      professionalId,
      texto,
      autorId,
      Object.freeze(evidenciasUnicas),
      props.registradoEm
    );
  }

  get evidenciaIds(): ReadonlyArray<string> {
    return this._evidenciaIds;
  }

  get registradoEm(): Date {
    return new Date(this._registradoEm.getTime());
  }

  /** Serialização determinística (evidências já normalizadas na criação). */
  serializar(): string {
    return JSON.stringify({
      casoId: this.casoId,
      professionalId: this.professionalId,
      texto: this.texto,
      autorId: this.autorId,
      evidenciaIds: this._evidenciaIds,
      registradoEm: this._registradoEm.toISOString(),
    });
  }
}

export function deserializarMotivoDaEscolha(json: string): MotivoDaEscolha {
  const parsed = JSON.parse(json) as Omit<MotivoDaEscolhaProps, "registradoEm"> & {
    registradoEm: string;
  };
  return MotivoDaEscolha.create({
    ...parsed,
    registradoEm: new Date(parsed.registradoEm),
  });
}
