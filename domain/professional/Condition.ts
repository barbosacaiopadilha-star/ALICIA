export type ConditionType =
  | "disease"
  | "syndrome"
  | "symptom"
  | "injury"
  | "body-region"
  | "care-need"
  | "other";

const VALID_CONDITION_TYPES: ConditionType[] = [
  "disease",
  "syndrome",
  "symptom",
  "injury",
  "body-region",
  "care-need",
  "other",
];

export interface ConditionProps {
  id: string;
  name: string;
  type: ConditionType;
  normalizedName?: string;
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

export class Condition {
  readonly id: string;
  readonly name: string;
  readonly type: ConditionType;
  readonly normalizedName: string;
  readonly description?: string;

  private constructor(props: {
    id: string;
    name: string;
    type: ConditionType;
    normalizedName: string;
    description?: string;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.normalizedName = props.normalizedName;
    this.description = props.description;
  }

  static create(props: ConditionProps): Condition {
    const id = props.id?.trim();
    const name = props.name?.trim();
    const description = props.description?.trim();

    if (!id) {
      throw new Error("Condition: id é obrigatório.");
    }
    if (!name) {
      throw new Error("Condition: name é obrigatório.");
    }
    if (!VALID_CONDITION_TYPES.includes(props.type)) {
      throw new Error(`Condition: type inválido "${props.type}".`);
    }
    if (props.description !== undefined && !description) {
      throw new Error("Condition: description, quando informada, não pode ser vazia.");
    }

    const normalizedSource = props.normalizedName?.trim() ? props.normalizedName : name;
    const normalizedName = normalize(normalizedSource);

    if (!normalizedName) {
      throw new Error("Condition: normalizedName resultante não pode ser vazio.");
    }

    return new Condition({
      id,
      name,
      type: props.type,
      normalizedName,
      description: description || undefined,
    });
  }
}
