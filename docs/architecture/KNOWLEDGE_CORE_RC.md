# RC — Consolidação do Knowledge Core e Bridges Residuais (MACROBLOCO-01)

## 1. Estado inicial

Branch: `master` · HEAD: `f07594b8d1022a517fce5b0b7008e4886bd38d24` (conferido) · Working tree: limpo.

## 2. Arquitetura encontrada

Auditoria integral de `domain/knowledge/`, `application/alicia/knowledge/`,
`infrastructure/alicia/knowledge/`, `domain/editorial/`,
`application/alicia/editorial/`, `infrastructure/alicia/editorial/`,
`domain/professional/PracticeLocation.ts`, as duas Projections
públicas e seus Builders, `services/alicia/*` e as factories de
composição existentes.

**Knowledge Core:** `KnowledgeClaim` (domínio), `Source`/`Evidence`/
`Verification` (entidades já hospedadas em `domain/professional/`,
reexportadas por `domain/knowledge/` via seus contratos de
repositório), 4 repositórios em memória, 9 casos de uso
(`CreateKnowledgeClaim`, `AddEvidenceToKnowledgeClaim`,
`AttachVerificationToKnowledgeClaim`,
`ChangeKnowledgeClaimEditorialStatus`, `GetKnowledgeClaimTrace`,
`CreateSource`, `CreateEvidence`, `CreateVerification`,
`GetPublishedKnowledgeClaimsByProfessional`,
`GetPublishedKnowledgeTraceByProfessional`). **Confirmado por busca
exaustiva: zero consumidor real** em `app/`, `components/`,
`services/` ou `mocks/` — toda a arquitetura existe, nenhuma linha é
executada por qualquer fluxo público real. **Nenhuma factory de
composição existe** para o Knowledge Core (diferente de catálogo,
perfil e editorial, que já têm `create*`).

**Achado relevante:** `KnowledgeClaimType` já inclui o valor
`"practice-location"` — o Knowledge Core **já está preparado**, desde
antes deste macrobloco, para representar fatos geográficos como
qualquer outro fato profissional (`KnowledgeClaim` + `Evidence` +
`Verification`). Isso **corrige e completa** a conclusão do
BLOCO-GEO-V1 (que propôs esse modelo como uma recomendação futura,
sem saber que o tipo já existia): não é necessária nenhuma nova
modelagem — a governança geográfica proposta já é diretamente
aplicável com o código existente, exatamente como está.

**Governança editorial:** `ProfessionalPublicBiography` + repositório
+ 2 casos de uso + composição (`createEditorialApplication`) — já
consolidados desde P2-032/P2-037. **Confirmado: nenhum modelo
paralelo existe** — `ProfessionalPublicBiography` continua sendo o
único modelo de biografia; `KnowledgeClaim` continua sendo o único
modelo de fato verificável. Nenhuma sobreposição entre os dois.

**Segunda fonte de dados de Professional identificada:**
`ProfessionalRepository`/`MockProfessionalRepository`/
`createMockProfessionalRepository()` — usada exclusivamente pelos
casos de uso do Knowledge Core para validar existência de um
`professionalId`. Constrói `Professional[]` a partir dos mesmos mocks
via o mesmo `LegacyProfessionalMapper`, em paralelo a
`ProfessionalCatalogSource`/`MockProfessionalCatalogSource` (usada
pelo catálogo/perfil). Um comentário já existente em
`createMockProfessionalCatalogSource.ts` desde sua criação já
registrava essa separação como **intencional**
("independente de `createMockProfessionalRepository()`") — não uma
duplicação acidental. Como nenhum dos dois caminhos tem consumidor
real hoje, e a separação repositório-de-agregado (leitura/escrita)
versus fonte-de-read-model (catálogo público) é uma distinção
arquitetural legítima (não um erro), **não foi unificada nesta
tarefa** — ver seção 4 e 11.

## 3. Bridges eliminados

**Nenhum.** Todos os bridges hoje existentes (`formacaoResumo`,
`verificado`, `verificacoes`, `bioCurta`, `formacao.cidade`/`estado`
por item) já foram auditados exaustivamente em RC-PERFIL-01 e
P2-BLOCO-B, e nenhuma condição para eliminação mudou desde então:
nenhum deles tem dado real equivalente publicado no Knowledge Core,
nenhuma revisão editorial humana ocorreu para as bios, e nenhuma
decisão humana foi tomada sobre os itens de `areasDeAtuacao` ainda
bloqueados. Forçar a eliminação de qualquer um deles agora
significaria perder informação real sem substituto — exatamente o
que as auditorias anteriores já concluíram que não deve acontecer.

## 4. Bridges remanescentes

| Bridge | Decisão | Motivo |
|---|---|---|
| `formacaoResumo` | Permanece | Sem equivalente em nenhuma entidade de domínio; não é um `KnowledgeClaim` nem um campo de `Education`/`Experience` |
| `verificado` (selo geral + por formação) | Permanece | Depende de `KnowledgeClaim`/`Verification` reais publicados — zero hoje |
| `verificacoes[]` | Permanece | Mesma razão — depende de `Evidence`/`Verification` reais |
| `bioCurta` | Permanece | Depende de revisão editorial humana das 2 bios reais (P2-038, não reaberta) |
| `formacao.cidade`/`estado` por item | Permanece | `Education` não possui esses campos — depende de evolução de domínio, não deste macrobloco |
| `ProfessionalRepository` (segunda fonte de Professional) | Permanece, documentado como pendência de baixo risco | Zero consumidor real hoje em ambos os lados; separação repositório-vs-read-model é legítima, não uma duplicação acidental |

## 5. Ajustes realizados

**Nenhuma alteração de código foi feita.** Após auditoria completa das
8 frentes solicitadas, nenhuma mudança segura e necessária foi
identificada: (a) eliminar bridges exigiria inventar dado ou forçar
decisão humana — explicitamente proibido em todas as auditorias
anteriores e neste próprio macrobloco; (b) aplicar a governança
geográfica não exige código novo, apenas a correção documental já
registrada na seção 2; (c) a duplicação entre `ProfessionalRepository`
e `ProfessionalCatalogSource` é uma separação arquitetural legítima
entre camadas com zero consumidor real em ambos os lados — refatorar
código sem consumidor e sem cobertura de testes, neste ambiente sem
`node_modules`, seria um risco desnecessário para um ganho nulo
(nenhuma funcionalidade real depende disso hoje); (d) a assimetria
entre `ProfessionalCatalogProjection` (sem `conditions`/`capabilities`/
`experience`) e `ProfessionalProfileProjection` (com esses campos) já
foi identificada em RC-CATÁLOGO-01 como uma lacuna conhecida, não uma
duplicação — corrigi-la exigiria alterar uma projection sem
necessidade demonstrada por nenhum consumidor real da listagem
pública hoje.

## 6. Código morto removido

**Nenhum código morto encontrado.** Confirmado por busca exaustiva em
todos os 8 focos do escopo — toda a arquitetura existente (Knowledge
Core, editorial, catálogo, perfil, services legados, factories) tem
ao menos uma razão de existência documentada (mesmo quando essa razão
é "está pronta, aguardando dado real ou decisão humana", não "está em
uso agora").

## 7. Compatibilidade

Nenhum arquivo de código foi alterado — confirmado via
`git status`/`git diff --stat` (ambos vazios). Rotas, slugs,
breadcrumbs, cards, perfil, busca, filtros, ordenação, mapa e layout
permanecem exatamente como estavam ao final do BLOCO-MAPA-V1.

## 8. Documento criado

`docs/architecture/KNOWLEDGE_CORE_RC.md` (este documento).

## 9. Testes e verificações

Typecheck/lint/build: não executados — sem `node_modules` (mesmo
bloqueio já documentado em todos os blocos anteriores desta sessão).
`git status`: limpo antes e depois (nenhuma mudança de código).
`git diff --stat`: vazio. `git diff --check`: limpo (exit 0, aplicável
apenas a este documento). Revisão estática: leitura integral de todos
os arquivos das 8 frentes do escopo, com buscas específicas
confirmando ausência de consumidores reais do Knowledge Core, ausência
de código morto, e confirmação da existência prévia de
`KnowledgeClaimType: "practice-location"`.

## 10. Commits

Um único commit, apenas documental (nenhuma alteração de código
acompanha este macrobloco):

`docs: consolidar knowledge core e bridges residuais`

## 11. Pendências para Dados Reais

Estas são as únicas ações que efetivamente desbloqueiam mais
consolidação, todas explicitamente fora do escopo deste e dos blocos
anteriores:

1. **Revisão editorial humana** das 2 bios reais existentes
   (med-001, med-006) e publicação via `CreateProfessionalPublicBiography`
   — desbloqueia `bioCurta`.
2. **População real do Knowledge Core** com `Source`/`Evidence`/
   `Verification` verdadeiros — desbloqueia `verificado`,
   `verificacoes[]`, e (usando `KnowledgeClaimType: "practice-location"`,
   já suportado) coordenadas geográficas verificadas.
3. **Decisão humana** sobre "Trauma esportivo" (`injury` vs.
   `care-need`) e "Prevenção cardiovascular" (decomposição editorial
   entre `Capability`/`Condition`) — desbloqueia os dois últimos
   itens residuais de `areasDeAtuacao`.
4. **Evolução de `Education`** para incluir `cidade`/`estado` por
   item, se a divergência visual atual for considerada inaceitável —
   desbloqueia o bridge de formação residual.
5. Quando o Knowledge Core tiver um consumidor real pela primeira vez,
   revisitar se `ProfessionalRepository`/`MockProfessionalRepository`
   deve continuar separado de `ProfessionalCatalogSource` ou se vale a
   pena unificar — decisão que hoje não tem informação suficiente
   para ser tomada com segurança.

## 12. Resultado

O Knowledge Core, a governança editorial e a governança geográfica
(esta última confirmada, não implementada, como já plenamente
suportada por `KnowledgeClaimType: "practice-location"`) estão
arquiteturalmente consolidados e livres de duplicação desnecessária.
Os bridges residuais permanecem exatamente os mesmos cinco já
documentados em auditorias anteriores, todos legitimamente bloqueados
por ausência de dado real ou decisão humana — nenhum deles pôde ser
eliminado com segurança nesta tarefa, e nenhum foi forçado.

PRONTO PARA REVISÃO
