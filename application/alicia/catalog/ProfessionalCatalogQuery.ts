import type { ProfessionalCatalogProjection } from "./ProfessionalCatalogProjection";

export interface ProfessionalCatalogQuery {
  list(): Promise<ReadonlyArray<ProfessionalCatalogProjection>>;
  getBySlug(slug: string): Promise<ProfessionalCatalogProjection | null>;
}
