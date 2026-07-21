import { medicos } from "@/mocks/alicia/medicos";
import type { ProfessionalDataProvider } from "./ProfessionalDataProvider";
import type { RawProfessionalData } from "./RawProfessionalData";
import { validateRawProfessionalDataList } from "./validateRawProfessionalData";

/**
 * Implementação do ProfessionalDataProvider a partir dos mocks
 * legados reais (mocks/alicia/medicos.ts). É a única implementação
 * concreta persistente em uso hoje (dados estáticos em memória, não
 * uma persistência real — ver
 * docs/architecture/PERSISTENT_DATA_PROVIDER_RC.md). Valida cada
 * registro na fronteira de entrada antes de retorná-lo.
 */
export class MockProfessionalDataProvider implements ProfessionalDataProvider {
  listRawProfessionals(): ReadonlyArray<RawProfessionalData> {
    return validateRawProfessionalDataList(medicos);
  }
}
