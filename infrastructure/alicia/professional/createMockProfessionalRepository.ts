import { listRawProfessionals } from "./professionalDataProvider";
import type { ProfessionalRepository } from "@/domain/professional/repositories/ProfessionalRepository";
import { LegacyProfessionalMapper } from "./LegacyProfessionalMapper";
import { MockProfessionalRepository } from "./MockProfessionalRepository";

/**
 * Cria um ProfessionalRepository em memória a partir da fronteira
 * única de dados brutos (professionalDataProvider). Não é conectado a
 * nenhuma UI ou service existente — é apenas um ponto de composição
 * isolado.
 */
export function createMockProfessionalRepository(): ProfessionalRepository {
  const professionals = listRawProfessionals().map((medico) => LegacyProfessionalMapper.toDomain(medico));
  return new MockProfessionalRepository(professionals);
}
