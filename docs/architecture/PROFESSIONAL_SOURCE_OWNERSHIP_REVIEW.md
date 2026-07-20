# Ownership das Fontes de Leitura Profissional (P2-023)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código de produção foi
alterado. Escopo: toda a cadeia de leitura do catálogo e do perfil
(`application/alicia/catalog/`, `application/alicia/profile/`,
`infrastructure/alicia/catalog/`), o mapper legado e `Professional`.

## 2. Inventário atual

**`ProfessionalCatalogSource`**
```ts
export interface ProfessionalCatalogSourceItem {
  readonly professional: Professional;
  readonly slug: string;
}
export interface ProfessionalCatalogSource {
  findAll(): Promise<ReadonlyArray<ProfessionalCatalogSourceItem>>;
  findBySlug(slug: string): Promise<ProfessionalCatalogSourceItem | null>;
}
```
Implementação concreta: `MockProfessionalCatalogSource` (usa
`LegacyProfessionalMapper.toDomain()` sobre cada `Medico`, valida
`slug` na composição, protege `findAll()`/`findBySlug()` retornando
novos objetos associativos). Factory: `createMockProfessionalCatalogSource()`,
lendo `mocks/alicia/medicos.ts`.

**`ProfessionalProfileSource`**
```ts
export interface ProfessionalProfileSourceItem {
  readonly professional: Professional;
  readonly slug: string;
}
export interface ProfessionalProfileSource {
  findBySlug(slug: string): Promise<ProfessionalProfileSourceItem | null>;
}
```
Nenhuma implementação concreta existe.

## 3. Consumidores reais

Busca textual em todo o projeto por `ProfessionalCatalogSource`,
`ProfessionalCatalogSourceItem`, `ProfessionalProfileSource`,
`ProfessionalProfileSourceItem`, `findBySlug`,
`BuildProfessionalProfileProjection`, `BuildProfessionalCatalogProjection`:

- `ProfessionalCatalogSource`/`Item`: consumidos por
  `ListProfessionalCatalog.ts` (via `findAll()`) e
  `MockProfessionalCatalogQuery.ts` (via `findAll()` e `findBySlug()`).
  Implementado por `MockProfessionalCatalogSource.ts`. **Totalmente
  conectado, ponta a ponta.**
- `ProfessionalProfileSource`/`Item`: aparecem **somente** dentro de
  `ProfessionalProfileSource.ts` e do barrel
  `application/alicia/profile/index.ts` que o reexporta. **Zero
  consumidores, zero implementação.**
- `BuildProfessionalProfileProjection`: aparece somente em seu próprio
  arquivo e no barrel que o reexporta. **Nenhum caso de uso, query ou
  outro código o instancia ou chama.**

## 4. Sobreposição encontrada

**Semelhanças:** os dois itens (`ProfessionalCatalogSourceItem` e
`ProfessionalProfileSourceItem`) são **estruturalmente idênticos**,
campo a campo, tipo a tipo — ambos `{ readonly professional: Professional; readonly slug: string }`.
O único método que ambos os contratos compartilham
(`findBySlug(slug): Promise<Item | null>`) tem a mesma assinatura
exata nos dois.

**Diferenças reais:** apenas uma — `ProfessionalCatalogSource` também
tem `findAll()`, porque o catálogo precisa listar todos os
profissionais; `ProfessionalProfileSource` não tem, porque o perfil só
localiza um por vez. Essa é uma diferença de **responsabilidade de
consulta**, não de dado ou de origem.

**Diferenças apenas nominais:** o nome do contrato (`Catalog` vs.
`Profile`) e o nome do item (`CatalogSourceItem` vs.
`ProfileSourceItem`) — sem nenhuma diferença de campo, tipo,
comportamento, autorização, cache, ciclo de vida ou tratamento de
erro.

**Respostas às perguntas objetivas da Etapa 2:**
- Os itens são estruturalmente idênticos? **Sim.**
- Possuem semântica diferente hoje? **Não** — ambos significam
  "localizar um Professional pelo seu slug público".
- Possuem política de autorização diferente? **Não** — nenhuma das
  duas tem qualquer noção de autorização.
- Possuem origem de dados diferente? **Não comprovadamente** — a
  única origem real implementada é `mocks/alicia/medicos.ts` via
  `LegacyProfessionalMapper`, usada pelo catálogo; o perfil não tem
  nenhuma implementação que evidencie uma origem distinta.
- Possuem política de cache diferente? **Não** — nenhuma das duas
  implementa cache.
- Possuem ciclo de vida diferente? **Não** — nenhuma evidência de
  diferença de ciclo de vida (ambas seriam injetadas via construtor).
- Possuem comportamento de erro diferente? **Não** — o
  comportamento conhecido (slug vazio → `null`, slug inexistente →
  `null`) é idêntico onde implementado.
- Possuem requisitos de consistência diferentes? **Não** — nenhuma
  evidência de requisito distinto.

## 5. Alternativas avaliadas

**A — Manter as duas sources independentes.** Clareza semântica alta
em teoria, mas hoje `ProfessionalProfileSource` é um contrato vazio.
Qualquer implementação futura duplicaria exatamente a mesma lógica de
composição (mapper + mocks + validação de slug) já escrita para o
catálogo. Custo de manutenção e risco de divergência altos para uma
diferença que hoje é apenas nominal. Nenhuma evidência real de que
catálogo e perfil precisarão de origens de dados diferentes no futuro
próximo — ambos leem os mesmos mocks/`Professional` hoje.

**B — Perfil reutiliza diretamente `ProfessionalCatalogSource`.**
Simplicidade alta — zero infraestrutura nova; um futuro caso de uso de
perfil injeta `ProfessionalCatalogSource` e chama `findBySlug()`
diretamente. Semântica um pouco estranha (usar algo com "Catalog" no
nome para servir o perfil), mas é um acoplamento nominal, não
técnico — `findBySlug()` não carrega nenhuma responsabilidade
exclusiva de listagem. Impacto futuro baixo: se um dia surgir uma
razão real para o catálogo evoluir (ex.: paginação em `findAll()`),
isso não afeta `findBySlug()`.

**C — Adapter fino de `ProfileSource` sobre `CatalogSource`.**
Isolamento semântico alto (o nome "Profile" sobrevive), duplicação
mínima (só um wrapper pequeno), fácil de testar — mas seu valor real
hoje é questionável: existiria apenas para preservar um nome, sem
nenhum comportamento distinto a proteger. É o mesmo tipo de indireção
que a P2-012/P2-019 já rejeitaram ao descartar abstrações
compartilhadas prematuras.

**D — Substituir ambas por `ProfessionalPublicSource` compartilhada.**
Neutralidade semântica alta (nem "Catalog" nem "Profile"), mas custo
de migração real: exigiria renomear/mover um contrato já em uso
(`ProfessionalCatalogSource`, consumido por `ListProfessionalCatalog`
e `MockProfessionalCatalogQuery`) só para acomodar um consumidor
(perfil) que ainda nem existe de fato. Seria a solução mais "correta"
a longo prazo, mas desproporcional ao estágio atual — abstração
prematura para um problema ainda não comprovado.

## 6. Decisão

**2. PERFIL REUTILIZA PROFESSIONALCATALOGSOURCE**

Avaliada contra os 15 critérios obrigatórios: elimina a duplicação
real e o risco de divergência (a mesma lógica de composição
Medico→Professional+slug não seria escrita duas vezes); é a menor
mudança e o menor custo de migração (nada em produção precisa mudar);
não introduz abstração prematura (nem adapter fino nem fonte
compartilhada, ambos soluções para um problema ainda hipotético);
preserva uma única fonte de verdade (um único adapter real,
`MockProfessionalCatalogSource`); é compatível com a arquitetura já
aprovada (a P2-019 já havia recomendado explicitamente reaproveitar
`ProfessionalCatalogSource.findBySlug()` para o perfil); e não
compromete a independência entre catálogo e perfil onde ela realmente
importa — na camada de **projeção/apresentação**
(`ProfessionalCatalogProjection` e `ProfessionalProfileProjection`
continuam sendo contratos e builders totalmente separados; só a
**fonte de dados brutos** passa a ser compartilhada).

**Respostas obrigatórias:**
- `ProfessionalProfileSource` deve continuar existindo? **Não** —
  deveria ser descontinuado em uma tarefa futura de implementação, por
  se tornar redundante.
- O perfil pode depender de `ProfessionalCatalogSource`? **Sim** —
  nenhuma fronteira técnica real seria violada; é o mesmo tipo de
  contrato, na mesma camada de aplicação.
- Qual abstração deve conhecer `LegacyProfessionalMapper`? Somente a
  implementação concreta (`MockProfessionalCatalogSource`, na
  infraestrutura) — já é assim hoje.
- Qual abstração deve conhecer os mocks? Somente
  `createMockProfessionalCatalogSource()` (infraestrutura) — já é
  assim hoje.
- Qual abstração deve ser consumida por um futuro caso de uso de
  perfil? `ProfessionalCatalogSource` (para localizar
  `Professional`+slug) e `BuildProfessionalProfileProjection` (para
  montar a projeção).
- Qual abstração deve ser consumida pela UI? Somente as projeções
  (`ProfessionalCatalogProjection` e `ProfessionalProfileProjection`)
  — nunca as sources, builders ou `Professional` diretamente.
- Existe código atualmente órfão? **Sim** —
  `ProfessionalProfileSource`/`ProfessionalProfileSourceItem` (contrato
  sem implementação e sem consumidor) e `BuildProfessionalProfileProjection`
  (existe e está correto, mas nenhum código real o instancia ainda).
- Existe duplicação real ou apenas semântica? **Real** — os dois itens
  são estruturalmente idênticos, e qualquer implementação futura do
  lado do perfil replicaria exatamente a mesma lógica já escrita para
  o catálogo.
- Alguma implementação deve ser removida futuramente? O **contrato**
  `ProfessionalProfileSource.ts` deveria ser removido/descontinuado
  (não há implementação concreta a remover, pois nunca existiu uma).
- Algum contrato deve ser renomeado futuramente? Não agora — só se, no
  futuro, catálogo e perfil realmente precisarem de origens de dados
  distintas, com evidência real (não especulativa).

## 7. Arquitetura-alvo

**Catálogo (já implementado):**
```
MockProfessionalCatalogSource (mocks + LegacyProfessionalMapper)
        ↓ (via ProfessionalCatalogSource)
ListProfessionalCatalog / MockProfessionalCatalogQuery (via BuildProfessionalCatalogProjection)
        ↓
ProfessionalCatalogProjection
        ↓
UI (lista/card/mapa)
```

**Perfil (arquitetura-alvo recomendada):**
```
MockProfessionalCatalogSource (a MESMA implementação, reaproveitada)
        ↓ (via ProfessionalCatalogSource.findBySlug(), o MESMO contrato)
futuro GetProfessionalProfileBySlug (via BuildProfessionalProfileProjection)
        ↓
ProfessionalProfileProjection
        ↓
UI (página individual)
```

Quem conhece `Professional`: os builders e a fonte. Quem conhece o
slug: a fonte (origem) e ambos os builders (parâmetro). Quem conhece
mocks: somente a factory de infraestrutura. Quem conhece o mapper:
somente o adapter concreto de infraestrutura. Quem conhece os
builders: os casos de uso de cada contexto. **O que a UI pode
consumir:** exclusivamente `ProfessionalCatalogProjection` e
`ProfessionalProfileProjection`. **O que a UI não pode consumir:**
`Professional`, `ProfessionalCatalogSource`,
`LegacyProfessionalMapper`, ou qualquer entidade/repositório do
Knowledge Core diretamente.

## 8. Impactos futuros

Sequência mínima recomendada (não implementada nesta tarefa):
1. Criar um caso de uso (ex.: `GetProfessionalProfileBySlug`) em
   `application/alicia/profile/`, injetando `ProfessionalCatalogSource`
   (do módulo catalog) e `BuildProfessionalProfileProjection`.
2. Remover `application/alicia/profile/ProfessionalProfileSource.ts` e
   sua exportação no barrel, por se tornar redundante.

Arquivos prováveis na próxima etapa: um novo arquivo de caso de uso em
`application/alicia/profile/`; `application/alicia/profile/index.ts`
(remover export de `ProfessionalProfileSource`, adicionar o novo caso
de uso). Risco de quebra: baixo — nada consome
`ProfessionalProfileSource` hoje. Necessidade de migração de dados:
nenhuma. Impacto sobre barrels: pequeno, restrito ao módulo `profile`.
Impacto sobre testes: nenhum (nenhum teste existe ainda, dado o
bloqueio de ambiente já documentado em tarefas anteriores).

## 9. Fora de escopo

Nenhuma source, query, builder, caso de uso, adapter, factory,
repository, entidade de domínio, infraestrutura, mapper, mock,
Knowledge Core, UI, rota, API ou teste foi criado ou alterado. Esta
tarefa é exclusivamente descritiva.
