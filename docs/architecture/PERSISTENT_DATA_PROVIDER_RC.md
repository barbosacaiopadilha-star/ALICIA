# RC — Origem Persistente de Profissionais (MACROBLOCO-04)

## 1. Contexto

Os três macroblocos anteriores entregaram: prontidão do Knowledge
Core (MACROBLOCO-01), fronteira única de leitura de mocks
(MACROBLOCO-02), e o contrato `RawProfessionalData` +
`ProfessionalDataProvider` com uma segunda implementação placeholder
(MACROBLOCO-03). Esta tarefa deveria substituir
`FutureProfessionalDataProvider` por uma implementação persistente
real, **condicionado à evidência real encontrada no repositório** —
nunca por preferência pessoal.

## 2. Infraestrutura encontrada

Auditoria exaustiva e objetiva, com evidência:

- `package.json`: dependências reais são apenas `next`, `react`,
  `react-dom`, `framer-motion`, `lucide-react` (+ devDependencies de
  build/lint). **Nenhuma dependência de banco, ORM, SDK de API ou
  cliente HTTP.**
- **Nenhum lockfile** (`package-lock.json`/`pnpm-lock.yaml`/
  `yarn.lock`) existe.
- **Nenhum diretório** `prisma/`, `drizzle/`, `supabase/`,
  `database/`, `db/` existe.
- **Nenhum arquivo** `.env`, `.env.example`, `.env.local.example` ou
  `vercel.json` existia antes desta tarefa.
- Busca exaustiva por `prisma`, `drizzle`, `supabase`, `postgres`,
  `mysql`, `sqlite`, `mongodb`, `firebase`, `redis`, `DATABASE_URL`,
  `SUPABASE_URL`, `POSTGRES_URL`, `KV_URL` em todo o código-fonte:
  **zero ocorrências** em qualquer arquivo `.ts`/`.tsx`/`.json`/`.js`.
- Busca por `fetch(`, `fs/promises`, `readFile`: **zero ocorrências**
  em código real.
- Busca por `process.env`: **zero ocorrências** em todo o projeto
  antes desta tarefa.
- `next.config.js`: configuração mínima (apenas `reactStrictMode` e
  `remotePatterns` de imagem para `images.unsplash.com`) — nenhuma
  configuração de infraestrutura de dados.
- `lib/`: apenas helpers de UI (`motion.ts`, `texto.ts`) — nada
  relacionado a dados.
- Nenhuma rota de API interna (`app/**/route.ts`) existe.

**Respostas às 6 perguntas obrigatórias:**
1. Existe tecnologia persistente já configurada? **Não.**
2. Existe cliente de banco ou API? **Não.**
3. Existe contrato de ambiente? **Não** (nenhum `.env*` existia).
4. Existe local apropriado para armazenamento? **Não** (apenas
   `mocks/`, que é dado estático em memória, não persistência).
5. O runtime permite filesystem persistente? Não há garantia disso
   neste ambiente de execução (container efêmero, sem acesso à rede
   para instalar dependências, e o projeto não define nenhuma
   infraestrutura própria de hospedagem que garanta filesystem
   gravável persistente).
6. A origem precisa ser assíncrona? Estruturalmente, qualquer fonte
   real (banco/API) precisaria — mas nenhuma fonte real foi
   encontrada para ativar essa decisão concretamente nesta tarefa.

## 3. Decisão de tecnologia

**Cenário C — Nenhuma persistência real configurada**, conforme as
próprias regras da tarefa. Nenhuma tecnologia foi escolhida por
preferência pessoal (nem Prisma, nem Supabase, nem qualquer outra) —
isso seria "adicionar SDK externo" arbitrariamente, exatamente o que
o Cenário C proíbe. **Alternativas rejeitadas:** qualquer stack de
banco/API específica (Prisma, Drizzle, Supabase, PostgreSQL direto,
etc.) — rejeitadas não por serem tecnicamente inadequadas, mas por
**ausência total de evidência** no repositório que justifique
escolher uma sobre as outras. **Decisão:** implementar apenas a
infraestrutura selecionável (contrato, seleção de origem, validação)
e manter `FutureProfessionalDataProvider` como o provider persistente
que falha explicitamente, documentando honestamente que a ativação
real está bloqueada por uma decisão externa de infraestrutura ainda
não tomada.

## 4. Assincronicidade

**Assinatura anterior:** `listRawProfessionals(): ReadonlyArray<RawProfessionalData>`
(síncrona). **Assinatura final:** inalterada — permanece síncrona.
**Cadeia afetada:** nenhuma. **Justificativa:** como nenhuma origem
concreta com I/O real está sendo ativada nesta tarefa (Cenário C —
`FutureProfessionalDataProvider` apenas lança erro, não faz I/O
algum), evoluir toda a cadeia (`provider → source/repository →
query/use case → factory → page.tsx`) para `Promise` agora seria
propagar uma mudança de grande superfície (tocando páginas públicas)
sem nenhum ganho real — a única fonte genuinamente ativa continua
sendo os mocks em memória, que são sincronamente corretos por
natureza. Esta decisão foi deliberadamente adiada desde o
MACROBLOCO-03 e permanece válida: a evolução para `Promise` deve
ocorrer **quando** uma tecnologia real e assíncrona for efetivamente
escolhida, não antes.

## 5. Contrato bruto

`RawProfessionalData` permanece exatamente como definido no
MACROBLOCO-03 — tipo puro, sem comportamento, sem depender de
`domain/professional/` nem de `app/`/`components/`. Nenhuma alteração
foi feita nele nesta tarefa. **Validação aplicada:** nova função
`validateRawProfessionalData`/`validateRawProfessionalDataList`
(`infrastructure/alicia/professional/validateRawProfessionalData.ts`),
verificando presença/não-vacuidade dos campos indispensáveis ao fluxo
atual (`id`, `slug`, `nome`, `especialidadeId`, `estadoSigla`,
`cidade`, `instituicaoPrincipal`, `formacaoResumo`, `verificado`) —
os mesmos exigidos por `LegacyProfessionalMapper`. Não duplica regras
de domínio (ex.: formato de `state` com duas letras, já validado por
`PracticeLocation.create()`). Falha explicitamente listando **apenas
os nomes dos campos ausentes**, nunca os valores reais — nenhum dado
pessoal é exposto em mensagem de erro.

## 6. Provider persistente

**Nome:** `FutureProfessionalDataProvider` (mantido, não renomeado —
já era um nome honesto, não enganoso; usar um nome como
`DatabaseProfessionalDataProvider`/`SupabaseProfessionalDataProvider`
seria enganoso, pois nenhuma dessas tecnologias foi escolhida).
**Localização:** `infrastructure/alicia/professional/FutureProfessionalDataProvider.ts`.
**Responsabilidade:** representar o ponto de extensão para uma futura
origem persistente real, documentando explicitamente o achado da
auditoria (Cenário C). **Mecanismo de leitura:** nenhum — lança erro
imediatamente ao ser chamado. **Está realmente funcional como fonte
persistente? NÃO** — é um placeholder estrutural, não uma fonte de
dados real. Isso é declarado honestamente, não maquiado.

## 7. Seleção de origem

```
Ambiente (PROFESSIONAL_DATA_SOURCE)
        ↓
createProfessionalDataProvider()  [infrastructure/alicia/professional/professionalDataProvider.ts]
        ↓
"mock" (ou ausente) → MockProfessionalDataProvider
"persistent"        → FutureProfessionalDataProvider (falha explicitamente ao ser usado)
qualquer outro valor → erro imediato
        ↓
listRawProfessionals() (atalho) → consumidores existentes
```

Valores suportados: `mock` (padrão quando a variável está ausente) e
`persistent`. Valor desconhecido: lança erro claro e imediato,
citando o valor recebido e os valores aceitos — nunca seleciona
silenciosamente uma origem diferente da solicitada. Variável
documentada em `.env.example` (arquivo novo, criado nesta tarefa,
apenas com um placeholder — `PROFESSIONAL_DATA_SOURCE=mock`, nenhum
segredo). Leitura de `process.env` ocorre exclusivamente dentro de
`professionalDataProvider.ts` (infraestrutura/servidor) — a UI nunca
lê nem conhece essa variável.

## 8. Falhas e fallback

**Nenhum fallback automático de "persistent" para "mock" foi
implementado** — consistente com a preferência explícita da tarefa
por ausência de fallback silencioso. Se `PROFESSIONAL_DATA_SOURCE=persistent`
for selecionado, `FutureProfessionalDataProvider.listRawProfessionals()`
lança um erro imediato e diagnóstico (citando que nenhuma origem real
está configurada e apontando para este documento) — nunca retorna
dados mock disfarçados de reais. **Comportamento em
desenvolvimento:** idêntico ao de produção — sem variável definida,
usa mock; com `persistent` definido, falha explicitamente em ambos os
ambientes (nenhum tratamento especial por ambiente foi criado, pois
nenhum fallback automático existe para diferenciar).

## 9. Repositories e factories

`MockProfessionalCatalogSource`, `MockProfessionalRepository`,
`createProfessionalCatalogQuery()`, `createGetProfessionalProfileBySlug()`
**não foram alterados** — já dependiam exclusivamente de
`listRawProfessionals()`/`createMockProfessionalCatalogSource()`
(consolidado no MACROBLOCO-02/03), portanto já herdam automaticamente
a nova seleção de origem sem qualquer mudança de código. Catálogo e
perfil continuam reutilizando a mesma composição
(`createMockProfessionalCatalogSource`), sem duplicação. Nenhuma
página ou componente instancia providers diretamente — confirmado por
busca exaustiva em `app/`/`components/`.

## 10. Arquivos alterados

- `infrastructure/alicia/professional/validateRawProfessionalData.ts` (novo)
- `infrastructure/alicia/professional/MockProfessionalDataProvider.ts` (modificado — aplica validação)
- `infrastructure/alicia/professional/FutureProfessionalDataProvider.ts` (modificado — documentação e mensagem de erro reforçadas)
- `infrastructure/alicia/professional/professionalDataProvider.ts` (modificado — seleção de origem via `PROFESSIONAL_DATA_SOURCE`)
- `infrastructure/alicia/professional/index.ts` (modificado — novas exportações)
- `docs/architecture/PERSISTENT_DATA_PROVIDER_RC.md` (novo, este documento)

**Nota sobre `.env.example`:** o arquivo foi criado em disco para
documentar `PROFESSIONAL_DATA_SOURCE`, mas o `.gitignore` já
existente deste repositório contém a regra `.env*` sem nenhuma
exceção para `.env.example` — ou seja, o próprio projeto já
estabelece a convenção de nunca versionar nenhum arquivo `.env*`,
incluindo o de exemplo. Respeitando essa convenção já existente (em
vez de forçar o rastreamento com `git add -f`, o que introduziria uma
convenção nova não evidenciada pelo repositório), o arquivo permanece
em disco como referência local, mas não foi adicionado ao commit. A
variável está integralmente documentada na seção 7 deste documento.

## 11. Código morto e bridges

| Item | Classificação |
|---|---|
| `Medico` | Ainda necessário — contrato público de `services/alicia/medicos.ts` e tipo legado consumido pelo bridge residual da UI; satisfaz `RawProfessionalData` estruturalmente, não foi removido |
| `listRawProfessionals()` | Definitivo como atalho de compatibilidade — agora respeita a origem selecionada; documentado nesta tarefa e no MACROBLOCO-03 |
| `MockProfessionalDataProvider` | Definitivo — única implementação realmente funcional hoje |
| `FutureProfessionalDataProvider` | Bridge estrutural intencional — permanece até uma tecnologia real ser escolhida externamente |
| `services/alicia/*` | Ainda necessários — inalterados nesta tarefa, mesma classificação do MACROBLOCO-01/02 |
| Nenhum resíduo adicional encontrado | — |

Nenhum código foi removido nesta tarefa — nada ficou comprovadamente
sem consumidores como resultado das mudanças feitas.

## 12. Compatibilidade

Confirmado via `git diff --stat`: `domain/`, `app/`, `components/`,
`mocks/`, `types/`, `application/`, `services/` **não foram
alterados**. Catálogo, perfil, busca, filtro por cidade, ordenação,
visualização geográfica, rotas, slugs, cards e UI continuam
funcionando exatamente como antes — com `PROFESSIONAL_DATA_SOURCE`
ausente (comportamento padrão), o resultado é idêntico ao estado
anterior a esta tarefa.

## 13. Segurança

Nenhum secret, credencial, token ou URL privada foi commitado —
confirmado por busca (`secret`, `token`, `password`, `api_key`) nos
arquivos novos/alterados, sem ocorrências. Nenhum dado fictício foi
apresentado como real: `FutureProfessionalDataProvider` falha
explicitamente em vez de simular dados. `.env.example` (em disco,
fora do controle de versão — ver seção 10) contém apenas um
placeholder (`mock`), nenhum valor real. Nenhum arquivo `.env` real
foi criado ou editado.

## 14. Documento criado

`docs/architecture/PERSISTENT_DATA_PROVIDER_RC.md` (este documento).

**Respostas obrigatórias:**

**Existe uma origem persistente real funcional? NÃO.** Nenhuma
tecnologia de persistência real foi conectada — `FutureProfessionalDataProvider`
é um placeholder estrutural que falha explicitamente, não uma fonte
de dados real, um stub disfarçado ou um JSON empacotado apresentado
como banco.

**A aplicação pode selecionar a origem sem alterar a UI? SIM.** A
seleção ocorre inteiramente em `professionalDataProvider.ts`
(infraestrutura), via `PROFESSIONAL_DATA_SOURCE`, lida apenas no
servidor. Nenhuma página ou componente conhece a origem ativa —
confirmado por busca exaustiva. Trocar `mock` por uma implementação
real futura exigirá apenas substituir `FutureProfessionalDataProvider`
por uma classe concreta, sem tocar em domínio, repositories, sources,
projections, aplicação ou UI.

## 15. Testes e verificações

**Typecheck/lint/test/build: não executados** — sem `node_modules`
(mesmo bloqueio já documentado em toda a sessão; nenhuma dependência
foi instalada, nenhum lockfile foi alterado). **Testes automatizados
não foram criados nesta tarefa** — o projeto não possui nenhum
framework de testes instalado (`package.json` não lista `jest`,
`vitest` ou equivalente) e nenhum arquivo de teste existe em nenhum
lugar do repositório. Instalar um framework de testes agora seria
exatamente a mesma categoria de decisão arbitrária que a Frente 2
proíbe para a tecnologia persistente ("não escolher uma tecnologia
que não esteja sustentada pelo repositório") — aplicando o mesmo
princípio de honestidade, não instalei nenhum framework de teste
especulativamente. Revisão estática completa foi realizada como
substituto: leitura integral de todos os arquivos antes/depois;
buscas confirmando ausência de imports diretos de mocks fora da
fronteira única, ausência de uso direto de `Medico` na cadeia
principal (fora do bridge legítimo em `services/alicia/medicos.ts`),
ausência de instanciação de provider na UI, ausência de fallback
silencioso, e ausência de secrets/credenciais. `git diff --stat`
confirmando escopo exato da mudança. `git diff --check`: limpo (exit
0). Contagem de chaves balanceada em todos os arquivos tocados.

## 16. Próxima frente

Quando uma tecnologia de persistência real for decidida
externamente (fora desta sessão de engenharia): (1) escolher a
tecnologia com base em requisitos de produto reais, não em auditoria
de repositório vazio; (2) implementar uma classe concreta substituindo
`FutureProfessionalDataProvider`, adicionando as dependências
necessárias e `.env` reais (nunca commitados); (3) decidir e propagar
a assincronicidade por toda a cadeia, conforme a Frente 3 desta
tarefa já detalha; (4) criar testes automatizados nesse momento,
quando um framework for genuinamente adotado pelo projeto; (5)
revisitar as pendências já registradas nos macroblocos anteriores
(revisão editorial das bios, população real do Knowledge Core,
decisão sobre os itens residuais de `areasDeAtuacao`).

PRONTO PARA REVISÃO
