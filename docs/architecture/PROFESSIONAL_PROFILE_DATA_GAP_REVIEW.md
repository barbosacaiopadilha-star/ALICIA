# Auditoria dos Gaps de Dados do Perfil Profissional (P2-027)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código foi alterado.
Escopo: a rota pública de perfil e seus componentes, os tipos e mocks
legados, o domínio (`Experience`, `Capability`, `Verification`,
`EditorialStatus`), o Knowledge Core (`KnowledgeClaim` e seus casos de
uso publicados) e a nova camada de aplicação do perfil.

## 2. Contrato legado da página

| Campo | Tipo | Obrigatoriedade | Componente | Efeito visual | Ausência |
|---|---|---|---|---|---|
| `medico.nome` | string | Obrigatório | PerfilMedicoHeader | Nome no h1 + iniciais no avatar | N/A |
| `medico.cidade`/`estadoSigla` | string | Obrigatório | PerfilMedicoHeader | Subtítulo "cidade, UF" | N/A |
| `medico.instituicaoPrincipal` | string | Obrigatório | PerfilMedicoHeader | Bloco "Instituição principal" | N/A |
| `medico.verificado` | boolean | Obrigatório | PerfilMedicoHeader | Selo "Formação verificada" (condicional) | Selo some |
| `medico.bioCurta` | string? | Opcional | PerfilMedicoHeader | Parágrafo de biografia (condicional) | Parágrafo some |
| `medico.formacoes` | `FormacaoAcademica[]?` | Opcional (`?? []`) | TrajetoriaAcademica → FormacaoItem | Lista com tipo/título/instituição/local/período/selo `verificado` por item | "Nenhuma formação cadastrada ainda" |
| `medico.experiencias` | `ExperienciaProfissional[]?` | Opcional (`?? []`) | TrajetoriaAcademica | Lista com função/instituição/cidade/período/"Atual" | "Nenhuma experiência profissional cadastrada ainda" |
| `medico.areasDeAtuacao` | `string[]?` | Opcional (`?? []`) | TrajetoriaAcademica | Tags de texto livre | Bloco inteiro não renderiza |
| `medico.verificacoes` | `VerificacaoMedico[]?` | Opcional (`?? []`) | VerificacoesMedico | Lista de título/descrição/status | "Nenhuma verificação registrada ainda" |
| `especialidadeNome` | string | Obrigatório (derivado) | PerfilMedicoHeader | Subtítulo | Já coberto por `specialties[].name` na nova arquitetura |

**Separação por categoria:** estruturais (nome, cidade/UF,
instituição, formação básica, especialidade) — já cobertos ou
cobríveis; editoriais (bioCurta, areasDeAtuacao) — texto livre sem
estrutura formal; verificação (`medico.verificado`,
`formacao.verificado`, `verificacoes[]`) — booleanos/textos sem
rastreabilidade real; derivados (período formatado, local
concatenado, nome de especialidade) — calculados, não bloqueantes em
si.

## 3. Matriz de disponibilidade (resumo — detalhamento nas seções 4–8)

| Campo | Legado | Mocks (de 7) | Domínio | Integrado a Professional | Mapper | Profile Projection | Knowledge Core |
|---|---|---|---|---|---|---|---|
| verificado (Medico + Formação) | Sim | 7/7 (obrigatório; 5 `true`, 2 `false`) | Não como booleano — existe `Verification`, muito mais rigoroso | Não | Não | Não | Conceito existe, zero dado real |
| bioCurta | Sim | 2/7 (med-001, med-006) | Não | — | Não | Não | Não |
| experiencias | Sim | 3/7 (med-001, med-002, med-006), 1 item cada | Sim (`Experience.ts`) | **Não** | Não | Não | Categoria existe (`"experience"`), zero dado real |
| areasDeAtuacao | Sim | 3/7 (2–3 itens cada) | Candidatos: Specialty/Capability/Condition — nenhum corresponde 1:1 | Parcial (só Specialty, que já é outra coisa) | Não | Não | Categoria existe (`"capability"`), zero dado real |
| verificacoes | Sim | 3/7 (3 itens cada) | Não como está — existe `Verification`, muito mais rigoroso | Não | Não | Não | Conceito existe, zero dado real |

## 4. Verificado

`Medico.verificado` (booleano, obrigatório) e
`FormacaoAcademica.verificado` (booleano, obrigatório por item) não
carregam data, fonte, método ou responsável — são selos binários
puros. Não estão vinculados a CRM (não existe campo de registro no
legado). Não estão formalmente vinculados a evidência/afirmação
alguma. O domínio já possui um conceito estrutural muito mais
rigoroso — `Verification` (exige `evidenceId`, `result`, `method`,
`verifiedAt`) — mas ele nunca é populado a partir do legado, e nenhuma
`KnowledgeClaim` real existe para nenhum profissional (confirmado:
nenhuma chamada a `CreateKnowledgeClaim`/`CreateVerification` em
mocks/services/app/components). **Não existe nenhuma evidência real
que sustente `true` para os 5 médicos marcados como verificados —**
é um valor de mock sem processo de verificação documentado.

**Risco:** apresentar "Formação verificada" sem comprovação auditável
contraria exatamente o princípio já registrado em
`KNOWLEDGE_MODEL.md` ("ausência de comprovação não pode ser
apresentada como verificação positiva"). Não deve ser aprovado
automaticamente para migração direta.

## 5. Bio curta

Origem e autoria não documentadas no código (equipe da AliCIA? o
próprio médico? fonte externa?). Caráter editorial/narrativo, não um
fato estruturado verificável. Presente em apenas 2 de 7 mocks. Pode
estar desatualizada — nenhum mecanismo de revisão ou data de última
atualização existe. Nenhuma relação com `Identity` (que só tem
fullName/professionalName/photoUrl/languages) nem com a Profile
Projection hoje.

**Alternativas avaliadas:** manter como campo editorial legado (mais
seguro enquanto autoria for indefinida); adicionar à projection
(exigiria antes definir a fonte de verdade); modelar como
`KnowledgeClaim` tipo `"other"` (semanticamente fraco, sem categoria
própria de "biografia"); conteúdo derivado (não se aplica); permanecer
fora (recomendado até decisão de produto).

## 6. Experiências

Correspondência campo a campo entre `ExperienciaProfissional` e
`domain/professional/Experience`:

| Legado | Domínio | Compatibilidade |
|---|---|---|
| `id` | `id` | Direta |
| `funcao` | `role` | Direta |
| `instituicao` | `organizationName` | Direta |
| `cidade?` | — | **Incompatível** — `Experience` não tem campo de local |
| `anoInicio?`/`anoConclusao?` (number) | `startDate?`/`endDate?` (Date) | **Incompatível** — converter ano→Date exigiria assumir dia/mês arbitrário, uma inferência não coberta pelo dado real |
| `atual?` | `current?` | Direta |
| — | **`type` (obrigatório)** | **Sem correspondente no legado** — classificar cada experiência como `clinical/academic/research/leadership/teaching/other` exigiria inferência humana não determinística |

**Conclusão:** `Experience` não pode ser populada pelo mapper sem
invenção, tanto pela ausência de `type` real quanto pela
incompatibilidade ano↔Date. `Experience` precisa primeiro ser
integrada à aggregate (mesmo tipo de tarefa já feito para
Specialty/Education/PracticeLocation — P2-007/008/009), **e** exige
uma decisão de modelagem adicional (regra segura para `type` e para
a conversão de datas) antes que o mapper possa populá-la sem
invenção — uma situação de bloqueio por dados de origem insuficientes,
análoga à P2-010 (Registration). O perfil deveria expor uma projeção
própria (campos equivalentes aos já usados para `education`), nunca a
entidade completa — mas só depois que o gap de dados for resolvido.

## 7. Áreas de atuação

Valores reais conferidos nos mocks (sem presumir): `"Joelho"`,
`"Trauma esportivo"`, `"Ortopedia geral"`, `"Angioplastia"`,
`"Arritmias"`, `"Prevenção cardiovascular"`. Esses valores **misturam
conceitos distintos**: `"Ortopedia geral"` é essencialmente uma
especialidade (redundante com `especialidadeId`); `"Angioplastia"` é
um procedimento (mais próximo de `Capability` tipo `"procedure"`);
`"Arritmias"` é um tema/condição clínica (mais próximo de
`Condition`); `"Joelho"`/`"Trauma esportivo"`/`"Prevenção
cardiovascular"` são subtemas ou abordagens de cuidado sem
correspondência clara e única. **Não é possível migrar cada valor sem
classificação manual** — não há um padrão determinístico no dado de
origem que permita decidir automaticamente se cada string é uma
Specialty, uma Capability ou uma Condition.

## 8. Verificações

`VerificacaoMedico` (`id`, `titulo`, `descricao`, `status`) não
possui `evidenceId`, `method`, `verifiedAt` nem `verifierId` — não
atende aos requisitos estruturais de `Verification` no domínio. São
textos editoriais com um rótulo binário de status, não verificações
formais e rastreáveis. **Não podem ser convertidas ao Knowledge Core
atual sem fabricar rastreabilidade** — criar `Source`/`Evidence`/
`Verification` fictícios para cada uma constituiria exatamente o que
a Etapa 8 desta auditoria proíbe. A forma correta, quando o Knowledge
Core tiver dados reais, é exibir um **resumo** no perfil (ex.: uma
contagem de afirmações publicadas) e deixar os detalhes completos
(evidência, fonte, método) para uma visão de rastreabilidade separada
— exatamente a recomendação já registrada na P2-019.

## 9. Alternativas de desbloqueio

**A — Expandir a Profile Projection com os campos legados
diretamente.** Velocidade alta, mas fidelidade baixa para
`verificado`/`verificacoes` (reproduziria selos sem rastreabilidade
real) e para `areasDeAtuacao` (reproduziria uma mistura de conceitos
sem estrutura). Dívida arquitetural alta — misturaria dado editorial
bruto do legado dentro de uma projeção que hoje só carrega dado
validado do domínio, contrariando a fronteira já estabelecida na
P2-012/P2-019.

**B — Evoluir primeiro o domínio e o mapper.** Correto para a parte
estrutural de `experiencias`, mas mesmo assim bloqueado pela ausência
de `type` real e pela incompatibilidade ano↔Date — exigiria uma
decisão de modelagem adicional, não apenas a integração à aggregate.
Não oferece nenhum caminho claro para `verificado`/`bioCurta`/
`areasDeAtuacao`/`verificacoes`, que não são fatos profissionais
estruturados.

**C — Compor Profile Projection com Knowledge Core.** Arquiteturalmente
pronto (casos de uso já existem e testados estaticamente), mas com
ausência total de dado real — exigiria um processo editorial de seed
(criar Source/Evidence/Verification/KnowledgeClaim reais), não uma
migração automática. Correto do ponto de vista de rastreabilidade,
mas bloquearia o MVP se fosse pré-requisito.

**D — Migração progressiva da página.** A página passaria a consumir
o novo pipeline (`GetProfessionalProfileBySlug`) para os blocos já
sustentados (identidade, especialidade, formação básica, localização)
e manteria, explicitamente e de forma temporária, o carregamento
legado (`getMedicoPorSlug`) apenas para os cinco blocos bloqueantes.
Transparência da dívida alta (documentada no código); risco real de
dupla fonte de dados durante a transição; preservação visual total
(única alternativa que não perde nem inventa conteúdo).

## 10. Critérios aplicados

Nenhuma invenção de dados, rastreabilidade e preservação visual foram
os critérios decisivos: nenhum dos campos pode ser resolvido
honestamente agora sem violar um desses três, exceto adiando a
migração completa da página.

## 11. Decisão por campo

| Campo | Decisão | Justificativa | Próxima tarefa | Fonte de verdade pretendida |
|---|---|---|---|---|
| verificado | 3. Modelar no Knowledge Core (temporariamente no legado até lá) | Selo sem rastreabilidade real hoje | Popular Knowledge Core com claims reais de verificação | `KnowledgeClaim`+`Verification`, resumido na projection |
| bioCurta | 4. Manter temporariamente no legado | Autoria/processo editorial indefinidos | Decisão de produto sobre autoria | Indefinida |
| experiencias | 2. Integrar primeiro ao domínio (bloqueada por dados insuficientes) | `Experience` existe, não integrada; falta `type` real e conversão de data | Integrar `Experience` à aggregate + decidir regra de `type`/datas | `Professional.experience[]`, depois a projection |
| areasDeAtuacao | 4. Manter temporariamente no legado | Mistura comprovada de Specialty/Capability/Condition, sem classificação automática segura | Decisão de modelagem sobre qual(is) conceito(s) representam isso | Indefinida |
| verificacoes | 3. Modelar no Knowledge Core (temporariamente no legado até lá) | Mesma razão de `verificado` | Popular Knowledge Core com claims reais | Knowledge Core, resumo na projection + visão de rastreabilidade separada |

## 12. Decisão global

**4. EXECUTAR MIGRAÇÃO PROGRESSIVA CONTROLADA**

Nenhum dos cinco campos pode ser resolvido honestamente agora sem
violar "nenhuma invenção de dados" ou "rastreabilidade". Ao mesmo
tempo, a rota pública já funciona hoje com esses dados via o pipeline
legado — degradá-la seria uma regressão real. A migração progressiva
é a única alternativa que atende simultaneamente essas três
exigências.

**Próxima tarefa mínima:** implementar a migração progressiva da
página (retomando a P2-026 com esta estratégia), usando
`createGetProfessionalProfileBySlug()`/`GetProfessionalProfileBySlug`
para os blocos já sustentados e mantendo `getMedicoPorSlug()` como
fonte adicional e temporária apenas para os cinco blocos bloqueantes,
com comentário explícito no código referenciando esta auditoria.

**A P2-026 deve ser retomada**, com esta estratégia (não com a troca
completa original). **Nenhum campo deve bloquear a rota** — a
migração progressiva permite lançar mantendo paridade visual total.
**Todos os cinco campos podem permanecer temporariamente no legado.**
**Nenhuma remoção de conteúdo é recomendada agora** — mas fica
registrado que, quando o Knowledge Core for populado de verdade, o
selo de verificação deveria passar a exigir uma claim publicada real,
não um booleano legado. **Arquivos prováveis na próxima etapa:**
`app/alicia/[estado]/[especialidade]/[medico]/page.tsx` (para
orquestrar as duas fontes); nenhum arquivo de
`application/alicia/profile` deve crescer com esses campos.

## 13. Arquitetura-alvo por bloco

| Bloco | Fonte | Projection | Estratégia |
|---|---|---|---|
| Identidade, formação básica, localização | `Professional` (via `ProfessionalCatalogSource`) | `ProfessionalProfileProjection` | Já migrado |
| Experiência | Futuro `Professional.experience[]` | Futuro campo na projection | Bloqueado até integração de domínio + decisão de `type`/datas |
| Áreas de atuação | Indefinida (Specialty/Capability/Condition) | — | Bloqueado até decisão de modelagem |
| Biografia | Indefinida | — | Bloqueado até decisão de produto |
| Verificação (selo) | Futuro Knowledge Core, resumido | Futuro campo resumido na projection | Bloqueado até Knowledge Core ser populado |
| Rastreabilidade completa | Knowledge Core (`GetKnowledgeClaimTrace`/`GetPublishedKnowledgeTraceByProfessional`, já existentes) | Visão de rastreabilidade separada, não o perfil público | Não incorporar ao perfil diretamente |

A UI nunca deve consumir aggregate, repositories, mocks, mapper,
`KnowledgeClaim`/`Evidence`/`Verification` brutos — mesmo durante a
migração progressiva, a página consumiria apenas `getMedicoPorSlug()`
(service já existente) para os blocos temporários e
`GetProfessionalProfileBySlug`/`ProfessionalProfileProjection` para os
já migrados.

## 14. Próxima sequência

1. Implementar a migração progressiva da página (fonte dupla,
   documentada).
2. Integrar `Experience` à aggregate `Professional`, condicionada a
   uma decisão de modelagem para `type` e conversão de datas.
3. Decidir a modelagem de `areasDeAtuacao` (Specialty? Capability?
   Condition? combinação?).
4. Decidir o processo/autoria de `bioCurta`.
5. Popular o Knowledge Core com claims reais de verificação (processo
   editorial, não migração automática).
6. Só então expandir a Profile Projection com um resumo de verificação
   e, eventualmente, experiência.

## 15. Fora de escopo

Nenhum campo, projeção, builder, domínio, mapper, mock, componente,
página ou rota foi criado ou alterado. Esta tarefa é exclusivamente
descritiva.
