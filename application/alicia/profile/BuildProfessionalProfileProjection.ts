import type { Professional } from "@/domain/professional/Professional";
import type {
  ProfessionalProfileCondition,
  ProfessionalProfileEducation,
  ProfessionalProfileExperience,
  ProfessionalProfileLocation,
  ProfessionalProfileProjection,
  ProfessionalProfileSpecialty,
} from "./ProfessionalProfileProjection";

export interface BuildProfessionalProfileProjectionInput {
  readonly professional: Professional;
  readonly slug: string;
}

export class BuildProfessionalProfileProjection {
  execute(input: BuildProfessionalProfileProjectionInput): ProfessionalProfileProjection {
    const slug = input.slug?.trim();
    if (!slug) {
      throw new Error("BuildProfessionalProfileProjection slug is required.");
    }

    const professional = input.professional;
    const practiceLocations = this.mapPracticeLocations(professional);

    return {
      id: professional.id,
      slug,
      fullName: professional.identity.fullName,
      professionalName: professional.identity.professionalName,
      photoUrl: professional.identity.photoUrl,
      specialties: this.mapSpecialties(professional),
      education: this.mapEducation(professional),
      experience: this.mapExperience(professional),
      conditions: this.mapConditions(professional),
      practiceLocations,
      primaryLocation: practiceLocations[0],
    };
  }

  private mapSpecialties(professional: Professional): ProfessionalProfileSpecialty[] {
    return professional.specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
    }));
  }

  private mapEducation(professional: Professional): ProfessionalProfileEducation[] {
    return professional.education.map((education) => ({
      id: education.id,
      type: education.type,
      program: education.program,
      institutionName: education.institutionName,
      startYear: education.startYear,
      endYear: education.endYear,
    }));
  }

  private mapExperience(professional: Professional): ProfessionalProfileExperience[] {
    return professional.experience.map((experience) => ({
      id: experience.id,
      type: experience.type,
      role: experience.role,
      organizationName: experience.organizationName,
      startYear: experience.startYear,
      endYear: experience.endYear,
      current: experience.current,
      description: experience.description,
    }));
  }

  private mapConditions(professional: Professional): ProfessionalProfileCondition[] {
    return professional.conditions.map((condition) => ({
      id: condition.id,
      name: condition.name,
      type: condition.type,
    }));
  }

  private mapPracticeLocations(professional: Professional): ProfessionalProfileLocation[] {
    return professional.practiceLocations.map((location) => ({
      id: location.id,
      name: location.name,
      city: location.city,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }
}
