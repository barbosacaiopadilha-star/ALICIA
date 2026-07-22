export class Observacao {
  readonly texto: string;
  readonly registradaEm: Date;

  private constructor(texto: string, registradaEm: Date) {
    this.texto = texto;
    this.registradaEm = registradaEm;
  }

  static create(texto: string, registradaEm: Date = new Date()): Observacao {
    const trimmed = texto?.trim();
    if (!trimmed) {
      throw new Error("Observacao: texto é obrigatório e não pode ser vazio.");
    }
    return new Observacao(trimmed, new Date(registradaEm.getTime()));
  }
}
