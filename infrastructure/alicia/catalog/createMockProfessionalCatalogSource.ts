import { listRawProfessionals } from "@/infrastructure/alicia/professional/professionalDataProvider";
import type { ProfessionalCatalogSource } from "@/application/alicia/catalog/ProfessionalCatalogSource";
import { MockProfessionalCatalogSource } from "./MockProfessionalCatalogSource";

/**
 * Cria um ProfessionalCatalogSource em memória a partir da fronteira
 * única de dados brutos (professionalDataProvider), preservando o
 * slug público de cada médico. Não é conectado a nenhuma UI ou
 * service existente — é um ponto de composição isolado, independente
 * de createMockProfessionalRepository().
 */
export function createMockProfessionalCatalogSource(): ProfessionalCatalogSource {
  return new MockProfessionalCatalogSource(listRawProfessionals());
}
