/**
 * Critério de curadoria — hierarquia fechada nos quatro grupos do
 * CURADORIA_MODEL.md (§2), nunca misturados. A categoria é imutável
 * por construção: cada subclasse É a sua categoria.
 *
 * Deliberadamente inexistentes (decisão nº 2 do Release Book,
 * protegido por teste): score, peso, prioridade numérica ou qualquer
 * noção de "melhor/pior" entre critérios ou médicos.
 */

export const CATEGORIAS_DE_CRITERIO = [
  "obrigatorio",
  "preferencial",
  "excludente",
  "indeterminado",
] as const;

export type CategoriaDeCriterio = (typeof CATEGORIAS_DE_CRITERIO)[number];

export const ORIGENS_DE_CRITERIO = [
  "historia_do_paciente",
  "normalizacao",
  "curador",
] as const;

export type OrigemDeCriterio = (typeof ORIGENS_DE_CRITERIO)[number];

export interface CriterioProps {
  id: string;
  descricao: string;
  origem: OrigemDeCriterio;
}

interface CriterioValidado {
  id: string;
  descricao: string;
  origem: OrigemDeCriterio;
}

function validar(nome: string, props: CriterioProps): CriterioValidado {
  const id = props.id?.trim();
  if (!id) {
    throw new Error(`${nome}: id é obrigatório e não pode ser vazio.`);
  }
  const descricao = props.descricao?.trim();
  if (!descricao) {
    throw new Error(`${nome}: descricao é obrigatória e não pode ser vazia.`);
  }
  if (!ORIGENS_DE_CRITERIO.includes(props.origem)) {
    throw new Error(`${nome}: origem desconhecida "${props.origem}".`);
  }
  return { id, descricao, origem: props.origem };
}

export abstract class Criterio {
  readonly id: string;
  readonly descricao: string;
  readonly origem: OrigemDeCriterio;

  protected constructor(props: CriterioValidado) {
    this.id = props.id;
    this.descricao = props.descricao;
    this.origem = props.origem;
  }

  abstract get categoria(): CategoriaDeCriterio;

  /** Igualdade por identidade, como nos demais value objects do domínio. */
  equals(other: Criterio): boolean {
    return this.id === other.id;
  }

  /** Serialização determinística: chaves em ordem fixa, sem campos extras. */
  serializar(): string {
    return JSON.stringify({
      id: this.id,
      categoria: this.categoria,
      descricao: this.descricao,
      origem: this.origem,
    });
  }
}

export class CriterioObrigatorio extends Criterio {
  static create(props: CriterioProps): CriterioObrigatorio {
    return new CriterioObrigatorio(validar("CriterioObrigatorio", props));
  }
  get categoria(): CategoriaDeCriterio {
    return "obrigatorio";
  }
}

export class CriterioPreferencial extends Criterio {
  static create(props: CriterioProps): CriterioPreferencial {
    return new CriterioPreferencial(validar("CriterioPreferencial", props));
  }
  get categoria(): CategoriaDeCriterio {
    return "preferencial";
  }
}

export class CriterioExcludente extends Criterio {
  static create(props: CriterioProps): CriterioExcludente {
    return new CriterioExcludente(validar("CriterioExcludente", props));
  }
  get categoria(): CategoriaDeCriterio {
    return "excludente";
  }
}

export class CriterioIndeterminado extends Criterio {
  static create(props: CriterioProps): CriterioIndeterminado {
    return new CriterioIndeterminado(validar("CriterioIndeterminado", props));
  }
  get categoria(): CategoriaDeCriterio {
    return "indeterminado";
  }
}

export function deserializarCriterio(json: string): Criterio {
  const parsed = JSON.parse(json) as {
    id: string;
    categoria: CategoriaDeCriterio;
    descricao: string;
    origem: OrigemDeCriterio;
  };
  const props: CriterioProps = {
    id: parsed.id,
    descricao: parsed.descricao,
    origem: parsed.origem,
  };
  switch (parsed.categoria) {
    case "obrigatorio":
      return CriterioObrigatorio.create(props);
    case "preferencial":
      return CriterioPreferencial.create(props);
    case "excludente":
      return CriterioExcludente.create(props);
    case "indeterminado":
      return CriterioIndeterminado.create(props);
    default:
      throw new Error(`Criterio: categoria desconhecida "${parsed.categoria}".`);
  }
}
