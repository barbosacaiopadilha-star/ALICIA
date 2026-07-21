import { MockProfessionalCatalogQuery } from "@/infrastructure/alicia/catalog/MockProfessionalCatalogQuery";
import { createMockProfessionalCatalogSource } from "@/infrastructure/alicia/catalog/createMockProfessionalCatalogSource";
import { BuildProfessionalCatalogProjection } from "@/application/alicia/catalog/BuildProfessionalCatalogProjection";
import type { ProfessionalCatalogQuery } from "@/application/alicia/catalog/ProfessionalCatalogQuery";

/**
 * Compõe uma instância pública de ProfessionalCatalogQuery, encapsulando
 * a fonte de dados (createMockProfessionalCatalogSource) e o builder de
 * projeção (BuildProfessionalCatalogProjection). A UI deve depender
 * apenas desta factory, nunca das peças de infraestrutura/aplicação que
 * ela compõe. Cada chamada produz uma composição nova e isolada — nenhum
 * singleton ou estado compartilhado.
 */
export function createProfessionalCatalogQuery(): ProfessionalCatalogQuery {
  const source = createMockProfessionalCatalogSource();
  const projectionBuilder = new BuildProfessionalCatalogProjection();
  return new MockProfessionalCatalogQuery(source, projectionBuilder);
}
