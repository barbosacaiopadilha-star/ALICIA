import type { ProfessionalPublicBiography } from "../ProfessionalPublicBiography";

export interface ProfessionalPublicBiographyRepository {
  findById(id: string): Promise<ProfessionalPublicBiography | null>;
  findByProfessionalId(
    professionalId: string
  ): Promise<ReadonlyArray<ProfessionalPublicBiography>>;
  save(biography: ProfessionalPublicBiography): Promise<void>;
}
