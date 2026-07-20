import { GetProfessionalProfileBySlug } from "@/application/alicia/profile/GetProfessionalProfileBySlug";
import { BuildProfessionalProfileProjection } from "@/application/alicia/profile/BuildProfessionalProfileProjection";
import { createMockProfessionalCatalogSource } from "@/infrastructure/alicia/catalog/createMockProfessionalCatalogSource";

/**
 * Compõe uma instância de GetProfessionalProfileBySlug reutilizando a
 * mesma fonte de dados já existente do catálogo
 * (createMockProfessionalCatalogSource), sem duplicar mapper, mocks ou
 * validação de slug. Cada chamada produz instâncias novas — nenhum
 * singleton ou estado compartilhado.
 */
export function createGetProfessionalProfileBySlug(): GetProfessionalProfileBySlug {
  const source = createMockProfessionalCatalogSource();
  const projectionBuilder = new BuildProfessionalProfileProjection();
  return new GetProfessionalProfileBySlug(source, projectionBuilder);
}
