export type CredentialType =
  | "specialist-title"
  | "board-certification"
  | "certification"
  | "license"
  | "membership"
  | "other";

const VALID_CREDENTIAL_TYPES: CredentialType[] = [
  "specialist-title",
  "board-certification",
  "certification",
  "license",
  "membership",
  "other",
];

export interface CredentialProps {
  id: string;
  type: CredentialType;
  title: string;
  issuer?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  credentialNumber?: string;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export class Credential {
  readonly id: string;
  readonly type: CredentialType;
  readonly title: string;
  readonly issuer?: string;
  readonly credentialNumber?: string;
  private readonly _issuedAt?: Date;
  private readonly _expiresAt?: Date;

  private constructor(props: {
    id: string;
    type: CredentialType;
    title: string;
    issuer?: string;
    credentialNumber?: string;
    issuedAt?: Date;
    expiresAt?: Date;
  }) {
    this.id = props.id;
    this.type = props.type;
    this.title = props.title;
    this.issuer = props.issuer;
    this.credentialNumber = props.credentialNumber;
    this._issuedAt = props.issuedAt;
    this._expiresAt = props.expiresAt;
  }

  get issuedAt(): Date | undefined {
    return this._issuedAt ? new Date(this._issuedAt.getTime()) : undefined;
  }

  get expiresAt(): Date | undefined {
    return this._expiresAt ? new Date(this._expiresAt.getTime()) : undefined;
  }

  static create(props: CredentialProps): Credential {
    const id = props.id?.trim();
    const title = props.title?.trim();
    const issuer = props.issuer?.trim() || undefined;
    const credentialNumber = props.credentialNumber?.trim() || undefined;

    if (!id) {
      throw new Error("Credential: id é obrigatório.");
    }
    if (!VALID_CREDENTIAL_TYPES.includes(props.type)) {
      throw new Error(`Credential: type inválido "${props.type}".`);
    }
    if (!title) {
      throw new Error("Credential: title é obrigatório.");
    }
    if (props.issuedAt !== undefined && !isValidDate(props.issuedAt)) {
      throw new Error("Credential: issuedAt precisa ser uma data válida.");
    }
    if (props.expiresAt !== undefined && !isValidDate(props.expiresAt)) {
      throw new Error("Credential: expiresAt precisa ser uma data válida.");
    }
    if (
      props.issuedAt !== undefined &&
      props.expiresAt !== undefined &&
      props.expiresAt.getTime() < props.issuedAt.getTime()
    ) {
      throw new Error("Credential: expiresAt não pode ser anterior a issuedAt.");
    }

    return new Credential({
      id,
      type: props.type,
      title,
      issuer,
      credentialNumber,
      issuedAt: props.issuedAt ? new Date(props.issuedAt.getTime()) : undefined,
      expiresAt: props.expiresAt ? new Date(props.expiresAt.getTime()) : undefined,
    });
  }
}
