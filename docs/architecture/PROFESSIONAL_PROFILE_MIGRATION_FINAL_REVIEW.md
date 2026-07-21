# Migração Final da Página Pública de Perfil (P2-BLOCO-B)

## 1. Contexto

Auditoria final dos bridges legados ainda existentes na página
pública de perfil, após a conclusão técnica da frente de
`areasDeAtuacao` (P2-BLOCO-A). Nenhum código de produção foi
alterado além de eventual limpeza segura comprovada (ver seção 11).

## 2. Estado atual da página

Já migrado para a nova arquitetura: identidade (nome/foto),
especialidade, localização, formação (dados estruturados),
experiência, e as áreas de atuação já aprovadas (Joelho, Arritmias,
Angioplastia). Ainda dependente do legado: selo `verificado`,
`verificacoes[]`, `bioCurta`, metadados residuais de formação
(cidade/estado/verificado por item) e dois itens de `areasDeAtuacao`
(Trauma esportivo, Prevenção cardiovascular).

## 3. Inventário de bridges

| Campo legado | Arquivo de origem | Consumidor | Uso visual | Arquitetura-alvo | Dados reais disponíveis? | Remoção possível agora? | Bloqueio |
|---|---|---|---|---|---|---|---|
| `verificado` | `legacyProfileBlocks.verificado` (page.tsx) | `PerfilMedicoHeader` | Selo "Formação verificada" | Knowledge Core (`KnowledgeClaim`+`Verification`) | Não (zero claims reais) | Não | B + C |
| `verificacoes[]` | `legacyProfileBlocks.verificacoes` (page.tsx) | `VerificacoesMedico` | Lista de título/descrição/status | Knowledge Core | Não | Não | B + C |
| `bioCurta` | `legacyProfileBlocks.bioCurta` (page.tsx) | `PerfilMedicoHeader` | Parágrafo de biografia | `ProfessionalPublicBiography` (pronta) | Sim (arquitetura), Não (dado publicado) | Não | C |
| `formacao.cidade`/`estado` (por item) | `legacyFormacaoPorId` (page.tsx) | `FormacaoItem` | Linha de local por formação | Evolução de `Education` | Sim (no legado) | Não | D |
| `formacao.verificado` (por item) | `legacyFormacaoPorId` (page.tsx) | `FormacaoItem` | "Informação verificada"/"ainda não verificada" | Knowledge Core | Não | Não | B + C |
| `areasDeAtuacao` residual (Trauma esportivo) | `legacyProfileBlocks.areasDeAtuacao`, filtrado | `TrajetoriaAcademica` | Tag na seção de áreas | `Condition` (bloqueada) | Sim (no legado) | Não | C (P2-040) |
| `areasDeAtuacao` residual (Prevenção cardiovascular) | idem | `TrajetoriaAcademica` | Tag na seção de áreas | `Capability`+`Condition` (bloqueada) | Sim (no legado) | Não | C (P2-049) |

Confirmado por busca: `Joelho`, `Arritmias`, `Angioplastia` e
`Ortopedia geral` **não** aparecem mais como origem de dado do
legado na seção de áreas — apenas na constante de exclusão
(`MIGRATED_OR_DISCARDED_LEGACY_AREAS`), que documenta que já foram
tratados. `experiencias` (bloco completo) já foi removido do bridge
desde a P2-030 — confirmado ausente de `legacyProfileBlocks`.

## 4. Classificação dos bloqueios

- `verificado`: **B** (arquitetura pronta no Knowledge Core, faltam
  dados) + **C** (decisão de produto sobre manter/remover o selo
  atual é editorial, não técnica).
- `verificacoes[]`: **B** + **C**, mesma razão.
- `bioCurta`: **C** — arquitetura completa e pronta
  (`ProfessionalPublicBiography`, repositório, casos de uso,
  composição), mas sem consumidor real e sem dado publicado; depende
  exclusivamente de revisão editorial humana (P2-031/P2-038, não
  reaberta aqui).
- `formacao.cidade`/`estado`: **D** — depende de evolução de
  `Education` (campos ainda não existem na entidade).
- `formacao.verificado`: **B** + **C** — mesma classe do selo geral.
- `Trauma esportivo`/`Prevenção cardiovascular`: **E** — resíduo
  legítimo temporário, aguardando decisão humana já registrada
  (P2-040, P2-049).
- Nenhum item foi classificado como **A** (pronto para remoção
  técnica) ou **F** (código morto) — confirmado por revisão completa
  de todos os arquivos da página (seção 11).

## 5. Verificado

O booleano vem de `Medico.verificado` (campo obrigatório, sem
metadata — sem evidência, fonte, data ou responsável). Preenchido
para todos os 7 profissionais (5 `true`, 2 `false`). Renderizado em
`PerfilMedicoHeader` (selo "Formação verificada") e em `FormacaoItem`
(rótulo por formação). Representa apenas um marcador legado — não
verificação documental nem editorial real. O Knowledge Core não
possui nenhum dado equivalente: confirmado por busca, zero chamadas a
`CreateKnowledgeClaim`/`CreateSource`/`CreateEvidence`/
`CreateVerification` em qualquer fluxo real (`app/`, `components/`,
`mocks/`, `services/`). O bloco não pode migrar agora (sem dado real
para popular o Knowledge Core) e sua remoção seria uma decisão de
produto sobre risco reputacional, não uma limpeza técnica trivial.

**Decisão: 2. MANTER TEMPORARIAMENTE NO LEGADO.**

## 6. Verificações

`VerificacaoMedico { id, titulo, descricao, status }` — 3 de 7
profissionais preenchidos (med-001, med-002, med-006). Os textos
misturam selo binário (`status`) com copy institucional livre
(título/descrição), sem estrutura de evidência formal. O Knowledge
Core consegue representar isso estruturalmente
(`KnowledgeClaim`+`Verification`+`EditorialStatus`), mas isso exigiria
decompor cada texto em uma claim real com evidência/fonte real, que
não existe hoje. Migrar agora fabricaria rastreabilidade inexistente.

**Decisão: 2. MANTER TEMPORARIAMENTE NO LEGADO.**

## 7. Biografia

Estado real confirmado: modelo editorial pronto
(`ProfessionalPublicBiography`, `ProfessionalPublicBiographyRepository`,
`InMemoryProfessionalPublicBiographyRepository`,
`CreateProfessionalPublicBiography`, `GetPublishedProfessionalBiography`,
`createEditorialApplication`) — mas **nenhum consumidor existe** em
`app/` ou `components/` (confirmado por busca exaustiva). Nenhuma
biografia está registrada em nenhum repositório em runtime, pois
`createEditorialApplication()` nunca é chamada por nenhum fluxo real
— e mesmo que fosse, cada chamada cria um repositório vazio (sem
seed). `bioCurta` continua sendo a única fonte visual. Remover o
bridge agora deixaria a seção de biografia vazia para os 2
profissionais que hoje têm texto (med-001, med-006), já que nenhuma
biografia real existe no novo modelo. Esta auditoria **não reabre**
a decisão da P2-031/P2-038 — apenas confirma que o estado real não
mudou: o bridge deve permanecer até revisão editorial humana.

## 8. Formação residual

Bridge criado na P2-028/P2-030: `legacyFormacaoPorId` (Map por `id`,
já que `Education.id === formacao.id`), consumido para produzir
`cidade`, `estado` e `verificado` por item de `FormacaoView`, além
dos campos já sustentados pela projection (`tipo`/`titulo`/
`instituicao`/`anoInicio`/`anoConclusao`).

| Campo | Education já possui? | Classificação |
|---|---|---|
| `cidade` | Não | Depende de evolução de `Education` |
| `estado` | Não | Depende de evolução de `Education` |
| `verificado` | Não | Depende de Knowledge Core (mesma classe do selo geral) |

Nenhum dos três é removível agora sem perder dado real (cidade/estado
aparecem em formações reais de med-001/002/006) ou sem reproduzir o
mesmo problema de "selo sem comprovação" (verificado). Nenhum é
código morto — todos são efetivamente consumidos por `FormacaoItem`.

## 9. Áreas de atuação residual

Confirmado por leitura direta do código e da constante
`MIGRATED_OR_DISCARDED_LEGACY_AREAS`: apenas **Trauma esportivo** e
**Prevenção cardiovascular** continuam vindo do legado. Os quatro
itens já tratados (Joelho, Arritmias, Angioplastia, Ortopedia geral)
não aparecem mais como origem de dado do legado — confirmado
ausentes de qualquer leitura direta de `legacyProfileBlocks.areasDeAtuacao`
fora do filtro de exclusão. Ambos classificados como **E — RESÍDUO
LEGÍTIMO TEMPORÁRIO**, aguardando decisão humana já registrada
(P2-040, P2-049) — não reaberta aqui.

## 10. Matriz final do perfil

| Bloco visual | Fonte atual | Fonte-alvo | Estado | Bridge? | Bloqueio | Próximo passo |
|---|---|---|---|---|---|---|
| Nome/foto | `ProfessionalProfileProjection.fullName`/`photoUrl` | mesma | Migrado | Não | — | — |
| Especialidade | `ProfessionalProfileProjection.specialties[0]` | mesma | Migrado | Não | — | — |
| Localização | `ProfessionalProfileProjection.primaryLocation` | mesma | Migrado | Não | — | — |
| Formação (estruturada) | `ProfessionalProfileProjection.education` | mesma | Migrado | Não | — | — |
| Formação (cidade/estado/verificado por item) | Legado, por ID | `Education` estendida / Knowledge Core | Residual | Sim | D / B+C | Evoluir `Education` ou popular Knowledge Core |
| Experiência | `ProfessionalProfileProjection.experience` | mesma | Migrado | Não | — | — |
| Áreas de atuação (Joelho/Arritmias/Angioplastia) | `conditions`/`capabilities` | mesma | Migrado | Não | — | — |
| Áreas de atuação (Ortopedia geral) | Specialty (fora da seção) | mesma | Descartado por duplicidade | Não | — | — |
| Áreas de atuação (Trauma esportivo/Prevenção cardiovascular) | Legado, filtrado | `Condition`/`Capability` futura | Residual | Sim | Humano | Decisão editorial/nova modelagem |
| Bio | `legacyProfileBlocks.bioCurta` | `ProfessionalPublicBiography` (pronta, sem consumidor) | Residual | Sim | Humano | Revisão editorial |
| Selo verificado | `legacyProfileBlocks.verificado` | Knowledge Core (sem dados) | Residual | Sim | Dado + Humano | Popular Knowledge Core ou decisão de produto |
| Verificações | `legacyProfileBlocks.verificacoes` | Knowledge Core (sem dados) | Residual | Sim | Dado + Humano | Popular Knowledge Core ou decisão de produto |

## 11. Limpeza realizada

Revisão completa de `page.tsx`, `PerfilMedicoHeader.tsx`,
`TrajetoriaAcademica.tsx`, `FormacaoItem.tsx`, `VerificacoesMedico.tsx`:
**nenhum import sem uso, campo extraído e nunca consumido, comentário
obsoleto, alias transitório ou tipo local sem uso foi encontrado.**
Todos os imports, variáveis e campos existentes são efetivamente
consumidos. Nenhuma remoção foi realizada — não há limpeza segura
disponível nesta rodada, e nenhuma foi inventada.

## 12. Decisão global

**1. PERFIL TECNICAMENTE MIGRADO; RESTAM APENAS BLOQUEIOS HUMANOS**

Todos os fatos estruturais do profissional (identidade, especialidade,
localização, formação, experiência, e as três áreas de atuação já
aprovadas) já vêm exclusivamente da nova arquitetura. Tudo que resta
(selo, verificações, bio, metadados residuais de formação, dois itens
de áreas de atuação) depende ou de dado real ainda inexistente
(Knowledge Core vazio), ou de decisão editorial/humana já registrada
em auditorias anteriores (P2-031, P2-038, P2-040, P2-049) — nenhum
bloqueio remanescente é puramente técnico no sentido de "arquitetura
ausente".

## 13. Próxima tarefa mínima

**E. Encerrar tecnicamente a página e registrar bloqueios humanos**

Não há mais trabalho técnico útil a fazer na página sem uma decisão
humana/editorial ou sem dado real populado: não há código morto para
remover (A/F não se aplicam); migrar metadados de formação restantes
(B) é uma extensão de baixo valor e baixa prioridade, não bloqueando
nada estratégico; remover selo/verificações sem rastreabilidade (C) é
uma decisão de produto sobre risco reputacional, não uma limpeza
técnica; integrar a biografia (D) está bloqueada até revisão humana
real ocorrer; nenhuma nova modelagem (F) é necessária, pois a
arquitetura já existe para tudo que falta. A ação correta agora é
formalizar o encerramento técnico e devolver os itens restantes como
decisões humanas/de produto explicitamente documentadas.

## 14. Critérios de encerramento

O encerramento técnico completo (sem mais bridges) exigirá,
independentemente: (a) revisão editorial humana das 2 bios reais e
uso do caso de uso já existente para publicá-las; (b) população real
do Knowledge Core com claims/evidências/verificações verdadeiras para
sustentar o selo e as verificações; (c) decisão humana sobre "Trauma
esportivo" e "Prevenção cardiovascular"; (d) opcionalmente, evolução
de `Education` para incorporar cidade/estado por formação, se a
divergência visual atual for considerada inaceitável.

## 15. Fora de escopo

"Trauma esportivo" e "Prevenção cardiovascular" não foram resolvidos.
Nenhuma autoria, revisão, data, fonte, evidência, claim, CRM ou selo
foi inventado. Nenhuma nova entidade, mapper, caso de uso ou
modelagem foi criada. Nenhum documento histórico anterior foi
alterado. Nenhuma dependência foi instalada.
