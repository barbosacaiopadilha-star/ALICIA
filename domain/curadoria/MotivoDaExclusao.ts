import { violaGramaticaRestrita } from "./JustificativaDeSelecao.ts";

/**
 * Motivo da exclusão (Epic C3): registro auditável do ato HUMANO de
 * excluir um profissional durante a curadoria — distinto das exclusões
 * automáticas do ConjuntoElegivel (Epic C2), que carregam apenas o
 * criterioId.
 *
 * Registro interno de auditoria, nunca afirmação pública negativa
 * (ADR-032). Invariantes:
 * - toda exclusão tem autor (autorId obrigatório);
 * - toda exclusão aponta para evidências (ao menos uma);
 * - criterioId é opcional e vincula a exclusão a um critério do caso
 *   quando ele a motivou;
 * - gramática restrita: sem linguagem de ranking ou demérito comparativo;
 * - imutável após criado — corrigir é registrar novo ato, nunca editar.
 */
export interface MotivoDaExclusaoProps {
  casoId: string;
  professionalId: string;
  texto: string;
  evidenciaIds: ReadonlyArray<string>;
  autorId: string;
  registradoEm: Date;
  criterioId?: string;
}

export class MotivoDaExclusao {
  readonly casoId: string;
  readonly professionalId: string;
  readonly texto: string;
  readonly autorId: string;
  readonly criterioId?: string;
  private readonly _evidenciaIds: ReadonlyArray<string>;
  private readonly _registradoEm: Date;

  private constructor(
    casoId: string,
    professionalId: string,
    texto: string,
    autorId: string,
    evidenciaIds: ReadonlyArray<string>,
    registradoEm: Date,
    criterioId?: string
  ) {
    this.casoId = casoId;
    this.professionalId = professionalId;
    this.texto = texto;
    this.autorId = autorId;
    this.criterioId = criterioId;
    this._evidenciaIds = evidenciaIds;
    this._registradoEm = new Date(registradoEm.getTime());
  }

  static create(props: MotivoDaExclusaoProps): MotivoDaExclusao {
    const casoId = props.casoId?.trim();
    if (!casoId) {
      throw new Error("MotivoDaExclusao: casoId é obrigatório e não pode ser vazio.");
    }
    const professionalId = props.professionalId?.trim();
    if (!professionalId) {
      throw new Error(
        "MotivoDaExclusao: professionalId é obrigatório e não pode ser vazio."
      );
    }
    const autorId = props.autorId?.trim();
    if (!autorId) {
      throw new Error(
        "MotivoDaExclusao: toda exclusão exige autor — autorId não pode ser vazio."
      );
    }
    const texto = props.texto?.trim();
    if (!texto) {
      throw new Error("MotivoDaExclusao: texto do motivo não pode ser vazio.");
    }
    const termo = violaGramaticaRestrita(texto);
    if (termo) {
      throw new Error(
        `MotivoDaExclusao: gramática restrita violada — termo proibido "${termo}" em "${texto}".`
      );
    }
    const evidenciaIds = (props.evidenciaIds ?? []).map((id) => id?.trim());
    if (evidenciaIds.length === 0 || evidenciaIds.some((id) => !id)) {
      throw new Error(
        "MotivoDaExclusao: toda exclusão exige ao menos uma evidência (evidenciaIds)."
      );
    }
    const evidenciasUnicas = Array.from(new Set(evidenciaIds)).sort((a, b) =>
      a.localeCompare(b)
    );
    if (!(props.registradoEm instanceof Date) || Number.isNaN(props.registradoEm.getTime())) {
      throw new Error("MotivoDaExclusao: registradoEm deve ser uma data válida.");
    }
    const criterioId = props.criterioId?.trim();
    if (props.criterioId !== undefined && !criterioId) {
      throw new Error(
        "MotivoDaExclusao: criterioId, quando informado, não pode ser vazio."
      );
    }
    return new MotivoDaExclusao(
      casoId,
      professionalId,
      texto,
      autorId,
      Object.freeze(evidenciasUnicas),
      props.registradoEm,
      criterioId
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
      ...(this.criterioId ? { criterioId: this.criterioId } : {}),
    });
  }
}

export function deserializarMotivoDaExclusao(json: string): MotivoDaExclusao {
  const parsed = JSON.parse(json) as Omit<MotivoDaExclusaoProps, "registradoEm"> & {
    registradoEm: string;
  };
  return MotivoDaExclusao.create({
    ...parsed,
    registradoEm: new Date(parsed.registradoEm),
  });
}
