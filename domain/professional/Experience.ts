export type ExperienceType =
  | "clinical"
  | "academic"
  | "research"
  | "leadership"
  | "teaching"
  | "other";

const VALID_EXPERIENCE_TYPES: ExperienceType[] = [
  "clinical",
  "academic",
  "research",
  "leadership",
  "teaching",
  "other",
];

export interface ExperienceProps {
  id: string;
  type: ExperienceType;
  role: string;
  organizationName: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  description?: string;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export class Experience {
  readonly id: string;
  readonly type: ExperienceType;
  readonly role: string;
  readonly organizationName: string;
  readonly current?: boolean;
  readonly description?: string;
  private readonly _startDate?: Date;
  private readonly _endDate?: Date;

  private constructor(props: {
    id: string;
    type: ExperienceType;
    role: string;
    organizationName: string;
    startDate?: Date;
    endDate?: Date;
    current?: boolean;
    description?: string;
  }) {
    this.id = props.id;
    this.type = props.type;
    this.role = props.role;
    this.organizationName = props.organizationName;
    this.current = props.current;
    this.description = props.description;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
  }

  get startDate(): Date | undefined {
    return this._startDate ? new Date(this._startDate.getTime()) : undefined;
  }

  get endDate(): Date | undefined {
    return this._endDate ? new Date(this._endDate.getTime()) : undefined;
  }

  static create(props: ExperienceProps): Experience {
    const id = props.id?.trim();
    const role = props.role?.trim();
    const organizationName = props.organizationName?.trim();
    const description = props.description?.trim();

    if (!id) {
      throw new Error("Experience: id é obrigatório.");
    }
    if (!VALID_EXPERIENCE_TYPES.includes(props.type)) {
      throw new Error(`Experience: type inválido "${props.type}".`);
    }
    if (!role) {
      throw new Error("Experience: role é obrigatório.");
    }
    if (!organizationName) {
      throw new Error("Experience: organizationName é obrigatório.");
    }
    if (props.startDate !== undefined && !isValidDate(props.startDate)) {
      throw new Error("Experience: startDate precisa ser uma data válida.");
    }
    if (props.endDate !== undefined && !isValidDate(props.endDate)) {
      throw new Error("Experience: endDate precisa ser uma data válida.");
    }
    if (
      props.startDate !== undefined &&
      props.endDate !== undefined &&
      props.endDate.getTime() < props.startDate.getTime()
    ) {
      throw new Error("Experience: endDate não pode ser anterior a startDate.");
    }
    if (props.current === true && props.endDate !== undefined) {
      throw new Error("Experience: endDate não pode estar preenchida quando current é true.");
    }
    if (props.description !== undefined && !description) {
      throw new Error("Experience: description, quando informada, não pode ser vazia.");
    }

    return new Experience({
      id,
      type: props.type,
      role,
      organizationName,
      startDate: props.startDate ? new Date(props.startDate.getTime()) : undefined,
      endDate: props.endDate ? new Date(props.endDate.getTime()) : undefined,
      current: props.current,
      description: description || undefined,
    });
  }
}
