# Catalog Projection vs. Profile Projection (P2-019)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código de produção foi
alterado. Escopo: toda a cadeia de leitura do catálogo
(`application/alicia/catalog/`, `infrastructure/alicia/catalog/`),
todas as entidades de `domain/professional/`, o mapper legado, e a
rota pública individual real do médico
(`app/alicia/[estado]/[especialidade]/[medico]/page.tsx` e seus
componentes).

## 2. Inventário da Catalog Projection atual

```ts
export interface ProfessionalCatalogProjection {
  readonly id: string;
  readonly slug: string;
  readonly fullName: string;
  readonly professionalName?: string;
  readonly photoUrl?: string;
  readonly specialties: ReadonlyArray<ProfessionalCatalogSpecialty>;
  readonly education: ReadonlyArray<ProfessionalCatalogEducation>;
  readonly primaryLocation?: ProfessionalCatalogLocation;
  readonly languages: ReadonlyArray<string>;
}
```

| Campo | Origem | Adequado para card/lista | Adequado para perfil | Obrigatório | Só depende de Professional | Preocupação de apresentação |
|---|---|---|---|---|---|---|
| id | Professional.id | Sim | Sim (mas insuficiente sozinho) | Sim | Sim | Não |
| slug | Fonte do catálogo (legado, hoje) | Sim | Sim | Sim | **Não** — vem de `ProfessionalCatalogSource`, não de `Professional` | Sim (roteamento) |
| fullName | Identity.fullName | Sim | Sim | Sim | Sim | Não |
| professionalName? | Identity.professionalName | Sim (nunca populado hoje) | Sim | Não | Sim | Não |
| photoUrl? | Identity.photoUrl | Sim (nunca populado hoje) | Sim | Não | Sim | Não |
| specialties | Professional.specialties[] | Sim | Sim, mas raso para perfil (só id+name) | Sim (array, pode ser vazio) | Sim | Não |
| education | Professional.education[] | **Excessivo para card** — útil só em lista detalhada/perfil | Base razoável, mas falta status de conclusão e verificação | Sim (array) | Sim | Contém dado potencialmente demais para um card simples |
| primaryLocation? | `practiceLocations[0]` (só o primeiro) | Sim | Insuficiente — perfil pode precisar de mais de um local | Não | Sim | Sim — a escolha "primeiro item" é uma simplificação deliberada de apresentação |
| languages | Sempre `[]` (Professional não integra) | N/A (nunca usado hoje) | Insuficiente | Sim (array, sempre vazio) | Sim | Não — mas é um campo hoje sempre vazio, "conhecido mas não integrado" |

**Campos suficientes para catálogo:** id, slug, fullName,
specialties, primaryLocation (city/state/name).
**Campos insuficientes para perfil:** faltam registro profissional,
experiência, credenciais, biografia, verificação/rastreabilidade,
múltiplos locais.
**Campos potencialmente excessivos para catálogo:** `education`
completo por item da lista é mais dado do que um card básico
normalmente exige.
**Campos que retornam sempre vazio por falta de integração:**
`professionalName`, `photoUrl`, `languages` (estruturalmente
presentes, nunca populados pelo `LegacyProfessionalMapper`).

## 3. Inventário do perfil legado

Rota real: `app/alicia/[estado]/[especialidade]/[medico]/page.tsx`,
usando `getMedicoPorSlug`, `PerfilMedicoHeader`, `TrajetoriaAcademica`,
`VerificacoesMedico`. Dados efetivamente consumidos:

- `estado.nome` (nome completo do estado, resolvido por serviço)
- `especialidade.nome`
- `medico.nome`, `medico.cidade`, `medico.estadoSigla`,
  `medico.instituicaoPrincipal`
- `medico.verificado` (booleano — selo "Formação verificada")
- `medico.bioCurta` (texto livre opcional)
- `medico.formacoes[]` (id, tipo, titulo, instituicao, cidade?,
  estado?, anoInicio?, anoConclusao?, verificado)
- `medico.experiencias[]` (id, funcao, instituicao, cidade?,
  anoInicio?, anoConclusao?, atual?)
- `medico.areasDeAtuacao[]` (tags de texto livre)
- `medico.verificacoes[]` (id, titulo, descricao, status)

## 4. Matriz de disponibilidade dos dados (A–F)

| Dado | Classificação | Observação |
|---|---|---|
| estado.nome | C | Resolvido hoje por serviço legado (`services/alicia/estados.ts`); `PracticeLocation.state` só guarda a sigla, não o nome completo |
| especialidade.nome | **A** | Já coberto por `specialties[].name` na projeção atual |
| nome/cidade/estado/instituição principal | **A** | Já cobertos (fullName, primaryLocation) |
| medico.verificado (selo) | C, com destino conceitual D | Não existe campo equivalente hoje; a forma correta futura é uma composição com o Knowledge Core (`KnowledgeClaim`+`Verification`), mas nenhuma claim real existe hoje para nenhum profissional (confirmado por busca) |
| medico.bioCurta | C | Existe só no legado; não há campo equivalente em `Identity` nem na projeção |
| formacoes[] | **A, parcialmente** | `Professional.education[]` já cobre tipo/programa/instituição/anos (via P2-007/008); faltam `cidade`/`estado` por formação (E, `Education` não tem esses campos) e `verificado` por item (E — sem correspondente no domínio) |
| experiencias[] | C | `Experience.ts` existe em `domain/professional/` mas **não está integrada** à aggregate `Professional` (confirmado: `Professional.ts` não a referencia); o legado tem dado rico, mas nada foi mapeado ainda (situação análoga à Education antes da P2-007/008) |
| areasDeAtuacao[] | C | Texto livre no legado; não corresponde de forma comprovada a `Capability` (que é estruturada por tipo/nível, não tags livres) |
| verificacoes[] | D (conceitual, não populado) | Corresponde ao papel que `Verification`+`KnowledgeClaim`+`EditorialStatus` deveriam cumprir no Knowledge Core, mas nenhum dado real existe hoje |
| registros profissionais (CRM) | B | `Professional.registrations` existe estruturalmente (sempre vazio); nenhuma fonte real, nem legado nem domínio, fornece esse dado (P2-010, bloqueada) |
| títulos/credenciais | E | `Credential.ts` existe isolada, sem integração e sem correspondente real no legado |
| instituições (como entidade) | E | `Institution.ts` existe isolada; hoje só o *nome* da instituição é usado (via `primaryLocation.name`), não a entidade completa |
| capacidades | E | `Capability.ts` existe isolada, sem dado real correspondente |
| localização (múltiplos locais) | A (para o único local que já existe hoje) | O legado só tem 1 local por médico; a aggregate já suporta múltiplos (`practiceLocations[]`), mas a projeção do catálogo só expõe o primeiro |
| coordenadas | E | Nenhuma coordenada real existe em lugar nenhum do projeto (confirmado repetidamente desde a P2-006/P2-011) |
| conhecimento publicado | D (não populado) | `GetPublishedKnowledgeTraceByProfessional` já existe e está pronto para compor isso, mas nenhum dado real existe |
| evidências / verificação (Knowledge Core) | D (não populado) | Mesma observação acima |
| elegibilidade | E | Nunca implementada; recomendação já registrada (P2-006) de usar Knowledge Core, não concretizada |
| ranking / score | E | Fora de escopo, nunca existiu |
| contatos | E | Zero ocorrências em todo o projeto (confirmado na P2-015A) |
| agenda | E | Nunca fez parte de nenhum escopo descrito |

## 5. Diferenças entre catálogo e perfil

**Catálogo:** leitura rápida, múltiplos profissionais simultâneos
(hoje 7, sem paginação), payload por item deveria ser pequeno,
atualização pouco frequente (nome/especialidade/cidade mudam
raramente).

**Perfil:** leitura aprofundada de um único profissional por vez,
precisa de trajetória completa (formação **e** experiência),
potencialmente múltiplos locais, informações editoriais/rastreáveis
(quando o Knowledge Core for integrado), volume de dado por item
muito maior.

**Riscos identificados:** usar uma única projeção rica para os dois
contextos geraria overfetching real na listagem (educação completa,
possível verificação/evidências replicadas em cada um dos N cards);
uma projeção "gigante" acumularia responsabilidades de dois contextos
de uso diferentes, dificultando manutenção; sem contratos formais e
separados, cada consumidor futuro (mapa, busca, perfil) tenderia a
inventar seu próprio subconjunto ad-hoc, gerando modelos inconsistentes.

## 6. Alternativas avaliadas

**A — Uma única projeção para catálogo e perfil.** Simplicidade
inicial alta, mas overfetching alto na listagem, acoplamento alto
entre dois contextos de uso muito diferentes, manutenção pior a médio
prazo, e contraria o mesmo princípio já decidido na P2-012 (não fazer
uma estrutura crescer só para servir exibição — aqui entre dois tipos
de exibição, não entre domínio e exibição).

**B — Projeções separadas (Catalog + Profile).** Clareza semântica
alta; pequena duplicação legítima de poucos campos (id, slug,
fullName, specialties); cada builder monta a partir de `Professional`
(e, no caso do perfil, futuramente também do Knowledge Core) de forma
independente; alta adequação a CQRS (múltiplos read models
especializados); independência da UI mantida.

**C — Base pública compartilhada (`ProfessionalPublicSummary` da qual
Catalog/Profile derivariam).** Reutilização alta para os campos
comuns, mas risco real de acoplamento: em TypeScript estrutural, uma
interface base formal criaria dependência de tipo entre os dois
contratos, de forma que uma mudança na base afetaria ambos mesmo
quando só um consumidor precisasse mudar. Com apenas dois modelos de
leitura hoje, essa abstração é prematura para o tamanho atual do
problema — TypeScript já permite reaproveitamento estrutural de campos
comuns sem herança formal.

**D — Perfil composto por blocos independentes (Catalog +
`ProfessionalEducationProjection` + `ProfessionalKnowledgeProjection`).**
Interessante para carregamento progressivo (vantagem real), mas
aumenta o número de consultas necessárias para montar uma única tela,
introduz risco de inconsistência entre blocos buscados
separadamente, e transfere para a UI (ou para uma camada
intermediária ainda inexistente) a responsabilidade de compor os
blocos — mais complexidade do que o volume atual de dados justifica.

## 7. Decisão

**2. CRIAR PROFESSIONALPROFILEPROJECTION SEPARADA**

Avaliada contra os 14 critérios obrigatórios: uma segunda projeção
pequena e focada é mais simples que uma projeção gigante (A), uma
base abstrata prematura (C), ou uma orquestração de múltiplos blocos
ainda não justificada pelo volume atual de dados (D). Não afeta
`Professional` (mesma proteção de aggregate já decidida na P2-012).
Elimina overfetching na lista. Mantém clareza semântica e
testabilidade altas. Permite que catálogo e perfil evoluam em ritmos
diferentes (perfil crescerá conforme o Knowledge Core amadurecer,
sem arrastar mudanças para a lista). Compatível com a rota pública
já existente (uma página, um objeto de perfil coeso). Preserva
Professional/Knowledge Core como fonte única de verdade — as
projeções continuam sendo apenas visões derivadas, nunca uma segunda
fonte de dados. Carregamento progressivo continua possível no futuro
dentro de uma única `ProfessionalProfileProjection` (campos opcionais
carregados depois), sem exigir a complexidade de D agora.

**Respostas obrigatórias:**
- A lista deve consumir `ProfessionalCatalogProjection` (via
  `ProfessionalCatalogQuery.list()`, já existente).
- O perfil deve consumir uma nova `ProfessionalProfileProjection`.
- Cada projeção deve ser montada por um builder próprio na camada de
  aplicação — `BuildProfessionalCatalogProjection` (já existe) e um
  futuro `BuildProfessionalProfileProjection`, em um módulo dedicado
  (ex.: `application/alicia/profile/`).
- O perfil **não** deve depender diretamente de
  `ProfessionalCatalogQuery` — deveria ter seu próprio contrato de
  consulta (`ProfessionalProfileQuery`), para não acoplar a tela de
  perfil a mudanças que a lista precise fazer por razões próprias
  (ex.: paginação).
- O perfil **deve** poder acessar `ProfessionalCatalogSource` — é
  razoável reaproveitar `findBySlug()` já existente para localizar o
  `Professional` correspondente, sem duplicar a composição
  Medico→Professional.
- O perfil deve, no futuro, compor dados do Knowledge Core — mas isso
  não é obrigatório para uma primeira versão do perfil, já que nenhum
  dado real de conhecimento publicado existe hoje.
- `ProfessionalProfileProjection` **deve existir já no MVP**, mesmo
  com poucos campos reais inicialmente.

## 8. ProfessionalProfileProjection mínima proposta (conceitual, não implementada)

**Campos sustentados por dados atuais:** `id`, `slug`, `fullName`,
`professionalName?`, `photoUrl?` (estruturais, hoje sempre ausentes),
`specialties`, `education`, `practiceLocations` (plural — diferente
do catálogo, o perfil poderia expor todos os locais, não só o
primeiro).

**Campos possíveis no futuro (fonte plausível, não integrada ainda):**
`registrations` (quando `Registration` finalmente tiver dado real —
P2-010 segue bloqueada), `credentials` (quando `Credential` for
integrada, análogo à P2-007), `experience` (quando `Experience` for
integrada — o legado já tem dado rico em `experiencias[]`, só falta a
mesma integração já feita para `Education`), `publishedKnowledge`/
`verification` (quando o Knowledge Core tiver claims reais — os casos
de uso já existem e estão prontos: `GetPublishedKnowledgeTraceByProfessional`).

**Campos proibidos sem nova fonte real:** ranking, score,
elegibilidade, recomendação, qualidade, "melhor médico",
compatibilidade, disponibilidade, contato, agenda — nenhum tem fonte
real hoje (confirmado nesta e nas auditorias P2-006/P2-012/P2-015A).

## 9. Relação com Knowledge Core

O perfil público deveria apresentar, no máximo, um **resumo derivado**
do estado editorial de claims publicadas relacionadas (ex.: uma
contagem ou pequeno resumo por tipo de afirmação verificada) — não a
estrutura completa de `Evidence`/`Source`/`Verification`. Os detalhes
completos de rastreabilidade (quem verificou, quando, com que fonte)
pertencem a uma visão de rastreabilidade separada, já sustentada pelos
casos de uso existentes (`GetKnowledgeClaimTrace`,
`GetPublishedKnowledgeTraceByProfessional`) — o perfil público deveria
apenas referenciar/resumir, nunca embutir tudo. Uma consulta composta
futura será necessária: um eventual `BuildProfessionalProfileProjection`
precisaria combinar `Professional` (via `ProfessionalCatalogSource`)
com o resultado de `GetPublishedKnowledgeTraceByProfessional`, sem que
a lista precise dessa mesma composição.

## 10. Arquitetura-alvo

```
ProfessionalCatalogSource (Professional + slug)     Knowledge Repositories (futuro, só para o perfil)
                    ↓                                            ↓
   BuildProfessionalCatalogProjection      BuildProfessionalProfileProjection (futuro)
                    ↓                                            ↓
      ProfessionalCatalogProjection              ProfessionalProfileProjection (futuro)
                    ↓                                            ↓
     UI: lista / card / mapa                 UI: página individual do médico
```

Quem conhece a aggregate `Professional`: somente os builders e a fonte
(`ProfessionalCatalogSource`). Quem conhece o Knowledge Core: apenas o
futuro builder de perfil — a lista não precisa. Quem conhece o slug:
a fonte do catálogo (origem) e ambos os builders (recebem como
parâmetro). Quem conhece as projeções: os contratos de consulta
(`Query`) e a UI. **O que a UI pode consumir:** exclusivamente
`ProfessionalCatalogProjection` e, futuramente,
`ProfessionalProfileProjection`. **O que a UI não pode consumir:**
`Professional`, `ProfessionalRepository`, `ProfessionalCatalogSource`,
`LegacyProfessionalMapper`, ou qualquer entidade/repositório do
Knowledge Core diretamente.

## 11. Impactos e sequência futura (não implementados)

1. Criar `application/alicia/profile/ProfessionalProfileProjection.ts`
   com os campos mínimos listados na seção 8.
2. Criar `BuildProfessionalProfileProjection`, reaproveitando
   `ProfessionalCatalogSource.findBySlug()`.
3. Criar `ProfessionalProfileQuery` (contrato) e sua implementação em
   memória, espelhando o padrão já usado no catálogo.
4. Integrar `Experience` à aggregate `Professional` (tarefa análoga à
   P2-007/008) antes de incluir experiência real no perfil.
5. Só depois considerar composição com o Knowledge Core, quando dados
   reais de conhecimento publicado existirem.

## 12. Fora de escopo (nesta auditoria)

Nenhuma projeção, builder, query, source, repository, entidade de
domínio, adapter, factory, mock, serviço, UI, rota, API ou teste foi
criado ou alterado. Esta tarefa é exclusivamente descritiva.
