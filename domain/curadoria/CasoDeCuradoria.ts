import { CasoId } from "./CasoId.ts";
import { PacienteId } from "./PacienteId.ts";
import { Observacao } from "./Observacao.ts";
import { Criterio } from "./Criterio.ts";
import {
  statusTerminal,
  transicaoPermitida,
  type StatusDaCuradoria,
} from "./StatusDaCuradoria.ts";

/**
 * Agregado raiz do caso de curadoria (Wave C1.1 — CURADORIA_MODEL.md).
 *
 * Escopo estrito desta wave: identidade, ciclo de vida, critérios e
 * observações. Nenhuma seleção de médicos, nenhum cálculo, nenhuma
 * compatibilidade — pertencem às waves C2/C3.
 *
 * Todo estado interno é privado; mutação apenas pelos métodos
 * explícitos, que validam invariantes e atualizam updatedAt. Não há
 * setters públicos. Datas expostas por cópia (createdAt imutável de
 * fato, não por convenção).
 */
export class CasoDeCuradoria {
  private _status: StatusDaCuradoria;
  private _criterios: Criterio[];
  private _observacoes: Observacao[];
  private _snapshotId?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  readonly id: CasoId;
  readonly pacienteId: PacienteId;

  private constructor(id: CasoId, pacienteId: PacienteId, createdAt: Date) {
    this.id = id;
    this.pacienteId = pacienteId;
    this._status = "criado";
    this._criterios = [];
    this._observacoes = [];
    this._createdAt = new Date(createdAt.getTime());
    this._updatedAt = new Date(createdAt.getTime());
  }

  static criar(props: {
    id: CasoId;
    pacienteId: PacienteId;
    createdAt?: Date;
  }): CasoDeCuradoria {
    if (!props.id) {
      throw new Error("CasoDeCuradoria: id é obrigatório.");
    }
    if (!props.pacienteId) {
      throw new Error("CasoDeCuradoria: pacienteId é obrigatório.");
    }
    return new CasoDeCuradoria(props.id, props.pacienteId, props.createdAt ?? new Date());
  }

  get status(): StatusDaCuradoria {
    return this._status;
  }

  get criterios(): ReadonlyArray<Criterio> {
    return Object.freeze([...this._criterios]);
  }

  get observacoes(): ReadonlyArray<Observacao> {
    return Object.freeze([...this._observacoes]);
  }

  get snapshotId(): string | undefined {
    return this._snapshotId;
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime());
  }

  private exigirCasoAtivo(operacao: string): void {
    if (statusTerminal(this._status)) {
      throw new Error(
        `CasoDeCuradoria: ${operacao} não é permitido em caso "${this._status}".`
      );
    }
  }

  private tocar(em: Date): void {
    this._updatedAt = new Date(em.getTime());
  }

  adicionarObservacao(observacao: Observacao, em: Date = new Date()): void {
    this.exigirCasoAtivo("adicionarObservacao");
    this._observacoes.push(observacao);
    this.tocar(em);
  }

  alterarStatus(novo: StatusDaCuradoria, em: Date = new Date()): void {
    if (!transicaoPermitida(this._status, novo)) {
      throw new Error(
        `CasoDeCuradoria: transição de "${this._status}" para "${novo}" não é permitida.`
      );
    }
    this._status = novo;
    this.tocar(em);
  }

  adicionarCriterio(criterio: Criterio, em: Date = new Date()): void {
    this.exigirCasoAtivo("adicionarCriterio");
    if (this._criterios.some((existente) => existente.id === criterio.id)) {
      throw new Error(
        `CasoDeCuradoria: critério "${criterio.id}" já existe no caso.`
      );
    }
    this._criterios.push(criterio);
    this.tocar(em);
  }

  removerCriterio(criterioId: string, em: Date = new Date()): void {
    this.exigirCasoAtivo("removerCriterio");
    const restantes = this._criterios.filter((criterio) => criterio.id !== criterioId);
    if (restantes.length === this._criterios.length) {
      throw new Error(
        `CasoDeCuradoria: critério "${criterioId}" não existe no caso.`
      );
    }
    this._criterios = restantes;
    this.tocar(em);
  }

  registrarSnapshot(snapshotId: string, em: Date = new Date()): void {
    this.exigirCasoAtivo("registrarSnapshot");
    const trimmed = snapshotId?.trim();
    if (!trimmed) {
      throw new Error("CasoDeCuradoria: snapshotId não pode ser vazio.");
    }
    this._snapshotId = trimmed;
    this.tocar(em);
  }
}
