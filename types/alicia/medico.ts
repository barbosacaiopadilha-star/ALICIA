import { ExperienciaProfissional, FormacaoAcademica, VerificacaoMedico } from "@/types/alicia/trajetoria-medica";

export interface Medico {
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
