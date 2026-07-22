/**
 * Justificativa de seleção (CURADORIA_MODEL.md §6): responde "por que
 * este médico foi selecionado?" com fatos verificáveis — cada fato
 * ancorado em uma evidência (ADR-031).
 *
 * Gramática restrita, validada no domínio: comparativos, superlativos
 * e linguagem de ranking são rejeitados na criação. A justificativa
 * não tem posição, destaque nem qualquer campo que diferencie um
 * médico dos demais do trio — igual dignidade por construção.
 */
export interface FatoDeSelecao {
  readonly texto: string;
  readonly evidenciaId: string;
}

const TERMOS_PROIBIDOS = [
  "melhor",
  "pior",
  "mais experiente",
  "mais qualificado",
  "excelente",
  "referencia",
  "referência",
  "top",
  "ranking",
  "nota",
  "score",
  "recomendado",
  "número 1",
  "numero 1",
  "primeiro lugar",
] as const;

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function violaGramaticaRestrita(texto: string): string | undefined {
  // Casamento por palavra inteira sobre texto normalizado (sem acentos,
  // minúsculas) — "Ortopedia" não pode disparar "top".
  const normalizado = normalizar(texto);
  return TERMOS_PROIBIDOS.find((termo) => {
    const escapado = normalizar(termo).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escapado}\\b`).test(normalizado);
  });
}

export interface JustificativaDeSelecaoProps {
  casoId: string;
  professionalId: string;
  fatos: ReadonlyArray<FatoDeSelecao>;
}

export class JustificativaDeSelecao {
  readonly casoId: string;
  readonly professionalId: string;
  private readonly _fatos: ReadonlyArray<FatoDeSelecao>;

  private constructor(
    casoId: string,
    professionalId: string,
    fatos: ReadonlyArray<FatoDeSelecao>
  ) {
    this.casoId = casoId;
    this.professionalId = professionalId;
    this._fatos = fatos;
  }

  static create(props: JustificativaDeSelecaoProps): JustificativaDeSelecao {
    const casoId = props.casoId?.trim();
    if (!casoId) {
      throw new Error("JustificativaDeSelecao: casoId é obrigatório e não pode ser vazio.");
    }
    const professionalId = props.professionalId?.trim();
    if (!professionalId) {
      throw new Error(
        "JustificativaDeSelecao: professionalId é obrigatório e não pode ser vazio."
      );
    }
    const fatos = (props.fatos ?? []).map((fato) => {
      const texto = fato.texto?.trim();
      if (!texto) {
        throw new Error("JustificativaDeSelecao: fato exige texto não vazio.");
      }
      const evidenciaId = fato.evidenciaId?.trim();
      if (!evidenciaId) {
        throw new Error(
          `JustificativaDeSelecao: todo fato exige evidência ("${texto}" está sem evidenciaId).`
        );
      }
      const termo = violaGramaticaRestrita(texto);
      if (termo) {
        throw new Error(
          `JustificativaDeSelecao: gramática restrita violada — termo proibido "${termo}" em "${texto}".`
        );
      }
      return Object.freeze({ texto, evidenciaId });
    });
    if (fatos.length === 0) {
      throw new Error("JustificativaDeSelecao: exige ao menos um fato verificável.");
    }
    return new JustificativaDeSelecao(casoId, professionalId, Object.freeze(fatos));
  }

  get fatos(): ReadonlyArray<FatoDeSelecao> {
    return this._fatos;
  }

  /** Serialização determinística: fatos na ordem de apresentação aprovada. */
  serializar(): string {
    return JSON.stringify({
      casoId: this.casoId,
      professionalId: this.professionalId,
      fatos: this._fatos,
    });
  }
}

export function deserializarJustificativaDeSelecao(
  json: string
): JustificativaDeSelecao {
  const parsed = JSON.parse(json) as JustificativaDeSelecaoProps;
  return JustificativaDeSelecao.create(parsed);
}
