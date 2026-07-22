/**
 * Snapshot de publicação (ADR-029): conjunto congelado de profissionais
 * publicados que serve de base para pesquisa e filtragem de um caso.
 *
 * Imutável por definição — não existe nenhum método de mutação; um novo
 * estado é sempre um novo snapshot. A ordem dos ids é normalizada
 * (ordenação lexicográfica) apenas para determinismo de serialização:
 * ela não carrega nenhum significado de mérito.
 */
export interface SnapshotDePublicacaoProps {
  id: string;
  criadoEm: Date;
  professionalIds: ReadonlyArray<string>;
}

export class SnapshotDePublicacao {
  readonly id: string;
  private readonly _criadoEm: Date;
  private readonly _professionalIds: ReadonlyArray<string>;

  private constructor(id: string, criadoEm: Date, professionalIds: ReadonlyArray<string>) {
    this.id = id;
    this._criadoEm = criadoEm;
    this._professionalIds = professionalIds;
  }

  static create(props: SnapshotDePublicacaoProps): SnapshotDePublicacao {
    const id = props.id?.trim();
    if (!id) {
      throw new Error("SnapshotDePublicacao: id é obrigatório e não pode ser vazio.");
    }
    if (!props.criadoEm) {
      throw new Error("SnapshotDePublicacao: criadoEm é obrigatório.");
    }
    const ids = (props.professionalIds ?? []).map((pid) => pid?.trim());
    if (ids.some((pid) => !pid)) {
      throw new Error("SnapshotDePublicacao: professionalId vazio não é permitido.");
    }
    const unicos = Array.from(new Set(ids)).sort((a, b) => a.localeCompare(b));
    return new SnapshotDePublicacao(
      id,
      new Date(props.criadoEm.getTime()),
      Object.freeze(unicos)
    );
  }

  get criadoEm(): Date {
    return new Date(this._criadoEm.getTime());
  }

  get professionalIds(): ReadonlyArray<string> {
    return this._professionalIds;
  }

  contem(professionalId: string): boolean {
    return this._professionalIds.includes(professionalId);
  }

  equals(other: SnapshotDePublicacao): boolean {
    return this.id === other.id;
  }

  /** Serialização determinística: ids já normalizados na criação. */
  serializar(): string {
    return JSON.stringify({
      id: this.id,
      criadoEm: this._criadoEm.toISOString(),
      professionalIds: this._professionalIds,
    });
  }
}

export function deserializarSnapshotDePublicacao(json: string): SnapshotDePublicacao {
  const parsed = JSON.parse(json) as {
    id: string;
    criadoEm: string;
    professionalIds: string[];
  };
  return SnapshotDePublicacao.create({
    id: parsed.id,
    criadoEm: new Date(parsed.criadoEm),
    professionalIds: parsed.professionalIds,
  });
}
