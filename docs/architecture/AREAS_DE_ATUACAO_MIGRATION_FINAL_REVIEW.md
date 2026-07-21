# Encerramento Técnico da Migração de areasDeAtuacao (P2-BLOCO-A)

## 1. Contexto

Consolidação de uma frente iniciada na P2-039 (decomposição de
`areasDeAtuacao`) e composta por auditorias sucessivas (P2-040,
P2-044, P2-048, P2-049) e implementações (P2-041 a P2-043, P2-045 a
P2-047, P2-050, P2-051). Este documento registra o estado técnico
final da frente, sem alterar domínio, mapper ou projections já
aprovadas.

## 2. Estado anterior

A P2-050 criou a primeira composição pública substituindo itens já
migrados do legado pelos equivalentes do novo domínio, mas incluiu
incorretamente `Professional.specialties` na seção "Áreas de
atuação" — uma equivalência semântica incorreta entre especialidade
principal e foco de atuação. A P2-051 corrigiu isso, removendo
`specialties` da composição. Este bloco consolida e formaliza esse
estado, com pequenos ajustes de nomenclatura e tipagem.

## 3. Correção semântica de Specialty

`Specialty` identifica a especialidade principal do profissional
(ex.: Ortopedia, Cardiologia) e é exibida exclusivamente pelo ponto
já existente da interface — o subtítulo do cabeçalho do perfil
(`especialidadeNome`, derivado de
`professionalProfile.specialties[0]?.name`, com guarda de segurança
para o nome já resolvido pela rota). `Specialty` **não** compõe mais
a seção "Áreas de atuação" — nem no tipo de apresentação
(`AreaDeAtuacaoSource` não contém `"specialty"`), nem na lista
montada em `page.tsx`.

## 4. Fontes atuais da seção "Áreas de atuação"

Exatamente três fontes, nesta ordem:
1. `professionalProfile.conditions` (`ProfessionalProfileProjection.conditions`)
2. `professionalProfile.capabilities` (`ProfessionalProfileProjection.capabilities`)
3. `legacyProfileBlocks.areasDeAtuacao`, filtrado pela constante fechada
   `MIGRATED_OR_DISCARDED_LEGACY_AREAS`

## 5. Itens migrados

- **Joelho** → `Condition` (`type: "body-region"`) — P2-042.
- **Arritmias** → `Condition` (`type: "disease"`) — P2-042.
- **Angioplastia** → `Capability` (`type: "procedure"`) — P2-046.

Todos os três já são projetados em `ProfessionalProfileProjection`
(P2-043, P2-047) e não são mais lidos do legado na seção de áreas de
atuação (confirmado pela exclusão explícita na constante).

## 6. Item descartado por duplicidade

- **Ortopedia geral** — não é exibido como área de atuação; o
  conceito já está representado pela `Specialty` do mesmo
  profissional (P2-048, `SPECIALTY_DUPLICATION_REVIEW.md`). Não foi
  mapeado para nenhuma entidade nova — apenas excluído da exibição.

## 7. Itens bloqueados

- **Trauma esportivo** — ambíguo entre `Condition: injury` e
  `Condition: care-need` (P2-040, `CONDITION_CLASSIFICATION_REVIEW.md`).
  Continua vindo do legado.
- **Prevenção cardiovascular** — conceito composto entre `Capability`
  e `Condition`, sem leitura dominante (P2-049,
  `CARDIOVASCULAR_PREVENTION_OWNERSHIP_REVIEW.md`). Continua vindo do
  legado.

Nenhum dos dois foi resolvido nesta tarefa, conforme instruído.

## 8. Matriz por profissional

| professionalId | specialty (fora da seção) | conditions exibidas | capabilities exibidas | itens residuais exibidos | seção aparece? |
|---|---|---|---|---|---|
| med-001 | Ortopedia | Joelho | — | Trauma esportivo | Sim |
| med-002 | Ortopedia | Joelho | — | — | Sim (1 item) |
| med-003 | Ortopedia | — | — | — | **Não** |
| med-004 | Cardiologia | — | — | — | **Não** |
| med-005 | Cardiologia | — | — | — | **Não** |
| med-006 | Cardiologia | Arritmias | Angioplastia | Prevenção cardiovascular | Sim (3 itens) |
| med-007 | Cardiologia | — | — | — | **Não** |

Confirmado estaticamente pelos mocks reais: nenhum profissional exibe
Joelho, Arritmias, Angioplastia ou Ortopedia geral vindos do legado;
os quatro profissionais sem nenhuma condição/capacidade/residual real
(med-003, 004, 005, 007) não exibem a seção — sem placeholder.

## 9. Fluxo arquitetural

**Fluxo estruturado (Conditions/Capabilities):**
```
mocks Medico.areasDeAtuacao
        ↓
LegacyProfessionalMapper (mapConditions / mapCapabilities)
        ↓
Professional.conditions / Professional.capabilities
        ↓
BuildProfessionalProfileProjection
        ↓
ProfessionalProfileProjection.conditions / .capabilities
        ↓
page.tsx (areasDeAtuacaoView)
        ↓
TrajetoriaAcademica (areasDeAtuacao: string[])
```

**Fluxo residual (itens bloqueados):**
```
legacyProfileBlocks.areasDeAtuacao
        ↓
filtro explícito (MIGRATED_OR_DISCARDED_LEGACY_AREAS)
        ↓
page.tsx (areasDeAtuacaoView)
        ↓
TrajetoriaAcademica (areasDeAtuacao: string[])
```

Confirmado: a UI (`page.tsx`, `TrajetoriaAcademica.tsx`,
`PerfilMedicoHeader.tsx`) não importa `Professional`, `Condition`,
`Capability`, o mapper, mocks diretamente ou repositories — apenas a
factory pública (`createGetProfessionalProfileBySlug`) e o serviço
legado já existente (`getMedicoPorSlug`, para os blocos residuais
documentados).

## 10. Bridge residual

Após esta consolidação, `legacyProfileBlocks.areasDeAtuacao` continua
existindo (não removido), mas — após o filtro explícito — só produz
efetivamente os dois valores ainda bloqueados: **Trauma esportivo** e
**Prevenção cardiovascular**. Nenhum mock foi alterado; o tipo legado
(`Medico.areasDeAtuacao`) permanece intacto com todos os seis valores
originais — apenas a exibição pública os filtra.

## 11. Riscos restantes

- Enquanto "Trauma esportivo" e "Prevenção cardiovascular"
  permanecerem bloqueados, a seção "Áreas de atuação" continuará
  dependendo parcialmente do legado para esses dois profissionais
  (med-001 e med-006).
- Se novos valores forem adicionados a `areasDeAtuacao` nos mocks no
  futuro, eles aparecerão automaticamente como itens "legacy" até
  serem auditados individualmente — isso é o comportamento esperado
  do filtro por exclusão explícita, não um risco de regressão, mas
  deve ser lembrado por quem mantiver os mocks.

## 12. Critérios para remoção total do bridge de areasDeAtuacao

O bridge (`legacyProfileBlocks.areasDeAtuacao` e o filtro associado)
só poderá ser completamente removido quando:
1. "Trauma esportivo" for resolvido (decisão humana sobre `injury`
   vs. `care-need`, ou nova modelagem) e migrado/mapeado.
2. "Prevenção cardiovascular" for resolvido (decisão editorial sobre
   decomposição em `Capability`+`Condition`, ou outra resolução) e
   migrado/mapeado.
3. Ambos os itens estiverem projetados em `ProfessionalProfileProjection`
   e a página consumir exclusivamente as fontes estruturadas.

## 13. Fora de escopo

"Trauma esportivo" e "Prevenção cardiovascular" não foram resolvidos
nesta tarefa. Nenhuma nova entidade, tipo de domínio, mapper, caso de
uso, projection, query, fallback textual, UI administrativa, decisão
editorial ou integração com Knowledge Core foi criada.
`legacyProfileBlocks.areasDeAtuacao` não foi removido. Nenhum
documento histórico anterior foi alterado.
