import type { Medico } from "@/types/alicia/medico";
import type { TipoFormacao } from "@/types/alicia/trajetoria-medica";
import { Identity } from "@/domain/professional/Identity";
import { Professional } from "@/domain/professional/Professional";
import { Specialty } from "@/domain/professional/Specialty";
import { Education } from "@/domain/professional/Education";
import type { EducationType } from "@/domain/professional/Education";
import { PracticeLocation } from "@/domain/professional/PracticeLocation";
import { Experience } from "@/domain/professional/Experience";
import { Condition } from "@/domain/professional/Condition";
import type { ConditionType } from "@/domain/professional/Condition";
import { Capability } from "@/domain/professional/Capability";
import type { CapabilityType } from "@/domain/professional/Capability";
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

// Tabela fechada e determinística: somente os itens de areasDeAtuacao já
// aprovados nas auditorias (docs/architecture/AREAS_DE_ATUACAO_DECOMPOSITION_REVIEW.md
// e docs/architecture/CONDITION_CLASSIFICATION_REVIEW.md) têm correspondência
// exata aqui. Correspondência é por igualdade exata de texto — nenhuma
// palavra-chave, regex, prefixo ou heurística. Qualquer valor ausente desta
// tabela (ex.: "Trauma esportivo", ambíguo entre injury/care-need) é
// ignorado por mapConditions, não convertido para "other".
const CONDITION_TYPE_MAP: Record<string, ConditionType> = {
  Joelho: "body-region",
  Arritmias: "disease",
};

// Tabela fechada e determinística: somente o item de areasDeAtuacao já
// aprovado na auditoria (docs/architecture/CAPABILITY_CLASSIFICATION_REVIEW.md)
// tem correspondência exata aqui. Correspondência é por igualdade exata de
// texto — nenhuma palavra-chave, regex, prefixo ou heurística. Qualquer
// valor ausente desta tabela (ex.: "Trauma esportivo", "Ortopedia geral",
// "Prevenção cardiovascular") é ignorado por mapCapabilities, não
// convertido para "other".
const CAPABILITY_TYPE_MAP: Record<string, CapabilityType> = {
  Angioplastia: "procedure",
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
      experience: this.mapExperience(input.experiencias),
      conditions: this.mapConditions(input.id, input.areasDeAtuacao ?? []),
      capabilities: this.mapCapabilities(input.id, input.areasDeAtuacao ?? []),
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

  private static mapExperience(experiencias: Medico["experiencias"]): Experience[] {
    const experience: Experience[] = [];
    for (const experiencia of experiencias ?? []) {
      // "type" não possui nenhuma correspondência real no legado (não há
      // campo equivalente em ExperienciaProfissional) — permanece
      // deliberadamente ausente, nunca inferido a partir de "funcao".
      // "cidade" também não é encaminhada: Experience não possui campo de
      // local, mesma política já adotada para Education.
      experience.push(
        Experience.create({
          id: experiencia.id,
          role: experiencia.funcao,
          organizationName: experiencia.instituicao,
          startYear: experiencia.anoInicio,
          endYear: experiencia.anoConclusao,
          current: experiencia.atual,
        })
      );
    }
    return experience;
  }

  private static mapConditions(
    professionalId: string,
    areasDeAtuacao: ReadonlyArray<string>
  ): Condition[] {
    const conditions: Condition[] = [];
    for (const area of areasDeAtuacao) {
      const type = CONDITION_TYPE_MAP[area];
      if (!type) {
        // Item ainda não aprovado para migração (ex.: "Trauma esportivo",
        // "Ortopedia geral", "Angioplastia", "Prevenção cardiovascular") —
        // permanece exclusivamente no bridge legado, sem virar Condition
        // nem "other".
        continue;
      }

      const id = `${professionalId}-condition-${this.slugify(area)}`;
      conditions.push(
        Condition.create({
          id,
          name: area,
          type,
        })
      );
    }
    return conditions;
  }

  private static mapCapabilities(
    professionalId: string,
    areasDeAtuacao: ReadonlyArray<string>
  ): Capability[] {
    const capabilities: Capability[] = [];
    for (const area of areasDeAtuacao) {
      const type = CAPABILITY_TYPE_MAP[area];
      if (!type) {
        // Item ainda não aprovado para migração (ex.: "Trauma esportivo",
        // "Ortopedia geral", "Prevenção cardiovascular") — permanece
        // exclusivamente no bridge legado, sem virar Capability nem "other".
        continue;
      }

      const id = `${professionalId}-capability-${this.slugify(area)}`;
      capabilities.push(
        Capability.create({
          id,
          name: area,
          type,
        })
      );
    }
    return capabilities;
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


