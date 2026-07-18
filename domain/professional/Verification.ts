export type VerificationResult =
  | "verified"
  | "partially-verified"
  | "not-verified"
  | "inconclusive";

const VALID_VERIFICATION_RESULTS: VerificationResult[] = [
  "verified",
  "partially-verified",
  "not-verified",
  "inconclusive",
];

export type VerificationMethod =
  | "manual-review"
  | "official-source-check"
  | "document-check"
  | "interview"
  | "automated-check"
  | "other";

const VALID_VERIFICATION_METHODS: VerificationMethod[] = [
  "manual-review",
  "official-source-check",
  "document-check",
  "interview",
  "automated-check",
  "other",
];

export interface VerificationProps {
  id: string;
  evidenceId: string;
  result: VerificationResult;
  method: VerificationMethod;
  verifiedAt: Date;
  verifierId?: string;
  notes?: string;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export class Verification {
  readonly id: string;
  readonly evidenceId: string;
  readonly result: VerificationResult;
  readonly method: VerificationMethod;
  readonly verifierId?: string;
  readonly notes?: string;
  private readonly _verifiedAt: Date;

  private constructor(props: {
    id: string;
    evidenceId: string;
    result: VerificationResult;
    method: VerificationMethod;
    verifiedAt: Date;
    verifierId?: string;
    notes?: string;
  }) {
    this.id = props.id;
    this.evidenceId = props.evidenceId;
    this.result = props.result;
    this.method = props.method;
    this.verifierId = props.verifierId;
    this.notes = props.notes;
    this._verifiedAt = props.verifiedAt;
  }

  get verifiedAt(): Date {
    return new Date(this._verifiedAt.getTime());
  }

  static create(props: VerificationProps): Verification {
    const id = props.id?.trim();
    const evidenceId = props.evidenceId?.trim();
    const verifierId = props.verifierId?.trim();
    const notes = props.notes?.trim();

    if (!id) {
      throw new Error("Verification: id é obrigatório.");
    }
    if (!evidenceId) {
      throw new Error("Verification: evidenceId é obrigatório.");
    }
    if (!VALID_VERIFICATION_RESULTS.includes(props.result)) {
      throw new Error(`Verification: result inválido "${props.result}".`);
    }
    if (!VALID_VERIFICATION_METHODS.includes(props.method)) {
      throw new Error(`Verification: method inválido "${props.method}".`);
    }
    if (!isValidDate(props.verifiedAt)) {
      throw new Error("Verification: verifiedAt precisa ser uma data válida.");
    }
    if (props.verifiedAt.getTime() > Date.now()) {
      throw new Error("Verification: verifiedAt não pode estar no futuro.");
    }
    if (props.verifierId !== undefined && !verifierId) {
      throw new Error("Verification: verifierId, quando informado, não pode ser vazio.");
    }
    if (props.notes !== undefined && !notes) {
      throw new Error("Verification: notes, quando informada, não pode ser vazia.");
    }

    return new Verification({
      id,
      evidenceId,
      result: props.result,
      method: props.method,
      verifiedAt: new Date(props.verifiedAt.getTime()),
      verifierId: verifierId || undefined,
      notes: notes || undefined,
    });
  }
}
