# Fechamento da Experiência Pública de Descoberta V1 (BLOCO-CATÁLOGO-D)

## 1. Contexto

Consolidação final da experiência de descoberta pública, após
RC-CATÁLOGO-01 (auditoria), BLOCO-CATÁLOGO-A (migração da listagem),
BLOCO-CATÁLOGO-B (composição encapsulada) e BLOCO-CATÁLOGO-C (busca e
filtro iniciais). Esta tarefa fecha as lacunas identificadas: regra
de busca duplicada, ausência de persistência em URL, ausência de
tratamento robusto de estado vazio e de ação de limpeza, e revisão de
acessibilidade/mobile.

## 2. Estado anterior

Ao final do BLOCO-CATÁLOGO-C: `matchesProfessionalCatalogSearchCriteria`
já existia na camada de aplicação, mas `CatalogoBusca.tsx` mantinha
uma **segunda implementação equivalente** (via `useMemo`), operando
sobre a view plana `MedicoView`. `q`/`city` viviam apenas em estado
local do componente (`useState`), sem qualquer relação com a URL —
refresh, compartilhamento de link e navegação por voltar/avançar
perdiam os filtros. Não havia normalização de acentos. O estado vazio
específico da busca já existia, mas não distinguia claramente "sem
cobertura" de "sem resultado para o filtro" de forma consistente com
persistência.

## 3. Regra única

**Arquivo:** `application/alicia/catalog/ProfessionalCatalogQuery.ts`
(já existente desde o BLOCO-CATÁLOGO-C, agora reforçada).

**Assinatura:**
```ts
export function matchesProfessionalCatalogSearchCriteria(
  projection: ProfessionalCatalogProjection,
  criteria: ProfessionalCatalogSearchCriteria
): boolean
```

**Critérios suportados:** `estado?`, `especialidade?`, `cidade?`,
`texto?` — todos opcionais e combináveis.

**Consumidores:** `MockProfessionalCatalogQuery.list()` (para os
critérios de rota) e `app/alicia/[estado]/[especialidade]/page.tsx`
(chamando a mesma função diretamente para os critérios interativos
cidade/texto, sobre o resultado já carregado). **Nenhum outro lugar
implementa filtragem** — `CatalogoBusca.tsx` não filtra mais nada por
conta própria; apenas lê/escreve parâmetros de URL e renderiza o que
já chega filtrado do servidor. É um módulo puro, sem dependência de
React, Next.js, browser ou infraestrutura mock — apenas TypeScript e
o tipo `ProfessionalCatalogProjection`.

## 4. Normalização textual

Função `normalizeSearchText` (mesmo arquivo), reaproveitando a técnica
já usada em `Specialty`/`Condition`/`Capability`/`LegacyProfessionalMapper`
(NFD + remoção de marcas diacríticas, minúsculas, espaços colapsados):

```ts
function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}
```

Exemplos reais verificados manualmente:
- `"joao"` encontra `"João"` (NFD decompõe "ã" em "a" + til, removido).
- `"sao paulo"` encontra `"São Paulo"`.
- `"  joAO  "` (espaços extras, maiúsculas) normaliza para `"joao"` e
  encontra `"João"`.

Aplicada em ambos os lados da comparação (agulha e campos), e apenas
sobre nome, instituição principal e cidade — nenhum campo novo
inventado, especialidade não incluída na busca textual (não estava
representada na regra anterior).

## 5. Persistência em URL

Parâmetros: `q` (texto) e `city` (cidade). Estado e especialidade
continuam na rota, inalterados.

```
/alicia/es/ortopedia
/alicia/es/ortopedia?q=joao
/alicia/es/ortopedia?city=vitoria
/alicia/es/ortopedia?q=joao&city=vitoria
```

Parâmetros vazios são removidos da URL (`params.delete()` quando o
valor é falsy). **Refresh:** a página é um Server Component que lê
`searchParams` diretamente — qualquer recarregamento reaplica os
mesmos filtros. **Voltar/avançar:** a seleção de cidade usa
`router.push()` (cria entrada de histórico, então voltar restaura a
cidade anterior); a digitação de texto usa `router.replace()` (não
cria uma entrada por tecla — mesmo padrão de busca ao vivo usado em
produtos reais como buscadores e editores de código; "voltar" nesse
caso específico navega para a página anterior à atual, não para um
estado intermediário de digitação — trade-off documentado
explicitamente, não uma limitação escondida). **Compartilhamento:**
copiar a URL com `q`/`city` reproduz o mesmo filtro para qualquer
pessoa que abrir o link.

## 6. Inicialização e navegação

O Server Component (`page.tsx`) lê `searchParams.q`/`searchParams.city`
na primeira renderização (carregamento direto, refresh, voltar,
avançar, link compartilhado são todos, do ponto de vista do
framework, "novas renderizações com novos searchParams") e já entrega
a lista filtrada. O componente client (`CatalogoBusca`) lê os mesmos
valores via `useSearchParams()` para exibir os controles já
preenchidos — nenhum estado local desconectado da URL (o único estado
local, o valor digitado no campo de texto, é sincronizado com a URL
via `useEffect` sempre que ela mudar por fora da própria digitação).

## 7. Estado vazio

Dois estados vazios distintos, corretamente separados:
1. **Sem cobertura na rota** (nenhum profissional para o
   estado+especialidade, independentemente de filtro) — inalterado
   desde antes deste bloco, controlado por `professionalsNaRota.length === 0`
   no servidor.
2. **Sem resultado para os filtros** (a rota tem profissionais, mas
   `q`/`city` não encontraram nenhum) — mensagem: "Nenhum profissional
   encontrado com esses filtros." + "Tente ajustar o texto ou a cidade
   selecionada." + botão "Limpar filtros". Não sugere ranking, não
   inventa médicos, não altera a rota de estado/especialidade.

## 8. Limpeza de filtros

Botão "Limpar filtros" (aparece apenas quando `q` ou `city` estão
ativos, e também dentro do estado vazio de busca): limpa o estado
local de texto, navega para `pathname` sem query string (removendo
`q` e `city` da URL simultaneamente), restaura a lista completa da
rota atual. Não altera estado/especialidade. Acionável por teclado
(elemento `<button type="button">` nativo, focável e ativável por
Enter/Espaço sem necessidade de JavaScript adicional).

## 9. Acessibilidade

- `<label>` explícito e associado (`htmlFor`/`id`) para busca e para
  cidade — substituindo os `aria-label` anteriores por rótulos reais
  (visualmente ocultos via `sr-only`), evitando ARIA redundante.
- Botão "Limpar filtros" é um elemento `<button>` nativo, identificável
  por texto visível, navegável e ativável por teclado sem atributos
  adicionais.
- Contagem de resultados (`"N profissionais encontrados."`) anunciada
  via `aria-live="polite"`, sem exigir redesenho.
- Foco visível usando os mesmos tokens já usados no projeto
  (`focus:border-gold`, cor de destaque já padrão em toda a AliCIA).
- Estado vazio com texto claro, sem jargão técnico.

## 10. Revisão mobile

`flex flex-col gap-3 sm:flex-row` no contêiner dos controles —
empilha em telas pequenas, alinha em linha a partir de `sm:`. Input e
select usam `w-full` (sem overflow) com larguras específicas apenas a
partir de `sm:` (`sm:flex-1`, `sm:w-56`). Botão "Limpar filtros" usa
`w-full sm:w-auto` — ocupa a largura total em mobile (alvo de toque
confortável) e se ajusta ao conteúdo em telas maiores. Nenhuma classe
da listagem (`MedicoList`/`MedicoCard`) foi alterada — cards
permanecem intactos.

## 11. Fluxo final

```
URL (/alicia/[estado]/[especialidade]?q=...&city=...)
        ↓
page.tsx (Server Component; lê params + searchParams)
        ↓
createProfessionalCatalogQuery()
        ↓
ProfessionalCatalogQuery.list({ estado, especialidade })  ← única leitura
        ↓
ProfessionalCatalogProjection[] (escopo da rota)
        ↓
matchesProfessionalCatalogSearchCriteria (cidade, texto)  ← mesma regra
        ↓
bridge legado residual (formacaoResumo, verificado)
        ↓
CatalogoBusca (client; controles + navegação de URL)
        ↓
MedicoList
        ↓
MedicoCard
```

## 12. Bridges e limitações

`formacaoResumo` e `verificado` **continuam residuais**, exatamente
como estavam desde o BLOCO-CATÁLOGO-A — não foram migrados nem
ampliados nesta tarefa; permanecem obtidos via
`getMedicosPorEstadoEEspecialidade` (bridge legado), associados por
`id`. Nenhum outro bridge foi criado. Não implementado, conforme
escopo: ranking, mapa, IA, autocomplete, paginação, cache, analytics,
virtualização, múltiplas cidades/especialidades simultâneas, ingestão
de dados reais, Knowledge Core, migração de biografia. Uma cidade
inexistente em `?city=` não quebra a página — simplesmente não
corresponde a nenhum profissional, produzindo o estado vazio de busca
naturalmente (opção escolhida entre as duas permitidas pela tarefa).
Uso de `useSearchParams()` em componente client dentro de uma rota
dinâmica (com `params`/`searchParams` já lidos no Server Component) —
não foi possível validar com build real neste ambiente (sem
node_modules); recomenda-se confirmar em ambiente com toolchain antes
de considerar esse ponto definitivamente livre de avisos de build.

## 13. Próximas frentes

Com a base de descoberta agora consistente e compartilhável, a
sequência já priorizada permanece válida: popular dados reais (mais
estados/especialidades/cidades) para validar a experiência em escala;
avaliar ranking apenas quando houver sinais de confiança reais
(Knowledge Core populado); considerar mapa quando houver coordenadas
reais; migrar `formacaoResumo`/`verificado` quando o Knowledge Core
tiver dados publicados.

## Resposta final

**A experiência pública de descoberta V1 está funcional,
compartilhável e consistente?**

**SIM.** A busca e o filtro de cidade funcionam de forma unificada
(uma única regra, reutilizada em servidor e nos dois pontos de
aplicação), são persistidos e restauráveis via URL (refresh,
compartilhamento de link e — com a ressalva documentada sobre
digitação — voltar/avançar), tratam estados vazios de forma clara sem
inventar dados, oferecem limpeza de filtros acessível, e preservam
integralmente rotas, slugs, cards e a página de perfil. As únicas
ressalvas conhecidas (histórico por tecla não criado deliberadamente;
verificação de build pendente de ambiente real) estão documentadas
explicitamente, não ocultas.
