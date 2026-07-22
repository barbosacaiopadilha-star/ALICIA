# AliCIA — Plataforma v2 · Kickoff Oficial

**Base:** v1.0 congelada (Release Book, commit `1453930`, tag `v1.0.0`; RC histórica `v0.1.0-rc1` → `7432d23`)
**Produção v1:** https://alicia-phi.vercel.app
**Data do kickoff:** 2026-07-21

---

## 1. Objetivos da v2

1. **Substituir os dados fictícios por dados reais verificados** — o provider `persistent` sai de "falha explícita" para implementação de verdade, com trilha de verificação por fonte.
2. **Entregar a promessa da landing** — o fluxo de Curadoria Médica (caso do paciente → análise → três médicos → escolha), hoje apenas narrado, passa a existir.
3. **Tornar o catálogo público e indexável** — remover o `noindex` e restaurar o sitemap completo **somente** quando os dados forem reais.
4. **Elevar a plataforma ao padrão de operação contínua** — telemetria real, deploy protegido por CI, dependências sem vulnerabilidades altas, domínio próprio.

## 2. O que permanece congelado da v1

- As **10+1 decisões invioláveis** da seção 14 do Release Book — em especial: **nenhum ranking/score/comparação entre médicos**; verificação como estado factual com linguagem neutra; falha explícita de provider inválido; URL como fonte de verdade dos filtros; logs sem dados pessoais.
- **Tags `v0.1.0-rc1` e `v1.0.0`** — imutáveis.
- **Arquitetura em camadas** (app → services → application/domain → infrastructure) e o modelo de conhecimento dos ADRs (`docs/architecture/`).
- **Pipeline mínimo do CI**: verify lockfile antes do install, `npm ci`, audit crítico bloqueante, health check pós-build.
- **Identidade visual** (tokens `paper/canvas/ink/gold/hairline`, Fraunces/Inter) e a landing aprovada.
- **Headers de segurança globais** e o contrato do `/api/health`.

## 3. O que pode evoluir

- Fonte de dados (mock → persistente real), cobertura de estados/especialidades e o conteúdo dos perfis.
- Fluxo de produto da curadoria (novas telas **após** o catálogo, sem redesenhar as existentes).
- Versões de framework/tooling (Next major, ESLint 9), CSP (nonce), telemetria, configurações da Vercel, domínio.
- Sitemap/indexação do catálogo (condicionados a dados reais).
- Páginas institucionais (`/sobre`, `/contato`, `/privacidade`, `/termos` — hoje linkadas no footer e caindo no 404).
- Identidade do pacote (`aliviar-landing` → nome oficial).

## 4. Roadmap por trilha

### Dados
1. Provider persistente real (contrato de `PERSISTENT_DATA_PROVIDER_RC.md`).
2. Pipeline de ingestão + verificação por fonte (registro de origem de cada afirmação de formação/experiência).
3. Migração das pontes legadas (`formacaoResumo`, `verificado`, `areasDeAtuacao` legacy) para o domínio novo.

### Curadoria
4. Captura do caso do paciente (formulário mínimo, sem dados clínicos sensíveis além do necessário).
5. Processo de análise e seleção dos três médicos (interno, auditável, sem score exposto).
6. Entrega da curadoria ao paciente (apresentação dos três perfis, escolha final do paciente).

### Produto
7. Páginas institucionais (sobre/contato/privacidade/termos) — remove os 404 do footer.
8. Expansão de cobertura (novos estados/especialidades conforme dados reais chegarem).
9. Assets finais do Manifesto (vídeo/poster) e reindexação SEO do catálogo real.

### Plataforma
10. Upgrade major do Next + ESLint 9 (zera as vulnerabilidades altas conhecidas).
11. Telemetria e monitoramento de erros (client + server), mantendo a política de dados dos logs.
12. Governança de deploy: deployment protection (CI verde obrigatório), settings da Vercel (`npm ci`, Node 22), domínio próprio + `NEXT_PUBLIC_SITE_URL`.
13. CSP estrita com nonce via middleware (remover `unsafe-inline` de script-src).

## 5. Critérios de aceite (globais da v2)

- Todo epic entra por commit(s) com **CI integralmente verde** (incluindo audit crítico e health check) e deploy verificado em produção.
- **Nenhum dado fictício apresentado como real** em nenhum momento da migração; estados mistos são explícitos na UI.
- Catálogo só perde o `noindex` quando 100% dos perfis publicados forem de dados reais verificados.
- Curadoria nunca exibe ranking/score; a escolha final é sempre do paciente entre exatamente três opções.
- Acessibilidade e headers de segurança preservados em toda tela nova.
- `v1.0.0` permanece reproduzível: `git checkout v1.0.0 && npm ci && npm run build` continua funcionando.

## 6. Critérios de rollback

- **Gatilhos:** health check fora de `ok`, erro de runtime recorrente em produção, dado fictício exibido como real, quebra de fluxo principal, regressão de segurança.
- **Mecânica:** redeploy do deployment anterior pelo dashboard da Vercel (imediato) ou `git revert` + push (auditável); base documentada em `docs/release/ROLLBACK.md`; último refúgio estável = tag `v1.0.0`.
- **Dados:** mudanças de provider ficam atrás de `PROFESSIONAL_DATA_SOURCE` — rollback de dados é trocar a env, sem deploy de código.
- Qualquer rollback gera registro em `docs/release/` com causa e correção antes de nova tentativa.

## 7. Métricas de sucesso

| Métrica | Baseline v1 | Alvo v2 |
|---|---|---|
| Perfis com dados reais verificados | 0 (7 fictícios) | 100% do catálogo público |
| Estados com cobertura real | 0 (2 fictícios) | ≥ 2 reais |
| Curadorias entregues ponta a ponta | 0 (fluxo inexistente) | fluxo operacional com primeiras entregas reais |
| Vulnerabilidades altas no `npm audit` | 7 (conhecidas) | 0 |
| Rotas institucionais 404 | 4 (footer) | 0 |
| Uptime do `/api/health` | sem medição | medido e ≥ 99,5% |
| Erros de runtime capturados | invisíveis (sem telemetria) | 100% capturados com incident id |
| Deploy sem CI verde | possível | impossível (protection ativa) |

## 8. Epics priorizados

### E1 — Provider persistente de dados reais
- **Objetivo:** implementar `PROFESSIONAL_DATA_SOURCE=persistent` de verdade, cumprindo o contrato já definido, com paridade de comportamento com o mock.
- **Impacto:** crítico — desbloqueia Dados, Curadoria e SEO real; é a fundação da v2.
- **Risco:** médio — contrato e testes já existem; risco concentrado na escolha do armazenamento e na migração das pontes legadas.
- **Estimativa:** M (2–3 semanas).
- **Dependências:** nenhuma (primeiro da fila).

### E2 — Ingestão e verificação de dados de médicos
- **Objetivo:** processo (mesmo que assistido/manual no início) para cadastrar médicos reais com fonte registrada por afirmação e estado de verificação honesto.
- **Impacto:** crítico — sem ele, E1 fica vazio; define a credibilidade do produto.
- **Risco:** alto — envolve dados de pessoas reais: exige base legal (LGPD), consentimento/fonte pública verificável e revisão humana.
- **Estimativa:** G (4+ semanas, contínuo).
- **Dependências:** E1.

### E3 — Governança de deploy e plataforma
- **Objetivo:** deployment protection (CI obrigatório), Vercel Settings (`npm ci`, Node 22, env explícita), domínio próprio + `NEXT_PUBLIC_SITE_URL`, renomear pacote.
- **Impacto:** alto — fecha as pendências operacionais da v1 com custo mínimo.
- **Risco:** baixo — configuração, sem código de produto.
- **Estimativa:** P (1–2 dias).
- **Dependências:** nenhuma (paralelizável desde já).

### E4 — Upgrade major do Next + ESLint 9
- **Objetivo:** eliminar as 3 vulnerabilidades altas do Next e o tooling EOL.
- **Impacto:** alto — segurança e manutenção de longo prazo.
- **Risco:** médio — major de framework; mitigado pelos 31 testes, build determinístico e smoke checklist.
- **Estimativa:** M (1–2 semanas).
- **Dependências:** nenhuma; fazer **antes** de E5/E6 para não construir telas novas sobre versão antiga.

### E5 — Telemetria e monitoramento
- **Objetivo:** captura real de erros (client/server) e métricas de uso mínimas, respeitando a política de logs sem dados pessoais.
- **Impacto:** alto — hoje erros de produção são invisíveis; pré-requisito de operação séria da curadoria.
- **Risco:** baixo/médio — escolha de fornecedor e ajuste da CSP (`connect-src`).
- **Estimativa:** P/M (≤1 semana).
- **Dependências:** E3 (envs), idealmente após E4.

### E6 — Fluxo de Curadoria Médica (núcleo do produto)
- **Objetivo:** caso do paciente → análise interna → apresentação de três médicos → escolha do paciente, com trilha auditável e sem score exposto.
- **Impacto:** crítico — é a promessa da landing e a razão de existir do produto.
- **Risco:** alto — novo domínio (casos de pacientes = dados sensíveis), novas telas, decisões de processo; exige LGPD desde o design.
- **Estimativa:** G (4–6 semanas).
- **Dependências:** E1, E2 (médicos reais), E5 (operação observável); E3 recomendado.

### E7 — Reindexação SEO + páginas institucionais + assets finais
- **Objetivo:** remover `noindex`/restaurar sitemap do catálogo real, criar `/sobre`, `/contato`, `/privacidade`, `/termos` e publicar os assets do Manifesto.
- **Impacto:** médio/alto — presença pública completa e legalmente adequada (privacidade/termos são pré-requisito de E6 coletar dados).
- **Risco:** baixo — os pontos de restauração estão marcados no código; conteúdo é o gargalo.
- **Estimativa:** P/M (≤1 semana de engenharia; conteúdo em paralelo).
- **Dependências:** E1+E2 (para a reindexação); páginas institucionais podem sair antes e são pré-requisito legal de E6.

### E8 — CSP estrita com nonce
- **Objetivo:** middleware com nonce por request; remover `unsafe-inline` de `script-src`.
- **Impacto:** médio — endurecimento incremental de uma superfície já protegida.
- **Risco:** médio — interage com cache/streaming do App Router; testar contra todas as rotas.
- **Estimativa:** P (2–4 dias).
- **Dependências:** E4 (fazer sobre a versão nova do Next).

**Ordem sugerida de execução:** E3 → E4 → E1 → E2 (contínuo) → E5 → E7 (institucionais antes) → E6 → E7 (reindexação) → E8.

---

*Documento de kickoff — nenhuma linha de código foi alterada. A execução de cada epic seguirá o mesmo protocolo da v1: tarefa isolada, CI verde, deploy verificado, relatório com evidências.*

**V2 KICKOFF CONCLUÍDO**
