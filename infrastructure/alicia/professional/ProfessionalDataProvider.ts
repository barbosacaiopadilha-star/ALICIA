import type { RawProfessionalData } from "./RawProfessionalData";

/**
 * Abstração para qualquer fonte de dados brutos de profissionais
 * (mock, banco, API, importação editorial). Repositories e sources
 * devem depender exclusivamente deste contrato, nunca de um formato
 * concreto como `Medico` ou de `mocks/alicia/medicos.ts` diretamente.
 */
export interface ProfessionalDataProvider {
  listRawProfessionals(): ReadonlyArray<RawProfessionalData>;
}
