/**
 * Referência de evidência que sustenta um fato de curadoria
 * (ADR-031: fonte de primeira classe; CURADORIA_MODEL.md §3).
 *
 * A lista de tipos é fechada e deliberadamente NÃO contém opinião,
 * avaliação de paciente, reputação ou indicação — opinião nunca é
 * evidência, nem como desempate (protegido por teste).
 */
export const TIPOS_DE_EVIDENCIA = [
  "registro_conselho",
  "diploma",
  "certificado_de_programa",
  "publicacao",
  "declaracao_institucional",
  "curriculo_publico",
] as const;

export type TipoDeEvidencia = (typeof TIPOS_DE_EVIDENCIA)[number];

export interface EvidenceReferenceProps {
  id: string;
  tipo: TipoDeEvidencia;
  /** Referência verificável (nº de registro, DOI, protocolo) — nunca inventada. */
  referencia: string;
  /** Data de captura (para revalidação futura — ADR-031). */
  capturadaEm?: Date;
}

export class EvidenceReference {
  readonly id: string;
  readonly tipo: TipoDeEvidencia;
  readonly referencia: string;
  readonly capturadaEm?: Date;

  private constructor(id: string, tipo: TipoDeEvidencia, referencia: string, capturadaEm?: Date) {
    this.id = id;
    this.tipo = tipo;
    this.referencia = referencia;
    this.capturadaEm = capturadaEm;
  }

  static create(props: EvidenceReferenceProps): EvidenceReference {
    const id = props.id?.trim();
    if (!id) {
      throw new Error("EvidenceReference: id é obrigatório e não pode ser vazio.");
    }
    if (!TIPOS_DE_EVIDENCIA.includes(props.tipo)) {
      throw new Error(`EvidenceReference: tipo desconhecido "${props.tipo}".`);
    }
    const referencia = props.referencia?.trim();
    if (!referencia) {
      throw new Error("EvidenceReference: referencia é obrigatória e não pode ser vazia.");
    }
    const capturadaEm = props.capturadaEm
      ? new Date(props.capturadaEm.getTime())
      : undefined;
    return new EvidenceReference(id, props.tipo, referencia, capturadaEm);
  }

  equals(other: EvidenceReference): boolean {
    return this.id === other.id;
  }

  /** Serialização determinística: chaves em ordem fixa. */
  serializar(): string {
    return JSON.stringify({
      id: this.id,
      tipo: this.tipo,
      referencia: this.referencia,
      capturadaEm: this.capturadaEm ? this.capturadaEm.toISOString() : null,
    });
  }
}

export function deserializarEvidenceReference(json: string): EvidenceReference {
  const parsed = JSON.parse(json) as {
    id: string;
    tipo: TipoDeEvidencia;
    referencia: string;
    capturadaEm: string | null;
  };
  return EvidenceReference.create({
    id: parsed.id,
    tipo: parsed.tipo,
    referencia: parsed.referencia,
    capturadaEm: parsed.capturadaEm ? new Date(parsed.capturadaEm) : undefined,
  });
}
