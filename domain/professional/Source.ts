export type SourceType =
  | "official-registry"
  | "institutional-website"
  | "professional-profile"
  | "curriculum"
  | "scientific-publication"
  | "document"
  | "interview"
  | "other";

const VALID_SOURCE_TYPES: SourceType[] = [
  "official-registry",
  "institutional-website",
  "professional-profile",
  "curriculum",
  "scientific-publication",
  "document",
  "interview",
  "other",
];

const ALLOWED_URL_PROTOCOLS = ["http:", "https:"];

export interface SourceProps {
  id: string;
  type: SourceType;
  title: string;
  url?: string;
  publisher?: string;
  accessedAt?: Date;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function normalizeUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Source: url deve ser uma URL válida.");
  }
  if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
    throw new Error("Source: url deve utilizar protocolo http ou https.");
  }
  return parsed.toString();
}

export class Source {
  readonly id: string;
  readonly type: SourceType;
  readonly title: string;
  readonly url?: string;
  readonly publisher?: string;
  private readonly _accessedAt?: Date;

  private constructor(props: {
    id: string;
    type: SourceType;
    title: string;
    url?: string;
    publisher?: string;
    accessedAt?: Date;
  }) {
    this.id = props.id;
    this.type = props.type;
    this.title = props.title;
    this.url = props.url;
    this.publisher = props.publisher;
    this._accessedAt = props.accessedAt;
  }

  get accessedAt(): Date | undefined {
    return this._accessedAt ? new Date(this._accessedAt.getTime()) : undefined;
  }

  static create(props: SourceProps): Source {
    const id = props.id?.trim();
    const title = props.title?.trim();
    const publisher = props.publisher?.trim();

    if (!id) {
      throw new Error("Source: id é obrigatório.");
    }
    if (!VALID_SOURCE_TYPES.includes(props.type)) {
      throw new Error(`Source: type inválido "${props.type}".`);
    }
    if (!title) {
      throw new Error("Source: title é obrigatório.");
    }
    if (props.publisher !== undefined && !publisher) {
      throw new Error("Source: publisher, quando informado, não pode ser vazio.");
    }

    const url = props.url !== undefined ? normalizeUrl(props.url.trim()) : undefined;

    if (props.accessedAt !== undefined) {
      if (!isValidDate(props.accessedAt)) {
        throw new Error("Source: accessedAt precisa ser uma data válida.");
      }
      if (props.accessedAt.getTime() > Date.now()) {
        throw new Error("Source: accessedAt não pode estar no futuro.");
      }
    }

    return new Source({
      id,
      type: props.type,
      title,
      url,
      publisher: publisher || undefined,
      accessedAt: props.accessedAt ? new Date(props.accessedAt.getTime()) : undefined,
    });
  }
}
