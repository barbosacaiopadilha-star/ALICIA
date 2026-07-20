# Ownership e Governança da Bio Pública Profissional (P2-031)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código foi alterado.
Escopo: `bioCurta` (`types/alicia/medico.ts`), seus dados reais
(`mocks/alicia/medicos.ts`), seus consumidores (`page.tsx`,
`PerfilMedicoHeader.tsx`), o domínio (`Identity`, `Professional`), o
Knowledge Core (`KnowledgeClaim`, `EditorialStatus` — localizada em
`domain/professional/EditorialStatus.ts`, não em
`domain/knowledge/`, divergência de caminho do prompt registrada aqui
por precisão) e a Profile Projection.

## 2. Inventário real das bios

Extração direta dos mocks (nenhuma inferência):

| professionalId | slug | texto | comprimento |
|---|---|---|---|
| med-001 | ana-martins | "Atua com foco em cirurgia do joelho e reabilitação ortopédica." | 64 caracteres |
| med-006 | felipe-rocha | "Atua principalmente em cardiologia intervencionista e prevenção cardiovascular." | 81 caracteres |

Os outros 5 profissionais (med-002, 003, 004, 005, 007) **não
possuem** `bioCurta` (campo opcional, ausente).

**Quantificação:**
- Profissionais com bio: 2/7
- Profissionais sem bio: 5/7
- Bios com fatos verificáveis formais (instituição, credencial, data):
  0/2 — nenhuma das duas cita algo além de área clínica de atuação
- Bios com linguagem subjetiva/promocional ("referência",
  "excelência", "melhor"): 0/2
- Bios com especialidade/experiência mencionada: 2/2 — ambas
  descrevem área clínica de atuação
- Bios potencialmente desatualizadas: 2/2 — nenhum mecanismo de
  revisão ou data existe para nenhuma delas

**Achado central:** os dois textos reais correspondem quase
literalmente aos valores já existentes em `areasDeAtuacao` do mesmo
profissional — med-001: `["Joelho", "Trauma esportivo", "Ortopedia
geral"]` ↔ bio "cirurgia do joelho e reabilitação ortopédica";
med-006: `["Angioplastia", "Arritmias", "Prevenção cardiovascular"]`
↔ bio "cardiologia intervencionista e prevenção cardiovascular". As
bios parecem ser, na prática, uma paráfrase textual de um dado já
estruturado em outro campo, não uma narrativa independente.

## 3. Classificação semântica

Ambas as bios classificadas como **E — Conteúdo derivável de dados
estruturados**: nenhuma contém fato verificável formal (categoria A),
nenhuma usa linguagem promocional (categoria C), nenhuma é declaração
subjetiva não factual (categoria D), e nenhuma carece de classificação
segura (categoria F) — o conteúdo é neutro e sobreposto a
`areasDeAtuacao`. Nenhuma veracidade foi presumida apenas por o texto
existir no mock; a classificação se baseia unicamente no conteúdo e
na ausência de alegações que exigiriam comprovação.

## 4. Ownership

**A — Identity:** incoerente — misturaria narrativa de apresentação
subjetiva com dados estáveis de identidade civil/profissional
(nome, foto, idiomas); frequência de atualização esperada da bio é
maior e de natureza diferente; risco real de inflar Identity com
conteúdo de propósito distinto.

**B — Professional (aggregate):** não há nenhuma regra de negócio ou
invariante que dependa do texto da bio — não é um fato do domínio
profissional, é conteúdo de apresentação. Colocá-la na aggregate
contrariaria o mesmo princípio já aplicado em toda esta sessão
(aggregate cresce por fatos reais, não por necessidade de exibição).

**C — Profile Projection:** simples para o MVP, mas a projection é
hoje montada por um builder puro e determinístico — adicionar bio
exigiria uma fonte real que hoje não existe fora do legado; herdaria
o mesmo problema de ausência de governança sem resolver nada.

**D — Knowledge Core:** rastreabilidade alta (exatamente o propósito
do Knowledge Core), mas ausência total de dados reais hoje (nenhuma
claim jamais criada) e a complexidade de decompor uma narrativa livre
em afirmações atômicas verificáveis — que, no caso das duas bios
reais, já são essencialmente `areasDeAtuacao` reformulado.

**E — Conceito editorial dedicado (ex.: `ProfessionalPublicBiography`):**
permite modelar autoria, revisão e publicação sem exigir o aparato
completo do Knowledge Core. Custo arquitetural real, mas é a única
alternativa que trata a bio pelo que ela é — conteúdo editorial com
necessidade de governança, não um fato de domínio nem uma afirmação
de conhecimento no sentido estrito do Knowledge Core.

## 5. Governança mínima

| Campo | Classificação |
|---|---|
| text | Obrigatório agora |
| authorId/authorName | Necessário no futuro (inexistente hoje) |
| createdAt | Necessário no futuro |
| updatedAt | Necessário no futuro |
| reviewedAt | Necessário no futuro (nenhuma revisão documentada hoje) |
| reviewedBy | Necessário no futuro |
| status | Necessário no futuro (mesmo conceito de `EditorialStatus` já existente, reaproveitável) |
| sourceReferences | Opcional agora (bios atuais não citam fontes) |
| professionalId | Obrigatório agora |
| version | Desnecessário agora (over-engineering para o volume atual — 2 bios) |

## 6. Relação com o Knowledge Core

A bio **não deveria ser uma `KnowledgeClaim` inteira** — ela é
narrativa, não uma afirmação atômica. Os fatos implícitos nela
(área clínica de atuação) já têm — ou poderiam ter — representação
mais adequada via `KnowledgeClaimType` (`"specialty"`/`"capability"`),
não via texto livre. Decompor as duas bios reais em claims separadas
seria, na prática, re-derivar dados já capturados em `areasDeAtuacao`
— não há fato novo na bio que já não esteja estruturado em outro
lugar. O Knowledge Core deveria armazenar os fatos verificáveis (se
algum dia existirem na bio), não necessariamente a prosa narrativa. A
ausência de claims reais **bloqueia** qualquer estratégia que dependa
inteiramente do Knowledge Core, mas não bloqueia um modelo editorial
mínimo independente.

## 7. Estratégias de migração

**1 — Mapear diretamente para a Profile Projection:** rápida e fiel,
mas ausência de governança total (sem autor, revisão ou data) —
herdaria exatamente o problema identificado, com risco reputacional
estrutural para textos futuros menos neutros que os dois atuais.

**2 — Manter no bridge legado:** simplicidade máxima, dívida já
documentada (P2-027/028), impacto visual zero, mas sem prazo de
resolução.

**3 — Criar contrato editorial mínimo antes da migração:** equilíbrio
bom — modela autoria/status/revisão sem exigir o Knowledge Core
completo; esforço moderado; risco de nova abstração real, mas
justificado pela natureza genuinamente diferente do dado (editorial,
não domínio, não afirmação de conhecimento).

**4 — Gerar bio a partir de dados estruturados:** determinismo alto
(os textos atuais já são, na prática, paráfrases de `areasDeAtuacao`),
mas perda de voz editorial (texto gerado tende a soar mecânico) e
risco de aparentar texto humano quando não é — exigiria ainda
aprovação editorial do tom antes de publicar.

**5 — Bio baseada em claims publicadas:** mais correta em
rastreabilidade, mas exige claims reais que hoje não existem —
bloquearia a bio até o Knowledge Core ser populado de verdade.

## 8. Critérios aplicados

Nenhuma invenção de dados, clareza de autoria e possibilidade de
revisão foram decisivos: nenhuma estratégia que publique sem
governança (1, 4 sem aprovação) atende ao padrão já estabelecido
nesta sessão; nenhuma que dependa do Knowledge Core vazio (5) é
viável agora; manter indefinidamente (2) não resolve a dívida.

## 9. Decisão

**3. CRIAR MODELO EDITORIAL MÍNIMO ANTES DA MIGRAÇÃO**

**Respostas obrigatórias:**
- `bioCurta` pertence ao domínio? Não — é conteúdo de apresentação,
  não um fato do domínio profissional.
- Pertence à Identity? Não — misturaria narrativa com dados estáveis.
- Deve fazer parte da Profile Projection? Sim, eventualmente, mas
  como campo derivado de uma fonte com governança própria, não
  diretamente do legado.
- Fonte de verdade: um futuro conceito editorial dedicado, não
  `Professional`/`Identity` nem o Knowledge Core em sentido estrito.
- Quem deveria editar: um curador/equipe editorial da AliCIA.
- Quem deveria aprovar: um processo de revisão editorial explícito
  (`reviewedBy`/`reviewedAt`), inexistente hoje.
- O profissional deveria poder fornecer o texto? Possivelmente, como
  rascunho, sempre sujeito a revisão antes de publicação.
- A AliCIA deveria revisar/reescrever? Sim, consistente com o rigor já
  estabelecido em `KNOWLEDGE_MODEL.md`.
- Fatos contidos na bio exigem evidência? Sim, se a bio vier a conter
  fatos verificáveis — hoje os dois textos reais não contêm nenhum
  além do que já está estruturado.
- Bios atuais podem continuar públicas temporariamente? Sim (seção 10).
- Profissionais sem bio devem exibir fallback? Não.
- É permitido gerar fallback automaticamente? Não, sem justificar a
  fonte.

## 10. Tratamento das bios atuais

Ambas as bios reais (med-001, med-006) classificadas como **A — PODE
PERMANECER TEMPORARIAMENTE**: nenhuma contém alegação factual não
verificável, ambas refletem dados já estruturados (`areasDeAtuacao`),
e já estão isoladas no bridge legado, documentadas como dívida
técnica temporária desde a P2-027/028. Não exigem remoção imediata
nem verificação factual formal — mas seriam boas candidatas a uma
revisão editorial leve quando o modelo editorial mínimo existir, não
por urgência, mas por boa prática antes de tratá-las como
definitivamente aprovadas.

Para os 5 profissionais sem bio: **sem bloco de bio** — o
comportamento condicional já existente (nenhum texto exibido) está
correto e deve continuar. Não criar texto genérico nem bio gerada sem
justificar a fonte.

## 11. Arquitetura-alvo

```
Curador/equipe editorial da AliCIA (possivelmente com rascunho do profissional)
        ↓
Futuro modelo editorial mínimo (texto + autoria + status + datas)
        ↓
Revisão editorial (reviewedBy/reviewedAt)
        ↓
Publicação (status = published)
        ↓
Futuro caso de uso de composição do perfil (lê somente o já publicado)
        ↓
ProfessionalProfileProjection (campo de bio, quando existir)
        ↓
UI (perfil público)
```

Quem armazena o texto: o futuro modelo editorial mínimo — não
`Professional`, não `Identity`, não o Knowledge Core diretamente.
Quem armazenaria fatos (se a bio um dia referenciar algo verificável):
o Knowledge Core, via claims separadas, referenciadas pelo modelo
editorial, nunca embutidas na prosa. Quem aprova: um fluxo de revisão
editorial explícito. Quem monta a projection: um builder análogo a
`BuildProfessionalProfileProjection`, lendo apenas conteúdo já
publicado. **O que a UI pode consumir:** apenas o campo de bio já
publicado, dentro da projection. **O que a UI não pode consumir:** o
modelo editorial bruto, rascunhos não publicados, ou qualquer
entidade de domínio/Knowledge Core diretamente.

## 12. Próxima tarefa mínima

Desenhar (auditoria/proposta de modelagem, não implementação
completa) o contrato editorial mínimo para a bio — campos de
governança (`text`, `authorId`/`authorName`, `status`, `reviewedAt`/
`reviewedBy`) como tarefa isolada de modelagem, sem ainda conectar ao
Knowledge Core nem à Profile Projection.

Arquivos prováveis: um novo arquivo de domínio ou aplicação isolado
(ex.: algo equivalente a `ProfessionalPublicBiography`), sem tocar a
Profile Projection ainda. Risco: baixo (modelagem isolada, sem
consumidor). Impacto visual: nenhum. Impacto sobre o bridge legado:
nenhum imediato — bio continua lá até a próxima etapa migrar de fato.
A rota pode continuar exatamente como está.

## 13. Fora de escopo

Nenhum domínio, projection, builder, mapper, mock, Knowledge Core,
componente, rota ou serviço foi criado ou alterado. Esta tarefa é
exclusivamente descritiva.
