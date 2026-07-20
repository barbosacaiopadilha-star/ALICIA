import type { ProfessionalPublicBiography } from "@/domain/editorial/ProfessionalPublicBiography";
import type { ProfessionalPublicBiographyRepository } from "@/domain/editorial/repositories/ProfessionalPublicBiographyRepository";

export class InMemoryProfessionalPublicBiographyRepository
  implements ProfessionalPublicBiographyRepository
{
  private readonly biographies: ProfessionalPublicBiography[];

  constructor(biographies: ReadonlyArray<ProfessionalPublicBiography> = []) {
    this.biographies = [...biographies];
  }

  async findById(id: string): Promise<ProfessionalPublicBiography | null> {
    const found = this.biographies.find((biography) => biography.id === id);
    return found ?? null;
  }

  async findByProfessionalId(
    professionalId: string
  ): Promise<ReadonlyArray<ProfessionalPublicBiography>> {
    return this.biographies.filter((biography) => biography.professionalId === professionalId);
  }

  async save(biography: ProfessionalPublicBiography): Promise<void> {
    const index = this.biographies.findIndex((existing) => existing.id === biography.id);
    if (index >= 0) {
      this.biographies[index] = biography;
    } else {
      this.biographies.push(biography);
    }
  }
}
