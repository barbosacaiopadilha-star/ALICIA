import type { Professional } from "@/domain/professional/Professional";

export interface ProfessionalCatalogSourceItem {
  readonly professional: Professional;
  readonly slug: string;
}

export interface ProfessionalCatalogSource {
  findAll(): Promise<ReadonlyArray<ProfessionalCatalogSourceItem>>;
  findBySlug(slug: string): Promise<ProfessionalCatalogSourceItem | null>;
}
