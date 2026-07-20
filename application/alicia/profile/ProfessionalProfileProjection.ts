import type { EducationType } from "@/domain/professional/Education";
import type { ExperienceType } from "@/domain/professional/Experience";
import type { ConditionType } from "@/domain/professional/Condition";
import type { CapabilityType } from "@/domain/professional/Capability";

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

export interface ProfessionalProfileExperience {
  readonly id: string;
  readonly type?: ExperienceType;
  readonly role: string;
  readonly organizationName: string;
  readonly startYear?: number;
  readonly endYear?: number;
  readonly current?: boolean;
  readonly description?: string;
}

export interface ProfessionalProfileCondition {
  readonly id: string;
  readonly name: string;
  readonly type: ConditionType;
}

export interface ProfessionalProfileCapability {
  readonly id: string;
  readonly name: string;
  readonly type: CapabilityType;
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
  readonly experience: ReadonlyArray<ProfessionalProfileExperience>;
  readonly conditions: ReadonlyArray<ProfessionalProfileCondition>;
  readonly capabilities: ReadonlyArray<ProfessionalProfileCapability>;
  readonly practiceLocations: ReadonlyArray<ProfessionalProfileLocation>;
  readonly primaryLocation?: ProfessionalProfileLocation;
}
