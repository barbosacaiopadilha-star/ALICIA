import type { ProfessionalDataProvider } from "./ProfessionalDataProvider";
import { MockProfessionalDataProvider } from "./MockProfessionalDataProvider";
import { FutureProfessionalDataProvider } from "./FutureProfessionalDataProvider";
import type { RawProfessionalData } from "./RawProfessionalData";
import { resolveProfessionalDataSource } from "./resolveProfessionalDataSource";

/**
 * Único ponto de composição do ProfessionalDataProvider ativo,
 * seleção controlada exclusivamente pela variável de ambiente
 * PROFESSIONAL_DATA_SOURCE (lida apenas aqui, nunca pela UI), via a
 * regra pura resolveProfessionalDataSource:
 *
 * - ausente → "mock" (padrão de desenvolvimento);
 * - "mock" → MockProfessionalDataProvider;
 * - "persistent" → FutureProfessionalDataProvider (hoje falha
 *   explicitamente ao ser usada — nenhuma tecnologia persistente real
 *   está configurada neste repositório, ver
 *   docs/architecture/PERSISTENT_DATA_PROVIDER_RC.md);
 * - qualquer outro valor → erro claro imediato, sem selecionar
 *   silenciosamente uma origem diferente da solicitada.
 *
 * Nenhum fallback automático de "persistent" para "mock" existe —
 * preferência explícita por ausência de fallback silencioso.
 */
export function createProfessionalDataProvider(): ProfessionalDataProvider {
  const source = resolveProfessionalDataSource(process.env.PROFESSIONAL_DATA_SOURCE);

  if (source === "persistent") {
    return new FutureProfessionalDataProvider();
  }

  return new MockProfessionalDataProvider();
}

/**
 * Atalho de conveniência mantido para compatibilidade com os
 * consumidores existentes (createMockProfessionalCatalogSource,
 * createMockProfessionalRepository, services/alicia/medicos.ts) —
 * delega inteiramente ao provider ativo, respeitando a origem
 * selecionada. Nenhum consumidor depende mais de
 * mocks/alicia/medicos.ts diretamente nem do formato Medico como
 * contrato — apenas de RawProfessionalData.
 */
export function listRawProfessionals(): ReadonlyArray<RawProfessionalData> {
  return createProfessionalDataProvider().listRawProfessionals();
}
