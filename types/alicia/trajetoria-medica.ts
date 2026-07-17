export type TipoFormacao =
  | "graduacao"
  | "residencia"
  | "fellowship"
  | "especializacao"
  | "curso";

export interface FormacaoAcademica {
  id: string;
  tipo: TipoFormacao;
  titulo: string;
  instituicao: string;
  cidade?: string;
  estado?: string;
  anoInicio?: number;
  anoConclusao?: number;
  verificado: boolean;
}

export interface ExperienciaProfissional {
  id: string;
  funcao: string;
  instituicao: string;
  cidade?: string;
  anoInicio?: number;
  anoConclusao?: number;
  atual?: boolean;
}

export interface VerificacaoMedico {
  id: string;
  titulo: string;
  descricao: string;
  status: "verificado" | "nao_verificado";
}
