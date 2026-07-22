/**
 * Ciclo de vida do caso de curadoria (CURADORIA_MODEL.md, §1).
 * Fluxo linear com cancelamento possível antes da conclusão; estados
 * terminais não transicionam. Nenhum estado além destes sete.
 */
export const STATUS_DA_CURADORIA = [
  "criado",
  "em_analise",
  "aguardando_curador",
  "pronto_para_curadoria",
  "curadoria_concluida",
  "encerrado",
  "cancelado",
] as const;

export type StatusDaCuradoria = (typeof STATUS_DA_CURADORIA)[number];

const TRANSICOES_PERMITIDAS: Readonly<
  Record<StatusDaCuradoria, ReadonlyArray<StatusDaCuradoria>>
> = {
  criado: ["em_analise", "cancelado"],
  em_analise: ["aguardando_curador", "cancelado"],
  aguardando_curador: ["pronto_para_curadoria", "cancelado"],
  pronto_para_curadoria: ["curadoria_concluida", "cancelado"],
  curadoria_concluida: ["encerrado"],
  encerrado: [],
  cancelado: [],
};

export function transicaoPermitida(
  de: StatusDaCuradoria,
  para: StatusDaCuradoria
): boolean {
  return TRANSICOES_PERMITIDAS[de].includes(para);
}

export function statusTerminal(status: StatusDaCuradoria): boolean {
  return TRANSICOES_PERMITIDAS[status].length === 0;
}
