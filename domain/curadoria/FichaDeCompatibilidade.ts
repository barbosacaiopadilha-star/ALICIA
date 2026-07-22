/**
 * Ficha de compatibilidade (CURADORIA_MODEL.md §4): matriz categórica
 * critério → resultado, de uso EXCLUSIVAMENTE interno do curador.
 *
 * Proibido por construção (decisão nº 2 do Release Book; protegido por
 * teste): somar células, atribuir pesos, produzir nota ou ordenar
 * fichas. Duas fichas diferentes são perfis diferentes — nunca
 * "maior/menor". Célula `indeterminado` nunca é tratada como falha.
 */
export const RESULTADOS_DE_COMPATIBILIDADE = [
  "atende",
  "nao_atende",
  "indeterminado",
] as const;

export type ResultadoDeCompatibilidade =
  (typeof RESULTADOS_DE_COMPATIBILIDADE)[number];

export interface CelulaDeCompatibilidade {
  readonly criterioId: string;
  readonly resultado: ResultadoDeCompatibilidade;
  /** Evidências que sustentam o resultado (ids de EvidenceReference). */
  readonly evidenciaIds: ReadonlyArray<string>;
}

export interface FichaDeCompatibilidadeProps {
  casoId: string;
  professionalId: string;
  celulas: ReadonlyArray<CelulaDeCompatibilidade>;
}

export class FichaDeCompatibilidade {
  readonly casoId: string;
  readonly professionalId: string;
  private readonly _celulas: ReadonlyArray<CelulaDeCompatibilidade>;

  private constructor(
    casoId: string,
    professionalId: string,
    celulas: ReadonlyArray<CelulaDeCompatibilidade>
  ) {
    this.casoId = casoId;
    this.professionalId = professionalId;
    this._celulas = celulas;
  }

  static create(props: FichaDeCompatibilidadeProps): FichaDeCompatibilidade {
    const casoId = props.casoId?.trim();
    if (!casoId) {
      throw new Error("FichaDeCompatibilidade: casoId é obrigatório e não pode ser vazio.");
    }
    const professionalId = props.professionalId?.trim();
    if (!professionalId) {
      throw new Error(
        "FichaDeCompatibilidade: professionalId é obrigatório e não pode ser vazio."
      );
    }

    const vistos = new Set<string>();
    const celulas = (props.celulas ?? []).map((celula) => {
      const criterioId = celula.criterioId?.trim();
      if (!criterioId) {
        throw new Error("FichaDeCompatibilidade: célula exige criterioId.");
      }
      if (vistos.has(criterioId)) {
        throw new Error(
          `FichaDeCompatibilidade: célula duplicada para o critério "${criterioId}".`
        );
      }
      vistos.add(criterioId);
      if (!RESULTADOS_DE_COMPATIBILIDADE.includes(celula.resultado)) {
        throw new Error(
          `FichaDeCompatibilidade: resultado desconhecido "${celula.resultado}".`
        );
      }
      const evidenciaIds = (celula.evidenciaIds ?? []).map((id) => id?.trim());
      if (evidenciaIds.some((id) => !id)) {
        throw new Error("FichaDeCompatibilidade: evidenciaId vazio não é permitido.");
      }
      return Object.freeze({
        criterioId,
        resultado: celula.resultado,
        evidenciaIds: Object.freeze(
          Array.from(new Set(evidenciaIds)).sort((a, b) => a.localeCompare(b))
        ),
      });
    });

    const ordenadas = [...celulas].sort((a, b) =>
      a.criterioId.localeCompare(b.criterioId)
    );

    return new FichaDeCompatibilidade(casoId, professionalId, Object.freeze(ordenadas));
  }

  get celulas(): ReadonlyArray<CelulaDeCompatibilidade> {
    return this._celulas;
  }

  resultadoPara(criterioId: string): ResultadoDeCompatibilidade | undefined {
    return this._celulas.find((celula) => celula.criterioId === criterioId)?.resultado;
  }

  /** Serialização determinística — e integralmente categórica: sem números. */
  serializar(): string {
    return JSON.stringify({
      casoId: this.casoId,
      professionalId: this.professionalId,
      celulas: this._celulas,
    });
  }
}

export function deserializarFichaDeCompatibilidade(
  json: string
): FichaDeCompatibilidade {
  const parsed = JSON.parse(json) as FichaDeCompatibilidadeProps;
  return FichaDeCompatibilidade.create(parsed);
}
