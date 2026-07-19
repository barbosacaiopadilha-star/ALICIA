import type { Professional } from "@/domain/professional/Professional";
import type {
  ProfessionalCatalogEducation,
  ProfessionalCatalogLocation,
  ProfessionalCatalogProjection,
  ProfessionalCatalogSpecialty,
} from "./ProfessionalCatalogProjection";

export interface BuildProfessionalCatalogProjectionInput {
  professional: Professional;
  slug: string;
}

export class BuildProfessionalCatalogProjection {
  execute(input: BuildProfessionalCatalogProjectionInput): ProfessionalCatalogProjection {
    const slug = input.slug?.trim();
    if (!slug) {
      throw new Error("BuildProfessionalCatalogProjection slug is required.");
    }

    const professional = input.professional;

    return {
      id: professional.id,
      slug,
      fullName: professional.identity.fullName,
      professionalName: professional.identity.professionalName,
      photoUrl: professional.identity.photoUrl,
      specialties: this.mapSpecialties(professional),
      education: this.mapEducation(professional),
      primaryLocation: this.mapPrimaryLocation(professional),
      // Professional ainda não possui uma coleção de idiomas integrada em
      // seu próprio nível (ver docs/architecture/PROFESSIONAL_CATALOG_PROJECTION.md).
      // O contrato representa essa coleção conhecida, porém não integrada.
      languages: [],
    };
  }

  private mapSpecialties(professional: Professional): ProfessionalCatalogSpecialty[] {
    return professional.specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
    }));
  }

  private mapEducation(professional: Professional): ProfessionalCatalogEducation[] {
    return professional.education.map((education) => ({
      id: education.id,
      type: education.type,
      program: education.program,
      institutionName: education.institutionName,
      startYear: education.startYear,
      endYear: education.endYear,
    }));
  }

  private mapPrimaryLocation(
    professional: Professional
  ): ProfessionalCatalogLocation | undefined {
    const [firstLocation] = professional.practiceLocations;
    if (!firstLocation) {
      return undefined;
    }

    return {
      id: firstLocation.id,
      name: firstLocation.name,
      city: firstLocation.city,
      state: firstLocation.state,
      latitude: firstLocation.latitude,
      longitude: firstLocation.longitude,
    };
  }
}
