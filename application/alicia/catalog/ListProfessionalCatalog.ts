import type { ProfessionalCatalogProjection } from "./ProfessionalCatalogProjection";
import type { ProfessionalCatalogSource } from "./ProfessionalCatalogSource";
import { BuildProfessionalCatalogProjection } from "./BuildProfessionalCatalogProjection";

export interface ListProfessionalCatalogInput {}

export class ListProfessionalCatalog {
  constructor(
    private readonly catalogSource: ProfessionalCatalogSource,
    private readonly projectionBuilder: BuildProfessionalCatalogProjection
  ) {}

  async execute(
    _input: ListProfessionalCatalogInput
  ): Promise<ReadonlyArray<ProfessionalCatalogProjection>> {
    const items = await this.catalogSource.findAll();

    const projections: ProfessionalCatalogProjection[] = [];
    for (const item of items) {
      projections.push(
        this.projectionBuilder.execute({
          professional: item.professional,
          slug: item.slug,
        })
      );
    }

    return projections;
  }
}
