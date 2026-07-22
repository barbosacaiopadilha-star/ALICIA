# ADR-032 — Verification Model

**Status:** Aceita (derivada da RFC-E1) · **Data:** 2026-07-21

## Contexto

A UI da v1 exibe dois estados neutros por afirmação: "Verificada" e
"Ainda não verificada". A decisão inviolável nº 2 do Release Book proíbe
que ausência de verificação vire afirmação negativa sobre o
profissional. Com `SourceRecord` (ADR-031), verificação deixa de ser um
booleano e passa a ser um processo com resultado.

## Problema

Um processo de verificação real tem três desfechos, não dois: fonte
confirma, fonte ainda não avaliada, fonte **contradiz** a afirmação. O
terceiro desfecho não pode ser exibido como "não verificada" (mentiria
por omissão para o processo editorial) nem como selo negativo público
(violaria a decisão nº 2).

## Alternativas consideradas

1. **Booleano derivado (tem fonte = verificada)** — não distingue fonte
   pendente de fonte contraditória; permite "verificada" com fonte não
   avaliada. Rejeitada.
2. **Escala graduada pública (score de confiança)** — colide
   frontalmente com a proibição de score/ranking. Rejeitada.
3. **Máquina de três estados internos com projeção pública de dois** —
   `verified` / `pending` / `rejected` internamente; publicamente
   `verified→"Verificada"`, `pending→"Ainda não verificada"`, e
   `rejected` **remove a afirmação do perfil publicado**. **Escolhida.**

## Decisão

`Verification` liga afirmação ↔ fontes com estado derivado:
- `verified` — ≥1 fonte avaliada e confirmatória;
- `pending` — sem fonte avaliada (estado de nascimento);
- `rejected` — fonte avaliada contradiz a afirmação.

Transições apenas por `ResolveVerification` (caso de uso auditado).
Afirmação `rejected` não entra em snapshot publicado; o perfil segue
publicável sem ela. A UI existente não muda: continua com os dois
rótulos neutros atuais.

## Consequências

- (+) Editorial honesto sem violar a neutralidade pública: contradição
  interna nunca vira acusação exibida.
- (+) "Verificada" passa a garantir fonte avaliada — o selo ganha
  significado material.
- (−) Perfis podem "encolher" ao republicar após rejeição de afirmação
  (aceito e desejado: melhor omitir que afirmar sem lastro).

## Rollback

Degradação segura embutida: na dúvida ou falha do processo, tudo tende
a `pending` (rótulo neutro). Reverter a decisão inteira significa
voltar ao booleano do ADR-031-alternativa-1 — possível sem migração
destrutiva, pois os três estados colapsam para dois sem perda pública.

## Relação com ADRs anteriores

Depende de ADR-031 (fontes). Implementa a decisão inviolável nº 2 do
Release Book em nível de modelo. Alinha com `VerificacoesMedico`
(componente v1) sem alterá-lo. Alimenta os critérios de publicação do
ADR-029 (snapshot não aceita `rejected`).
