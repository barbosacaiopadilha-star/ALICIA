import { MetodologiaAliCIA } from "@/types/alicia/metodologia";

export const metodologia: MetodologiaAliCIA = {
  versao: "MVP 0.1",
  atualizadoEm: "Julho de 2026",
  resumo:
    "A AliCIA organiza evidências sobre a trajetória acadêmica dos médicos cadastrados. Esta versão não classifica, pontua nem recomenda médicos — apenas organiza e explica as informações disponíveis.",
  criterios: [
    {
      id: "graduacao",
      titulo: "Graduação em Medicina",
      descricao:
        "A base acadêmica declarada pelo médico, incluindo a instituição e o período da formação.",
      oQueObservamos: [
        "Instituição de graduação",
        "Curso de Medicina",
        "Situação da informação (verificada, em validação ou declarada)",
        "Período da formação, quando disponível",
      ],
      porQueImporta:
        "A graduação ajuda a contextualizar a base acadêmica do profissional, mas não determina isoladamente a qualidade do médico.",
      status: "ativo",
    },
    {
      id: "residencia",
      titulo: "Residência Médica",
      descricao:
        "A formação de especialização realizada após a graduação, geralmente o principal elemento da trajetória formativa.",
      oQueObservamos: [
        "Especialidade da residência",
        "Instituição onde foi realizada",
        "Duração da residência",
        "Relação com a especialidade apresentada no perfil",
        "Status de verificação",
      ],
      porQueImporta:
        "A residência é um dos principais elementos da trajetória formativa — isso não significa que uma instituição seja superior a outra.",
      status: "ativo",
    },
    {
      id: "formacao-complementar",
      titulo: "Formação Complementar",
      descricao:
        "Fellowships, especializações, pós-graduações, cursos relevantes e treinamentos complementares registrados no perfil.",
      oQueObservamos: [
        "Tipo de formação complementar",
        "Instituição",
        "Área de aprofundamento",
        "Período, quando disponível",
      ],
      porQueImporta:
        "Essas formações ajudam a compreender áreas de aprofundamento. Cursos curtos não são considerados equivalentes a uma residência.",
      status: "ativo",
    },
    {
      id: "coerencia-trajetoria",
      titulo: "Coerência da Trajetória",
      descricao:
        "A consistência entre os diferentes elementos da formação e da atuação registrados no perfil.",
      oQueObservamos: [
        "Relação entre graduação e residência",
        "Relação entre residência e especialidade declarada",
        "Relação entre formação complementar e área de atuação",
        "Relação com a atuação profissional registrada",
      ],
      porQueImporta:
        "Observar essa coerência ajuda a organizar a trajetória de forma compreensível, sem gerar um score de coerência ou diagnóstico automático.",
      status: "em_validacao",
    },
    {
      id: "experiencia-profissional",
      titulo: "Experiência Profissional",
      descricao:
        "As instituições, funções e períodos de atuação profissional declarados pelo médico.",
      oQueObservamos: [
        "Instituições de atuação",
        "Funções exercidas",
        "Períodos de atuação",
        "Relação com a especialidade",
      ],
      porQueImporta:
        "A experiência ajuda a contextualizar a trajetória, mas não substitui a formação acadêmica nem comprova qualidade de resultado clínico.",
      status: "ativo",
    },
    {
      id: "verificacao-informacoes",
      titulo: "Verificação das Informações",
      descricao: "O estágio de confirmação de cada informação apresentada no perfil.",
      oQueObservamos: [
        "Estado atual: verificada, em validação, declarada ou ainda não verificada",
        "Fonte associada à informação, quando aplicável",
      ],
      porQueImporta:
        "\"Ainda não verificada\" não significa \"falsa\" — significa apenas que a AliCIA ainda não concluiu a confirmação dessa informação.",
      status: "ativo",
    },
  ],
  fontes: [
    {
      id: "fonte-publica",
      nome: "Páginas institucionais públicas",
      descricao:
        "A AliCIA pode utilizar páginas oficiais de instituições de ensino, hospitais e clínicas, além de registros públicos permitidos.",
      tipo: "fonte_publica",
    },
    {
      id: "documento-profissional",
      nome: "Currículos profissionais públicos",
      descricao:
        "Currículos e materiais profissionais disponibilizados publicamente pelo médico.",
      tipo: "documento_profissional",
    },
    {
      id: "declaracao-medico",
      nome: "Declarações do próprio médico",
      descricao: "Informações declaradas diretamente pelo médico ao compor o perfil.",
      tipo: "declaracao_do_medico",
    },
    {
      id: "validacao-manual",
      nome: "Validação manual",
      descricao:
        "Na evolução da plataforma, as informações poderão ser conferidas manualmente, incluindo contato com instituições quando aplicável.",
      tipo: "validacao_manual",
    },
  ],
  naoAvaliado: [
    "Resultado de tratamentos",
    "Taxa de sucesso",
    "Quantidade de cirurgias",
    "Popularidade",
    "Seguidores em redes sociais",
    "Avaliações anônimas",
    "Preço",
    "Disponibilidade de agenda",
    "Proximidade",
    "Convênio",
    "Compatibilidade com um paciente específico",
    "Qualidade humana",
    "Qualidade da comunicação",
    "Desfecho clínico",
    "Indicação médica personalizada",
  ],
  limites: [
    {
      id: "dados-incompletos",
      titulo: "Dados podem estar incompletos",
      descricao:
        "Nem todas as informações acadêmicas ou profissionais estão necessariamente disponíveis ou atualizadas.",
    },
    {
      id: "informacoes-podem-mudar",
      titulo: "Informações podem mudar",
      descricao:
        "Trajetórias profissionais são atualizadas ao longo do tempo e podem não refletir mudanças recentes.",
    },
    {
      id: "fontes-nem-sempre-disponiveis",
      titulo: "Nem toda fonte está publicamente disponível",
      descricao:
        "Algumas instituições ou documentos podem não estar acessíveis para confirmação neste momento.",
    },
    {
      id: "credencial-isolada",
      titulo: "Uma credencial isolada não define o profissional",
      descricao: "Nenhuma formação, isoladamente, determina a qualidade total de um médico.",
    },
    {
      id: "nao-substitui-orientacao",
      titulo: "A AliCIA não substitui orientação médica",
      descricao:
        "As informações aqui apresentadas não substituem uma consulta, diagnóstico ou orientação médica profissional.",
    },
    {
      id: "sem-garantia-resultado",
      titulo: "Não há garantia de resultados clínicos",
      descricao: "A plataforma não garante resultados de tratamentos ou procedimentos.",
    },
    {
      id: "metodologia-em-evolucao",
      titulo: "A metodologia está em evolução",
      descricao:
        "Critérios, fontes e formas de verificação podem ser revisados conforme a AliCIA evolui.",
    },
    {
      id: "sem-ranking",
      titulo: "Não existe ranking no MVP atual",
      descricao: "Esta versão organiza e explica informações — não classifica nem recomenda médicos.",
    },
  ],
};
