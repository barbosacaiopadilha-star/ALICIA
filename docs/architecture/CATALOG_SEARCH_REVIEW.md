# Busca e Filtros Públicos sobre o Catálogo (BLOCO-CATÁLOGO-C)

## 1. Contexto

Com a arquitetura de catálogo já consolidada (BLOCO-CATÁLOGO-A/B),
esta tarefa implementa a primeira versão da experiência de descoberta
além da navegação hierárquica estado → especialidade → lista,
adicionando busca textual e filtro por cidade, sem alterar domínio,
aggregates, mapper ou o formato da `ProfessionalCatalogProjection`.

## 2. Busca implementada

Busca textual client-side, sem indexação, considerando exatamente
três campos públicos já existentes: `nome`, `instituição principal` e
`cidade` (comparação case-insensitive por substring). A mesma
semântica de correspondência é expressa de duas formas, adequadas a
cada contexto: (a) `matchesProfessionalCatalogSearchCriteria`, um
predicado puro na camada de aplicação
(`application/alicia/catalog/ProfessionalCatalogQuery.ts`), usado
pela `Query` para os critérios de rota; (b) uma filtragem equivalente
dentro do componente client `CatalogoBusca`, operando sobre a view
plana `MedicoView` já usada pela apresentação (necessária porque o
componente client não pode invocar diretamente a `Query` assíncrona
do servidor sem uma nova leitura).

## 3. Filtros implementados

| Critério | Onde é aplicado | Forma |
|---|---|---|
| Estado | Servidor, via `catalogQuery.list({ estado })` | Exato (`primaryLocation.state`) |
| Especialidade | Servidor, via `catalogQuery.list({ especialidade })` | Exato (`specialties[].id`) |
| Cidade | Cliente, `CatalogoBusca` (select) | Exato (`medico.cidade`), opção só aparece se houver mais de uma cidade |
| Texto | Cliente, `CatalogoBusca` (input) | Substring case-insensitive sobre nome/instituição/cidade |

Todos os quatro são opcionais e combináveis (o filtro de cidade e a
busca textual atuam em conjunto, ambos sobre o mesmo resultado já
carregado).

## 4. Fluxo da consulta

```
ProfessionalCatalogQuery.list({ estado, especialidade })
        ↓ (uma única leitura no servidor)
ProfessionalCatalogProjection[] já filtrado por rota
        ↓
bridge legado (formacaoResumo, verificado) + montagem de MedicoView[]
        ↓
CatalogoBusca (client component)
        ↓ (filtragem em memória, sem nova leitura)
texto + cidade aplicados sobre MedicoView[] já carregado
        ↓
MedicoList → MedicoCard
```

## 5. Componentes alterados

- `application/alicia/catalog/ProfessionalCatalogQuery.ts` (modificado)
  — adicionado `ProfessionalCatalogSearchCriteria` e
  `matchesProfessionalCatalogSearchCriteria`; `list()` passou a aceitar
  critério opcional.
- `infrastructure/alicia/catalog/MockProfessionalCatalogQuery.ts`
  (modificado) — `list()` aplica o predicado quando um critério é
  fornecido; sem critério, comportamento idêntico ao anterior.
- `application/alicia/catalog/index.ts` (modificado) — exporta o novo
  tipo e o predicado.
- `components/alicia/CatalogoBusca.tsx` (novo) — client component com
  busca textual, filtro de cidade e estado local de filtros.
- `app/alicia/[estado]/[especialidade]/page.tsx` (modificado) — passou
  a chamar `catalogQuery.list({ estado, especialidade })` em vez do
  `.filter()` manual anterior; substituiu `<MedicoList>` direto por
  `<CatalogoBusca>` no branch não vazio.

`MedicoList.tsx`/`MedicoCard.tsx` não foram alterados.

## 6. Compatibilidade

Rotas, slugs e cards preservados integralmente. Layout principal
inalterado — os únicos elementos visuais novos são o campo de busca e
o seletor de cidade, usando exatamente os tokens já existentes
(`border-hairline`, `bg-paper`, `text-ink`, `focus:border-gold`).
**Sem filtros aplicados** (estado inicial da página), `CatalogoBusca`
renderiza `MedicoList` com a lista completa — visualmente idêntico ao
comportamento anterior ao bloco. A página de perfil individual não foi
tocada.

## 7. Limitações

Não implementado, conforme escopo: ranking, mapa, indexação/IA,
autocomplete, paginação, cache, analytics, debounce e virtualização.
A busca/filtro operam inteiramente sobre a lista já carregada no
servidor (uma única leitura por carregamento de página) — não há
atualização de URL/query params, portanto os filtros não são
compartilháveis por link nem persistem entre navegações. O filtro de
cidade usa igualdade exata, não busca aproximada.

## 8. Fora de escopo

Ranking, mapa, IA, autocomplete, paginação, cache e analytics não
foram implementados. Domínio, aggregates, mapper e o formato de
`ProfessionalCatalogProjection` não foram alterados.
