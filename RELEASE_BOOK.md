# AliCIA — Release Book

**Versão congelada:** 1.0 (linha da tag `v0.1.0-rc1` + waves de hardening)
**Último commit de engenharia:** `44077d9d5647f107c3feb7692fcb171999758309`
**Tag oficial:** `v1.0.0` (anotada, criada no commit deste Release Book)
**Tag de RC:** `v0.1.0-rc1` → `7432d23c4f80d4b2af97b9bdca90531ec5adbb94` (imutável)
**URL de produção:** https://alicia-phi.vercel.app
**Data do congelamento:** 2026-07-21

Histórico da release (todos com CI verde e deploy verificado em produção):

| Commit | Descrição |
|---|---|
| `7432d23` | release: preparar primeira publicacao controlada (base da RC) |
| `28a75d4` | ci: tornar instalacao e build reproduziveis (lockfile + npm ci) |
| `5c5f7a9` | security: atualizar next para versão segura (14.2.5 → 14.2.35) |
| `4faaf4c` | security: adicionar headers HTTP de proteção |
| `28a95ce` | fix: corrigir falhas visíveis de produção (manifesto/favicon/404/error) |
| `534fffc` | seo: concluir metadados de produção |
| `1ceb766` | ops: adicionar observabilidade e governança mínima |
| `44077d9` | fix: restaurar noindex do catalogo demonstrativo |

---

## 1. Arquitetura final

Aplicação **Next.js 14 (App Router) com SSR**, organizada em camadas com dependências apontando para dentro:

- **`app/`** — rotas, layouts, metadata, boundaries de erro e endpoints (`/api/health`, sitemap, robots, manifest, OG image). Não contém regra de negócio.
- **`components/`** — componentes visuais (seções da landing e componentes da AliCIA). Recebem *views* prontas; não acessam dados.
- **`services/`** — fachada de leitura consumida pelas páginas (`getEstados`, `getEspecialidadePorId`, `getMedicoPorSlug`, …).
- **`application/`** — casos de uso e regras puras (ex.: `matchesProfessionalCatalogSearchCriteria`, ordenações do catálogo). Testado por unidade.
- **`domain/`** — modelo de conhecimento (profissional, capability, condition, specialty) — ver ADRs em `docs/architecture/`.
- **`infrastructure/`** — provedores de dados. `createProfessionalDataProvider` resolve a fonte via `PROFESSIONAL_DATA_SOURCE` (`mock` por padrão; `persistent` falha explicitamente até existir implementação — sem fallback silencioso).
- **`mocks/`** — dados fictícios versionados (7 médicos, SP/RJ, ortopedia/cardiologia).
- **`lib/`** — utilitários transversais (`site.ts` com a URL canônica, `logger.ts`, `motion.ts`).
- **`types/`** — contratos TypeScript.

Filtros do catálogo são aplicados **no servidor** a partir de `searchParams` (`?q=`, `?city=`, `?sort=`), com re-hidratação dos controles no cliente — a URL é a fonte de verdade do estado de busca.

## 2. Fluxo do usuário

1. **`/`** — landing editorial Aliviar (hero → escolhas habituais → curadoria → manifesto → CTA).
2. **`/alicia`** — escolha de estado (SP e RJ ativos; demais "Em breve", `aria-disabled`, sem erro).
3. **`/alicia/[estado]`** — escolha de especialidade (com contagem de médicos; indisponíveis como "Em breve").
4. **`/alicia/[estado]/[especialidade]`** — catálogo com busca textual (com/sem acento), filtro de cidade, ordenação e visão "Por cidade"; filtros refletidos na URL (deep-link e refresh preservam estado).
5. **`/alicia/[estado]/[especialidade]/[medico]`** — perfil por slug: trajetória acadêmica cronológica, experiência, áreas de atuação e **verificações com estado explícito** ("Verificada" / "Ainda não verificada" — linguagem neutra, sem ranking).
6. **`/alicia/metodologia`** — critérios, fontes e limites da análise.
7. Rota inexistente → 404 pt-BR com retorno para `/alicia`; erro de runtime → boundary pt-BR com "Tentar novamente" e código do incidente.

## 3. Estrutura do projeto

```
app/                  rotas (App Router), metadata, error/not-found, api/health,
                      sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, icon.svg
application/alicia/   regras puras do catálogo (+ testes)
components/           sections/ (landing) e alicia/ (produto)
domain/               modelo de conhecimento
infrastructure/       provedores de dados (professional, catalog, profile) (+ testes)
lib/                  site.ts, logger.ts, motion.ts
mocks/alicia/         estados, especialidades, medicos, metodologia
services/alicia/      fachada de leitura das páginas
types/                contratos
docs/architecture/    ADRs e reviews (33 documentos)
docs/release/         checklist, handoff, rollback, release notes
.github/workflows/    rc-validation.yml (pipeline único)
```

## 4. Tecnologias

- **Next.js 14.2.35** (App Router, SSR + páginas estáticas) · **React 18.3** · **TypeScript 5.5 (strict)**
- **Tailwind CSS 3.4** com tokens próprios (`paper`, `canvas`, `ink`, `gold`, `hairline`) · **Framer Motion** (landing) · **Lucide** (ícones)
- Fontes **Fraunces + Inter** via `next/font` (self-hosted, preload, swap)
- Testes com **`node --test` nativo** (31 testes) — zero dependência de framework de teste
- Node **22.x** (fixado em `engines` e no CI) · npm com **`package-lock.json`** versionado (lockfileVersion 3)

## 5. Pipeline (`.github/workflows/rc-validation.yml`)

Dispara em push/PR para `main` (e `workflow_dispatch`). Ordem:

1. Checkout → Setup Node 22
2. **Verify lockfile** (falha explícita se `package-lock.json` ausente — *antes* do install)
3. **Install: `npm ci`** (reproduzível)
4. **Audit (critical):** `npm audit --audit-level=critical` (bloqueia apenas críticas)
5. Typecheck → Lint → Test (31) → Build
6. **Health check:** sobe `next start`, faz polling de `/api/health` (até 15s) e exige `"status":"ok"`

O deploy é feito pela integração git da Vercel (não pelo workflow).

## 6. Segurança

- **Next 14.2.35** — CVE crítica da 14.2.5 eliminada; audit crítico agora bloqueia regressões no CI.
- **Headers em todas as rotas** (`next.config.js → headers()`): CSP (`default-src 'self'`; `script-src 'self' 'unsafe-inline'` — ver ADR em §13; `img-src` restrito a `self`/`data:`/unsplash; `frame-ancestors 'none'`; `object-src 'none'`; `upgrade-insecure-requests`), `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/payment/usb negados), `X-Content-Type-Options: nosniff`. HSTS (2 anos, preload) via Vercel.
- Sem secrets no repositório; única env é `PROFESSIONAL_DATA_SOURCE` (não sensível; ausente = mock seguro; `persistent` falha explicitamente).

## 7. SEO

- `metadataBase` e canonical apontando para a **URL real de produção** via `lib/site.ts` (`NEXT_PUBLIC_SITE_URL` permite troca de domínio sem código).
- **Títulos e descrições por rota** (estáticos e via `generateMetadata` nas dinâmicas), com templates aninhados ("· Aliviar" na raiz, "· AliCIA" nas internas).
- **`sitemap.xml` institucional** (raiz, `/alicia`, `/alicia/metodologia`) · `robots.txt` coerente · **catálogo demonstrativo fora do índice**: rotas de estado/especialidade/médico com `noindex, follow` enquanto os dados forem fictícios (commit `44077d9`; ao chegar o provider real, remover o noindex e restaurar a enumeração no sitemap) · **`og:image`/`twitter:image`** geradas em runtime (`next/og`, 1200×630, tokens da marca) · favicon `app/icon.svg` · `manifest.webmanifest`.

## 8. Observabilidade

- **`GET /api/health`** — `{status, service, environment, timestamp, version}`; `version` = SHA do commit em produção (`VERCEL_GIT_COMMIT_SHA`); `cache-control: no-store`; sem consulta externa.
- **`lib/logger.ts`** — logs JSON estruturados (info/warn/error) com sanitização de chaves sensíveis; uso deliberadamente restrito (health; futuras falhas de infraestrutura). Nada de dados de usuário ou de busca em logs.
- **Boundaries** `app/error.tsx` / `app/global-error.tsx` em pt-BR com **código do incidente** (`error.digest` do Next, correlacionável nos runtime logs da Vercel), sem stack trace.
- Limitação registrada: sem serviço externo, não há telemetria client-side — decisão consciente da v1.0.

## 9. Deploy

- **Vercel**, projeto **`alicia`** (time Aliviar), exclusivo da AliCIA, **integração git**: push em `main` → deploy de produção automático com metadados de commit e GitHub Deployment.
- Produção: `alicia-phi.vercel.app` (aliases `alicia-aliviar` e `alicia-git-main-aliviar`); região `iad1`; builds ~40s.
- Rollback: redeploy de commit anterior pelo dashboard, ou `git revert` + push (base documentada em `docs/release/ROLLBACK.md`; base histórica `cf76db5`).

## 10. Checklist operacional (pós-deploy de qualquer mudança)

1. CI `RC Validation` verde (todas as 6+ etapas).
2. `GET /api/health` → 200, `status: "ok"`, `version` = SHA esperado.
3. `/`, `/alicia`, um catálogo e um perfil → 200; rota falsa → 404 pt-BR.
4. Headers de segurança presentes (spot-check em qualquer rota).
5. `robots.txt`/`sitemap.xml` respondendo com o domínio correto.
6. Sem erros no console do navegador (verificação manual — ver §11).
7. Checklist completo de smoke em `docs/release/GO_LIVE_CHECKLIST.md`.

## 11. Pendências conhecidas (não bloqueiam a v1.0)

1. **Vercel Settings** (manual, 2 min): Install Command → `npm ci`; Node → 22.x; `PROFESSIONAL_DATA_SOURCE=mock` explícito em Production/Preview.
2. **Assets do Manifesto** (`public/media/manifesto.{mp4,jpg}`): seção usa fallback sólido da identidade; restaurar `<video>` ao receber os arquivos finais (ponto marcado em `components/sections/Manifesto.tsx`).
3. **Vulnerabilidades altas remanescentes** do `npm audit`: 3 advisories do Next que atingem todas as versões ≤16.3-canary (fix = major, ver roadmap) — vetores de self-hosting mitigados na Vercel; demais em tooling de dev (glob/minimatch/postcss).
4. **Identidade do pacote**: `package.json` ainda `aliviar-landing@1.0.0`.
5. **ESLint 8** (EOL) acompanhará upgrade futuro do Next.
6. **Domínio próprio** não configurado (deliberado); ao configurar, definir `NEXT_PUBLIC_SITE_URL`.
7. **Lighthouse e console de produção** não medidos a partir do ambiente de release (política de rede); rodar PageSpeed Insights/DevTools manualmente.
8. Dados são **mock fictícios** (7 médicos, 2 estados) — declarado na própria UI ("Sobre este perfil").

## 12. Roadmap da v0.2 (técnico)

1. Provider `persistent` real (contrato já definido em `infrastructure/` — ver `PERSISTENT_DATA_PROVIDER_RC.md`).
2. Upgrade de major do Next (elimina as altas remanescentes) + ESLint 9.
3. CSP estrita com nonces via middleware (remover `unsafe-inline` de script-src).
4. Telemetria real (analytics/monitoramento de erros) — hoje inexistente por decisão.
5. Deployment protection na Vercel (deploy condicionado a CI verde).
6. `generateStaticParams` em `[estado]`/`[medico]` (dados imutáveis → estático).
7. Assets finais do Manifesto e domínio próprio.
8. Tag `v1.0.0` sobre o commit congelado, encerrando a linha `v0.1.0-rc1`.

## 13. ADRs relevantes (em `docs/architecture/`)

- **`KNOWLEDGE_MODEL.md` / `KNOWLEDGE_CORE_*`** — modelo de conhecimento do domínio.
- **`PROFESSIONAL_CATALOG_PROJECTION.md` + `CATALOG_*_REVIEW.md`** — projeção única do catálogo; busca/ordenação como funções puras reutilizadas por Query e filtros de página.
- **`SPECIALTY_DUPLICATION_REVIEW.md`** — Specialty não compõe "áreas de atuação" (lista fechada `MIGRATED_OR_DISCARDED_LEGACY_AREAS`, sem normalização automática).
- **`PERSISTENT_DATA_PROVIDER_RC.md` / `REAL_DATA_*`** — fonte de dados resolvida por env; `persistent` falha explícito até existir.
- **`PROFESSIONAL_PROFILE_RC.md` / projeções de perfil** — composição do perfil e verificações.
- **`TECHNICAL_HARDENING_RC.md` e `docs/release/*`** — trilha de release (checklist, handoff, rollback).
- Decisões desta release documentadas nos próprios commits/código: CSP compatível sem nonce (comentário em `next.config.js`), fallback do Manifesto (comentário no componente), digest como incident id (comentário em `app/error.tsx`).

## 14. Decisões que não devem ser quebradas

1. **A tag `v0.1.0-rc1` é imutável** (`7432d23`). Novas versões ganham tags novas.
2. **Nenhum ranking, score, recomendação ou comparação entre médicos.** Verificação é estado factual, com linguagem neutra; ausência de dado nunca vira afirmação negativa.
3. **`PROFESSIONAL_DATA_SOURCE` inválido ou `persistent` sem implementação deve falhar explicitamente** — jamais exibir mock como se fosse dado real.
4. **A URL é a fonte de verdade dos filtros do catálogo** (`?q=`, `?city=`, `?sort=`) — não migrar para estado apenas client-side.
5. **Verify lockfile antes do install e `npm ci` no CI** — nunca voltar a `npm install` nem tornar a verificação pós-install.
6. **Headers de segurança são globais** (`/(.*)`) — qualquer exceção precisa de ADR.
7. **Logs jamais contêm dados pessoais, buscas ou termos sensíveis** — todo novo log passa pelo `lib/logger.ts` e sua sanitização.
8. **`/api/health` permanece sem dependências externas e sem secrets** — é o sinal de vida mínimo e barato.
9. **Camadas**: páginas consomem `services/`; regra de negócio pura em `application/`/`domain/`; componente visual nunca acessa provider de dados diretamente.
10. **Dados fictícios são sempre declarados como tal na UI** enquanto não houver provider real.
11. **O catálogo demonstrativo permanece `noindex`** (e fora do sitemap) enquanto os dados forem fictícios — indexar só com dados reais.

---

## Encerramento oficial

- **Plataforma v1 encerrada.** O escopo de engenharia da v1.0 está concluído: fluxo completo em produção, pipeline reproduzível com auditoria e health check, segurança de superfície HTTP, SEO institucional com catálogo demonstrativo protegido de indexação, e observabilidade mínima.
- **Release oficial:** tag anotada `v1.0.0` sobre o commit deste Release Book; `v0.1.0-rc1` permanece imutável como marco histórico da RC.
- **Próxima fase: Produto v2** — o desenvolvimento segue no roadmap da seção 12, a partir de novas tags.

*Release Book gerado em 2026-07-21 a partir do estado real verificado de produção (CI runs `29849494572` e `29863585523`, deploys com metadados de commit, health check reportando o SHA em produção).*

**RELEASE BOOK CONCLUÍDO**
