# Migração das Biografias Legadas para o Modelo Editorial (P2-038)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código foi alterado.
Escopo: `bioCurta` (legado, ainda no bridge da página pública) versus
`ProfessionalPublicBiography` (núcleo editorial completo: entidade,
repositório, casos de uso de criação/leitura e composição).

Consumidores reais confirmados: `page.tsx` (lê
`legacyProfessional.bioCurta` para compor `legacyProfileBlocks.bioCurta`)
e `PerfilMedicoHeader.tsx` (renderiza condicionalmente). Nenhum
consumidor do novo modelo editorial existe ainda — nem
`CreateProfessionalPublicBiography` nem
`GetPublishedProfessionalBiography` têm qualquer chamador real.

## 2. Inventário

| professionalId | slug | texto | status atual | authorId? | reviewedAt? | reviewedBy? | createdAt? | updatedAt? |
|---|---|---|---|---|---|---|---|---|
| med-001 | ana-martins | "Atua com foco em cirurgia do joelho e reabilitação ortopédica." | Nenhum (`Medico` não tem campo de status) | Não | Não | Não | Não | Não |
| med-006 | felipe-rocha | "Atua principalmente em cardiologia intervencionista e prevenção cardiovascular." | Nenhum | Não | Não | Não | Não | Não |

Nenhum outro profissional (5 dos 7) possui `bioCurta`. Nenhum valor
foi inventado — a tabela reflete exatamente o que existe nos mocks.

## 3. Compatibilidade campo a campo

| Campo legado | Campo `ProfessionalPublicBiography` | Classificação |
|---|---|---|
| (nenhum id de bio distinto) | `id` (obrigatório) | **Incompatível** — precisaria gerar um novo identificador para a biografia, distinto do id do profissional, já que o repositório permite múltiplas bios por profissional |
| `Medico.id` | `professionalId` (obrigatório) | Compatível |
| `bioCurta` | `text` (obrigatório) | Compatível |
| (nenhum) | `status` (obrigatório) | **Incompatível** — nenhum status existe no legado |
| (nenhum) | `createdAt` (obrigatório) | **Incompatível** — nenhuma data existe |
| (nenhum) | `updatedAt` (obrigatório) | **Incompatível** — nenhuma data existe |
| (nenhum) | `authorId` (opcional) | Compatível com ausência |
| (nenhum) | `reviewedAt` (opcional; obrigatório se `published`) | Compatível com ausência se não `published`; incompatível se `published` |
| (nenhum) | `reviewedBy` (opcional; obrigatório se `published`) | Mesma observação |

## 4. Estratégias

**A — Migrar exatamente como está:** impossível — a própria factory
`ProfessionalPublicBiography.create()` rejeitaria a chamada por falta
de `status`/`createdAt`/`updatedAt`, todos obrigatórios.

**B — Migrar como `draft`:** consistente (draft não exige
`reviewedAt`/`reviewedBy`); ainda exige decidir `createdAt`/`updatedAt`
e gerar um novo id de bio. Rastreabilidade fraca mas honesta (autor
permanece `undefined`, não inventado). Governança parcial, aceitável
em draft. Custo baixo. Impacto visual nenhum (leitura pública só
busca `published`). Dívida técnica controlada.

**C — Migrar como `in_review`:** mesma análise de B, mas sinaliza um
processo de revisão ativo que não existe de fato hoje — enganoso.

**D — Criar manualmente novas biografias (curadoria humana):** mais
correto em governança (alguém decide conscientemente autoria/status),
maior custo/esforço, não é uma "migração automática" — é reescrita
curada.

**E — Descartar as atuais:** perderia conteúdo real sem necessidade;
nenhuma das duas bios contém alegação problemática (P2-031 já
concluiu isso) — desproporcional.

## 5. Publicação

**NÃO.** As bios atuais **não podem** ser migradas diretamente como
`published`: a entidade exige `reviewedAt` E `reviewedBy` quando
`status === "published"` (validação real em
`ProfessionalPublicBiography.create()`), e nenhum dos dois existe no
legado — a chamada lançaria
`"ProfessionalPublicBiography published biography requires reviewedAt."`
imediatamente.

## 6. Datas

Nenhuma data existe no legado. Alternativas avaliadas: inferir uma
data arbitrária do passado (rejeitado — seria uma data falsa
apresentada como real); usar a data da migração; exigir preenchimento
manual; manter no legado.

**Decisão: usar a data da migração** para `createdAt`/`updatedAt`, se
e quando a migração ocorrer. É o único valor honesto e não inventado
disponível — reflete quando o registro passou a existir no novo
modelo, não uma data histórica fictícia sobre quando o texto foi
originalmente escrito (que permanece desconhecido).

## 7. Autoria

- Pode permanecer `undefined`? **Sim** — `authorId` é opcional na
  entidade exatamente para este cenário.
- Deve ser preenchido? Não, a menos que uma decisão de produto real
  identifique quem escreveu cada texto (hoje desconhecido).
- Pode ser inferido? **Não** — não há evidência de autoria; atribuir
  (ex.: "a própria AliCIA") seria fabricar uma atribuição sem base.
- Deve bloquear a migração? **Não** — a entidade foi desenhada para
  tolerar essa ausência fora de `published` (já decidido como NÃO na
  seção 5).

## 8. Revisão

Os dados atuais **não permitem** `published`: nem `reviewedAt` nem
`reviewedBy` existem no legado.

## 9. Decisão (próxima implementação)

Avaliadas as cinco alternativas: seed/script/importador (1–3) seriam
desproporcionais para apenas 2 registros e mecanizariam uma decisão
que deveria ser humana (quem é o autor, se o texto merece entrar no
novo modelo governado); manter o bridge legado (4) não avança nada,
mas é consistente com a P2-031.

**Decisão: 5. AGUARDAR REVISÃO EDITORIAL HUMANA.**

Antes de qualquer implementação automatizada, uma pessoa da equipe
editorial da AliCIA deveria revisar conscientemente os 2 textos
existentes e decidir autoria/conteúdo — e só então usar
`CreateProfessionalPublicBiography` (já existente) para registrá-los
deliberadamente, tipicamente como `draft` (Estratégia B), nunca via
seed automatizado. Até essa revisão ocorrer, o bridge legado (Etapa 4
— opção 4) permanece como estado de fato, exatamente como a P2-031
já havia decidido.

## 10. Próxima etapa

Nenhuma implementação é recomendada nesta auditoria. A ação
recomendada, quando alguém decidir agir, é uma revisão editorial
humana das 2 bios reais, seguida do uso manual (não automatizado) do
caso de uso `CreateProfessionalPublicBiography` já existente.

## 11. Fora de escopo

Nenhum domínio, aplicação, infraestrutura, UI, mock, Profile
Projection ou bridge legado foi criado ou alterado. Esta tarefa é
exclusivamente descritiva.
