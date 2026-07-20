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
  type?: ExperienceType;
  role: string;
  organizationName: string;
  startYear?: number;
  endYear?: number;
  current?: boolean;
  description?: string;
}

function isValidYear(year: number): boolean {
  if (!Number.isInteger(year)) {
    return false;
  }
  if (year < 1000 || year > 9999) {
    return false;
  }
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear + 1) {
    return false;
  }
  return true;
}

export class Experience {
  readonly id: string;
  readonly type?: ExperienceType;
  readonly role: string;
  readonly organizationName: string;
  readonly startYear?: number;
  readonly endYear?: number;
  readonly current?: boolean;
  readonly description?: string;

  private constructor(props: {
    id: string;
    type?: ExperienceType;
    role: string;
    organizationName: string;
    startYear?: number;
    endYear?: number;
    current?: boolean;
    description?: string;
  }) {
    this.id = props.id;
    this.type = props.type;
    this.role = props.role;
    this.organizationName = props.organizationName;
    this.startYear = props.startYear;
    this.endYear = props.endYear;
    this.current = props.current;
    this.description = props.description;
  }

  static create(props: ExperienceProps): Experience {
    const id = props.id?.trim();
    const role = props.role?.trim();
    const organizationName = props.organizationName?.trim();
    const description = props.description?.trim();

    if (!id) {
      throw new Error("Experience: id é obrigatório.");
    }
    if (props.type !== undefined && !VALID_EXPERIENCE_TYPES.includes(props.type)) {
      throw new Error(`Experience: type inválido "${props.type}".`);
    }
    if (!role) {
      throw new Error("Experience: role é obrigatório.");
    }
    if (!organizationName) {
      throw new Error("Experience: organizationName é obrigatório.");
    }
    if (props.startYear !== undefined && !isValidYear(props.startYear)) {
      throw new Error("Experience: startYear inválido.");
    }
    if (props.endYear !== undefined && !isValidYear(props.endYear)) {
      throw new Error("Experience: endYear inválido.");
    }
    if (
      props.startYear !== undefined &&
      props.endYear !== undefined &&
      props.endYear < props.startYear
    ) {
      throw new Error("Experience: endYear não pode ser anterior a startYear.");
    }
    if (props.current === true && props.endYear !== undefined) {
      throw new Error("Experience: endYear não pode estar preenchido quando current é true.");
    }
    if (props.description !== undefined && !description) {
      throw new Error("Experience: description, quando informada, não pode ser vazia.");
    }

    return new Experience({
      id,
      type: props.type,
      role,
      organizationName,
      startYear: props.startYear,
      endYear: props.endYear,
      current: props.current,
      description: description || undefined,
    });
  }
}
