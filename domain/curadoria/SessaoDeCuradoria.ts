import type { ConjuntoElegivel } from "./ConjuntoElegivel.ts";
import type { Observacao } from "./Observacao.ts";
import {
  criarRegistroDeAlteracao,
  type RegistroDeAlteracao,
  type TipoDeAlteracaoDaSessao,
} from "./RegistroDeAlteracao.ts";

/**
 * Sessão de curadoria (Wave C3.2): um caso aberto para análise HUMANA.
 *
 * A sessão não escolhe médicos — organiza o trabalho do curador sobre
 * o conjunto elegível produzido pelo Epic C2. Seleção, aprovação e
 * rejeição de médicos pertencem às próximas waves e NÃO existem aqui.
 *
 * Invariantes:
 * - nasce "criada", com snapshot e conjunto obrigatórios e coerentes;
 * - o conjunto elegível nunca é mutado (a classe é imutável e o
 *   agregado só o expõe, jamais o substitui);
 * - todo estado interno é privado; mutação apenas pelos métodos do
 *   agregado; estados terminais não aceitam mutações;
 * - TODA mudança gera um RegistroDeAlteracao com autor e timestamp.
 */
export const STATUS_DA_SESSAO = [
  "criada",
  "em_analise",
  "aguardando_decisao",
  "concluida",
  "cancelada",
] as const;

export type StatusDaSessao = (typeof STATUS_DA_SESSAO)[number];

const TRANSICOES_DA_SESSAO: Readonly<
  Record<StatusDaSessao, ReadonlyArray<StatusDaSessao>>
> = {
  criada: ["em_analise", "cancelada"],
  em_analise: ["aguardando_decisao", "cancelada"],
  aguardando_decisao: ["concluida", "cancelada"],
  concluida: [],
  cancelada: [],
};

export function transicaoDeSessaoPermitida(
  de: StatusDaSessao,
  para: StatusDaSessao
): boolean {
  return TRANSICOES_DA_SESSAO[de].includes(para);
}

export function statusDeSessaoTerminal(status: StatusDaSessao): boolean {
  return TRANSICOES_DA_SESSAO[status].length === 0;
}

export class SessaoDeCuradoria {
  readonly id: string;
  readonly casoId: string;
  readonly snapshotId: string;
  readonly iniciadoPor: string;
  private readonly _conjuntoElegivel: ConjuntoElegivel;
  private _status: StatusDaSessao;
  private _observacoes: Observacao[];
  private _alteracoes: RegistroDeAlteracao[];
  private _encerradoPor?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: string,
    casoId: string,
    snapshotId: string,
    conjuntoElegivel: ConjuntoElegivel,
    iniciadoPor: string,
    createdAt: Date
  ) {
    this.id = id;
    this.casoId = casoId;
    this.snapshotId = snapshotId;
    this.iniciadoPor = iniciadoPor;
    this._conjuntoElegivel = conjuntoElegivel;
    this._status = "criada";
    this._observacoes = [];
    this._alteracoes = [];
    this._createdAt = new Date(createdAt.getTime());
    this._updatedAt = new Date(createdAt.getTime());
  }

  static criar(props: {
    id: string;
    casoId: string;
    snapshotId: string;
    conjuntoElegivel: ConjuntoElegivel;
    iniciadoPor: string;
    createdAt?: Date;
  }): SessaoDeCuradoria {
    const id = props.id?.trim();
    if (!id) {
      throw new Error("SessaoDeCuradoria: id é obrigatório e não pode ser vazio.");
    }
    const casoId = props.casoId?.trim();
    if (!casoId) {
      throw new Error("SessaoDeCuradoria: casoId é obrigatório e não pode ser vazio.");
    }
    const snapshotId = props.snapshotId?.trim();
    if (!snapshotId) {
      throw new Error(
        "SessaoDeCuradoria: snapshot é obrigatório — snapshotId não pode ser vazio."
      );
    }
    const iniciadoPor = props.iniciadoPor?.trim();
    if (!iniciadoPor) {
      throw new Error(
        "SessaoDeCuradoria: toda sessão exige autor — iniciadoPor não pode ser vazio."
      );
    }
    if (!props.conjuntoElegivel) {
      throw new Error("SessaoDeCuradoria: conjunto elegível é obrigatório.");
    }
    if (props.conjuntoElegivel.casoId !== casoId) {
      throw new Error(
        `SessaoDeCuradoria: conjunto pertence ao caso "${props.conjuntoElegivel.casoId}", não a "${casoId}".`
      );
    }
    if (props.conjuntoElegivel.snapshotId !== snapshotId) {
      throw new Error(
        `SessaoDeCuradoria: conjunto vem do snapshot "${props.conjuntoElegivel.snapshotId}", não de "${snapshotId}".`
      );
    }
    const createdAt = props.createdAt ?? new Date();
    const sessao = new SessaoDeCuradoria(
      id,
      casoId,
      snapshotId,
      props.conjuntoElegivel,
      iniciadoPor,
      createdAt
    );
    sessao.auditar("sessao_criada", iniciadoPor, createdAt, {
      casoId,
      snapshotId,
    });
    return sessao;
  }

  get status(): StatusDaSessao {
    return this._status;
  }

  get conjuntoElegivel(): ConjuntoElegivel {
    return this._conjuntoElegivel;
  }

  get observacoes(): ReadonlyArray<Observacao> {
    return Object.freeze([...this._observacoes]);
  }

  get alteracoes(): ReadonlyArray<RegistroDeAlteracao> {
    return Object.freeze([...this._alteracoes]);
  }

  get encerradoPor(): string | undefined {
    return this._encerradoPor;
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime());
  }

  private exigirSessaoAtiva(operacao: string): void {
    if (statusDeSessaoTerminal(this._status)) {
      throw new Error(
        `SessaoDeCuradoria: ${operacao} não é permitido em sessão "${this._status}".`
      );
    }
  }

  private auditar(
    tipo: TipoDeAlteracaoDaSessao,
    autor: string,
    em: Date,
    payload: Readonly<Record<string, string>> = {}
  ): void {
    const id = `alt-${String(this._alteracoes.length + 1).padStart(4, "0")}`;
    this._alteracoes.push(
      criarRegistroDeAlteracao({ id, sessaoId: this.id, autor, em, tipo, payload })
    );
    this._updatedAt = new Date(em.getTime());
  }

  private transicionar(
    novo: StatusDaSessao,
    tipo: TipoDeAlteracaoDaSessao,
    autor: string,
    em: Date,
    payload: Readonly<Record<string, string>> = {}
  ): void {
    if (!transicaoDeSessaoPermitida(this._status, novo)) {
      throw new Error(
        `SessaoDeCuradoria: transição de "${this._status}" para "${novo}" não é permitida.`
      );
    }
    const de = this._status;
    this._status = novo;
    this.auditar(tipo, autor, em, { de, para: novo, ...payload });
  }

  /** Abre a análise humana: "criada" → "em_analise". */
  iniciar(props: { autor: string; em?: Date }): void {
    this.transicionar("em_analise", "sessao_iniciada", props.autor, props.em ?? new Date());
  }

  /**
   * Transição genérica entre estados NÃO terminais. Estados terminais
   * têm porta única: encerrar() e cancelar() — que registram quem
   * encerrou.
   */
  alterarStatus(novo: StatusDaSessao, props: { autor: string; em?: Date }): void {
    if (statusDeSessaoTerminal(novo)) {
      throw new Error(
        `SessaoDeCuradoria: use encerrar() ou cancelar() para chegar a "${novo}".`
      );
    }
    this.transicionar(novo, "status_alterado", props.autor, props.em ?? new Date());
  }

  registrarObservacao(observacao: Observacao, props: { autor: string; em?: Date }): void {
    this.exigirSessaoAtiva("registrarObservacao");
    this._observacoes.push(observacao);
    this.auditar("observacao_registrada", props.autor, props.em ?? new Date(), {
      texto: observacao.texto,
    });
  }

  /** Conclui a sessão: "aguardando_decisao" → "concluida". */
  encerrar(props: { autor: string; em?: Date }): void {
    this.transicionar("concluida", "sessao_encerrada", props.autor, props.em ?? new Date());
    this._encerradoPor = props.autor?.trim();
  }

  /** Cancela a sessão a partir de qualquer estado não terminal. */
  cancelar(props: { autor: string; em?: Date; motivo?: string }): void {
    const motivo = props.motivo?.trim();
    this.transicionar(
      "cancelada",
      "sessao_cancelada",
      props.autor,
      props.em ?? new Date(),
      motivo ? { motivo } : {}
    );
    this._encerradoPor = props.autor?.trim();
  }
}
