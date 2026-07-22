/**
 * Identificador opaco do paciente. Deliberadamente NÃO carrega nome,
 * contato ou qualquer dado pessoal — minimização (LGPD) desde o
 * domínio: o agregado de curadoria referencia o paciente, nunca o
 * descreve.
 */
export class PacienteId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): PacienteId {
    const trimmed = value?.trim();
    if (!trimmed) {
      throw new Error("PacienteId: valor é obrigatório e não pode ser vazio.");
    }
    return new PacienteId(trimmed);
  }

  equals(other: PacienteId): boolean {
    return this.value === other.value;
  }
}
