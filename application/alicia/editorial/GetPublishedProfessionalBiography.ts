import type { ProfessionalPublicBiography } from "@/domain/editorial/ProfessionalPublicBiography";
import type { ProfessionalPublicBiographyRepository } from "@/domain/editorial/repositories/ProfessionalPublicBiographyRepository";

export class GetPublishedProfessionalBiography {
  constructor(private readonly biographyRepository: ProfessionalPublicBiographyRepository) {}

  async execute(professionalId: string): Promise<ProfessionalPublicBiography | null> {
    const normalizedProfessionalId = professionalId?.trim();
    if (!normalizedProfessionalId) {
      throw new Error("GetPublishedProfessionalBiography professionalId is required.");
    }

    const biographies = await this.biographyRepository.findByProfessionalId(
      normalizedProfessionalId
    );

    const publishedBiographies = biographies
      .filter((biography) => biography.status === "published")
      .sort((a, b) => {
        const updatedAtDiff = b.updatedAt.getTime() - a.updatedAt.getTime();
        if (updatedAtDiff !== 0) {
          return updatedAtDiff;
        }

        const createdAtDiff = b.createdAt.getTime() - a.createdAt.getTime();
        if (createdAtDiff !== 0) {
          return createdAtDiff;
        }

        if (a.id < b.id) {
          return -1;
        }
        if (a.id > b.id) {
          return 1;
        }
        return 0;
      });

    return publishedBiographies[0] ?? null;
  }
}
