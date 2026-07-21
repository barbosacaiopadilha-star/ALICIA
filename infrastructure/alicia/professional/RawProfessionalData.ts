import type {
  ExperienciaProfissional,
  FormacaoAcademica,
  VerificacaoMedico,
} from "@/types/alicia/trajetoria-medica";

/**
 * Contrato de dados brutos de entrada para profissionais — a única
 * forma que uma fonte de dados (mock, banco, API, importação
 * editorial) precisa produzir para alimentar a aplicação. Puro tipo
 * de dados: sem comportamento, sem dependência de domain/professional
 * nem de app/components.
 *
 * `Medico` (types/alicia/medico.ts) satisfaz este contrato
 * estruturalmente hoje, mas não é mais o contrato permanente da
 * aplicação — apenas a primeira fonte concreta a implementá-lo (ver
 * docs/architecture/REAL_DATA_PROVIDER_RC.md).
 */
export interface RawProfessionalData {
  id: string;
  slug: string;
  nome: string;
  especialidadeId: string;
  estadoSigla: string;
  cidade: string;
  instituicaoPrincipal: string;
  formacaoResumo: string;
  verificado: boolean;
  fotoUrl?: string;
  bioCurta?: string;
  formacoes?: FormacaoAcademica[];
  experiencias?: ExperienciaProfissional[];
  verificacoes?: VerificacaoMedico[];
  areasDeAtuacao?: string[];
}
