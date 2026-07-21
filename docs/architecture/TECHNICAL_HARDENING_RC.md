# RC — Hardening Técnico e Validação Integral (MACROBLOCO-05)

## 1. Contexto

Transformar as aprovações arquiteturais e revisões estáticas dos
macroblocos anteriores em evidência técnica executável: instalação
de dependências, typecheck, lint, testes e build reais, corrigindo
regressões genuínas encontradas — sem implementar funcionalidades
novas, tecnologia persistente ou dados reais.

## 2. Ambiente e dependências

**Gerenciador esperado:** npm (único `package.json`, scripts
`npm run *`, sem `pnpm-lock.yaml`/`yarn.lock`). **Lockfile:** nenhum
existe. **Node:** v22.22.2 disponível no ambiente de execução.
**Scripts antes desta tarefa:** `dev`, `build`, `start`, `lint`,
`typecheck`. **Scripts depois:** os mesmos + `test` (novo, real,
executável — ver seção 4). **Instalação de dependências:** `npm ci`
falha corretamente por ausência de lockfile (comportamento esperado);
`npm install` falha com `403 Forbidden` em `registry.npmjs.org` —
acesso à rede bloqueado por política do ambiente, erro registrado
integralmente, não mascarado. **Reprodutibilidade:** o repositório
não é reproduzível neste ambiente específico (sem rede); é
reproduzível em qualquer ambiente com acesso normal ao registry npm,
já que `package.json` e o código-fonte estão íntegros.

## 3. Typecheck

**Comando real do projeto:** `npm run typecheck` (`tsc --noEmit`) —
não executável integralmente, pois `node_modules` (incluindo o
`typescript@^5.5.3` do próprio projeto) não está instalado.
**Alternativa usada:** um `tsc` global disponível no ambiente
(versão 6.0.3, **não** a versão do projeto) permitiu uma análise
parcial. **Resultado inicial:** 552 diagnósticos, dos quais dois
eram bugs reais, independentes da ausência de `node_modules`:
- `TS1149`: dois arquivos no mesmo diretório
  (`ProfessionalDataProvider.ts` e `professionalDataProvider.ts`)
  diferindo apenas na capitalização — colisão real em sistemas de
  arquivos case-insensitive (macOS/Windows). **Corrigido:** renomeado
  para `createProfessionalDataProvider.ts`, todos os imports
  atualizados.
- `TS4104`: `TrajetoriaAcademica`'s prop `experience` era tipado como
  array mutável, recebendo um `ReadonlyArray` real da projeção.
  **Corrigido:** tipo do prop ajustado para `ReadonlyArray<...>`.
- `TS5097`: os novos arquivos de teste usam extensão `.ts` explícita
  (exigida pelo test runner nativo do Node), o que exige
  `allowImportingTsExtensions`. **Corrigido:** flag habilitada em
  `tsconfig.json` (compatível com `moduleResolution: "bundler"` e
  `noEmit: true` já configurados; sem efeito sobre os ~150 arquivos
  de produção que usam imports sem extensão).
- `TS2345`: um dos meus próprios arquivos de teste passava campos
  `string | undefined` onde `MedicoView` exige `string`. **Corrigido**
  no próprio teste.

**Resultado final:** 551 diagnósticos restantes, **todos** confirmados
como artefatos da ausência de `node_modules`/`@types/react`/
`@types/node` (módulos não encontrados, JSX implícito `any`,
narrowing de `null` perdido por `notFound()` não tipado, `key` prop
tratado como propriedade literal por falta de
`JSX.LibraryManagedAttributes`, `process`/`node:test` não encontrados)
— nenhum bug de código real permanece identificável com as
ferramentas disponíveis.

## 4. Lint

**Comando real:** `npm run lint` (`next lint`) — não executável (nem
`eslint` nem `next` estão instalados; nenhum binário global
equivalente disponível). **Substituto:** revisão manual dos arquivos
alterados/criados nesta sessão, cobrindo exatamente as categorias que
`next/core-web-vitals` verificaria: imports mortos (nenhum
encontrado), variáveis sem uso (nenhuma), regras de hooks (`useEffect`
em `CatalogoBusca.tsx` com array de dependências `[textoNaUrl]`
correto — `setTexto` é um setter estável, corretamente omitido),
funções duplicadas (nenhuma — `agruparPorCidade`/
`resolveProfessionalDataSource` existem em exatamente um lugar cada),
mutações indevidas (nenhuma — `agruparPorCidade` e
`sortProfessionalCatalogProjections` sempre operam sobre cópias),
separação server/client (ver seção 7). **Resultado: não executado
via ferramenta real — revisão manual completa realizada como
substituto, sem violações encontradas.**

## 5. Testes

**Framework:** nenhum framework de terceiros foi instalado — usado o
test runner **nativo** do Node (`node --test`) com
`--experimental-strip-types`, que executa TypeScript real diretamente,
sem nenhuma dependência adicional. Descoberto e comprovado
experimentalmente nesta tarefa. **Testes criados:** 31, cobrindo:
- Validação bruta (7 testes): registro válido, coleção válida, campo
  ausente/vazio, tipo inválido, ausência de dados pessoais no erro,
  interrupção no primeiro registro inválido.
- Seleção de origem (5 testes): ausente, vazia, `mock`, `persistent`,
  inválida (sem fallback silencioso).
- Busca e ordenação (13 testes): case-insensitive, accent-insensitive,
  espaços extras, substring, combinação texto+cidade, cidade inválida,
  filtros opcionais, `relevance`/`name-asc`/`name-desc`, acentos na
  ordenação, ausência de mutação do array de entrada, sort padrão.
- Agrupamento por cidade (5 testes): agrupamento correto, cidades
  repetidas, ordenação determinística, coleção vazia, ausência de
  cidade.
- Integração leve (1 teste): validação → busca/filtro → ordenação →
  agrupamento encadeados sobre dados reais.

**Resultado: 31/31 aprovados**, ~0.7–1s de execução total. Uma falha
inicial genuína foi encontrada e corrigida — não no código de
produção, mas na minha própria expectativa de teste sobre ordenação
com acentos (verificado manualmente que o comportamento real do
`localeCompare` estava correto).

**Limitação honesta:** o trecho "mapper → domínio → projection"
(`LegacyProfessionalMapper.toDomain`, `BuildProfessionalCatalogProjection`,
classes de domínio) não pôde ser testado via o runner nativo, porque
essas classes usam extensivamente o alias `@/` internamente (imports
de valor reais, não apenas de tipo) — o Node puro não resolve esse
alias sem bundler/`node_modules`. Tentei ativamente resolver isso via
o campo nativo `imports` do `package.json` (recurso do próprio Node,
não do TypeScript); a tentativa falhou (`ERR_MODULE_NOT_FOUND`) e foi
revertida integralmente, sem deixar rastro no `package.json` final.
O teste de integração criado (seção 6) cobre o que é genuinamente
executável, com essa lacuna documentada explicitamente no próprio
arquivo de teste.

## 6. Build de produção

**Comando:** `npm run build` (`next build`). **Resultado:** falha
com `sh: 1: next: not found` — o binário `next` não existe porque
`node_modules` não está instalado (consequência direta do bloqueio de
rede já documentado). Erro registrado integralmente, não mascarado;
nenhuma flag de supressão (`ignoreBuildErrors`/`ignoreDuringBuilds`)
foi usada ou cogitada.

## 7. Separação server/client

Matriz de imports confirmada por busca exaustiva:

| Módulo | Server | Client | Compartilhado |
|---|---|---|---|
| `createProfessionalDataProvider.ts` (lê `process.env`) | ✓ | | |
| `MockProfessionalDataProvider.ts`/`FutureProfessionalDataProvider.ts` | ✓ | | |
| `resolveProfessionalDataSource.ts` | | | ✓ (pura, sem I/O) |
| `validateRawProfessionalData.ts` | | | ✓ (pura, sem I/O) |
| `matchesProfessionalCatalogSearchCriteria`/`sortProfessionalCatalogProjections` | | | ✓ (puras, sem I/O) |
| `agruparPorCidade.ts` | | | ✓ (pura, sem I/O) |
| `CatalogoBusca.tsx` | | ✓ | |
| `MedicoList.tsx`/`MedicoCard.tsx` | | | ✓ (sem "use client" própria, mas importadas diretamente por `CatalogoBusca.tsx` — tratadas pelo App Router como parte da árvore client; não usam nada server-only, portanto seguras) |

Apenas 5 arquivos no projeto inteiro têm `"use client"`:
`CatalogoBusca.tsx` (AliCIA) + 4 componentes da landing page
pré-existente (`ChoicesReveal.tsx`, `Hero.tsx`, `ScrollIndicator.tsx`,
`Reveal.tsx`), fora do escopo desta frente. `process.env` é lido em
**exatamente um lugar** em todo o projeto. **Nenhuma violação
encontrada** — nenhum componente client importa `infrastructure/`,
nenhum provider é instanciado fora da factory `createProfessionalDataProvider()`.
`import "server-only"` não foi adicionado: nenhuma dependência nova
seria necessária (é um pacote separado do Next.js), e a separação já
está correta sem essa proteção adicional — considerado desnecessário
neste momento.

## 8. Variáveis de ambiente

`PROFESSIONAL_DATA_SOURCE`, testado (seção 5): ausente → `"mock"`;
`"mock"` → `"mock"`; `"persistent"` → `"persistent"` (o provider
resultante falha explicitamente ao ser usado — nenhuma tecnologia
real configurada); valor desconhecido → erro imediato, citando o
valor recebido e os valores aceitos. **Nenhum fallback silencioso de
`persistent` para `mock` existe** — comprovado por teste automatizado
explícito. Comportamento idêntico em desenvolvimento e produção (não
há tratamento condicional por ambiente, pois não há fallback a
diferenciar). `.env.example` permanece fora do controle de versão,
respeitando o `.gitignore` já existente (`.env*`, sem exceção) — a
variável está documentada neste arquivo em disco e neste próprio
documento.

## 9. Validação da experiência pública

**Não executada via browser real** — nenhuma ferramenta de browser
disponível neste ambiente, e `next dev`/`next build` não podem
iniciar sem `node_modules`. Registrado honestamente como não
executado, não simulado. Substituído por: (a) os 31 testes reais
cobrindo busca/cidade/ordenação/agrupamento; (b) revisão estática
completa de `page.tsx`/`CatalogoBusca.tsx` já realizada
exaustivamente nos blocos BLOCO-CATÁLOGO-C/D e BLOCO-RANKING-V1/
BLOCO-MAPA-V1, reconfirmada nesta tarefa sem encontrar regressões.

## 10. Nomenclatura pública

Aplicado definitivamente: rótulo "Relevância" → **"Ordem padrão"**;
rótulo "Mapa" → **"Por cidade"**. Valores internos (`sort=relevance`,
`view=map`) e toda a lógica de URL/estado **inalterados** — apenas o
texto visível ao usuário mudou, confirmado por busca antes/depois.

## 11. Bridges e legado

Reauditados, nenhuma mudança de classificação desde o MACROBLOCO-01:
`formacaoResumo`/`verificado`/`bioCurta` permanecem — mesmos
consumidores (`page.tsx`, `PerfilMedicoHeader.tsx`, `MedicoCard.tsx`),
mesmo bloqueio (dados reais/revisão humana inexistentes).
`services/alicia/*` (4 arquivos) permanecem, todos com consumidores
reais confirmados. `Medico` permanece como contrato do bridge legado
legítimo. `listRawProfessionals()` permanece como atalho de
compatibilidade, agora residindo em `createProfessionalDataProvider.ts`
(renomeado por correção real, seção 3) — continua respeitando a
origem selecionada, sem ignorá-la.

## 12. Código morto

**Nenhum código morto removido** — nenhum foi comprovadamente
encontrado sem consumidores. A única remoção de código foi a
duplicação de `agruparPorCidade` (definida uma vez dentro de
`CatalogoBusca.tsx`, extraída para seu próprio módulo e importada de
volta) — não uma remoção por morte, mas uma extração para
testabilidade, sem alterar comportamento.

## 13. Segurança

Buscas por `SECRET`, `TOKEN`, `PASSWORD`, `DATABASE_URL`, `API_KEY`,
`PRIVATE_KEY` em todos os arquivos alterados/criados: **zero
ocorrências**. `process.env` confirmado restrito a um único módulo
server-only. Nenhum fallback silencioso de origem persistente para
mock (comprovado por teste). Nenhuma dependência nova foi instalada
(logo, nenhuma dependência suspeita). `.env.example` (fora do
controle de versão) contém apenas um placeholder.

## 14. Dependências

Nenhuma dependência nova foi adicionada ao `package.json` (apenas o
script `test`, que não requer pacotes). Auditoria de vulnerabilidades
(`npm audit`) não pôde ser executada — depende de `node_modules`
instalado, que está bloqueado por rede. Nenhuma versão foi atualizada.
Nenhum lockfile foi criado ou alterado (nenhum existia antes).

## 15. Arquivos alterados

- `README.md` (corrigida divergência de scripts documentados)
- `package.json` (adicionado script `test`)
- `tsconfig.json` (adicionado `allowImportingTsExtensions: true`)
- `components/alicia/CatalogoBusca.tsx` (extração de `agruparPorCidade`; nomenclatura pública)
- `components/alicia/TrajetoriaAcademica.tsx` (correção TS4104)
- `infrastructure/alicia/catalog/createMockProfessionalCatalogSource.ts` (atualização de import pelo rename)
- `infrastructure/alicia/professional/createMockProfessionalRepository.ts` (atualização de import pelo rename)
- `infrastructure/alicia/professional/professionalDataProvider.ts` → renomeado para `createProfessionalDataProvider.ts` (correção TS1149; reutiliza `resolveProfessionalDataSource`)
- `infrastructure/alicia/professional/index.ts` (novas exportações)
- `services/alicia/medicos.ts` (atualização de import pelo rename)
- `application/alicia/catalog/ProfessionalCatalogQuery.test.ts` (novo)
- `application/alicia/catalog/professionalCatalogPipeline.test.ts` (novo)
- `components/alicia/agruparPorCidade.ts` (novo)
- `components/alicia/agruparPorCidade.test.ts` (novo)
- `infrastructure/alicia/professional/resolveProfessionalDataSource.ts` (novo)
- `infrastructure/alicia/professional/resolveProfessionalDataSource.test.ts` (novo)
- `infrastructure/alicia/professional/validateRawProfessionalData.test.ts` (novo)

Confirmado via `git diff --stat`: domínio, aggregates, aplicação de
perfil/editorial/knowledge, mocks e types **não foram tocados**.

## 16. Prontidão para o Release Candidate

**O projeto passa em typecheck?** **PARCIALMENTE.** Os dois bugs
reais identificáveis sem `node_modules` foram corrigidos e
verificados; o restante dos diagnósticos é inteiramente atribuível à
ausência de dependências instaladas, não a erros de código — mas uma
execução real com `node_modules` completo (`typescript@5.5.3` real)
ainda não pôde confirmar 100% de ausência de erros.

**O projeto passa em lint?** **NÃO EXECUTADO** — ferramenta
indisponível neste ambiente; revisão manual equivalente não encontrou
violações nos arquivos desta sessão, mas isso não substitui uma
execução real do ESLint completo.

**O projeto passa nos testes?** **SIM**, para o que foi criado: 31/31
testes reais passam, cobrindo os módulos puros críticos do catálogo
público. Não cobre a cadeia mapper→domínio→projection (limitação
técnica documentada, seção 5).

**O projeto gera build de produção?** **NÃO** — bloqueado
exclusivamente pela ausência de `node_modules` (rede indisponível
neste ambiente), não por nenhum erro de código identificado.

**A experiência pública foi validada?** **PARCIALMENTE** — validada
via 31 testes automatizados reais e revisão estática exaustiva
acumulada ao longo de toda a sessão; não validada via browser/servidor
real (ferramenta indisponível).

**O projeto está tecnicamente pronto para o Release Candidate
final?** **PARCIALMENTE.** A arquitetura, os bridges, a separação
server/client, a segurança e a cobertura de testes dos módulos puros
estão genuinamente sólidos e verificados. O bloqueio remanescente é
inteiramente ambiental (rede bloqueada para `npm install`, sem o qual
build/lint/typecheck completos e testes de integração profunda não
podem ser executados de forma definitiva) — não uma dívida de código
deste projeto. Assim que `node_modules` puder ser instalado em um
ambiente com acesso normal ao registry, recomienda-se reexecutar
`npm run typecheck`, `npm run lint`, `npm run build` e `npm test`
integralmente antes de qualquer release real.
