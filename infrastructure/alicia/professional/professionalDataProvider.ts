import { medicos } from "@/mocks/alicia/medicos";
import type { Medico } from "@/types/alicia/medico";

/**
 * Única fronteira de leitura dos dados brutos de profissionais nesta
 * versão do MVP. Hoje lê exclusivamente de mocks/alicia/medicos.ts —
 * esta função é o único ponto que precisará mudar quando uma fonte
 * real (banco de dados, API, importação editorial) substituir os
 * mocks. Nenhum outro arquivo de infraestrutura, aplicação ou service
 * deve importar `medicos` diretamente (ver
 * docs/architecture/REAL_DATA_FOUNDATION_RC.md).
 *
 * Retorna o formato bruto (Medico), não Professional — a conversão
 * para o domínio continua sendo responsabilidade de
 * LegacyProfessionalMapper, chamado por cada consumidor conforme sua
 * própria necessidade (com ou sem slug, por exemplo).
 */
export function listRawProfessionals(): ReadonlyArray<Medico> {
  return medicos;
}
