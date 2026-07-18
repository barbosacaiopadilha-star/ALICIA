export type EvidenceType =
  | "primary"
  | "secondary"
  | "self-reported"
  | "observational"
  | "documentary"
  | "other";

const VALID_EVIDENCE_TYPES: EvidenceType[] = [
  "primary",
  "secondary",
  "self-reported",
  "observational",
  "documentary",
  "other",
];

export interface EvidenceProps {
  id: string;
  sourceId: string;
  type: EvidenceType;
  claim: string;
  excerpt?: string;
  observedAt?: Date;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export class Evidence {
  readonly id: string;
  readonly sourceId: string;
  readonly type: EvidenceType;
  readonly claim: string;
  readonly excerpt?: string;
  private readonly _observedAt?: Date;

  private constructor(props: {
    id: string;
    sourceId: string;
    type: EvidenceType;
    claim: string;
    excerpt?: string;
    observedAt?: Date;
  }) {
    this.id = props.id;
    this.sourceId = props.sourceId;
    this.type = props.type;
    this.claim = props.claim;
    this.excerpt = props.excerpt;
    this._observedAt = props.observedAt;
  }

  get observedAt(): Date | undefined {
    return this._observedAt ? new Date(this._observedAt.getTime()) : undefined;
  }

  static create(props: EvidenceProps): Evidence {
    const id = props.id?.trim();
    const sourceId = props.sourceId?.trim();
    const claim = props.claim?.trim();
    const excerpt = props.excerpt?.trim();

    if (!id) {
      throw new Error("Evidence: id é obrigatório.");
    }
    if (!sourceId) {
      throw new Error("Evidence: sourceId é obrigatório.");
    }
    if (!VALID_EVIDENCE_TYPES.includes(props.type)) {
      throw new Error(`Evidence: type inválido "${props.type}".`);
    }
    if (!claim) {
      throw new Error("Evidence: claim é obrigatório.");
    }
    if (props.excerpt !== undefined && !excerpt) {
      throw new Error("Evidence: excerpt, quando informado, não pode ser vazio.");
    }
    if (props.observedAt !== undefined) {
      if (!isValidDate(props.observedAt)) {
        throw new Error("Evidence: observedAt precisa ser uma data válida.");
      }
      if (props.observedAt.getTime() > Date.now()) {
        throw new Error("Evidence: observedAt não pode estar no futuro.");
      }
    }

    return new Evidence({
      id,
      sourceId,
      type: props.type,
      claim,
      excerpt: excerpt || undefined,
      observedAt: props.observedAt ? new Date(props.observedAt.getTime()) : undefined,
    });
  }
}
