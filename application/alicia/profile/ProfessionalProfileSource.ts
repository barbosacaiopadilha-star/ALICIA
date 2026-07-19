import type { Professional } from "@/domain/professional/Professional";

export interface ProfessionalProfileSourceItem {
  readonly professional: Professional;
  readonly slug: string;
}

export interface ProfessionalProfileSource {
  findBySlug(slug: string): Promise<ProfessionalProfileSourceItem | null>;
}
