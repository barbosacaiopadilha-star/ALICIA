export type ProfessionalPublicBiographyStatus = "draft" | "in_review" | "published" | "archived";

const VALID_STATUSES: ProfessionalPublicBiographyStatus[] = [
  "draft",
  "in_review",
  "published",
  "archived",
];

export interface ProfessionalPublicBiographyProps {
  readonly id: string;
  readonly professionalId: string;
  readonly text: string;
  readonly status: ProfessionalPublicBiographyStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly authorId?: string;
  readonly reviewedAt?: Date;
  readonly reviewedBy?: string;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export class ProfessionalPublicBiography {
  readonly id: string;
  readonly professionalId: string;
  readonly text: string;
  readonly status: ProfessionalPublicBiographyStatus;
  readonly authorId?: string;
  readonly reviewedBy?: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _reviewedAt?: Date;

  private constructor(props: {
    id: string;
    professionalId: string;
    text: string;
    status: ProfessionalPublicBiographyStatus;
    createdAt: Date;
    updatedAt: Date;
    authorId?: string;
    reviewedAt?: Date;
    reviewedBy?: string;
  }) {
    this.id = props.id;
    this.professionalId = props.professionalId;
    this.text = props.text;
    this.status = props.status;
    this.authorId = props.authorId;
    this.reviewedBy = props.reviewedBy;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._reviewedAt = props.reviewedAt;
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime());
  }

  get reviewedAt(): Date | undefined {
    return this._reviewedAt ? new Date(this._reviewedAt.getTime()) : undefined;
  }

  static create(props: ProfessionalPublicBiographyProps): ProfessionalPublicBiography {
    const id = props.id?.trim();
    const professionalId = props.professionalId?.trim();
    const text = props.text?.trim();
    const authorId = props.authorId?.trim();
    const reviewedBy = props.reviewedBy?.trim();

    if (!id) {
      throw new Error("ProfessionalPublicBiography id is required.");
    }
    if (!professionalId) {
      throw new Error("ProfessionalPublicBiography professionalId is required.");
    }
    if (!text) {
      throw new Error("ProfessionalPublicBiography text is required.");
    }
    if (!VALID_STATUSES.includes(props.status)) {
      throw new Error("ProfessionalPublicBiography status is invalid.");
    }
    if (!isValidDate(props.createdAt)) {
      throw new Error("ProfessionalPublicBiography createdAt is invalid.");
    }
    if (!isValidDate(props.updatedAt)) {
      throw new Error("ProfessionalPublicBiography updatedAt is invalid.");
    }
    if (props.updatedAt.getTime() < props.createdAt.getTime()) {
      throw new Error("ProfessionalPublicBiography updatedAt cannot be before createdAt.");
    }
    if (props.authorId !== undefined && !authorId) {
      throw new Error("ProfessionalPublicBiography authorId cannot be empty.");
    }
    if (props.reviewedBy !== undefined && !reviewedBy) {
      throw new Error("ProfessionalPublicBiography reviewedBy cannot be empty.");
    }
    if (props.reviewedAt !== undefined && !isValidDate(props.reviewedAt)) {
      throw new Error("ProfessionalPublicBiography reviewedAt is invalid.");
    }
    if (props.status === "published") {
      if (props.reviewedAt === undefined) {
        throw new Error("ProfessionalPublicBiography published biography requires reviewedAt.");
      }
      if (!reviewedBy) {
        throw new Error("ProfessionalPublicBiography published biography requires reviewedBy.");
      }
    }

    return new ProfessionalPublicBiography({
      id,
      professionalId,
      text,
      status: props.status,
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
      authorId: authorId || undefined,
      reviewedAt: props.reviewedAt ? new Date(props.reviewedAt.getTime()) : undefined,
      reviewedBy: reviewedBy || undefined,
    });
  }
}
