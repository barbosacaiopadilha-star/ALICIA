# RC — Fundação para Dados Reais (MACROBLOCO-02)

## 1. Estado inicial

Branch: `master` · HEAD: `abb70701862dd4adbea090e4266aa067c97d4cf7` (conferido) · Working tree: limpo.

## 2. Arquitetura encontrada

Fluxo completo de dados, da origem até a UI, antes desta tarefa:

```
mocks/alicia/medicos.ts
   ├─→ (import direto) infrastructure/alicia/catalog/createMockProfessionalCatalogSource.ts
   ├─→ (import direto) infrastructure/alicia/professional/createMockProfessionalRepository.ts
   └─→ (import direto) services/alicia/medicos.ts
```

**Três pontos distintos** importavam `mocks/alicia/medicos.ts`
diretamente, fora da própria pasta de mocks — nenhuma fronteira
única existia. `mocks/alicia/especialidades.ts` também importa
`medicos` (para computar `quantidadePorEstado`), mas isso é uma
derivação mock-para-mock, dentro da própria camada de mocks — não é
um consumidor de aplicação/infraestrutura/service, e permanece fora
do escopo desta fronteira.

**Quem produz:** os arrays `medicos`/`estados`/`especialidadesBase`
em `mocks/alicia/`. **Quem transforma:** `LegacyProfessionalMapper`
(`Medico` → `Professional`), `BuildProfessionalCatalogProjection`/
`BuildProfessionalProfileProjection` (`Professional` →
Projection pública). **Quem consome:** as páginas públicas (via
`createProfessionalCatalogQuery`/`createGetProfessionalProfileBySlug`
para dados estruturados; `services/alicia/medicos.ts` para os
bridges residuais documentados em RC-PERFIL-01/CATALOG_MIGRATION_REVIEW).

## 3. Origem única

Criada `infrastructure/alicia/professional/professionalDataProvider.ts`,
exportando `listRawProfessionals(): ReadonlyArray<Medico>`. É agora o
**único** arquivo do projeto (fora de `mocks/`) que importa
`mocks/alicia/medicos.ts` — confirmado por busca exaustiva. Retorna o
formato bruto (`Medico`), não `Professional`: a conversão para o
domínio continua responsabilidade de `LegacyProfessionalMapper`,
chamada por cada consumidor conforme sua necessidade (ex.: o catálogo
precisa do slug, o repositório não). Trocar a origem real no futuro
(banco, API, importação editorial) exigirá alterar **apenas este
arquivo** — nenhum outro consumidor precisa mudar.

## 4. Repositories

| Repository | Classificação | Justificativa |
|---|---|---|
| `ProfessionalCatalogSource`/`MockProfessionalCatalogSource` | Evolui (mínimo) | Passou a receber os dados brutos via `listRawProfessionals()` em vez de importar mocks diretamente; contrato e comportamento público inalterados |
| `ProfessionalRepository`/`MockProfessionalRepository` | Evolui (mínimo) | Mesma evolução — composição agora usa a fronteira única |
| `ProfessionalPublicBiographyRepository`/`InMemory...` | Permanece | Já não depende de mocks (repositório sempre criado vazio); nenhuma evolução necessária |
| `KnowledgeClaimRepository`/`SourceRepository`/`EvidenceRepository`/`VerificationRepository` (todos `InMemory...`) | Permanece | Já não dependem de mocks; zero consumidor real ainda, sem necessidade de evolução agora |

Nenhum repository foi substituído ou removido — apenas os dois que
liam mocks diretamente evoluíram para ler através da nova fronteira.

## 5. Adapters

- **`LegacyProfessionalMapper`** — classificado como **definitivo**,
  não temporário: mesmo com uma fonte real futura, alguma forma de
  adaptação de um registro bruto para `Professional` continuará
  necessária. O que deverá evoluir no futuro não é sua existência,
  mas potencialmente sua assinatura de entrada (hoje `Medico`), caso a
  fonte real produza um formato diferente — decisão explicitamente
  adiada para a fase de integração (seção 11).
- **Nenhum adapter obsoleto foi encontrado** — nada foi removido nesta
  frente.
- **Preparado para dados reais:** `professionalDataProvider.ts` em si
  — é o ponto exato que deverá ser reescrito (ou ganhar uma
  implementação alternativa selecionável) quando uma fonte real
  existir, sem tocar em `LegacyProfessionalMapper` nem em nenhum
  consumidor.

## 6. Factories

| Factory | Consistência |
|---|---|
| `createProfessionalCatalogQuery()` | Instância nova por chamada, sem singleton — inalterada nesta tarefa, já usa a fronteira única transitivamente (via `createMockProfessionalCatalogSource`) |
| `createMockProfessionalCatalogSource()` | Evoluída: agora usa `listRawProfessionals()` |
| `createGetProfessionalProfileBySlug()` | Inalterada — reaproveita `createMockProfessionalCatalogSource()`, herda a fronteira única automaticamente |
| `createEditorialApplication()` | Inalterada — nunca dependeu de mocks (repositório sempre vazio) |
| `createMockProfessionalRepository()` | Evoluída: agora usa `listRawProfessionals()` |

Todas seguem o mesmo padrão (função pura, sem parâmetros, sem estado
compartilhado, nova composição a cada chamada). **Nenhuma composição
para o Knowledge Core foi criada** — avaliado explicitamente (frente
6 do escopo permite criar "caso faça sentido"): como o Knowledge Core
continua sem nenhum consumidor real (confirmado no MACROBLOCO-01),
criar uma factory agora seria implementar antes da necessidade
demonstrada — decisão consciente de não fazê-lo, não um esquecimento.

## 7. Compatibilidade

Confirmado via `git diff --stat`: domínio, aggregates, mapper (código,
não a origem de dados que ele recebe), projections, componentes,
páginas/rotas e mocks **não foram alterados**. Catálogo, perfil,
descoberta (busca/cidade/ordenação), mapa e Knowledge Core continuam
funcionando exatamente como antes — a mudança é inteiramente interna
à composição de infraestrutura, sem nenhum efeito observável.

## 8. Documento criado

`docs/architecture/REAL_DATA_FOUNDATION_RC.md` (este documento).

## 9. Testes e verificações

Typecheck/lint/build: não executados — sem `node_modules` (mesmo
bloqueio já documentado em toda a sessão). `git status`/`git diff --stat`:
confirmam exatamente os 5 arquivos listados na seção 10. `git diff --check`:
limpo (exit 0). Revisão estática: leitura completa de todos os
arquivos antes/depois das edições; busca exaustiva confirmando que
`professionalDataProvider.ts` é o único importador real de
`mocks/alicia/medicos.ts` fora da pasta de mocks; contagem de chaves
balanceada em todos os arquivos tocados.

## 10. Commits

Um commit único e coeso, reunindo toda a consolidação de código desta
tarefa (mais o documento):

`architecture: consolidar fronteira de dados de profissionais`

Arquivos: `infrastructure/alicia/professional/professionalDataProvider.ts` (novo),
`infrastructure/alicia/catalog/createMockProfessionalCatalogSource.ts`,
`infrastructure/alicia/professional/createMockProfessionalRepository.ts`,
`infrastructure/alicia/professional/index.ts`,
`services/alicia/medicos.ts`,
`docs/architecture/REAL_DATA_FOUNDATION_RC.md`.

## 11. Pendências

Exclusivamente o que falta para iniciar a integração real:

1. Decidir o formato de entrada real (substituir/estender `Medico`
   como formato bruto, ou manter `LegacyProfessionalMapper` recebendo
   exatamente esse formato de um adaptador intermediário).
2. Implementar uma segunda implementação de
   `listRawProfessionals()`-equivalente (ex.: `DatabaseProfessionalDataProvider`)
   e um mecanismo de seleção entre mock/real (variável de ambiente ou
   configuração — não decidido aqui).
3. Popular o Knowledge Core com dados reais e, só então, decidir se
   vale a pena criar sua composição pública.
4. Revisão editorial humana das bios e decisão sobre os dois itens
   residuais de `areasDeAtuacao` — pendências já registradas em
   MACROBLOCO-01, inalteradas.
5. Reavaliar, com um consumidor real do Knowledge Core, se
   `ProfessionalRepository` deve ou não ser unificado com
   `ProfessionalCatalogSource`.

## Respostas obrigatórias

**A aplicação está pronta para substituir os mocks?**
Estruturalmente, sim, no sentido de que existe agora exatamente um
ponto de troca (`professionalDataProvider.ts`) — mas os dados reais em
si, e uma segunda implementação real desse provedor, ainda não
existem, e essa implementação não foi feita aqui (fora de escopo).

**Quais pontos ainda bloqueiam dados reais?** A ausência de uma fonte
real (banco/API/importação) e a ausência de decisão sobre o formato
de entrada real (se `Medico` continua sendo o contrato ou se evolui).

**Quais bridges permanecem?** Os mesmos cinco já documentados no
MACROBLOCO-01 (`formacaoResumo`, `verificado`, `verificacoes[]`,
`bioCurta`, `formacao.cidade`/`estado` por item) — nenhum foi
alterado ou eliminado nesta tarefa, pois nenhuma condição para isso
mudou.

**Quais decisões ficam para a fase de integração?** Formato de dado
bruto real; mecanismo de seleção de origem (mock vs. real); ordem de
população do Knowledge Core; e a decisão sobre unificar ou não
`ProfessionalRepository` com `ProfessionalCatalogSource`.

PRONTO PARA REVISÃO
