# Professional Catalog Projection — Auditoria e Desenho (P2-012)

## 1. Escopo

Auditoria exclusivamente de leitura sobre `domain/professional/`,
`infrastructure/alicia/professional/`, `application/alicia/knowledge/`,
`types/alicia/medico.ts`, `mocks/alicia/medicos.ts`, e busca por
referências a `Professional`/`ProfessionalCard`/`Catalog`/`Mapa`/
`Profile`/`List` em `app/`, `components/`, `types/`. Nenhuma alteração
de código foi feita.

## 2. Estado atual

`Professional` hoje integra: `Identity`, `Registration[]` (estrutura
pronta, sem dado real — ver P2-010, bloqueada), `Specialty[]`,
`Education[]`, `PracticeLocation[]`. Todas as quatro últimas já são
populadas pelo `LegacyProfessionalMapper` a partir de dados reais do
mock (`especialidadeId` via catálogo, `formacoes[]`, `cidade`+
`estadoSigla`+`instituicaoPrincipal`).

**Busca por consumidores na UI atual:** nenhuma ocorrência de
`Professional`, `ProfessionalCard`, `Catalog`, `Mapa`, `Profile` ou
`List` em `app/`, `components/` ou `types/`. Confirmado, sem exceção:
**a UI atual (`app/alicia/*`) não consome `domain/professional` em
nenhum ponto** — continua inteiramente sobre o pipeline legado
(`types/alicia`, `mocks/alicia`, `services/alicia`), exatamente como já
registrado na auditoria P2-006.

### Tabela — campo × onde existe

| Campo | Classificação | Observação |
|---|---|---|
| id | Existe em ambos | `Professional.id` = `Medico.id`, mapeado 1:1 |
| nome | Existe em ambos | `Identity.fullName` ← `Medico.nome` |
| foto | Existe em ambos (estrutural) | `Identity.photoUrl` ← `Medico.fotoUrl`; campo existe nos dois lados, mas nenhum mock tem valor real preenchido |
| especialidades | Existe em ambos | `Professional.specialties[]` ← `especialidadeId` via catálogo `especialidadesBase` |
| formação | Existe em ambos | `Professional.education[]` ← `formacoes[]` |
| localização | Existe em ambos | `Professional.practiceLocations[]` ← `cidade`+`estadoSigla`+`instituicaoPrincipal` |
| idiomas | Existe apenas em Professional | `Identity.languages` existe estruturalmente; `Medico` não tem nenhum campo de idioma — nunca populado |
| experiência | Existe apenas no legado | `Medico.experiencias[]` existe; a entidade `domain/professional/Experience.ts` existe isolada, mas **não está integrada à aggregate Professional** (confirmado: `Professional.ts` não importa `Experience`) |
| instituição principal | Existe em ambos | No legado é campo direto (`Medico.instituicaoPrincipal`); em Professional não é campo próprio — foi reaproveitado como `PracticeLocation.name` |
| verificado | Existe apenas no legado | `Medico.verificado`/`verificacoes[]` (booleano/texto solto); o Knowledge Core tem um conceito muito mais robusto (`Verification`+`EditorialStatus`+`KnowledgeClaim`), mas **nenhuma claim real foi criada a partir do legado ainda** — o conceito superior existe, mas está vazio na prática |
| trajetória | Existe em ambos (parcial) | Legado combina `formacoes`+`experiencias` numa narrativa; Professional só tem `education` (equivalente a `formacoes`) — sem `Experience` integrada, a trajetória do domínio é incompleta |
| contato público | Não existe | Confirmado exaustivamente já na P2-006: zero ocorrências em qualquer lugar |
| elegibilidade | Não existe | Nenhum campo, caso de uso ou entidade — recomendação já registrada (P2-006) de usar `KnowledgeClaim`, não implementada |
| score | Não existe | — |
| ranking | Não existe | — |

## 3. Modelo do catálogo (proposta conceitual, sem implementação)

Campos necessários para card/lista/mapa/perfil resumido, e a origem
de cada um:

| Campo da projeção | Origem |
|---|---|
| id | Professional |
| nome (fullName) | Professional |
| nome de apresentação (professionalName) | Professional (estrutural; hoje sempre ausente — mapper não popula) |
| foto | Professional (estrutural; hoje sempre ausente) |
| especialidades (nomes) | Professional (`specialties[].name`) |
| cidade / estado (lista, filtro textual) | Professional (`practiceLocations[].city/state`) |
| coordenadas (mapa) | Ausente — nenhum dado real existe hoje em nenhuma camada |
| instituição principal (exibida no card) | Professional (`practiceLocations[0]?.name`) |
| formação resumida (perfil resumido) | Professional (`education[]`: program/institutionName/startYear/endYear) |
| selo "formação verificada" | Knowledge (via `KnowledgeClaim` publicada + `Verification`) — **hoje ausente na prática**, pois nenhuma claim foi criada a partir de dados legados |
| idiomas (se exibido) | Professional (`identity.languages`) — estrutural, sempre vazio hoje |
| elegibilidade (aparece ou não no catálogo) | Calculado — recomendado via Knowledge Core (P2-006), não implementado |
| contato | Ausente |
| score / ranking | Ausente — permanece fora de escopo |
| slug / URL amigável do perfil | Legado (`Medico.slug`) — não existe em `Professional` hoje; a projeção precisaria decidir se deriva um novo slug ou reaproveita o do legado |

## 4. Aggregate × Projection

**A partir daqui, a UI deve consumir uma projeção dedicada
(`ProfessionalCatalogProjection`), não a aggregate `Professional`
diretamente, e a aggregate não deve continuar crescendo apenas para
satisfazer necessidades de exibição.**

Justificativa: os campos que o catálogo precisa vêm de **três fontes
distintas** — (1) fatos brutos da aggregate `Professional` (nome,
especialidades, formação, localização), (2) o Knowledge Core
(selo de verificação, e futuramente elegibilidade), e (3), ao menos
por enquanto, um campo remanescente do legado (`slug`) sem
equivalente na aggregate. Nenhuma dessas três fontes deveria ser
forçada dentro da outra: adicionar "selo de verificado" ou
"elegibilidade" como campo direto de `Professional` misturaria fatos
de registro profissional (que exigem validação de escrita, como já
acontece com `Registration`/`Specialty`/`Education`) com dados
derivados/calculados de outra fonte (Knowledge Core) — exatamente o
tipo de mistura que uma projeção de leitura existe para evitar.

A aggregate deve continuar crescendo **somente** quando o novo dado
for um fato profissional de primeira classe, validável e pertencente
ao próprio profissional (ex.: uma futura integração real de
`Registration`, `Credential` ou `Experience`, quando dados legados ou
uma nova fonte tornarem isso mapeável) — não para campos
puramente derivados ou de outra fonte (verificação, elegibilidade,
coordenadas geocodificadas, contato).

## 5. Impactos (análise, sem alteração de código)

**Mapper:** `LegacyProfessionalMapper` continua produzindo a
aggregate `Professional` exatamente como está — não muda. Uma futura
projeção seria construída por um componente novo e separado (ex.: um
"builder" de projeção), que combina a saída do `ProfessionalRepository`
com a saída de casos de uso do Knowledge Core — sem tocar no mapper
existente.

**Knowledge Core:** nenhuma mudança necessária hoje. O caso de uso
`GetPublishedKnowledgeTraceByProfessional` (já existente, já testado
estaticamente nas etapas KB) já retorna exatamente a forma de dado
(claim + evidências + fontes + verificação) que uma futura projeção
precisaria consumir para montar o selo de "formação verificada" —
essa é, inclusive, uma razão concreta para essa consulta já existir.

**Futuros filtros:** filtros por especialidade/cidade/estado se
beneficiariam de uma projeção já "achatada" (nomes como string,
cidade/estado como string simples) em vez de precisar navegar objetos
aninhados da aggregate a cada consulta — mais barato para indexação
ou busca futura.

**Elegibilidade:** caso a recomendação da P2-006 (elegibilidade via
`KnowledgeClaim` publicada) seja adotada no futuro, o campo de
elegibilidade da projeção viria naturalmente do Knowledge Core através
de um caso de uso de leitura dedicado — reforçando a necessidade de a
projeção combinar múltiplas fontes em vez de a aggregate absorver tudo.

**Ranking/score:** permanecem inteiramente fora de escopo; nada nesta
auditoria habilita ou aproxima essa funcionalidade.

## 6. Próxima tarefa recomendada (não implementada)

Definir e implementar `ProfessionalCatalogProjection` como um tipo de
leitura (read model) na camada de aplicação, junto de um caso de uso
que o construa combinando `ProfessionalRepository` (para os dados da
aggregate) e, quando aplicável, os casos de uso já existentes do
Knowledge Core — sem alterar `Professional`, o mapper ou o Knowledge
Core em si.
