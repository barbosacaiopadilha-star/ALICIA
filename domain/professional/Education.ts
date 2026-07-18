export type EducationType =
  | "undergraduate"
  | "residency"
  | "specialization"
  | "fellowship"
  | "masters"
  | "doctorate"
  | "postdoctorate"
  | "other";

const VALID_EDUCATION_TYPES: EducationType[] = [
  "undergraduate",
  "residency",
  "specialization",
  "fellowship",
  "masters",
  "doctorate",
  "postdoctorate",
  "other",
];

export interface EducationProps {
  id: string;
  type: EducationType;
  program: string;
  institutionName: string;
  startYear?: number;
  endYear?: number;
  completed?: boolean;
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

export class Education {
  readonly id: string;
  readonly type: EducationType;
  readonly program: string;
  readonly institutionName: string;
  readonly startYear?: number;
  readonly endYear?: number;
  readonly completed?: boolean;

  private constructor(props: {
    id: string;
    type: EducationType;
    program: string;
    institutionName: string;
    startYear?: number;
    endYear?: number;
    completed?: boolean;
  }) {
    this.id = props.id;
    this.type = props.type;
    this.program = props.program;
    this.institutionName = props.institutionName;
    this.startYear = props.startYear;
    this.endYear = props.endYear;
    this.completed = props.completed;
  }

  static create(props: EducationProps): Education {
    const id = props.id?.trim();
    const program = props.program?.trim();
    const institutionName = props.institutionName?.trim();

    if (!id) {
      throw new Error("Education: id é obrigatório.");
    }
    if (!VALID_EDUCATION_TYPES.includes(props.type)) {
      throw new Error(`Education: type inválido "${props.type}".`);
    }
    if (!program) {
      throw new Error("Education: program é obrigatório.");
    }
    if (!institutionName) {
      throw new Error("Education: institutionName é obrigatório.");
    }
    if (props.startYear !== undefined && !isValidYear(props.startYear)) {
      throw new Error("Education: startYear inválido.");
    }
    if (props.endYear !== undefined && !isValidYear(props.endYear)) {
      throw new Error("Education: endYear inválido.");
    }
    if (
      props.startYear !== undefined &&
      props.endYear !== undefined &&
      props.endYear < props.startYear
    ) {
      throw new Error("Education: endYear não pode ser anterior a startYear.");
    }

    return new Education({
      id,
      type: props.type,
      program,
      institutionName,
      startYear: props.startYear,
      endYear: props.endYear,
      completed: props.completed,
    });
  }
}
