import { medicos } from "@/mocks/alicia/medicos";
import type { ProfessionalDataProvider } from "./ProfessionalDataProvider";
import type { RawProfessionalData } from "./RawProfessionalData";

/**
 * Implementação do ProfessionalDataProvider a partir dos mocks
 * legados reais (mocks/alicia/medicos.ts). É a única implementação
 * concreta em uso hoje.
 */
export class MockProfessionalDataProvider implements ProfessionalDataProvider {
  listRawProfessionals(): ReadonlyArray<RawProfessionalData> {
    return medicos;
  }
}
