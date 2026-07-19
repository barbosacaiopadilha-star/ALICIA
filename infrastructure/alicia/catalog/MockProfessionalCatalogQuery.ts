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

    // ProfessionalCatalogSource não expõe (e esta tarefa não autoriza criar)
    // um método de busca por slug — o único caminho real disponível é
    // findAll() seguido de filtro em memória.
    const items = await this.source.findAll();
    const found = items.find((item) => item.slug === normalizedSlug);
    if (!found) {
      return null;
    }

    return this.projectionBuilder.execute({
      professional: found.professional,
      slug: found.slug,
    });
  }
}
