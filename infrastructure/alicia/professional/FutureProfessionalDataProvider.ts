import type { ProfessionalDataProvider } from "./ProfessionalDataProvider";
import type { RawProfessionalData } from "./RawProfessionalData";

/**
 * Placeholder para uma futura implementação real de
 * ProfessionalDataProvider (banco de dados, API ou importação
 * editorial). Não é conectada a nenhuma composição pública — existe
 * apenas para comprovar que o contrato ProfessionalDataProvider já é
 * suficiente para uma segunda implementação, sem alterar
 * repositories, sources, domínio ou UI quando essa fonte real existir.
 *
 * Nenhuma integração externa foi criada nesta tarefa — ver
 * docs/architecture/REAL_DATA_PROVIDER_RC.md para as adaptações ainda
 * pendentes antes de tornar esta implementação real.
 */
export class FutureProfessionalDataProvider implements ProfessionalDataProvider {
  listRawProfessionals(): ReadonlyArray<RawProfessionalData> {
    throw new Error("FutureProfessionalDataProvider.listRawProfessionals not implemented.");
  }
}
