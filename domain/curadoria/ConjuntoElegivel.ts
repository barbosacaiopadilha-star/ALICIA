/**
 * Conjunto elegível (CURADORIA_MODEL.md §1): resultado da filtragem de
 * um snapshot pelos critérios do caso. É um CONJUNTO — não uma lista
 * ordenada: nenhuma posição carrega mérito; a normalização
 * lexicográfica existe só para determinismo.
 *
 * Cada exclusão registra o critério excludente que a motivou
 * (auditabilidade interna, §2) — nunca exibida publicamente como
 * afirmação negativa. Imutável: o algoritmo de filtragem que o produz
 * pertence à Wave C2, não a esta unidade.
 */
export interface ExclusaoRegistrada {
  readonly professionalId: string;
  readonly criterioId: string;
}

export interface ConjuntoElegivelProps {
  casoId: string;
  snapshotId: string;
  elegiveis: ReadonlyArray<string>;
  exclusoes?: ReadonlyArray<ExclusaoRegistrada>;
}

export class ConjuntoElegivel {
  readonly casoId: string;
  readonly snapshotId: string;
  private readonly _elegiveis: ReadonlyArray<string>;
  private readonly _exclusoes: ReadonlyArray<ExclusaoRegistrada>;

  private constructor(
    casoId: string,
    snapshotId: string,
    elegiveis: ReadonlyArray<string>,
    exclusoes: ReadonlyArray<ExclusaoRegistrada>
  ) {
    this.casoId = casoId;
    this.snapshotId = snapshotId;
    this._elegiveis = elegiveis;
    this._exclusoes = exclusoes;
  }

  static create(props: ConjuntoElegivelProps): ConjuntoElegivel {
    const casoId = props.casoId?.trim();
    if (!casoId) {
      throw new Error("ConjuntoElegivel: casoId é obrigatório e não pode ser vazio.");
    }
    const snapshotId = props.snapshotId?.trim();
    if (!snapshotId) {
      throw new Error("ConjuntoElegivel: snapshotId é obrigatório e não pode ser vazio.");
    }

    const elegiveis = (props.elegiveis ?? []).map((id) => id?.trim());
    if (elegiveis.some((id) => !id)) {
      throw new Error("ConjuntoElegivel: professionalId vazio não é permitido.");
    }
    const elegiveisUnicos = Array.from(new Set(elegiveis)).sort((a, b) =>
      a.localeCompare(b)
    );

    const exclusoes = (props.exclusoes ?? []).map((exclusao) => {
      const professionalId = exclusao.professionalId?.trim();
      const criterioId = exclusao.criterioId?.trim();
      if (!professionalId || !criterioId) {
        throw new Error(
          "ConjuntoElegivel: exclusão exige professionalId e criterioId (motivo registrado)."
        );
      }
      return { professionalId, criterioId };
    });

    const excluidosSet = new Set(exclusoes.map((exclusao) => exclusao.professionalId));
    const sobreposicao = elegiveisUnicos.find((id) => excluidosSet.has(id));
    if (sobreposicao) {
      throw new Error(
        `ConjuntoElegivel: "${sobreposicao}" não pode ser elegível e excluído ao mesmo tempo.`
      );
    }

    const exclusoesOrdenadas = [...exclusoes].sort(
      (a, b) =>
        a.professionalId.localeCompare(b.professionalId) ||
        a.criterioId.localeCompare(b.criterioId)
    );

    return new ConjuntoElegivel(
      casoId,
      snapshotId,
      Object.freeze(elegiveisUnicos),
      Object.freeze(exclusoesOrdenadas.map((exclusao) => Object.freeze(exclusao)))
    );
  }

  get elegiveis(): ReadonlyArray<string> {
    return this._elegiveis;
  }

  get exclusoes(): ReadonlyArray<ExclusaoRegistrada> {
    return this._exclusoes;
  }

  contem(professionalId: string): boolean {
    return this._elegiveis.includes(professionalId);
  }

  /** Serialização determinística (conteúdo já normalizado na criação). */
  serializar(): string {
    return JSON.stringify({
      casoId: this.casoId,
      snapshotId: this.snapshotId,
      elegiveis: this._elegiveis,
      exclusoes: this._exclusoes,
    });
  }
}

export function deserializarConjuntoElegivel(json: string): ConjuntoElegivel {
  const parsed = JSON.parse(json) as ConjuntoElegivelProps;
  return ConjuntoElegivel.create(parsed);
}
