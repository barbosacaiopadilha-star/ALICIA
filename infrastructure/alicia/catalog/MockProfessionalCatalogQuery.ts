import type { ProfessionalCatalogQuery } from "@/application/alicia/catalog/ProfessionalCatalogQuery";
import type { ProfessionalCatalogSource } from "@/application/alicia/catalog/ProfessionalCatalogSource";
import type { ProfessionalCatalogProjection } from "@/application/alicia/catalog/ProfessionalCatalogProjection";
import { BuildProfessionalCatalogProjection } from "@/application/alicia/catalog/BuildProfessionalCatalogProjection";

export class MockProfessionalCatalogQuery implements ProfessionalCatalogQuery {
  constructor(
    private readonly source: ProfessionalCatalogSource,
    private readonly projectionBuilder: BuildProfessionalCatalogProjection
  ) {}

  async list(): Promise<ReadonlyArray<ProfessionalCatalogProjection>> {
    const items = await this.source.findAll();

    return items.map((item) =>
      this.projectionBuilder.execute({
        professional: item.professional,
        slug: item.slug,
      })
    );
  }

  async getBySlug(slug: string): Promise<ProfessionalCatalogProjection | null> {
    const normalizedSlug = slug?.trim();
    if (!normalizedSlug) {
      return null;
    }

    const item = await this.source.findBySlug(normalizedSlug);
    if (!item) {
      return null;
    }

    return this.projectionBuilder.execute({
      professional: item.professional,
      slug: item.slug,
    });
  }
}
