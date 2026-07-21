import type { ProfessionalCatalogProjection } from "./ProfessionalCatalogProjection";

export interface ProfessionalCatalogSearchCriteria {
  readonly estado?: string;
  readonly especialidade?: string;
  readonly cidade?: string;
  readonly texto?: string;
}

export type ProfessionalCatalogSort = "relevance" | "name-asc" | "name-desc";

export const VALID_PROFESSIONAL_CATALOG_SORTS: ProfessionalCatalogSort[] = [
  "relevance",
  "name-asc",
  "name-desc",
];

export interface ProfessionalCatalogQuery {
  list(
    criteria?: ProfessionalCatalogSearchCriteria
  ): Promise<ReadonlyArray<ProfessionalCatalogProjection>>;
  getBySlug(slug: string): Promise<ProfessionalCatalogProjection | null>;
}

/**
 * Normalização textual determinística: minúsculas, sem acentos,
 * espaços extras colapsados. Mesma técnica (NFD + remoção de marcas
 * diacríticas) já usada em Specialty/Condition/Capability e no
 * LegacyProfessionalMapper — reutilizada aqui para a busca pública,
 * não duplicada como uma nova regra.
 */
function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Predicado puro e reutilizável de correspondência entre uma
 * ProfessionalCatalogProjection e critérios de busca opcionais.
 * Filtragem em memória, sem indexação — é a única regra de busca do
 * catálogo, usada tanto para os critérios de rota (estado/
 * especialidade) quanto para os critérios interativos (cidade/texto).
 * A busca textual considera apenas campos públicos já existentes na
 * projeção: nome, instituição principal e cidade; é case-insensitive,
 * accent-insensitive, tolerante a espaços extras e baseada em
 * substring.
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

  const texto = criteria.texto?.trim();
  if (texto) {
    const needle = normalizeSearchText(texto);
    if (needle) {
      const campos = [
        projection.fullName,
        projection.primaryLocation?.name,
        projection.primaryLocation?.city,
      ].filter((valor): valor is string => Boolean(valor));

      const encontrado = campos.some((valor) => normalizeSearchText(valor).includes(needle));
      if (!encontrado) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Ordenação pública determinística e explicável — não representa
 * qualidade médica, apenas critérios totalmente objetivos já
 * existentes na projeção (nome) ou a preservação da ordem já
 * produzida pela filtragem ("relevance"). Não utiliza IA, avaliações,
 * popularidade ou qualquer métrica clínica, porque nenhuma delas
 * existe como campo público real. Retorna sempre uma nova coleção —
 * nunca reordena o array original.
 */
export function sortProfessionalCatalogProjections(
  projections: ReadonlyArray<ProfessionalCatalogProjection>,
  sort: ProfessionalCatalogSort = "relevance"
): ProfessionalCatalogProjection[] {
  if (sort === "name-asc") {
    return [...projections].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "pt-BR", { sensitivity: "base" })
    );
  }

  if (sort === "name-desc") {
    return [...projections].sort((a, b) =>
      b.fullName.localeCompare(a.fullName, "pt-BR", { sensitivity: "base" })
    );
  }

  // "relevance": nenhuma métrica de qualidade existe — apenas preserva
  // a ordem já produzida pela filtragem (estabilidade da lista).
  return [...projections];
}
