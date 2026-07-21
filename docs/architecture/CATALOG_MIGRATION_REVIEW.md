# Migração da Listagem Pública para o Catálogo (BLOCO-CATÁLOGO-A)

## 1. Contexto

A RC-CATÁLOGO-01 identificou que a arquitetura de catálogo já
construída (`ProfessionalCatalogSource`/`Query`/`Projection`) tinha
zero consumidor real — toda a experiência de descoberta em produção
usava exclusivamente `services/alicia/*.ts` e o tipo `Medico`. Este
bloco elimina essa duplicidade para a **listagem de médicos**
especificamente (estado → especialidade → lista), substituindo a
origem dos dados sem alterar a experiência visual.

## 2. Fluxo anterior

```
services/alicia/estados.ts, especialidades.ts, medicos.ts
        ↓
app/alicia/[estado]/[especialidade]/page.tsx
  (getMedicosPorEstadoEEspecialidade → Medico[])
        ↓
MedicoList → MedicoCard (consumindo Medico legado diretamente)
```

Consumidores reais confirmados por busca antes da migração:
`app/alicia/page.tsx` (via `EstadoGrid`), `app/alicia/[estado]/page.tsx`
(via `EspecialidadeGrid`), e
`app/alicia/[estado]/[especialidade]/page.tsx` (via `MedicoList`/
`MedicoCard`) — todos consumindo `services/alicia/*.ts` e os tipos
`Estado`/`Especialidade`/`Medico`.

## 3. Fluxo novo

```
MockProfessionalCatalogSource (mocks + LegacyProfessionalMapper)
        ↓
MockProfessionalCatalogQuery.list() (via BuildProfessionalCatalogProjection)
        ↓
ProfessionalCatalogProjection[]
        ↓
filtro em memória por estado (primaryLocation.state) e
especialidade (specialties[].id)
        ↓
app/alicia/[estado]/[especialidade]/page.tsx
        ↓
MedicoList → MedicoCard (consumindo MedicoView, não mais Medico)
```

`getEstadoPorSigla`/`getEspecialidadePorId` (services legados)
permanecem — são necessários para validar a rota e resolver o
breadcrumb/nome da especialidade, e não pertencem ao domínio do
catálogo profissional. `getMedicosPorEstadoEEspecialidade` permanece
como bridge temporário, apenas para os dois campos ainda sem
representação na projeção (seção 6).

## 4. Arquivos alterados

- `app/alicia/[estado]/[especialidade]/page.tsx` (modificado)
- `components/alicia/MedicoCard.tsx` (modificado)
- `components/alicia/MedicoList.tsx` (modificado)
- `docs/architecture/CATALOG_MIGRATION_REVIEW.md` (novo)

## 5. Componentes migrados

- **`MedicoCard.tsx`**: passou a receber `MedicoView` (tipo de
  apresentação local, não o `Medico` legado). `nome`, `cidade`,
  `instituicaoPrincipal` e o link de navegação agora se originam de
  `ProfessionalCatalogProjection` (via `page.tsx`). Adicionadas
  guardas condicionais mínimas para `cidade`/`instituicaoPrincipal`
  (agora opcionais, refletindo `primaryLocation?` da projeção) — sem
  alterar a saída renderizada para nenhum dos 7 profissionais reais
  (todos têm essa localização preenchida).
- **`MedicoList.tsx`**: apenas trocou o tipo de prop de `Medico[]`
  para `MedicoView[]`; nenhuma mudança de lógica ou JSX.
- **`app/alicia/[estado]/[especialidade]/page.tsx`**: passou a
  instanciar `MockProfessionalCatalogQuery` (com
  `createMockProfessionalCatalogSource()` e
  `BuildProfessionalCatalogProjection`), chamar `.list()` e filtrar
  o resultado por `primaryLocation.state === estado.sigla` e
  `specialties.some(s => s.id === especialidade.id)` — a mesma
  combinação estado+especialidade que a rota já validava.

## 6. Componentes remanescentes

**`EstadoGrid.tsx`/`EstadoCard.tsx`** e
**`EspecialidadeGrid.tsx`/`EspecialidadeCard.tsx`** **não foram
migrados** — auditados e mantidos conscientemente no legado.
Justificativa: eles exibem taxonomia (lista de todos os estados/
especialidades, com nome, ícone e contagem, incluindo os que ainda
não têm nenhum médico, marcados "Em breve"), não dados de
profissionais individuais. `ProfessionalCatalogProjection` não
representa "todos os estados possíveis" nem "contagem de
profissionais por especialidade" — isso exigiria um novo caso de uso
de agregação, explicitamente fora de escopo ("não implementar filtros
novos"). Migrá-los forçaria a criação de uma funcionalidade nova, não
uma simples troca de origem de dados.

`services/alicia/medicos.ts::getMedicosPorEstadoEEspecialidade`
permanece como **bridge temporário**, usado apenas para obter
`formacaoResumo` e `verificado` por médico (dois campos sem
representação em `ProfessionalCatalogProjection` — o mesmo tipo de
gap já documentado para a página de perfil em RC-PERFIL-01).
`getMedicoPorSlug` (mesmo arquivo) permanece em uso pela página de
perfil individual, sem relação com esta migração.

## 7. Código morto

**Nenhum código morto encontrado.** `Medico` deixou de ser importado
por `MedicoCard.tsx`/`MedicoList.tsx`, mas o tipo continua em uso
ativo em `services/alicia/medicos.ts`, na página de perfil e no
mapper — não há remoção segura de nenhum arquivo ou tipo. Nenhum
import, variável ou service ficou sem consumidor após a migração.

## 8. Fluxo final

```
UI (listagem)
        ↓
MockProfessionalCatalogQuery (list)
        ↓
ProfessionalCatalogProjection
        ↓
filtro em memória (estado + especialidade)
        ↓
MedicoView (bridge mínimo: formacaoResumo, verificado)
        ↓
MedicoList → MedicoCard
```

## 9. Próxima frente

Conforme já priorizado em `CATALOG_PUBLIC_EXPERIENCE_REVIEW.md`:
busca textual, seguida de filtros reais (cidade, convênio), ambos
agora construídos sobre a base correta (`ProfessionalCatalogQuery`),
em vez de precisarem ser refeitos depois.

## 10. Compatibilidade visual

JSX, classes, textos, ordem das seções e comportamento de estado
vazio preservados integralmente — confirmado por comparação linha a
linha do arquivo antes/depois. Rotas, parâmetros e formato de slug
inalterados (o `href` de `MedicoCard` continua construído exatamente
como antes: `/alicia/${estadoSigla}/${especialidadeId}/${slug}`,
agora alimentado por dados equivalentes vindos da nova projeção).

## 11. Fora de escopo

Ranking, busca, filtros novos, mapa, paginação e cache não foram
implementados. Domínio, mapper e projections não foram alterados.
`EstadoGrid`/`EspecialidadeGrid` permanecem legados, conforme
justificado na seção 6.
