import type { EditorialStatus } from "@/domain/professional/EditorialStatus";

export type KnowledgeClaimType =
  | "identity"
  | "registration"
  | "specialty"
  | "credential"
  | "education"
  | "experience"
  | "institution-affiliation"
  | "practice-location"
  | "capability"
  | "other";

const VALID_KNOWLEDGE_CLAIM_TYPES: KnowledgeClaimType[] = [
  "identity",
  "registration",
  "specialty",
  "credential",
  "education",
  "experience",
  "institution-affiliation",
  "practice-location",
  "capability",
  "other",
];

export interface KnowledgeClaimProps {
  id: string;
  professionalId: string;
  type: KnowledgeClaimType;
  content: string;
  evidenceIds?: readonly string[];
  verificationId?: string;
  editorialStatus: EditorialStatus;
  createdAt: Date;
  updatedAt: Date;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export class KnowledgeClaim {
  readonly id: string;
  readonly professionalId: string;
  readonly type: KnowledgeClaimType;
  readonly content: string;
  readonly evidenceIds: ReadonlyArray<string>;
  readonly verificationId?: string;
  readonly editorialStatus: EditorialStatus;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: {
    id: string;
    professionalId: string;
    type: KnowledgeClaimType;
    content: string;
    evidenceIds: string[];
    verificationId?: string;
    editorialStatus: EditorialStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.professionalId = props.professionalId;
    this.type = props.type;
    this.content = props.content;
    this.evidenceIds = Object.freeze(props.evidenceIds);
    this.verificationId = props.verificationId;
    this.editorialStatus = props.editorialStatus;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime());
  }

  static create(props: KnowledgeClaimProps): KnowledgeClaim {
    const id = props.id?.trim();
    const professionalId = props.professionalId?.trim();
    const content = props.content?.trim();
    const verificationId = props.verificationId?.trim();

    if (!id) {
      throw new Error("KnowledgeClaim: id é obrigatório.");
    }
    if (!professionalId) {
      throw new Error("KnowledgeClaim: professionalId é obrigatório.");
    }
    if (!VALID_KNOWLEDGE_CLAIM_TYPES.includes(props.type)) {
      throw new Error(`KnowledgeClaim: type inválido "${props.type}".`);
    }
    if (!content) {
      throw new Error("KnowledgeClaim: content é obrigatório e não pode ser vazio.");
    }
    if (!props.editorialStatus) {
      throw new Error("KnowledgeClaim: editorialStatus é obrigatório.");
    }
    if (props.verificationId !== undefined && !verificationId) {
      throw new Error("KnowledgeClaim: verificationId, quando informado, não pode ser vazio.");
    }
    if (!isValidDate(props.createdAt)) {
      throw new Error("KnowledgeClaim: createdAt precisa ser uma data válida.");
    }
    if (props.createdAt.getTime() > Date.now()) {
      throw new Error("KnowledgeClaim: createdAt não pode estar no futuro.");
    }
    if (!isValidDate(props.updatedAt)) {
      throw new Error("KnowledgeClaim: updatedAt precisa ser uma data válida.");
    }
    if (props.updatedAt.getTime() > Date.now()) {
      throw new Error("KnowledgeClaim: updatedAt não pode estar no futuro.");
    }
    if (props.updatedAt.getTime() < props.createdAt.getTime()) {
      throw new Error("KnowledgeClaim: updatedAt não pode anteceder createdAt.");
    }

    const evidenceIds = Array.from(
      new Set(
        (props.evidenceIds ?? [])
          .map((evidenceId) => evidenceId.trim())
          .filter((evidenceId) => evidenceId.length > 0)
      )
    );

    if (props.editorialStatus.value === "published" && evidenceIds.length === 0) {
      throw new Error(
        "KnowledgeClaim: uma afirmação publicada deve possuir ao menos um evidenceId."
      );
    }

    return new KnowledgeClaim({
      id,
      professionalId,
      type: props.type,
      content,
      evidenceIds,
      verificationId: verificationId || undefined,
      editorialStatus: props.editorialStatus,
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }
}
