import { medicos } from "@/mocks/alicia/medicos";
import type { ProfessionalRepository } from "@/domain/professional/repositories/ProfessionalRepository";
import { LegacyProfessionalMapper } from "./LegacyProfessionalMapper";
import { MockProfessionalRepository } from "./MockProfessionalRepository";

/**
 * Cria um ProfessionalRepository em memória a partir dos mocks legados
 * reais (mocks/alicia/medicos.ts). Não é conectado a nenhuma UI ou
 * service existente — é apenas um ponto de composição isolado.
 */
export function createMockProfessionalRepository(): ProfessionalRepository {
  const professionals = medicos.map((medico) => LegacyProfessionalMapper.toDomain(medico));
  return new MockProfessionalRepository(professionals);
}
