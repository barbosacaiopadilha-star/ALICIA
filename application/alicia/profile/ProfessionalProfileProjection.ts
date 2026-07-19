import type { EducationType } from "@/domain/professional/Education";

export interface ProfessionalProfileSpecialty {
  readonly id: string;
  readonly name: string;
}

export interface ProfessionalProfileEducation {
  readonly id: string;
  readonly type: EducationType;
  readonly program: string;
  readonly institutionName: string;
  readonly startYear?: number;
  readonly endYear?: number;
}

export interface ProfessionalProfileLocation {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly state: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

export interface ProfessionalProfileProjection {
  readonly id: string;
  readonly slug: string;
  readonly fullName: string;
  readonly professionalName?: string;
  readonly photoUrl?: string;
  readonly specialties: ReadonlyArray<ProfessionalProfileSpecialty>;
  readonly education: ReadonlyArray<ProfessionalProfileEducation>;
  readonly practiceLocations: ReadonlyArray<ProfessionalProfileLocation>;
  readonly primaryLocation?: ProfessionalProfileLocation;
}
