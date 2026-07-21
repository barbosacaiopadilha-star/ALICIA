import type { ProfessionalDataProvider } from "./ProfessionalDataProvider";
import { MockProfessionalDataProvider } from "./MockProfessionalDataProvider";
import type { RawProfessionalData } from "./RawProfessionalData";

/**
 * Único ponto de composição do ProfessionalDataProvider ativo. Hoje
 * sempre retorna MockProfessionalDataProvider — trocar a origem real
 * no futuro (banco, API, importação editorial) significa alterar
 * apenas esta função, nunca os consumidores.
 */
function createProfessionalDataProvider(): ProfessionalDataProvider {
  return new MockProfessionalDataProvider();
}

/**
 * Atalho de conveniência mantido para compatibilidade com os
 * consumidores existentes (createMockProfessionalCatalogSource,
 * createMockProfessionalRepository, services/alicia/medicos.ts) —
 * delega inteiramente ao provider ativo. Nenhum consumidor depende
 * mais de mocks/alicia/medicos.ts diretamente nem do formato Medico
 * como contrato — apenas de RawProfessionalData.
 */
export function listRawProfessionals(): ReadonlyArray<RawProfessionalData> {
  return createProfessionalDataProvider().listRawProfessionals();
}
