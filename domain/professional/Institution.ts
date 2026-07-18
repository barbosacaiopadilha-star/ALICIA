export type InstitutionType =
  | "hospital"
  | "clinic"
  | "university"
  | "research-center"
  | "professional-association"
  | "public-agency"
  | "other";

const VALID_INSTITUTION_TYPES: InstitutionType[] = [
  "hospital",
  "clinic",
  "university",
  "research-center",
  "professional-association",
  "public-agency",
  "other",
];

const ALLOWED_URL_PROTOCOLS = ["http:", "https:"];

export interface InstitutionProps {
  id: string;
  name: string;
  type: InstitutionType;
  legalName?: string;
  websiteUrl?: string;
}

function normalizeWebsiteUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Institution: websiteUrl deve ser uma URL válida.");
  }
  if (!ALLOWED_URL_PROTOCOLS.includes(url.protocol)) {
    throw new Error("Institution: websiteUrl deve utilizar protocolo http ou https.");
  }
  return url.toString();
}

export class Institution {
  readonly id: string;
  readonly name: string;
  readonly type: InstitutionType;
  readonly legalName?: string;
  readonly websiteUrl?: string;

  private constructor(props: {
    id: string;
    name: string;
    type: InstitutionType;
    legalName?: string;
    websiteUrl?: string;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.legalName = props.legalName;
    this.websiteUrl = props.websiteUrl;
  }

  static create(props: InstitutionProps): Institution {
    const id = props.id?.trim();
    const name = props.name?.trim();
    const legalName = props.legalName?.trim();

    if (!id) {
      throw new Error("Institution: id é obrigatório.");
    }
    if (!name) {
      throw new Error("Institution: name é obrigatório.");
    }
    if (!VALID_INSTITUTION_TYPES.includes(props.type)) {
      throw new Error(`Institution: type inválido "${props.type}".`);
    }
    if (props.legalName !== undefined && !legalName) {
      throw new Error("Institution: legalName, quando informado, não pode ser vazio.");
    }

    const websiteUrl =
      props.websiteUrl !== undefined ? normalizeWebsiteUrl(props.websiteUrl.trim()) : undefined;

    return new Institution({
      id,
      name,
      type: props.type,
      legalName: legalName || undefined,
      websiteUrl,
    });
  }
}
