/**
 * Caso controlado da primeira curadoria real (PRODUCT-WAVE-P1).
 *
 * Dados fictícios e determinísticos que alimentam o workspace do
 * curador em /curadoria. Nenhuma IA, nenhuma persistência: o caso é
 * montado em memória pelo domínio real (montarCasoControlado) a cada
 * abertura — a demonstração não exige editar código nem montar mocks
 * à mão.
 *
 * Este arquivo é DADO, não lógica: nenhum import de runtime, para que
 * os módulos que o consomem rodem tanto no build do Next quanto no
 * test runner nativo do Node.
 */
export type GrupoDeCriterioControlado =
  | "obrigatorio"
  | "preferencial"
  | "excludente"
  | "indeterminado";

export interface CriterioControlado {
  readonly id: string;
  readonly grupo: GrupoDeCriterioControlado;
  readonly descricao: string;
  readonly origem: "historia_do_paciente" | "normalizacao" | "curador";
}

export interface MedicoControlado {
  readonly id: string;
  readonly nome: string;
  readonly especialidade: string;
  readonly cidade: string;
  readonly formacao: ReadonlyArray<string>;
  readonly experiencia: ReadonlyArray<string>;
}

export interface EvidenciaControlada {
  readonly id: string;
  readonly tipo:
    | "registro_conselho"
    | "diploma"
    | "certificado_de_programa"
    | "publicacao"
    | "declaracao_institucional"
    | "curriculo_publico";
  readonly referencia: string;
  readonly descricao: string;
}

export interface AvaliacaoControlada {
  readonly criterioId: string;
  readonly professionalId: string;
  readonly resultado: "atende" | "nao_atende" | "indeterminado";
  readonly evidenciaIds: ReadonlyArray<string>;
}

export const CASO_CONTROLADO = {
  casoId: "caso-0001",
  pacienteId: "pac-0001",
  abertoEm: "2026-07-20T09:00:00.000Z",
  snapshotId: "snap-0001",

  historia: [
    "Paciente adulto com dor crônica no joelho direito após lesão esportiva, com indicação de avaliação cirúrgica.",
    "Já realizou tratamento conservador por seis meses, sem melhora sustentada.",
    "Reside em São Paulo e prefere atendimento presencial na cidade.",
  ],

  criterios: [
    {
      id: "crit-obr-1",
      grupo: "obrigatorio",
      descricao: "Residência concluída em Ortopedia e Traumatologia",
      origem: "historia_do_paciente",
    },
    {
      id: "crit-obr-2",
      grupo: "obrigatorio",
      descricao: "Registro ativo no conselho profissional",
      origem: "normalizacao",
    },
    {
      id: "crit-pref-1",
      grupo: "preferencial",
      descricao: "Atuação documentada em cirurgia do joelho",
      origem: "historia_do_paciente",
    },
    {
      id: "crit-pref-2",
      grupo: "preferencial",
      descricao: "Atendimento presencial na cidade de São Paulo",
      origem: "normalizacao",
    },
    {
      id: "crit-excl-1",
      grupo: "excludente",
      descricao: "Atuação exclusivamente pediátrica (o caso é de paciente adulto)",
      origem: "curador",
    },
    {
      id: "crit-ind-1",
      grupo: "indeterminado",
      descricao: "Volume anual de cirurgias do joelho não documentado publicamente",
      origem: "curador",
    },
  ] as ReadonlyArray<CriterioControlado>,

  medicos: [
    {
      id: "med-001",
      nome: "Ana Martins",
      especialidade: "Ortopedia",
      cidade: "São Paulo",
      formacao: [
        "Graduação em Medicina — Universidade Médica do Sudeste (fictícia)",
        "Residência em Ortopedia e Traumatologia — Hospital Escola Santa Aurora (fictício)",
      ],
      experiencia: [
        "Atuação em cirurgia do joelho e reabilitação ortopédica",
        "Acompanhamento de trauma esportivo em centro clínico (fictício)",
      ],
    },
    {
      id: "med-002",
      nome: "Carlos Eduardo Lima",
      especialidade: "Ortopedia",
      cidade: "São Paulo",
      formacao: [
        "Graduação em Medicina — Instituto Médico do Interior (fictício)",
        "Residência em Ortopedia e Traumatologia — Hospital Central Fictício",
      ],
      experiencia: [
        "Atuação em ortopedia geral com atendimento presencial em São Paulo",
      ],
    },
    {
      id: "med-003",
      nome: "Patrícia Nogueira",
      especialidade: "Ortopedia",
      cidade: "São Paulo",
      formacao: [
        "Graduação em Medicina — Universidade do Norte (fictícia)",
        "Residência em Ortopedia e Traumatologia — Hospital Universitário do Norte (fictício)",
      ],
      experiencia: [
        "Atuação em ortopedia com publicação sobre reabilitação pós-artroscopia",
      ],
    },
    {
      id: "med-004",
      nome: "Bruno Teixeira",
      especialidade: "Ortopedia",
      cidade: "São Paulo",
      formacao: [
        "Graduação em Medicina — Faculdade Médica Paulista (fictícia)",
        "Residência em Ortopedia Pediátrica — Hospital Infantil Fictício",
      ],
      experiencia: ["Atuação em ambulatório infantil (fictício)"],
    },
    {
      id: "med-005",
      nome: "Juliana Castro",
      especialidade: "Ortopedia",
      cidade: "São Paulo",
      formacao: ["Graduação em Medicina — Universidade Fictícia da Capital"],
      experiencia: ["Atuação em pronto atendimento ortopédico (fictício)"],
    },
    {
      id: "med-006",
      nome: "Felipe Rocha",
      especialidade: "Ortopedia",
      cidade: "São Paulo",
      formacao: [
        "Graduação em Medicina — Universidade Médica do Sudeste (fictícia)",
        "Residência em Ortopedia e Traumatologia — Hospital Escola Santa Aurora (fictício)",
      ],
      experiencia: [
        "Atuação em cirurgia do joelho com foco em trauma esportivo",
      ],
    },
  ] as ReadonlyArray<MedicoControlado>,

  evidencias: [
    { id: "ev-001-crm", tipo: "registro_conselho", referencia: "CRM/SP (fictício) A-1101", descricao: "Registro ativo no conselho — Ana Martins" },
    { id: "ev-001-res", tipo: "certificado_de_programa", referencia: "Certificado RM Ortopedia (fictício) HESA-2019", descricao: "Residência em Ortopedia e Traumatologia — Ana Martins" },
    { id: "ev-001-joelho", tipo: "curriculo_publico", referencia: "Currículo público (fictício) — seção joelho", descricao: "Atuação documentada em cirurgia do joelho — Ana Martins" },
    { id: "ev-002-crm", tipo: "registro_conselho", referencia: "CRM/SP (fictício) A-1102", descricao: "Registro ativo no conselho — Carlos Eduardo Lima" },
    { id: "ev-002-res", tipo: "certificado_de_programa", referencia: "Certificado RM Ortopedia (fictício) IMED-2016", descricao: "Residência em Ortopedia e Traumatologia — Carlos Eduardo Lima" },
    { id: "ev-003-crm", tipo: "registro_conselho", referencia: "CRM/SP (fictício) A-1103", descricao: "Registro ativo no conselho — Patrícia Nogueira" },
    { id: "ev-003-res", tipo: "certificado_de_programa", referencia: "Certificado RM Ortopedia (fictício) HUNE-2014", descricao: "Residência em Ortopedia e Traumatologia — Patrícia Nogueira" },
    { id: "ev-003-pub", tipo: "publicacao", referencia: "DOI fictício 10.0000/joelho-reab", descricao: "Publicação sobre reabilitação pós-artroscopia — Patrícia Nogueira" },
    { id: "ev-004-crm", tipo: "registro_conselho", referencia: "CRM/SP (fictício) A-1104", descricao: "Registro ativo no conselho — Bruno Teixeira" },
    { id: "ev-004-ped", tipo: "declaracao_institucional", referencia: "Declaração institucional (fictícia) — ambulatório infantil", descricao: "Atuação exclusivamente pediátrica — Bruno Teixeira" },
    { id: "ev-005-crm", tipo: "registro_conselho", referencia: "CRM/SP (fictício) A-1105", descricao: "Registro ativo no conselho — Juliana Castro" },
    { id: "ev-006-crm", tipo: "registro_conselho", referencia: "CRM/SP (fictício) A-1106", descricao: "Registro ativo no conselho — Felipe Rocha" },
    { id: "ev-006-res", tipo: "certificado_de_programa", referencia: "Certificado RM Ortopedia (fictício) HESA-2021", descricao: "Residência em Ortopedia e Traumatologia — Felipe Rocha" },
    { id: "ev-006-joelho", tipo: "curriculo_publico", referencia: "Currículo público (fictício) — trauma esportivo", descricao: "Atuação documentada em cirurgia do joelho — Felipe Rocha" },
  ] as ReadonlyArray<EvidenciaControlada>,

  /**
   * Tabela determinística de avaliação por (critério, profissional).
   * O critério indeterminado (crit-ind-1) não aparece: o grupo
   * indeterminado nunca é avaliado (ADR-030).
   * Ausência de linha = "indeterminado" (nunca vira nao_atende).
   */
  avaliacoes: [
    // Ana Martins — elegível
    { criterioId: "crit-obr-1", professionalId: "med-001", resultado: "atende", evidenciaIds: ["ev-001-res"] },
    { criterioId: "crit-obr-2", professionalId: "med-001", resultado: "atende", evidenciaIds: ["ev-001-crm"] },
    { criterioId: "crit-pref-1", professionalId: "med-001", resultado: "atende", evidenciaIds: ["ev-001-joelho"] },
    { criterioId: "crit-pref-2", professionalId: "med-001", resultado: "atende", evidenciaIds: ["ev-001-crm"] },
    { criterioId: "crit-excl-1", professionalId: "med-001", resultado: "nao_atende", evidenciaIds: [] },
    // Carlos Eduardo Lima — elegível
    { criterioId: "crit-obr-1", professionalId: "med-002", resultado: "atende", evidenciaIds: ["ev-002-res"] },
    { criterioId: "crit-obr-2", professionalId: "med-002", resultado: "atende", evidenciaIds: ["ev-002-crm"] },
    { criterioId: "crit-pref-1", professionalId: "med-002", resultado: "nao_atende", evidenciaIds: [] },
    { criterioId: "crit-pref-2", professionalId: "med-002", resultado: "atende", evidenciaIds: ["ev-002-crm"] },
    { criterioId: "crit-excl-1", professionalId: "med-002", resultado: "nao_atende", evidenciaIds: [] },
    // Patrícia Nogueira — elegível
    { criterioId: "crit-obr-1", professionalId: "med-003", resultado: "atende", evidenciaIds: ["ev-003-res"] },
    { criterioId: "crit-obr-2", professionalId: "med-003", resultado: "atende", evidenciaIds: ["ev-003-crm"] },
    { criterioId: "crit-pref-1", professionalId: "med-003", resultado: "indeterminado", evidenciaIds: [] },
    { criterioId: "crit-pref-2", professionalId: "med-003", resultado: "atende", evidenciaIds: ["ev-003-crm"] },
    { criterioId: "crit-excl-1", professionalId: "med-003", resultado: "nao_atende", evidenciaIds: [] },
    // Bruno Teixeira — excluído pelo excludente (atuação pediátrica)
    { criterioId: "crit-obr-1", professionalId: "med-004", resultado: "atende", evidenciaIds: ["ev-004-crm"] },
    { criterioId: "crit-obr-2", professionalId: "med-004", resultado: "atende", evidenciaIds: ["ev-004-crm"] },
    { criterioId: "crit-excl-1", professionalId: "med-004", resultado: "atende", evidenciaIds: ["ev-004-ped"] },
    // Juliana Castro — obrigatório crit-obr-1 sem linha ⇒ indeterminado ⇒ exclusão auditável
    { criterioId: "crit-obr-2", professionalId: "med-005", resultado: "atende", evidenciaIds: ["ev-005-crm"] },
    { criterioId: "crit-excl-1", professionalId: "med-005", resultado: "nao_atende", evidenciaIds: [] },
    // Felipe Rocha — elegível
    { criterioId: "crit-obr-1", professionalId: "med-006", resultado: "atende", evidenciaIds: ["ev-006-res"] },
    { criterioId: "crit-obr-2", professionalId: "med-006", resultado: "atende", evidenciaIds: ["ev-006-crm"] },
    { criterioId: "crit-pref-1", professionalId: "med-006", resultado: "atende", evidenciaIds: ["ev-006-joelho"] },
    { criterioId: "crit-pref-2", professionalId: "med-006", resultado: "atende", evidenciaIds: ["ev-006-crm"] },
    { criterioId: "crit-excl-1", professionalId: "med-006", resultado: "nao_atende", evidenciaIds: [] },
  ] as ReadonlyArray<AvaliacaoControlada>,
} as const;
