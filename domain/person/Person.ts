export interface PersonProps {
  id: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  preferredName?: string;
  birthDate?: Date;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export class Person {
  readonly id: string;
  readonly fullName: string;
  readonly preferredName?: string;
  private readonly _birthDate?: Date;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: {
    id: string;
    fullName: string;
    preferredName?: string;
    birthDate?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.preferredName = props.preferredName;
    this._birthDate = props.birthDate;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get birthDate(): Date | undefined {
    return this._birthDate ? new Date(this._birthDate.getTime()) : undefined;
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime());
  }

  static create(props: PersonProps): Person {
    const id = props.id?.trim();
    const fullName = props.fullName?.trim();
    const preferredName = props.preferredName?.trim();

    if (!id) {
      throw new Error("Person: id é obrigatório.");
    }
    if (!fullName) {
      throw new Error("Person: fullName é obrigatório.");
    }
    if (props.preferredName !== undefined && !preferredName) {
      throw new Error("Person: preferredName, quando informado, não pode ser vazio.");
    }
    if (props.birthDate !== undefined) {
      if (!isValidDate(props.birthDate)) {
        throw new Error("Person: birthDate precisa ser uma data válida.");
      }
      if (props.birthDate.getTime() > Date.now()) {
        throw new Error("Person: birthDate não pode estar no futuro.");
      }
    }
    if (!isValidDate(props.createdAt)) {
      throw new Error("Person: createdAt precisa ser uma data válida.");
    }
    if (!isValidDate(props.updatedAt)) {
      throw new Error("Person: updatedAt precisa ser uma data válida.");
    }
    if (props.updatedAt.getTime() < props.createdAt.getTime()) {
      throw new Error("Person: updatedAt não pode anteceder createdAt.");
    }

    return new Person({
      id,
      fullName,
      preferredName: preferredName || undefined,
      birthDate: props.birthDate ? new Date(props.birthDate.getTime()) : undefined,
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }
}
