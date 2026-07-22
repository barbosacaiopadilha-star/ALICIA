import {
  MotivoDaEscolha,
  deserializarMotivoDaEscolha,
} from "./MotivoDaEscolha.ts";

/**
 * Registro de decisão da curadoria (PRODUCT-WAVE-P2): o ato humano
 * final da sessão — quem escolheu, quando, quais três médicos e por
 * quê, com cada justificativa ancorada em evidências (via
 * MotivoDaEscolha, ADR-031).
 *
 * Invariantes:
 * - exatamente três médicos e exatamente três motivos, um por médico;
 * - autor obrigatório e coincidente com o autor de cada motivo;
 * - snapshot obrigatório (a decisão referencia a fotografia avaliada);
 * - trioSelecionado é CONJUNTO (normalização lexicográfica sem mérito);
 * - imutável: decisão não se edita — nova decisão é novo registro.
 */
export interface RegistroDeDecisaoProps {
  sessaoId: string;
  casoId: string;
  snapshotId: string;
  autor: string;
  motivos: ReadonlyArray<MotivoDaEscolha>;
  timestamp: Date;
}

export class RegistroDeDecisao {
  readonly sessaoId: string;
  readonly casoId: string;
  readonly snapshotId: string;
  readonly autor: string;
  private readonly _motivos: ReadonlyArray<MotivoDaEscolha>;
  private readonly _trioSelecionado: ReadonlyArray<string>;
  private readonly _timestamp: Date;

  private constructor(
    sessaoId: string,
    casoId: string,
    snapshotId: string,
    autor: string,
    motivos: ReadonlyArray<MotivoDaEscolha>,
    trioSelecionado: ReadonlyArray<string>,
    timestamp: Date
  ) {
    this.sessaoId = sessaoId;
    this.casoId = casoId;
    this.snapshotId = snapshotId;
    this.autor = autor;
    this._motivos = motivos;
    this._trioSelecionado = trioSelecionado;
    this._timestamp = new Date(timestamp.getTime());
  }

  static create(props: RegistroDeDecisaoProps): RegistroDeDecisao {
    const sessaoId = props.sessaoId?.trim();
    if (!sessaoId) {
      throw new Error("RegistroDeDecisao: sessaoId é obrigatório e não pode ser vazio.");
    }
    const casoId = props.casoId?.trim();
    if (!casoId) {
      throw new Error("RegistroDeDecisao: casoId é obrigatório e não pode ser vazio.");
    }
    const snapshotId = props.snapshotId?.trim();
    if (!snapshotId) {
      throw new Error(
        "RegistroDeDecisao: snapshot é obrigatório — snapshotId não pode ser vazio."
      );
    }
    const autor = props.autor?.trim();
    if (!autor) {
      throw new Error(
        "RegistroDeDecisao: toda decisão exige autor — autor não pode ser vazio."
      );
    }
    if (!(props.timestamp instanceof Date) || Number.isNaN(props.timestamp.getTime())) {
      throw new Error("RegistroDeDecisao: timestamp deve ser uma data válida.");
    }
    const motivos = props.motivos ?? [];
    if (motivos.length !== 3) {
      throw new Error(
        `RegistroDeDecisao: o trio tem exatamente três médicos com três motivos — foram recebidos ${motivos.length}.`
      );
    }
    const profissionais = motivos.map((motivo) => motivo.professionalId);
    if (new Set(profissionais).size !== 3) {
      throw new Error(
        "RegistroDeDecisao: um motivo para cada médico — profissional repetido no trio."
      );
    }
    for (const motivo of motivos) {
      if (motivo.casoId !== casoId) {
        throw new Error(
          `RegistroDeDecisao: motivo de "${motivo.professionalId}" pertence ao caso "${motivo.casoId}", não a "${casoId}".`
        );
      }
      if (motivo.autorId !== autor) {
        throw new Error(
          `RegistroDeDecisao: motivo de "${motivo.professionalId}" foi assinado por "${motivo.autorId}" — a decisão é de "${autor}".`
        );
      }
    }
    const trioSelecionado = [...profissionais].sort((a, b) => a.localeCompare(b));
    return new RegistroDeDecisao(
      sessaoId,
      casoId,
      snapshotId,
      autor,
      Object.freeze([...motivos]),
      Object.freeze(trioSelecionado),
      props.timestamp
    );
  }

  get motivos(): ReadonlyArray<MotivoDaEscolha> {
    return this._motivos;
  }

  /** Conjunto dos três escolhidos — ordem lexicográfica, sem mérito. */
  get trioSelecionado(): ReadonlyArray<string> {
    return this._trioSelecionado;
  }

  get timestamp(): Date {
    return new Date(this._timestamp.getTime());
  }

  motivoPara(professionalId: string): MotivoDaEscolha | undefined {
    return this._motivos.find((motivo) => motivo.professionalId === professionalId);
  }

  /** Serialização determinística: motivos na ordem de registro. */
  serializar(): string {
    return JSON.stringify({
      sessaoId: this.sessaoId,
      casoId: this.casoId,
      snapshotId: this.snapshotId,
      autor: this.autor,
      timestamp: this._timestamp.toISOString(),
      trioSelecionado: this._trioSelecionado,
      motivos: this._motivos.map((motivo) => JSON.parse(motivo.serializar()) as unknown),
    });
  }
}

export function deserializarRegistroDeDecisao(json: string): RegistroDeDecisao {
  const parsed = JSON.parse(json) as {
    sessaoId: string;
    casoId: string;
    snapshotId: string;
    autor: string;
    timestamp: string;
    motivos: ReadonlyArray<unknown>;
  };
  return RegistroDeDecisao.create({
    sessaoId: parsed.sessaoId,
    casoId: parsed.casoId,
    snapshotId: parsed.snapshotId,
    autor: parsed.autor,
    timestamp: new Date(parsed.timestamp),
    motivos: (parsed.motivos ?? []).map((motivo) =>
      deserializarMotivoDaEscolha(JSON.stringify(motivo))
    ),
  });
}
