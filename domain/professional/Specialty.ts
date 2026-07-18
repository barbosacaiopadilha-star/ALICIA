export interface SpecialtyProps {
  id: string;
  name: string;
  normalizedName?: string;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export class Specialty {
  readonly id: string;
  readonly name: string;
  readonly normalizedName: string;

  private constructor(props: { id: string; name: string; normalizedName: string }) {
    this.id = props.id;
    this.name = props.name;
    this.normalizedName = props.normalizedName;
  }

  static create(props: SpecialtyProps): Specialty {
    const id = props.id?.trim();
    const name = props.name?.trim();

    if (!id) {
      throw new Error("Specialty: id é obrigatório.");
    }
    if (!name) {
      throw new Error("Specialty: name é obrigatório.");
    }

    const source = props.normalizedName?.trim() ? props.normalizedName : name;
    const normalizedName = normalize(source);

    return new Specialty({ id, name, normalizedName });
  }
}
