# RFC-E1 — Fundação dos Dados Reais

**Status:** Proposta · **Epic:** E1 (V2_KICKOFF) · **Base:** v1.0.0 (`1453930`)
**Autor:** Principal Software Architect (sessão de release) · **Data:** 2026-07-21
**ADRs de referência:** `PERSISTENT_DATA_PROVIDER_RC.md` (MACROBLOCO-04), `REAL_DATA_FOUNDATION_RC.md`, `REAL_DATA_PROVIDER_RC.md`, `KNOWLEDGE_MODEL.md`, `PROFESSIONAL_CATALOG_PROJECTION.md`

---

## 1. Problema

**O que a arquitetura atual impede.** A v1 tem uma fronteira de dados exemplar — toda leitura passa por `ProfessionalDataProvider` via `createProfessionalDataProvider()`, selecionado por `PROFESSIONAL_DATA_SOURCE` — mas com três travas estruturais:

1. **`FutureProfessionalDataProvider` falha por design.** `persistent` existe como valor válido, porém sem implementação (Cenário C do MACROBLOCO-04: zero banco, zero cliente HTTP, zero contrato de env no repositório). Nenhum dado real pode entrar no sistema hoje.
2. **O contrato é síncrono.** `listRawProfessionals(): ReadonlyArray<RawProfessionalData>` retorna memória. Qualquer fonte real (banco/API) é assíncrona — a pergunta 6 do MACROBLOCO-04 já antecipou que essa é a mudança estrutural inevitável. Ela se propaga por `services/`, `infrastructure/alicia/catalog`, `profile` e `app/sitemap.ts`.
3. **Pontes legadas ainda vivas.** `formacaoResumo`, `verificado` e `areasDeAtuacao` legacy fluem pelo `LegacyProfessionalMapper` fora do domínio novo — um segundo caminho de dados que precisaria ser duplicado em qualquer fonte real.

**Limitações dos mocks.** Imutáveis sem deploy (todo ajuste de dado é um commit); sem procedência (o campo `verificado: true` é uma afirmação sem fonte); sem versionamento nem trilha de auditoria; sem estados editoriais (tudo que existe está publicado); acoplados ao bundle (dado cresce = bundle cresce); e legalmente confinados — por serem fictícios, o catálogo inteiro está `noindex` (commit `44077d9`), ou seja, **o produto não pode existir publicamente enquanto os mocks forem a fonte**.

## 2. Objetivo

Arquitetura de dados da v2, em uma frase: **uma fonte persistente versionada e auditável, lida através do mesmo contrato de provider já existente (tornado assíncrono), onde cada afirmação sobre um profissional carrega procedência e estado de verificação, e onde "publicado" é uma transição explícita — nunca o estado de nascimento do dado.**

Propriedades-alvo:

- **Mesma fronteira:** UI e `application/` continuam ignorando a origem; muda-se a env, não as telas.
- **Publicação como snapshot:** o site serve apenas a projeção publicada; ingestão e revisão acontecem fora do caminho de leitura.
- **Procedência por afirmação:** formação, residência e experiência apontam para fontes registradas, não para um booleano solto.
- **Reversibilidade:** voltar ao mock ou a um snapshot anterior é operação de configuração, não de código.

**Tecnologia recomendada:** Postgres gerenciado (Supabase), pelos critérios: integração nativa com Vercel/serverless, SQL auditável, RLS para separar leitura pública de escrita editorial, e disponibilidade imediata no ambiente operacional do time. A decisão final de fornecedor é da Wave 1 e não altera o restante desta RFC (o contrato isola).

## 3. Requisitos

**Funcionais**
- RF1: `PROFESSIONAL_DATA_SOURCE=persistent` serve o catálogo/perfis completos com paridade funcional ao mock.
- RF2: CRUD editorial de profissionais fora do site público (ingestão nunca passa pelas rotas do app).
- RF3: Cada formação/residência/experiência referencia ≥0 fontes; o estado de verificação deriva das fontes, não é editado à mão.
- RF4: Publicar/despublicar profissional é transição explícita com autor e timestamp.
- RF5: O mock permanece funcional para desenvolvimento e testes (nunca é removido).

**Não funcionais**
- RNF1: p95 de leitura do catálogo ≤ o atual + 100ms (mitigado por cache, ver abaixo).
- RNF2: Indisponibilidade da fonte → erro explícito e observável (log estruturado + `/api/health` degradado), jamais fallback silencioso para mock (decisão inviolável nº 3).
- RNF3: Zero credenciais no repositório; contrato de env documentado (`.env.example` com placeholders).

**LGPD**
- Base legal registrada por profissional (dados públicos de registro profissional/fonte pública verificável, ou consentimento documentado).
- Direito de titular: despublicação e retificação com trilha; exclusão física possível sem quebrar auditoria de decisões (tombstone).
- Minimização: apenas dados profissionais públicos; nada de dados pessoais além do necessário ao propósito declarado na metodologia.

**Versionamento** — toda mutação editorial gera versão (autor, timestamp, diff lógico); o snapshot publicado referencia versões específicas.
**Auditoria** — log imutável de eventos editoriais (quem, o quê, quando, por quê); consultável, nunca reescrito.
**Cache** — leitura pública via cache do Next (`revalidate`/tags) sobre o snapshot publicado; invalidação por tag no evento de publicação; TTL defensivo (ex.: 5 min) como rede de segurança.
**Atualização** — mudança editorial só chega ao público via nova publicação (nunca write-through); sitemap e reindexação SEO reagem ao snapshot, não à tabela viva.

## 4. Modelo de domínio

**Entidades** (evolução do `KNOWLEDGE_MODEL.md`, não substituição):
- `Professional` — identidade, slug, especialidade principal, localização primária.
- `Education` / `Experience` — já existentes na projeção de perfil; ganham vínculo a `SourceRecord`.
- `Specialty`, `Condition`, `Capability` — inalteradas (Knowledge Core congelado).
- **`SourceRecord`** *(nova)* — fonte verificável: tipo (registro profissional, diploma, instituição, declaração), referência, data de captura, avaliador.
- **`Verification`** *(nova, materializa o conceito)* — liga afirmação ↔ fontes; estado derivado.
- **`PublicationSnapshot`** *(nova)* — conjunto imutável de versões publicadas; o site lê sempre o snapshot ativo.
- **`AuditEvent`** *(nova)* — registro imutável de mutação/decisão editorial.

**Relacionamentos:** `Professional 1—N Education/Experience`; `afirmação N—N SourceRecord` (via `Verification`); `PublicationSnapshot N—N versões de Professional`; `AuditEvent` referencia qualquer entidade.

**Estados do `Professional`:** `draft → in_review → published ⇄ unpublished`; terminal `removed` (tombstone LGPD). Estados da `Verification` (mapeiam 1:1 para a UI já existente): `verified` ("Verificada"), `pending` ("Ainda não verificada"), `rejected` (nunca exibida como negativa — a afirmação sai do perfil publicado).

**Eventos:** `ProfessionalDrafted`, `SourceAttached`, `VerificationResolved`, `ProfessionalPublished`, `ProfessionalUnpublished`, `SnapshotActivated`, `TitularRequestProcessed` — todos geram `AuditEvent`; `SnapshotActivated` dispara invalidação de cache.

## 5. Arquitetura

- **`domain/`** — ganha os tipos novos (`SourceRecord`, `Verification`, estados/eventos) como modelo puro; Knowledge Core intocado.
- **`application/`** — casos de uso editoriais (`PublishProfessional`, `AttachSource`, `ResolveVerification`) como funções puras sobre portas; projeções de leitura existentes (`ProfessionalCatalogProjection`, perfil) **inalteradas em forma**, apenas alimentadas pela nova origem.
- **`infrastructure/`**
  - `providers/` — `PersistentProfessionalDataProvider` substitui o `Future*`, implementando o **contrato tornado assíncrono** (`listRawProfessionals(): Promise<…>` numa primeira fase, servindo `RawProfessionalData` para paridade; numa segunda fase o contrato evolui para o modelo com procedência).
  - `repositories/` — `ProfessionalRepository`, `SnapshotRepository`, `AuditRepository`: portas definidas em `application/`, implementadas aqui (SQL).
  - `adapters/` — tradução Postgres⇄domínio (row mappers), cliente de conexão, e o `LegacyProfessionalMapper` absorvido: os campos-ponte (`formacaoResumo`, `verificado`, `areasDeAtuacao`) passam a ser colunas/derivações reais, extinguindo o segundo caminho de dados.
- **Composição** — `createProfessionalDataProvider()` permanece o único ponto de composição; `resolveProfessionalDataSource` inalterado (`mock`/`persistent`, erro para o resto, sem fallback).

## 6. Fluxo

1. **Ingestão** — operador registra o profissional (ferramenta editorial fora do site público; na primeira fase, seeds SQL revisados servem) com fontes anexadas → `draft` + `AuditEvent`.
2. **Normalização** — adapters normalizam nomes de instituições/cidades contra o Knowledge Core (specialties/conditions/capabilities por id, nunca texto livre); slug gerado segundo `SLUG_OWNERSHIP_REVIEW.md`.
3. **Validação** — `validateRawProfessionalData` (já existente) + invariantes novas: profissional publicável exige especialidade válida, localização, ≥1 formação, e nenhuma verificação `rejected` visível. Falha = permanece `draft`, com erro explícito.
4. **Publicação** — `PublishProfessional` congela versões num `PublicationSnapshot`, ativa o snapshot, grava auditoria e invalida a tag de cache.
5. **Consumo** — o site lê exclusivamente o snapshot ativo via provider assíncrono → mesmas projeções → mesmas telas. Sitemap/noindex passam a derivar do snapshot (catálogo real ⇒ indexável, conforme decisão nº 11).

## 7. Estratégia de migração (sem interromper a produção)

**Princípio: a env é o interruptor; produção nunca espera código.**

1. **Fase 0 — Assincronia a mock constante** *(sem banco)*: contrato do provider vira `async`; consumidores (`services/`, catalog, profile, sitemap) adaptados; `MockProfessionalDataProvider` devolve `Promise` do mesmo dado. Deploy com `PROFESSIONAL_DATA_SOURCE=mock` — **zero mudança observável**. Este é o passo de maior contato com código existente, feito enquanto a fonte ainda é trivial.
2. **Fase 1 — Persistência espelho**: banco provisionado; seed com os **mesmos 7 fictícios** (marcados `demo: true`); `PersistentProfessionalDataProvider` implementado. Produção continua `mock`; Preview roda `persistent` para validação comparativa (paridade byte a byte das projeções).
3. **Fase 2 — Chaveamento**: produção muda a env para `persistent` ainda servindo os fictícios espelhados — mesmo conteúdo, nova origem. Rollback = trocar a env de volta (segundos, sem deploy).
4. **Fase 3 — Dados reais (fronteira com E2)**: perfis reais entram `draft→published` pelo fluxo editorial; fictícios são despublicados na mesma janela. `noindex`/sitemap só mudam quando o snapshot ativo for 100% real.
5. **Fase 4 — Aposentadoria das pontes**: `LegacyProfessionalMapper` removido; `Future*` deletado; mock permanece para dev/testes.

## 8. Critérios de aceite

1. `persistent` em produção servindo o snapshot com paridade funcional total (catálogo, busca com/sem acento, filtros na URL, perfil, sitemap) — validada pelo mesmo smoke checklist da v1.
2. Indisponibilidade simulada da fonte produz erro explícito + log estruturado + health degradado; **nenhum** fallback silencioso.
3. Toda mutação editorial consultável na auditoria; publicar/despublicar refletem no público em ≤ TTL do cache.
4. Rollback de origem (env) e de snapshot (reativação do anterior) demonstrados em Preview.
5. Mock intacto: suíte de testes roda sem banco; CI permanece verde sem credenciais.
6. Zero regressão nas decisões invioláveis (sem ranking; verificação neutra; `rejected` nunca exibida como afirmação negativa).
7. `.env.example` documenta o contrato de ambiente sem valores reais.

## 9. Riscos

- **Técnicos:** a assincronia da Fase 0 toca muitos consumidores de uma vez (mitigação: fase isolada, sem banco, coberta pelos 31 testes + smoke); latência de banco em serverless (mitigação: cache por snapshot + connection pooling do fornecedor); divergência mock⇄persistente (mitigação: validação comparativa da Fase 1).
- **Produto:** dado real mal verificado publicado (mitigação: publicação exige validação + revisão humana de E2; RF3 impede "verificado" sem fonte); janela mista fictício/real confundindo usuários (mitigação: chaveamento de conteúdo atômico por snapshot na Fase 3).
- **Operação:** credencial vazada (mitigação: env só na Vercel, RLS, chave de leitura pública separada da editorial); snapshot corrompido (mitigação: snapshots imutáveis — rollback é reativação).
- **LGPD:** publicar dados de pessoa real sem base legal (mitigação: base legal é campo obrigatório do fluxo editorial, bloqueante para `published`); pedido de titular (mitigação: `unpublish` imediato + tombstone; processo documentado antes da Fase 3).

## 10. Plano de implementação — Waves

**Wave E1.1 — Contrato assíncrono (Fase 0)**
- *Objetivo:* provider e consumidores assíncronos, mock como única origem.
- *Arquivos:* `infrastructure/alicia/professional/*` (contrato/providers), `services/alicia/*`, `infrastructure/alicia/catalog|profile`, `app/sitemap.ts`, testes afetados.
- *Riscos:* regressão ampla por mudança mecânica (mitigada por typecheck strict + 31 testes + smoke).
- *Tempo:* 2–3 dias. · *Rollback:* `git revert` do commit único; comportamento é idêntico, então rollback é trivial.

**Wave E1.2 — Esquema, banco e contrato de ambiente**
- *Objetivo:* provisionar Postgres, migrations do modelo (§4), RLS, seed espelho dos fictícios, `.env.example`.
- *Arquivos:* diretório novo de migrations/seeds, `.env.example`, docs da decisão de fornecedor (ADR novo).
- *Riscos:* modelagem prematura de procedência (mitigada por seguir §4 e revisar com E2 antes de congelar).
- *Tempo:* 3–5 dias. · *Rollback:* banco descartável — nada em produção depende dele ainda.

**Wave E1.3 — PersistentProfessionalDataProvider + repositórios de leitura**
- *Objetivo:* implementar o provider real lendo o snapshot ativo; validação comparativa mock⇄persistent em Preview.
- *Arquivos:* `infrastructure/alicia/providers|repositories|adapters` novos, testes de paridade.
- *Riscos:* divergência de projeção (mitigada pelo teste comparativo automatizado).
- *Tempo:* 1 semana. · *Rollback:* produção segue `mock`; nada a reverter publicamente.

**Wave E1.4 — Casos de uso editoriais + auditoria + publicação**
- *Objetivo:* `PublishProfessional`, `AttachSource`, `ResolveVerification`, snapshots e trilha de auditoria; invalidação de cache por tag.
- *Arquivos:* `application/` (casos de uso + portas), `infrastructure/` (repos de escrita/auditoria), testes.
- *Riscos:* LGPD/base legal (bloqueio: revisão do processo antes de habilitar publicação de pessoa real).
- *Tempo:* 1–1,5 semana. · *Rollback:* escrita é interna; desativar caminho editorial não afeta o site.

**Wave E1.5 — Chaveamento de produção (Fase 2) e aposentadoria das pontes (Fase 4)**
- *Objetivo:* produção em `persistent` (espelho), observação, depois remoção de `LegacyProfessionalMapper`/`Future*`.
- *Arquivos:* env na Vercel (config), remoção das pontes, atualização dos ADRs afetados.
- *Riscos:* incidente pós-chaveamento (mitigado por health/logs + rollback de env em segundos).
- *Tempo:* 2–3 dias (+ janela de observação). · *Rollback:* `PROFESSIONAL_DATA_SOURCE=mock` — sem deploy.

*(A entrada de dados reais em si é o Epic E2, que consome esta fundação a partir da Wave E1.4.)*

---

**RFC E1 CONCLUÍDA**
