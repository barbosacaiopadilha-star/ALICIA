# Consolidação da Composição do Catálogo Público (BLOCO-CATÁLOGO-B)

## 1. Contexto

O BLOCO-CATÁLOGO-A migrou corretamente a listagem pública para
`ProfessionalCatalogQuery`, mas a página passou a montar manualmente
a composição (`MockProfessionalCatalogQuery` +
`createMockProfessionalCatalogSource()` +
`BuildProfessionalCatalogProjection()`), conhecimento que pertence à
infraestrutura, não à UI. Este bloco encapsula essa composição em uma
única factory pública, seguindo exatamente o mesmo padrão já usado no
módulo de perfil (`createGetProfessionalProfileBySlug`).

## 2. Composição anterior

Dentro de `app/alicia/[estado]/[especialidade]/page.tsx`:
```ts
const professionalCatalogQuery = new MockProfessionalCatalogQuery(
  createMockProfessionalCatalogSource(),
  new BuildProfessionalCatalogProjection()
);
```
A página conhecia três peças de infraestrutura/aplicação diretamente.

## 3. Nova composição

```
page.tsx
        ↓
createProfessionalCatalogQuery()
        ↓
new MockProfessionalCatalogQuery(source, projectionBuilder)
        ↓
createMockProfessionalCatalogSource() (Source)
BuildProfessionalCatalogProjection() (Builder)
```

```ts
export function createProfessionalCatalogQuery(): ProfessionalCatalogQuery {
  const source = createMockProfessionalCatalogSource();
  const projectionBuilder = new BuildProfessionalCatalogProjection();
  return new MockProfessionalCatalogQuery(source, projectionBuilder);
}
```
Assinatura pública exatamente `createProfessionalCatalogQuery(): ProfessionalCatalogQuery`,
sem parâmetros. Cada chamada produz uma composição nova e isolada —
nenhum singleton ou estado compartilhado.

## 4. Arquivos alterados

- `infrastructure/alicia/catalog/createProfessionalCatalogQuery.ts` (novo)
- `infrastructure/alicia/catalog/index.ts` (modificado)
- `app/alicia/[estado]/[especialidade]/page.tsx` (modificado)
- `docs/architecture/CATALOG_COMPOSITION_REVIEW.md` (novo)

## 5. Dependências removidas da UI

Confirmado via busca em `app/` e `components/`: a página não importa
mais `MockProfessionalCatalogQuery`, `MockProfessionalCatalogSource`,
`createMockProfessionalCatalogSource` nem
`BuildProfessionalCatalogProjection`. A única dependência de
infraestrutura do catálogo agora é `createProfessionalCatalogQuery`.

## 6. Compatibilidade

Layout, JSX, classes, rotas, slugs, cards e navegação preservados
integralmente — a única mudança é a substituição de três linhas de
composição manual por uma chamada de factory; o restante do arquivo
(filtro por estado/especialidade, bridge legado de
`formacaoResumo`/`verificado`, renderização) permanece byte-a-byte
idêntico ao produzido no BLOCO-CATÁLOGO-A.

## 7. Código morto

**Nenhum código morto encontrado.** Todos os imports removidos da
página (`MockProfessionalCatalogQuery`, `createMockProfessionalCatalogSource`,
`BuildProfessionalCatalogProjection`) continuam em uso ativo dentro da
nova factory — nenhum arquivo, classe ou função ficou órfão.

## 8. Fluxo final

```
UI (page.tsx)
        ↓
createProfessionalCatalogQuery()  ← única dependência de infraestrutura
        ↓
ProfessionalCatalogQuery.list()
        ↓
ProfessionalCatalogProjection[]
        ↓
filtro em memória (estado + especialidade) + bridge legado residual
        ↓
MedicoList → MedicoCard
```

## 9. Próxima frente

Conforme já priorizado em `CATALOG_PUBLIC_EXPERIENCE_REVIEW.md`:
busca textual e filtros reais, agora construídos sobre uma composição
já totalmente encapsulada, sem exigir que a UI conheça detalhes de
infraestrutura.
