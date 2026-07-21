import type { ProfessionalCatalogProjection } from "./ProfessionalCatalogProjection";

export interface ProfessionalCatalogSearchCriteria {
  readonly estado?: string;
  readonly especialidade?: string;
  readonly cidade?: string;
  readonly texto?: string;
}

export interface ProfessionalCatalogQuery {
  list(
    criteria?: ProfessionalCatalogSearchCriteria
  ): Promise<ReadonlyArray<ProfessionalCatalogProjection>>;
  getBySlug(slug: string): Promise<ProfessionalCatalogProjection | null>;
}

/**
 * Predicado puro e reutilizável de correspondência entre uma
 * ProfessionalCatalogProjection e critérios de busca opcionais.
 * Filtragem em memória, sem indexação — usado pela implementação da
 * Query para os critérios de rota (estado/especialidade). A busca
 * textual considera apenas campos públicos já existentes na
 * projeção: nome, instituição principal e cidade.
 */
export function matchesProfessionalCatalogSearchCriteria(
  projection: ProfessionalCatalogProjection,
  criteria: ProfessionalCatalogSearchCriteria
): boolean {
  if (criteria.estado && projection.primaryLocation?.state !== criteria.estado) {
    return false;
  }

  if (
    criteria.especialidade &&
    !projection.specialties.some((specialty) => specialty.id === criteria.especialidade)
  ) {
    return false;
  }

  if (criteria.cidade && projection.primaryLocation?.city !== criteria.cidade) {
    return false;
  }

  const texto = criteria.texto?.trim().toLowerCase();
  if (texto) {
    const campos = [
      projection.fullName,
      projection.primaryLocation?.name,
      projection.primaryLocation?.city,
    ].filter((valor): valor is string => Boolean(valor));

    const encontrado = campos.some((valor) => valor.toLowerCase().includes(texto));
    if (!encontrado) {
      return false;
    }
  }

  return true;
}
