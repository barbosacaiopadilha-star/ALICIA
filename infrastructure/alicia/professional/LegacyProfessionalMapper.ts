import type { Medico } from "@/types/alicia/medico";
import type { TipoFormacao } from "@/types/alicia/trajetoria-medica";
import { Identity } from "@/domain/professional/Identity";
import { Professional } from "@/domain/professional/Professional";
import { Specialty } from "@/domain/professional/Specialty";
import { Education } from "@/domain/professional/Education";
import type { EducationType } from "@/domain/professional/Education";
import { PracticeLocation } from "@/domain/professional/PracticeLocation";
import { especialidadesBase } from "@/mocks/alicia/especialidades";

/**
 * Converte um registro legado (Medico, de types/alicia/medico.ts) em uma
 * instância válida de Professional.
 *
 * Os mocks atuais (mocks/alicia/medicos.ts) não possuem council, number,
 * state, status nem data de verificação de registro profissional — por
 * isso nenhuma Registration é criada aqui. Nenhum dado é inventado.
 */

// Tradução determinística: TipoFormacao (legado) -> EducationType (domínio).
// "curso" não corresponde a nenhuma categoria acadêmica específica da
// união do domínio, por isso vai para o único valor genérico existente
// ("other"), sem presumir um tipo mais específico.
const EDUCATION_TYPE_MAP: Record<TipoFormacao, EducationType> = {
  graduacao: "undergraduate",
  residencia: "residency",
  fellowship: "fellowship",
  especializacao: "specialization",
  curso: "other",
};

export class LegacyProfessionalMapper {
  static toDomain(input: Medico): Professional {
    const identity = Identity.create({
      fullName: input.nome,
      photoUrl: input.fotoUrl,
    });

    return Professional.create({
      id: input.id,
      identity,
      specialties: this.mapSpecialties(input.especialidadeId),
      education: this.mapEducation(input.formacoes),
      practiceLocations: this.mapPracticeLocations(input),
    });
  }

  private static mapSpecialties(especialidadeId: string): Specialty[] {
    const catalogEntry = especialidadesBase.find((item) => item.id === especialidadeId);
    if (!catalogEntry) {
      return [];
    }
    return [Specialty.create({ id: catalogEntry.id, name: catalogEntry.nome })];
  }

  private static mapEducation(formacoes: Medico["formacoes"]): Education[] {
    const education: Education[] = [];
    for (const formacao of formacoes ?? []) {
      const type = EDUCATION_TYPE_MAP[formacao.tipo];
      if (!type) {
        continue;
      }
      education.push(
        Education.create({
          id: formacao.id,
          type,
          program: formacao.titulo,
          institutionName: formacao.instituicao,
          startYear: formacao.anoInicio,
          endYear: formacao.anoConclusao,
        })
      );
    }
    return education;
  }

  private static mapPracticeLocations(input: Medico): PracticeLocation[] {
    // cidade e estadoSigla representam exclusivamente a localização de
    // atuação do médico nesta tarefa (não o estado de registro profissional).
    if (!input.cidade || !input.estadoSigla) {
      return [];
    }

    // ID determinístico e estável: derivado apenas de professionalId,
    // cidade e UF, sem índice de array, UUID ou timestamp.
    const id = `${input.id}-practice-location-${this.slugify(input.cidade)}-${input.estadoSigla.toLowerCase()}`;

    return [
      PracticeLocation.create({
        id,
        name: input.instituicaoPrincipal,
        city: input.cidade,
        state: input.estadoSigla,
      }),
    ];
  }

  private static slugify(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "");
  }
}


