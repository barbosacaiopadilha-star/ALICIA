/**
 * Critério extraído do caso, classificado em exatamente um dos quatro
 * grupos do CURADORIA_MODEL.md (§2) — nunca misturados. Representação
 * mínima desta wave: seleção, elegibilidade e compatibilidade
 * pertencem às waves seguintes.
 */
export const GRUPOS_DE_CRITERIO = [
  "obrigatorio",
  "preferencial",
  "excludente",
  "desconhecido",
] as const;

export type GrupoDeCriterio = (typeof GRUPOS_DE_CRITERIO)[number];

export class CriterioDoCaso {
  readonly id: string;
  readonly grupo: GrupoDeCriterio;
  readonly descricao: string;

  private constructor(id: string, grupo: GrupoDeCriterio, descricao: string) {
    this.id = id;
    this.grupo = grupo;
    this.descricao = descricao;
  }

  static create(props: {
    id: string;
    grupo: GrupoDeCriterio;
    descricao: string;
  }): CriterioDoCaso {
    const id = props.id?.trim();
    if (!id) {
      throw new Error("CriterioDoCaso: id é obrigatório e não pode ser vazio.");
    }
    if (!GRUPOS_DE_CRITERIO.includes(props.grupo)) {
      throw new Error(`CriterioDoCaso: grupo desconhecido "${props.grupo}".`);
    }
    const descricao = props.descricao?.trim();
    if (!descricao) {
      throw new Error("CriterioDoCaso: descricao é obrigatória e não pode ser vazia.");
    }
    return new CriterioDoCaso(id, props.grupo, descricao);
  }
}
