export type StatusCriterioMetodologia = "ativo" | "em_validacao" | "futuro";

export interface CriterioMetodologia {
  id: string;
  titulo: string;
  descricao: string;
  oQueObservamos: string[];
  porQueImporta: string;
  status: StatusCriterioMetodologia;
}

export type TipoFonteMetodologia =
  | "fonte_publica"
  | "documento_profissional"
  | "declaracao_do_medico"
  | "validacao_manual";

export interface FonteMetodologia {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoFonteMetodologia;
}

export interface LimiteMetodologia {
  id: string;
  titulo: string;
  descricao: string;
}

export interface MetodologiaAliCIA {
  versao: string;
  atualizadoEm: string;
  resumo: string;
  criterios: CriterioMetodologia[];
  fontes: FonteMetodologia[];
  limites: LimiteMetodologia[];
  naoAvaliado: string[];
}
