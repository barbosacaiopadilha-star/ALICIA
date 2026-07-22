export class CasoId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): CasoId {
    const trimmed = value?.trim();
    if (!trimmed) {
      throw new Error("CasoId: valor é obrigatório e não pode ser vazio.");
    }
    return new CasoId(trimmed);
  }

  equals(other: CasoId): boolean {
    return this.value === other.value;
  }
}
