export const VALID_PROFESSIONAL_DATA_SOURCES = ["mock", "persistent"] as const;
export type ProfessionalDataSource = (typeof VALID_PROFESSIONAL_DATA_SOURCES)[number];

/**
 * Resolve o valor bruto de PROFESSIONAL_DATA_SOURCE para uma origem
 * válida, sem nenhuma dependência (nem process.env, nem os
 * providers) — puramente a regra de decisão, para ser testável
 * isoladamente com o test runner nativo do Node. Ausente/vazio →
 * "mock". Valor desconhecido → lança erro, nunca seleciona
 * silenciosamente uma origem diferente da solicitada.
 */
export function resolveProfessionalDataSource(
  rawValue: string | undefined
): ProfessionalDataSource {
  const trimmed = rawValue?.trim();
  const source = trimmed ? trimmed : "mock";

  if (!VALID_PROFESSIONAL_DATA_SOURCES.includes(source as ProfessionalDataSource)) {
    throw new Error(
      `PROFESSIONAL_DATA_SOURCE inválido "${trimmed}". ` +
        `Valores aceitos: ${VALID_PROFESSIONAL_DATA_SOURCES.map((value) => `"${value}"`).join(", ")}.`
    );
  }

  return source as ProfessionalDataSource;
}
