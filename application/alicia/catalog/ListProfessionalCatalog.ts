import type { ProfessionalRepository } from "@/domain/professional/repositories/ProfessionalRepository";
import type { ProfessionalCatalogProjection } from "./ProfessionalCatalogProjection";
import { BuildProfessionalCatalogProjection } from "./BuildProfessionalCatalogProjection";

export interface ListProfessionalCatalogInput {}

export class ListProfessionalCatalog {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly buildProfessionalCatalogProjection: BuildProfessionalCatalogProjection
  ) {}

  async execute(
    _input: ListProfessionalCatalogInput
  ): Promise<ReadonlyArray<ProfessionalCatalogProjection>> {
    const professionals = await this.professionalRepository.findAll();

    const projections: ProfessionalCatalogProjection[] = [];
    for (const professional of professionals) {
      // Professional não expõe, em nenhum campo público, um slug do fluxo
      // legado: Medico.slug nunca foi integrado à aggregate (descartado pelo
      // LegacyProfessionalMapper). Sem uma fonte real de slug alcançável
      // através de ProfessionalRepository, este profissional é omitido do
      // catálogo aqui, em vez de receber um slug inventado ou derivado do
      // nome. Com o modelo atual, isto se aplica a todo profissional
      // retornado por findAll() — ver relatório da P2-015 para o registro
      // completo desta lacuna arquitetural. A ordem do repositório é
      // preservada para os itens que eventualmente vierem a ter slug.
      void professional;
      continue;
    }

    return projections;
  }
}
