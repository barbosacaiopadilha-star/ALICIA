import type { RawProfessionalData } from "./RawProfessionalData";

/**
 * Validação mínima e explícita da fronteira de entrada de dados
 * brutos de profissionais. Verifica apenas presença/não-vacuidade dos
 * campos indispensáveis ao fluxo atual (os mesmos exigidos por
 * LegacyProfessionalMapper) — não duplica regras de domínio (ex.:
 * formato de estado com duas letras, já validado por
 * PracticeLocation.create()). Falha de forma explícita e diagnóstica,
 * relatando quais campos estão ausentes/vazios, sem nunca incluir os
 * valores reais dos campos (evita expor dado pessoal em mensagem de
 * erro).
 */
export function validateRawProfessionalData(
  record: RawProfessionalData,
  index?: number
): RawProfessionalData {
  const missing: string[] = [];

  if (!record.id?.trim()) missing.push("id");
  if (!record.slug?.trim()) missing.push("slug");
  if (!record.nome?.trim()) missing.push("nome");
  if (!record.especialidadeId?.trim()) missing.push("especialidadeId");
  if (!record.estadoSigla?.trim()) missing.push("estadoSigla");
  if (!record.cidade?.trim()) missing.push("cidade");
  if (!record.instituicaoPrincipal?.trim()) missing.push("instituicaoPrincipal");
  if (!record.formacaoResumo?.trim()) missing.push("formacaoResumo");
  if (typeof record.verificado !== "boolean") missing.push("verificado");

  if (missing.length > 0) {
    const posicao = index !== undefined ? ` (posição ${index})` : "";
    throw new Error(
      `RawProfessionalData inválido${posicao}: campo(s) obrigatório(s) ausente(s) ou vazio(s): ${missing.join(", ")}.`
    );
  }

  return record;
}

/**
 * Valida uma coleção inteira, preservando a ordem original. Lança no
 * primeiro registro inválido encontrado — falha explícita, não
 * rejeição silenciosa.
 */
export function validateRawProfessionalDataList(
  records: ReadonlyArray<RawProfessionalData>
): ReadonlyArray<RawProfessionalData> {
  return records.map((record, index) => validateRawProfessionalData(record, index));
}
