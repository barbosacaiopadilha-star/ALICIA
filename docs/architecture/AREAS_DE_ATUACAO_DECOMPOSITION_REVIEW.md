# Decomposição de areasDeAtuacao no Novo Modelo de Domínio (P2-039)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código foi alterado.
Escopo: `Medico.areasDeAtuacao` (legado), as três entidades candidatas
já existentes no domínio (`Specialty`, `Capability`, `Condition`,
nenhuma delas integrada ao bloco legado) e seus consumidores reais.

Consumidores reais confirmados: `page.tsx` (compõe
`legacyProfileBlocks.areasDeAtuacao` a partir de
`legacyProfessional.areasDeAtuacao ?? []`) e
`TrajetoriaAcademica.tsx` (renderiza como lista de tags, condicional a
`length > 0`).

## 2. Inventário completo

Extração direta dos mocks (nenhum agrupamento por semelhança, nenhuma
normalização):

| texto | profissionais | quantidade |
|---|---|---|
| "Joelho" | med-001, med-002 | 2 |
| "Trauma esportivo" | med-001 | 1 |
| "Ortopedia geral" | med-001, med-002 | 2 |
| "Angioplastia" | med-006 | 1 |
| "Arritmias" | med-006 | 1 |
| "Prevenção cardiovascular" | med-006 | 1 |

6 valores distintos no total, distribuídos entre 3 dos 7 profissionais
(med-001, med-002, med-006 — os mesmos 3 que têm `experiencias`/
`verificacoes` populadas). med-001 e med-002 têm `especialidadeId:
"ortopedia"`; med-006 tem `especialidadeId: "cardiologia"`.

## 3. Classificação semântica

**"Joelho"** — **C. Condition** (`type: "body-region"`). É uma região
anatômica, não uma especialidade nem uma capacidade/procedimento.

**"Trauma esportivo"** — **C. Condition** (`type: "injury"` ou
`"care-need"` — ambíguo entre os dois subtipos, mas claramente uma
condição/necessidade de cuidado, não uma especialidade nem uma
capacidade).

**"Ortopedia geral"** — **A. Specialty**. Restabelece literalmente o
nome da especialidade já existente do mesmo profissional
(`especialidadeId: "ortopedia"` → `Specialty.name: "Ortopedia"`),
apenas com o sufixo "geral" — é essencialmente redundante com a
especialidade já mapeada, não um conceito novo.

**"Angioplastia"** — **B. Capability** (`type: "procedure"`). É um
procedimento clínico específico, correspondência direta com a união
de tipos de `Capability`.

**"Arritmias"** — **C. Condition** (`type: "disease"` ou
`"syndrome"`). É uma categoria de condição cardíaca, não uma
especialidade nem uma capacidade.

**"Prevenção cardiovascular"** — **D. Misto**. Descreve uma
abordagem/foco de cuidado, não um fato único e determinístico —
poderia ser `Capability` (`type: "clinical-management"`, uma
capacidade de gestão clínica preventiva) ou `Condition`
(`type: "care-need"`, uma necessidade de cuidado). Nenhuma das duas
interpretações é comprovadamente mais correta que a outra a partir do
texto isolado — genuinamente ambíguo.

**Resumo:** 1 Specialty (redundante), 1 Capability, 3 Condition, 1
Misto/ambíguo. Nenhum item classificado como E (não classificável) —
todos têm ao menos uma categoria plausível, mesmo quando ambígua entre
duas.

## 4. Compatibilidade

| Categoria | Já existe entidade? | Estrutura suficiente? | Exige evolução? | Bloqueia migração? |
|---|---|---|---|---|
| Specialty | Sim (`Specialty.ts`) | Sim (`id`/`name`/`normalizedName`) | Não | Não — mas exige decisão de deduplicação com a especialidade principal já mapeada, não uma evolução estrutural |
| Capability | Sim (`Capability.ts`) | Sim (`id`/`name`/`type`/`level?`/`description?`) | Não | Não — `level` não existe no legado e ficaria `undefined` (campo opcional, sem invenção) |
| Condition | Sim (`Condition.ts`) | Sim (`id`/`name`/`type`/`description?`) | Não | Não — `type` precisa ser escolhido por item (region/injury/disease), decisão de classificação, não estrutural |

Nenhuma das três entidades bloqueia estruturalmente a migração — o
bloqueio real é semântico (decidir o `type`/categoria correta por
item), não uma limitação de modelo.

## 5. Duplicidades

Nenhuma igualdade textual exata foi encontrada entre qualquer valor
de `areasDeAtuacao` e `Specialty.name`, `Education.program` ou
`Experience.role` de qualquer profissional (confirmado por busca
direta nos mocks). Encontradas, porém, **sobreposições parciais**
(mesmo tema, strings diferentes), classificadas conforme instruído
(sem inferir equivalência além do comprovável):

- **"Ortopedia geral"** — sobreposição parcial com a `Specialty`
  já mapeada do mesmo profissional ("Ortopedia", via
  `especialidadeId` compartilhado) — mesmo conceito, texto diferente.
- **"Trauma esportivo"** — sobreposição parcial com a formação de
  med-001: `"Residência em Ortopedia e Traumatologia"`.
- **"Joelho"** — sobreposição parcial com a formação de med-001:
  `"Fellowship em Cirurgia do Joelho"`.
- **"Angioplastia"**, **"Arritmias"**, **"Prevenção cardiovascular"**
  — independentes: nenhuma sobreposição textual ou temática
  comprovável com `Specialty`/`Education`/`Experience` do mesmo
  profissional.

Nenhuma duplicidade real (igualdade textual exata) foi encontrada em
nenhum caso.

## 6. Estratégias

**A — Migrar tudo para Capability:** fidelidade baixa — "Joelho"
(região anatômica) e "Arritmias" (condição) não são capacidades;
forçaria conceitos estruturalmente incorretos. Simplicidade alta,
risco alto, governança ruim, dívida técnica alta (exigiria correção
futura).

**B — Migrar tudo para Condition:** fidelidade baixa — "Angioplastia"
(procedimento) e "Ortopedia geral" (especialidade) não são condições.
Mesmos problemas de A, invertidos.

**C — Migrar tudo para Specialty:** fidelidade pior ainda — a maioria
dos valores (Joelho, Angioplastia, Arritmias) claramente não são
especialidades médicas formais.

**D — Decompor item a item:** fidelidade alta — cada item vai para o
conceito que genuinamente representa. Simplicidade menor (exige
classificação por item, e ao menos um item — "Prevenção
cardiovascular" — permanece ambíguo mesmo após análise cuidadosa).
Risco controlado para os itens claramente classificáveis (5 de 6);
risco real apenas para o item ambíguo. Governança alta — é a única
estratégia que respeita a natureza real de cada dado.

**E — Manter legado:** simplicidade máxima, mas perpetua
indefinidamente a mistura de conceitos já identificada desde a P2-027,
sem progresso.

## 7. Decisão

**4. Decompor item a item**

Forçar todos os 6 valores em uma única categoria (A, B ou C)
produziria dados estruturalmente incorretos para a maioria deles —
por exemplo, "Angioplastia" como `Specialty` ou `Condition` seria
factualmente errado, o mesmo valendo para "Joelho" como `Capability`
ou `Specialty`. A decomposição item a item é a única estratégia
sustentada pelos dados reais, mesmo exigindo tratar separadamente o
único caso genuinamente ambíguo ("Prevenção cardiovascular").

## 8. Próxima implementação

**Entidade escolhida: Condition**

Justificativa: `Condition` é a categoria com o maior número de itens
claramente classificáveis sem ambiguidade de categoria geral (3 de 6:
"Joelho", "Trauma esportivo", "Arritmias" — todos claramente
`Condition`, mesmo quando o subtipo exato dentro da união exige
julgamento), contra apenas 1 item claro para `Capability`
("Angioplastia") e 1 para `Specialty` (que, além disso, é redundante
com uma especialidade já mapeada, não um conceito novo a integrar).
Integrar `Condition` primeiro resolve a maior fatia do problema com o
menor risco de classificação equivocada, seguindo o mesmo padrão de
integração incremental já usado para `Education`/`PracticeLocation`/
`Experience` — deixando os itens mais ambíguos ("Prevenção
cardiovascular") e os redundantes ("Ortopedia geral") para uma etapa
posterior, quando o padrão de integração já estiver estabelecido.

## 9. Fora de escopo

Nenhum domínio, aplicação, infraestrutura, UI, mock ou bridge legado
foi criado ou alterado. Esta tarefa é exclusivamente descritiva.
