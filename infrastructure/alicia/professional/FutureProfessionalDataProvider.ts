import type { ProfessionalDataProvider } from "./ProfessionalDataProvider";
import type { RawProfessionalData } from "./RawProfessionalData";

/**
 * Placeholder para uma futura implementação real de
 * ProfessionalDataProvider (banco de dados, API ou importação
 * editorial). Não é conectada a nenhuma composição pública por
 * padrão — só é retornada quando PROFESSIONAL_DATA_SOURCE=persistent
 * for explicitamente selecionado, e falha imediatamente ao ser usada.
 *
 * Auditoria de infraestrutura (MACROBLOCO-04, ver
 * docs/architecture/PERSISTENT_DATA_PROVIDER_RC.md) não encontrou
 * nenhuma tecnologia de persistência real configurada neste
 * repositório (sem dependências de banco/API, sem diretório de
 * configuração, sem variável de ambiente, sem cliente HTTP) —
 * portanto nenhuma tecnologia foi escolhida arbitrariamente. Esta
 * classe existe apenas para comprovar que o contrato
 * ProfessionalDataProvider já é suficiente para uma segunda
 * implementação, sem alterar repositories, sources, domínio ou UI
 * quando uma fonte real for decidida externamente.
 */
export class FutureProfessionalDataProvider implements ProfessionalDataProvider {
  listRawProfessionals(): ReadonlyArray<RawProfessionalData> {
    throw new Error(
      "FutureProfessionalDataProvider.listRawProfessionals: nenhuma origem persistente real está configurada neste projeto. " +
        "Veja docs/architecture/PERSISTENT_DATA_PROVIDER_RC.md para a decisão técnica pendente."
    );
  }
}
