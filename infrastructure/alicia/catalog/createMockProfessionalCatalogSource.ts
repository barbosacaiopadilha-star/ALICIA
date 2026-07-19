import { medicos } from "@/mocks/alicia/medicos";
import type { ProfessionalCatalogSource } from "@/application/alicia/catalog/ProfessionalCatalogSource";
import { MockProfessionalCatalogSource } from "./MockProfessionalCatalogSource";

/**
 * Cria um ProfessionalCatalogSource em memória a partir dos mocks legados
 * reais (mocks/alicia/medicos.ts), preservando o slug público de cada
 * médico. Não é conectado a nenhuma UI ou service existente — é um ponto
 * de composição isolado, independente de createMockProfessionalRepository().
 */
export function createMockProfessionalCatalogSource(): ProfessionalCatalogSource {
  return new MockProfessionalCatalogSource(medicos);
}
