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
}
