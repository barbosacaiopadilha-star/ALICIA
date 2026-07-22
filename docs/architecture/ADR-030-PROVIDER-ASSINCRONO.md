# ADR-030 — Provider Assíncrono

**Status:** Aceita (derivada da RFC-E1) · **Data:** 2026-07-21

## Contexto

O contrato atual é síncrono: `listRawProfessionals():
ReadonlyArray<RawProfessionalData>` — adequado a mocks em memória. A
pergunta 6 do MACROBLOCO-04 deixou registrado que qualquer fonte real
(banco/API) exigiria assincronia, sem ativar a decisão por falta de
fonte concreta. A RFC-E1 ativa essa decisão.

## Problema

Banco e rede são assíncronos. Manter o contrato síncrono forçaria
bloqueio de event loop, cache global mutável pré-carregado ou leitura no
build — todos incompatíveis com dados editáveis servidos por serverless.
A assinatura do contrato se propaga por `services/`, catálogo, perfil e
`app/sitemap.ts`.

## Alternativas consideradas

1. **Manter síncrono com cache pré-carregado em módulo** — quebra em
   serverless (cold start por instância), dados obsoletos, esconde
   falhas. Rejeitada.
2. **Dois contratos paralelos (sync p/ mock, async p/ persistent)** —
   bifurca todos os consumidores, dobra testes, viola a fronteira
   única. Rejeitada.
3. **Contrato único assíncrono; mock devolve `Promise` de memória** —
   mudança mecânica uma única vez, consumidores já rodam em contexto
   assíncrono (Server Components). **Escolhida.**

## Decisão

`ProfessionalDataProvider` passa a ser integralmente assíncrono
(`Promise<ReadonlyArray<RawProfessionalData>>` na primeira fase). A
conversão é feita como Wave E1.1 isolada, **antes** de existir banco,
com `mock` como única origem — comportamento observável idêntico,
validado pelos 31 testes e smoke checklist.

## Consequências

- (+) Um único contrato para todas as origens; `persistent` plugável
  sem tocar consumidores novamente.
- (+) A mudança mais invasiva do epic acontece no momento mais barato
  (fonte trivial, diff mecânico).
- (−) Diff amplo de uma vez em `services/`, catálogo, perfil e sitemap
  (aceito: mudança mecânica, tipada, coberta por testes).

## Rollback

`git revert` do commit da Wave E1.1 — como o comportamento é idêntico
por construção, o revert é livre de efeitos colaterais de dados.

## Relação com ADRs anteriores

Executa a previsão registrada em `PERSISTENT_DATA_PROVIDER_RC.md`
(pergunta 6). Preserva `resolveProfessionalDataSource` e a regra "sem
fallback silencioso" (MACROBLOCO-04). Pré-requisito de ADR-029 e
ADR-033.
