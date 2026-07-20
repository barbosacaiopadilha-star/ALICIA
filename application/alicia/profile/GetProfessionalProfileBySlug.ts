import type { ProfessionalCatalogSource } from "@/application/alicia/catalog/ProfessionalCatalogSource";
import type { ProfessionalProfileProjection } from "./ProfessionalProfileProjection";
import { BuildProfessionalProfileProjection } from "./BuildProfessionalProfileProjection";

export interface GetProfessionalProfileBySlugInput {
  readonly slug: string;
}

export class GetProfessionalProfileBySlug {
  constructor(
    private readonly source: ProfessionalCatalogSource,
    private readonly projectionBuilder: BuildProfessionalProfileProjection
  ) {}

  async execute(input: GetProfessionalProfileBySlugInput): Promise<ProfessionalProfileProjection> {
    const slug = input.slug?.trim();
    if (!slug) {
      throw new Error("GetProfessionalProfileBySlug slug is required.");
    }

    const item = await this.source.findBySlug(slug);
    if (!item) {
      throw new Error("GetProfessionalProfileBySlug professional not found.");
    }

    return this.projectionBuilder.execute({
      professional: item.professional,
      slug: item.slug,
    });
  }
}
