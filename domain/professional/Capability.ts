export type CapabilityType =
  | "diagnostic"
  | "clinical-management"
  | "procedure"
  | "surgery"
  | "rehabilitation"
  | "care-delivery"
  | "second-opinion"
  | "other";

const VALID_CAPABILITY_TYPES: CapabilityType[] = [
  "diagnostic",
  "clinical-management",
  "procedure",
  "surgery",
  "rehabilitation",
  "care-delivery",
  "second-opinion",
  "other",
];

export type CapabilityLevel = "foundational" | "advanced" | "expert";

const VALID_CAPABILITY_LEVELS: CapabilityLevel[] = ["foundational", "advanced", "expert"];

export interface CapabilityProps {
  id: string;
  name: string;
  type: CapabilityType;
  normalizedName?: string;
  level?: CapabilityLevel;
  description?: string;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export class Capability {
  readonly id: string;
  readonly name: string;
  readonly type: CapabilityType;
  readonly normalizedName: string;
  readonly level?: CapabilityLevel;
  readonly description?: string;

  private constructor(props: {
    id: string;
    name: string;
    type: CapabilityType;
    normalizedName: string;
    level?: CapabilityLevel;
    description?: string;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.normalizedName = props.normalizedName;
    this.level = props.level;
    this.description = props.description;
  }

  static create(props: CapabilityProps): Capability {
    const id = props.id?.trim();
    const name = props.name?.trim();
    const description = props.description?.trim();

    if (!id) {
      throw new Error("Capability: id é obrigatório.");
    }
    if (!name) {
      throw new Error("Capability: name é obrigatório.");
    }
    if (!VALID_CAPABILITY_TYPES.includes(props.type)) {
      throw new Error(`Capability: type inválido "${props.type}".`);
    }
    if (props.level !== undefined && !VALID_CAPABILITY_LEVELS.includes(props.level)) {
      throw new Error(`Capability: level inválido "${props.level}".`);
    }
    if (props.description !== undefined && !description) {
      throw new Error("Capability: description, quando informada, não pode ser vazia.");
    }

    const normalizedSource = props.normalizedName?.trim() ? props.normalizedName : name;
    const normalizedName = normalize(normalizedSource);

    if (!normalizedName) {
      throw new Error("Capability: normalizedName resultante não pode ser vazio.");
    }

    return new Capability({
      id,
      name,
      type: props.type,
      normalizedName,
      level: props.level,
      description: description || undefined,
    });
  }
}
