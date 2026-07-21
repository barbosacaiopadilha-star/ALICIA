import type { RawProfessionalData } from "@/infrastructure/alicia/professional/RawProfessionalData";
import { LegacyProfessionalMapper } from "@/infrastructure/alicia/professional/LegacyProfessionalMapper";
import type {
  ProfessionalCatalogSource,
  ProfessionalCatalogSourceItem,
} from "@/application/alicia/catalog/ProfessionalCatalogSource";

export class MockProfessionalCatalogSource implements ProfessionalCatalogSource {
  private readonly items: ProfessionalCatalogSourceItem[];

  constructor(records: ReadonlyArray<RawProfessionalData>) {
    this.items = records.map((record) => {
      const slug = record.slug?.trim();
      if (!slug) {
        throw new Error("MockProfessionalCatalogSource slug is required.");
      }

      return {
        professional: LegacyProfessionalMapper.toDomain(record),
        slug,
      };
    });
  }

  async findAll(): Promise<ReadonlyArray<ProfessionalCatalogSourceItem>> {
    return this.items.map((item) => ({
      professional: item.professional,
      slug: item.slug,
    }));
  }

  async findBySlug(slug: string): Promise<ProfessionalCatalogSourceItem | null> {
    const normalizedSlug = slug?.trim();
    if (!normalizedSlug) {
      return null;
    }

    const found = this.items.find((item) => item.slug === normalizedSlug);
    if (!found) {
      return null;
    }

    return {
      professional: found.professional,
      slug: found.slug,
    };
  }
}
