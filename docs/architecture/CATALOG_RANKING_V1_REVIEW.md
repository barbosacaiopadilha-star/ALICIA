# Ranking Público Explicável V1 (BLOCO-RANKING-V1)

## 1. Contexto

Com a experiência de descoberta V1 concluída (BLOCO-CATÁLOGO-A a D),
a lista de profissionais era apresentada apenas na ordem de origem
dos mocks — nenhuma estratégia pública de ordenação existia. Este
bloco implementa a primeira versão de ordenação explícita,
determinística e documentada, sem introduzir qualquer interpretação
de qualidade médica.

## 2. Dados disponíveis

Campos públicos reais existentes em `ProfessionalCatalogProjection`,
utilizáveis para ordenação: `fullName` (nome), `professionalName?`,
`specialties[]` (especialidades), `primaryLocation.city` (cidade),
`primaryLocation.name` (instituição principal),
`primaryLocation.state` (estado), `education[]` (formação — tipo,
anos), `slug`, `id`, `photoUrl?`, `languages[]`.

## 3. Dados indisponíveis

Não existem como campo público em nenhuma camada hoje: qualidade,
experiência clínica, avaliações, publicações, produção científica,
desfechos clínicos, volume cirúrgico, popularidade, favoritos,
verificação real (Knowledge Core vazio, confirmado em auditorias
anteriores — RC-PERFIL-01). Nenhum desses foi inventado ou
aproximado por proxy.

## 4. Estratégia adotada

Função pura `sortProfessionalCatalogProjections(projections, sort)`,
em `application/alicia/catalog/ProfessionalCatalogQuery.ts` (camada de
aplicação — nunca na aggregate, no mapper ou no componente React).
Critérios:

- **`relevance`** (padrão): preserva a ordem já produzida pela
  filtragem — nenhuma métrica de qualidade existe, então "relevância"
  significa apenas correspondência aos filtros ativos e estabilidade
  da lista, nunca uma nota ou pontuação.
- **`name-asc`** / **`name-desc`**: ordenação alfabética por
  `fullName`, via `localeCompare("pt-BR", { sensitivity: "base" })` —
  determinística, reproduzível, sem inferência.

Sempre retorna uma nova coleção (nunca reordena o array original).
Filtrar (busca/cidade) e ordenar comutam para as três estratégias
suportadas — o resultado final independe da ordem de aplicação; o
código aplica filtro e depois ordenação, mas o resultado seria
idêntico na ordem inversa.

## 5. Ordenações suportadas

| Valor | Rótulo | Comportamento |
|---|---|---|
| `relevance` | Relevância (padrão) | Preserva a ordem já filtrada |
| `name-asc` | Nome (A–Z) | Alfabética crescente |
| `name-desc` | Nome (Z–A) | Alfabética decrescente |

## 6. Persistência na URL

Parâmetro `sort`. `relevance` é tratado como padrão e omitido da URL
(mesma convenção já usada para `q`/`city` vazios):

```
/alicia/es/ortopedia            (sort=relevance implícito)
/alicia/es/ortopedia?sort=name-asc
/alicia/es/ortopedia?sort=name-desc
```

Valor inválido ou ausente em `?sort=` cai em `relevance` sem quebrar
a página — validado contra `VALID_PROFESSIONAL_CATALOG_SORTS` no
servidor. Refresh e botão voltar preservam o valor, pois o Server
Component lê `searchParams.sort` diretamente a cada renderização;
selecionar uma ordenação usa `router.push()` (ação discreta e
deliberada, mesma escolha já feita para o filtro de cidade), criando
uma entrada de histórico.

## 7. Fluxo final

```
URL (?q=&city=&sort=)
        ↓
page.tsx (Server Component; lê params + searchParams)
        ↓
ProfessionalCatalogQuery.list({ estado, especialidade })  ← única leitura
        ↓
matchesProfessionalCatalogSearchCriteria (cidade, texto)
        ↓
sortProfessionalCatalogProjections (sort)
        ↓
bridge legado residual (formacaoResumo, verificado)
        ↓
CatalogoBusca (client; controles de busca/cidade/ordenação)
        ↓
MedicoList → MedicoCard
```

## 8. Limitações

Não implementado, conforme escopo: score de qualidade, IA, machine
learning, avaliações, favoritos, popularidade, mapa, paginação,
cache, analytics, recomendação personalizada. A ordenação alfabética
usa apenas `fullName` — nenhum critério composto (ex.: nome +
cidade) foi adicionado, por não haver necessidade demonstrada ainda.
Build/typecheck/lint não puderam ser executados neste ambiente (sem
`node_modules`, mesmo bloqueio já documentado em blocos anteriores).

## 9. Próxima frente

Avaliar critérios adicionais totalmente objetivos apenas se e quando
novos campos públicos existirem na projeção (ex.: distância real,
quando houver coordenadas); popular o Knowledge Core antes de
qualquer consideração futura de ranking por confiança verificada —
nunca antes disso.

## Resposta obrigatória

**O ranking representa qualidade médica?**

**NÃO.** A opção "Relevância" apenas preserva a ordem já produzida
pela filtragem (sem nenhuma pontuação, nota ou heurística aplicada) e
as opções "Nome (A–Z)"/"Nome (Z–A)" ordenam por um único campo
textual, totalmente objetivo e verificável por qualquer pessoa que
leia o código. Nenhum dado de qualidade clínica, experiência,
avaliação, publicação, desfecho ou popularidade existe como campo
público hoje — e mesmo que existisse, esta tarefa foi explicitamente
restrita a critérios que não impliquem qualidade médica. O ranking
é uma ordenação de apresentação, não uma avaliação de mérito
profissional.
