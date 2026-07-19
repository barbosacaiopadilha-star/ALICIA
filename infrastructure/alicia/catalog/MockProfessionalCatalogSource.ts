import type { Medico } from "@/types/alicia/medico";
import { LegacyProfessionalMapper } from "@/infrastructure/alicia/professional/LegacyProfessionalMapper";
import type {
  ProfessionalCatalogSource,
  ProfessionalCatalogSourceItem,
} from "@/application/alicia/catalog/ProfessionalCatalogSource";

export class MockProfessionalCatalogSource implements ProfessionalCatalogSource {
  private readonly items: ProfessionalCatalogSourceItem[];

  constructor(medicos: ReadonlyArray<Medico>) {
    this.items = medicos.map((medico) => {
      const slug = medico.slug?.trim();
      if (!slug) {
        throw new Error("MockProfessionalCatalogSource slug is required.");
      }

      return {
        professional: LegacyProfessionalMapper.toDomain(medico),
        slug,
      };
    });
  }

  async findAll(): Promise<ReadonlyArray<ProfessionalCatalogSourceItem>> {
    return [...this.items];
  }
}
