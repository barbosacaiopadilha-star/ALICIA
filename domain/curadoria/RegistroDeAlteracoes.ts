/**
 * Registro de alterações (Epic C3): diário append-only de TODO ato que
 * altera o ambiente de curadoria. É a garantia executável de que:
 * - todo ato humano é auditável (tipo fechado + autor + instante);
 * - toda alteração é reproduzível (payload `dados` só de strings,
 *   desserialização por replay);
 * - nenhuma alteração apaga histórico (imutável; registrar devolve
 *   nova instância; não existe remoção nem edição).
 *
 * Identificadores de entrada são derivados da posição na sequência
 * ("alt-0001", …) apenas para referência auditável — a ordem é
 * cronológica, nunca mérito.
 */
export const TIPOS_DE_ALTERACAO = [
  "sessao_aberta",
  "escolha_registrada",
  "exclusao_registrada",
  "item_checklist_confirmado",
  "item_checklist_nao_aplicavel",
  "sessao_concluida",
  "sessao_cancelada",
] as const;

export type TipoDeAlteracao = (typeof TIPOS_DE_ALTERACAO)[number];

export interface AlteracaoRegistrada {
  readonly id: string;
  readonly tipo: TipoDeAlteracao;
  readonly autorId: string;
  /** Instante do ato em ISO-8601 — string por ser documento, não relógio. */
  readonly em: string;
  readonly dados: Readonly<Record<string, string>>;
}

export interface RegistrarAlteracaoProps {
  tipo: TipoDeAlteracao;
  autorId: string;
  em: Date;
  dados?: Readonly<Record<string, string>>;
}

export class RegistroDeAlteracoes {
  readonly escopoId: string;
  private readonly _alteracoes: ReadonlyArray<AlteracaoRegistrada>;

  private constructor(
    escopoId: string,
    alteracoes: ReadonlyArray<AlteracaoRegistrada>
  ) {
    this.escopoId = escopoId;
    this._alteracoes = alteracoes;
  }

  static vazio(escopoId: string): RegistroDeAlteracoes {
    const trimmed = escopoId?.trim();
    if (!trimmed) {
      throw new Error(
        "RegistroDeAlteracoes: escopoId é obrigatório e não pode ser vazio."
      );
    }
    return new RegistroDeAlteracoes(trimmed, Object.freeze([]));
  }

  registrar(props: RegistrarAlteracaoProps): RegistroDeAlteracoes {
    if (!TIPOS_DE_ALTERACAO.includes(props.tipo)) {
      throw new Error(
        `RegistroDeAlteracoes: tipo de alteração desconhecido "${String(props.tipo)}".`
      );
    }
    const autorId = props.autorId?.trim();
    if (!autorId) {
      throw new Error(
        "RegistroDeAlteracoes: todo ato exige autor — autorId não pode ser vazio."
      );
    }
    if (!(props.em instanceof Date) || Number.isNaN(props.em.getTime())) {
      throw new Error("RegistroDeAlteracoes: em deve ser uma data válida.");
    }
    const dados = props.dados ?? {};
    for (const [chave, valor] of Object.entries(dados)) {
      if (typeof valor !== "string") {
        throw new Error(
          `RegistroDeAlteracoes: dados["${chave}"] deve ser string — o registro é categórico, sem valores numéricos.`
        );
      }
    }
    const id = `alt-${String(this._alteracoes.length + 1).padStart(4, "0")}`;
    const entrada: AlteracaoRegistrada = Object.freeze({
      id,
      tipo: props.tipo,
      autorId,
      em: props.em.toISOString(),
      dados: Object.freeze({ ...dados }),
    });
    return new RegistroDeAlteracoes(
      this.escopoId,
      Object.freeze([...this._alteracoes, entrada])
    );
  }

  get alteracoes(): ReadonlyArray<AlteracaoRegistrada> {
    return this._alteracoes;
  }

  /** Serialização determinística: alterações na ordem de registro. */
  serializar(): string {
    return JSON.stringify({
      escopoId: this.escopoId,
      alteracoes: this._alteracoes,
    });
  }
}

export function deserializarRegistroDeAlteracoes(json: string): RegistroDeAlteracoes {
  const parsed = JSON.parse(json) as {
    escopoId: string;
    alteracoes: ReadonlyArray<AlteracaoRegistrada>;
  };
  // Reconstrução por REPLAY: cada alteração é registrada de novo na
  // ordem original. Os ids são recomputados deterministicamente da
  // posição — se divergirem do documento, o documento foi adulterado.
  return (parsed.alteracoes ?? []).reduce((registro, alteracao, indice) => {
    const reproduzido = registro.registrar({
      tipo: alteracao.tipo,
      autorId: alteracao.autorId,
      em: new Date(alteracao.em),
      dados: alteracao.dados,
    });
    const recomputado = reproduzido.alteracoes[indice];
    if (recomputado.id !== alteracao.id) {
      throw new Error(
        `RegistroDeAlteracoes: id "${alteracao.id}" não corresponde à posição na sequência ("${recomputado.id}") — histórico inconsistente.`
      );
    }
    return reproduzido;
  }, RegistroDeAlteracoes.vazio(parsed.escopoId));
}
