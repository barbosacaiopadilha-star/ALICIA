import { ProfessionalPublicBiography } from "@/domain/editorial/ProfessionalPublicBiography";
import type { ProfessionalPublicBiographyStatus } from "@/domain/editorial/ProfessionalPublicBiography";
import type { ProfessionalPublicBiographyRepository } from "@/domain/editorial/repositories/ProfessionalPublicBiographyRepository";

export interface CreateProfessionalPublicBiographyInput {
  readonly id: string;
  readonly professionalId: string;
  readonly text: string;
  readonly status: ProfessionalPublicBiographyStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly authorId?: string;
  readonly reviewedAt?: Date;
  readonly reviewedBy?: string;
}

export class CreateProfessionalPublicBiography {
  constructor(private readonly biographyRepository: ProfessionalPublicBiographyRepository) {}

  async execute(
    input: CreateProfessionalPublicBiographyInput
  ): Promise<ProfessionalPublicBiography> {
    const existingBiography = await this.biographyRepository.findById(input.id);
    if (existingBiography) {
      throw new Error("CreateProfessionalPublicBiography biography already exists.");
    }

    const biography = ProfessionalPublicBiography.create({
      id: input.id,
      professionalId: input.professionalId,
      text: input.text,
      status: input.status,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      authorId: input.authorId,
      reviewedAt: input.reviewedAt,
      reviewedBy: input.reviewedBy,
    });

    await this.biographyRepository.save(biography);

    return biography;
  }
}
