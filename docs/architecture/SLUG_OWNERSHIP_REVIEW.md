# Responsabilidade Arquitetural do Slug (P2-015A)

## 1. Escopo

Auditoria exclusivamente de leitura sobre `domain/professional/`,
`infrastructure/alicia/professional/`, `types/alicia/medico.ts`,
`mocks/alicia/medicos.ts`, `application/alicia/catalog/`, e busca por
`slug`/`id`/`identity`/`ProfessionalCatalogProjection` em todo o
projeto (incluindo `app/`, `components/`, `services/`, não listados
explicitamente no escopo mas necessários para responder com evidência
real onde `slug` é efetivamente consumido). Nenhuma alteração de
código foi feita.

## 2. Contexto confirmado

A P2-015 identificou corretamente o bloqueio: `ProfessionalCatalogProjection`
e `BuildProfessionalCatalogProjection` exigem `slug`;
`ProfessionalRepository.findAll()` retorna apenas `Professional`;
`Professional` não possui `slug` em nenhum campo público;
`LegacyProfessionalMapper` descarta `Medico.slug` (nunca lê
`input.slug` em `toDomain()`).

**Achado adicional desta auditoria:** `slug` é, hoje, um identificador
de **roteamento público real**, não apenas um campo ocioso do legado.
Confirmado por leitura de:
- `components/alicia/MedicoCard.tsx` — monta o link do card como
  `` `/alicia/${medico.estadoSigla}/${medico.especialidadeId}/${medico.slug}` ``;
- `services/alicia/medicos.ts` — resolve um médico a partir da URL
  comparando `medico.slug === slug` (case-insensitive).

Ou seja: o slug já sustenta uma rota pública em produção no pipeline
legado (`app/alicia/[estado]/[especialidade]/[medico]`), o que muda o
peso da decisão — não é um campo cosmético descartável.

## 3. Matriz de identidade

| Identificador | Onde existe | Responsável | Público | Persistente | Observação |
|---|---|---|---|---|---|
| `Professional.id` | `domain/professional/Professional.ts` | Aggregate `Professional` (domínio) | Não — nunca aparece em nenhuma URL ou rota | Sim — é a chave usada por `ProfessionalRepository` | Mapeado 1:1 a partir de `Medico.id` pelo `LegacyProfessionalMapper` |
| `Medico.id` | `types/alicia/medico.ts` | Legado (`Medico`) | Não | Sim (chave do mock) | Fonte de `Professional.id` |
| `Medico.slug` | `types/alicia/medico.ts` | Legado (`Medico`), consumido por `services/alicia/medicos.ts` e `components/alicia/MedicoCard.tsx` | **Sim** — compõe a URL pública do perfil | Sim — estável por médico no mock | **Não é identidade de domínio** — é identidade de apresentação/roteamento, e hoje é a única fonte real desse dado em todo o projeto |

Nenhum outro identificador relevante foi encontrado (não há, por
exemplo, um `slug` em `Identity`, `Specialty`, `Education` ou
`PracticeLocation`).

## 4. Avaliação das alternativas

### A — Adicionar slug à aggregate Professional

**Benefícios:** resolveria o bloqueio de forma direta.
**Riscos:** mistura uma preocupação de apresentação/roteamento com a
aggregate de domínio; abre precedente para outros dados de exibição
(ex.: texto de card, meta description) entrarem na aggregate; contraria
a fronteira já estabelecida na P2-012 entre "fatos profissionais
validáveis" (que pertencem a `Professional`) e "dados de exibição do
catálogo" (que pertencem à projeção).
**Impacto:** exigiria alterar `ProfessionalProps`, o construtor de
`Professional`, e o `LegacyProfessionalMapper` (que passaria a ler
`Medico.slug`).
**Compatibilidade com DDD:** baixa — um slug de URL não é um fato do
mundo real sobre o profissional; é uma preocupação de apresentação.
**Impacto futuro (filtros/mapa/perfil):** nenhum ganho real — filtros e
mapa não precisam de slug; perfil precisa, mas esse é exatamente o
papel de uma projeção de leitura, não da aggregate.

### B — Adicionar slug ao contrato de ProfessionalRepository

**Benefícios:** resolveria o bloqueio sem alterar a aggregate em si
(ex.: um método adicional que retorna `Professional` associado a
slug).
**Riscos:** um repositório de domínio que devolve dado de apresentação
misturado ao dado de domínio perde responsabilidade única; qualquer
implementação real futura (banco de dados) do repositório teria que
também gerenciar slugs, um dado que não pertence à mesma fonte de
verdade do resto da aggregate.
**Impacto:** mudança de contrato usado por `CreateKnowledgeClaim`,
`GetPublishedKnowledgeClaimsByProfessional`,
`GetPublishedKnowledgeTraceByProfessional` e `MockProfessionalRepository`
— todos teriam que ser revisados mesmo não precisando de slug.
**Compatibilidade com DDD:** baixa — repositórios de domínio devem
persistir/consultar aggregates, não combiná-las com dados de outra
camada.
**Impacto futuro:** poluição permanente de um contrato central,
dificultando evoluções futuras (ex.: quando `Registration` finalmente
se tornar mapeável).

### C — Criar um contrato de leitura próprio para o catálogo contendo Professional + slug

**Benefícios:** resolve o bloqueio sem tocar `Professional` nem
`ProfessionalRepository`; mantém a mesma filosofia já adotada e
aprovada na P2-012/P2-013 (a leitura do catálogo combina múltiplas
fontes fora da aggregate); isola toda a mudança dentro de
`application/alicia/catalog/`.
**Riscos:** exige criar uma nova peça arquitetural (um resolvedor ou
contrato que associe `Professional.id` ao `slug` correspondente) —
mais uma peça, porém pequena e isolada.
**Impacto:** zero mudança em `Professional`, `ProfessionalRepository`,
`MockProfessionalRepository` ou nos casos de uso do Knowledge Core; o
trabalho fica inteiramente contido em `application/alicia/catalog/`.
**Compatibilidade com DDD:** alta — exatamente o padrão de read model
já decidido na P2-012 (Aggregate × Projection).
**Impacto futuro:** positivo — o mesmo contrato seria o lugar natural
para futuramente incorporar também o selo de verificação/elegibilidade
do Knowledge Core, sem jamais poluir a aggregate.

### D — Remover slug da ProfessionalCatalogProjection

**Benefícios:** eliminaria o bloqueio imediatamente.
**Riscos:** o slug é, hoje, o único identificador público real usado
pela rota existente da AliCIA (`/alicia/[estado]/[especialidade]/[medico]`,
confirmado em `MedicoCard.tsx`/`services/alicia/medicos.ts`) —
removê-lo tornaria a projeção incapaz de sustentar links de perfil
funcionais, quebrando a capacidade central de um catálogo público
navegável.
**Impacto:** perda de uma capacidade essencial do MVP.
**Compatibilidade com DDD:** neutra — não é uma questão de modelagem,
é uma perda funcional.
**Impacto futuro:** ruim — adiaria o problema real sem resolvê-lo, e
muito provavelmente exigiria reintroduzir o campo assim que o perfil
público real fosse implementado.

## 5. Decisão recomendada

**2. slug pertence ao contrato do catálogo**

Corresponde à Alternativa C. Justificativa técnica: é a única
alternativa com alta compatibilidade com DDD, que não altera
`Professional` nem `ProfessionalRepository`, que preserva a capacidade
funcional essencial do catálogo (gerar links de perfil reais, hoje
sustentados por slug), e que segue exatamente o precedente já
aprovado na P2-012/P2-013 — leitura do catálogo é uma composição de
múltiplas fontes (hoje: `Professional` via `ProfessionalRepository` +
slug via o legado), não uma responsabilidade da aggregate de domínio.

Isso não significa que o legado seja necessariamente a fonte
permanente do slug — apenas que a **posse arquitetural** do conceito
"slug" é do contrato de leitura do catálogo, não do domínio
`Professional`. De onde exatamente esse valor será obtido no futuro
(legado, uma tabela dedicada de slugs, ou geração determinística a
partir de outro identificador estável) é uma decisão de implementação
separada, não desta auditoria.

## 6. Consequências (não implementadas)

- Uma tarefa futura deverá criar um contrato/porta específico (ex.:
  algo como um resolvedor de slug por `professionalId`) dentro de
  `application/alicia/catalog/`, consumido apenas por
  `ListProfessionalCatalog` (ou equivalente), sem tocar `Professional`
  ou `ProfessionalRepository`.
- `Professional` e `ProfessionalRepository` permanecem exatamente como
  estão — nenhuma mudança de contrato de domínio é necessária.
- O gap concreto registrado na P2-015 (nenhum profissional obtém slug
  real hoje através de `ProfessionalRepository`) permanece existente
  até essa tarefa futura ser executada — esta auditoria não o resolve,
  apenas decide onde ele deve ser resolvido.
