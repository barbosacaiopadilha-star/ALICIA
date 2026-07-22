/**
 * Registro de alteração da sessão de curadoria (Wave C3.2): entrada de
 * auditoria gerada por TODA mudança de estado da SessaoDeCuradoria.
 *
 * - tipo fechado: só os atos que o agregado sabe executar;
 * - autor obrigatório: nenhuma mudança existe sem autor;
 * - timestamp em ISO-8601 (string — o registro é documento, não relógio);
 * - payload categórico: apenas strings, nunca valores numéricos;
 * - imutável: a entrada nasce congelada.
 *
 * Somente domínio — sem persistência, sem banco.
 */
export const TIPOS_DE_ALTERACAO_DA_SESSAO = [
  "sessao_criada",
  "sessao_iniciada",
  "status_alterado",
  "observacao_registrada",
  "decisao_registrada",
  "sessao_encerrada",
  "sessao_cancelada",
] as const;

export type TipoDeAlteracaoDaSessao = (typeof TIPOS_DE_ALTERACAO_DA_SESSAO)[number];

export interface RegistroDeAlteracao {
  readonly id: string;
  readonly sessaoId: string;
  readonly autor: string;
  readonly timestamp: string;
  readonly tipo: TipoDeAlteracaoDaSessao;
  readonly payload: Readonly<Record<string, string>>;
}

export function criarRegistroDeAlteracao(props: {
  id: string;
  sessaoId: string;
  autor: string;
  em: Date;
  tipo: TipoDeAlteracaoDaSessao;
  payload?: Readonly<Record<string, string>>;
}): RegistroDeAlteracao {
  const id = props.id?.trim();
  if (!id) {
    throw new Error("RegistroDeAlteracao: id é obrigatório e não pode ser vazio.");
  }
  const sessaoId = props.sessaoId?.trim();
  if (!sessaoId) {
    throw new Error("RegistroDeAlteracao: sessaoId é obrigatório e não pode ser vazio.");
  }
  const autor = props.autor?.trim();
  if (!autor) {
    throw new Error(
      "RegistroDeAlteracao: toda mudança exige autor — autor não pode ser vazio."
    );
  }
  if (!TIPOS_DE_ALTERACAO_DA_SESSAO.includes(props.tipo)) {
    throw new Error(
      `RegistroDeAlteracao: tipo desconhecido "${String(props.tipo)}".`
    );
  }
  if (!(props.em instanceof Date) || Number.isNaN(props.em.getTime())) {
    throw new Error("RegistroDeAlteracao: em deve ser uma data válida.");
  }
  const payload = props.payload ?? {};
  for (const [chave, valor] of Object.entries(payload)) {
    if (typeof valor !== "string") {
      throw new Error(
        `RegistroDeAlteracao: payload["${chave}"] deve ser string — o registro é categórico, sem valores numéricos.`
      );
    }
  }
  return Object.freeze({
    id,
    sessaoId,
    autor,
    timestamp: props.em.toISOString(),
    tipo: props.tipo,
    payload: Object.freeze({ ...payload }),
  });
}
