import type { EducationType } from "@/domain/professional/Education";

export interface ProfessionalCatalogSpecialty {
  readonly id: string;
  readonly name: string;
}

export interface ProfessionalCatalogEducation {
  readonly id: string;
  readonly type: EducationType;
  readonly program: string;
  readonly institutionName: string;
  readonly startYear?: number;
  readonly endYear?: number;
}

export interface ProfessionalCatalogLocation {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly state: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

export interface ProfessionalCatalogProjection {
  readonly id: string;
  readonly slug: string;
  readonly fullName: string;
  readonly professionalName?: string;
  readonly photoUrl?: string;
  readonly specialties: ReadonlyArray<ProfessionalCatalogSpecialty>;
  readonly education: ReadonlyArray<ProfessionalCatalogEducation>;
  readonly primaryLocation?: ProfessionalCatalogLocation;
  readonly languages: ReadonlyArray<string>;
}
