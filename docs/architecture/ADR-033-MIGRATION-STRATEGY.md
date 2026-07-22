# ADR-033 — Migration Strategy

**Status:** Aceita (derivada da RFC-E1) · **Data:** 2026-07-21

## Contexto

A v1 está em produção contínua (deploy automático de `main`, health
check, smoke checklist). A v2 troca a origem dos dados — a operação com
maior potencial de ruptura do roadmap. O MACROBLOCO-04 deixou o
interruptor pronto: `PROFESSIONAL_DATA_SOURCE` com `mock`/`persistent`,
sem fallback silencioso.

## Problema

Como migrar de mocks para persistência real **sem interromper produção,
sem janela de conteúdo misto acidental e com rollback instantâneo** —
sabendo que a mudança de contrato (assincronia) toca muitos arquivos e
que a entrada de dados reais tem dependências externas (E2, LGPD)?

## Alternativas consideradas

1. **Big-bang** (assincronia + banco + dados reais em um deploy) —
   rollback ambíguo, superfície de falha máxima. Rejeitada.
2. **Branch longa de v2** — divergência prolongada de `main`, integração
   dolorosa, contraria o fluxo trunk-based praticado na v1. Rejeitada.
3. **Fases pequenas em `main`, chaveadas por env, cada uma inócua por
   construção** — **Escolhida.**

## Decisão

Cinco fases, cada uma deployável e reversível isoladamente:

- **Fase 0** — contrato assíncrono com mock constante (ADR-030);
  comportamento idêntico por construção.
- **Fase 1** — banco provisionado espelhando os próprios fictícios
  (`demo: true`); produção segue `mock`; Preview valida `persistent`
  com teste comparativo de paridade das projeções.
- **Fase 2** — produção chaveia a env para `persistent` servindo o
  espelho: mesmo conteúdo, nova origem. **Rollback = trocar a env de
  volta, segundos, sem deploy.**
- **Fase 3** — dados reais entram pelo fluxo editorial (fronteira com
  E2); fictícios são despublicados na mesma ativação de snapshot
  (ADR-029) — troca de conteúdo atômica, nunca mistura acidental.
  `noindex`/sitemap só mudam com snapshot 100% real.
- **Fase 4** — aposentadoria de `LegacyProfessionalMapper` e
  `FutureProfessionalDataProvider`; mock permanece para dev/testes.

## Consequências

- (+) Produção nunca espera código: os dois momentos de risco (troca de
  origem, troca de conteúdo) são operações de configuração/ativação.
- (+) Cada fase tem verificação própria (testes, paridade em Preview,
  health/smoke) antes da seguinte.
- (−) Duração total maior que um big-bang e custo temporário de manter
  espelho fictício no banco (aceito: é o preço da reversibilidade).

## Rollback

Por fase: F0 `git revert` trivial; F1 banco descartável; F2 env de
volta a `mock`; F3 reativação do snapshot anterior; F4 revert do commit
de remoção. Refúgio absoluto: tag `v1.0.0`.

## Relação com ADRs anteriores

Orquestra ADR-029/030/031/032 no tempo. Preserva as invariantes do
MACROBLOCO-04 (sem fallback silencioso; env como única seleção de
origem) e as decisões invioláveis nº 3 e nº 11 do Release Book. Fecha,
ao final, as pontes legadas registradas em
`PROFESSIONAL_PROFILE_DATA_GAP_REVIEW.md` e
`CATALOG_MIGRATION_REVIEW.md`.
