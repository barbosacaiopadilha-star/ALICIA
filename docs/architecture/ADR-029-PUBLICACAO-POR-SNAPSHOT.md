# ADR-029 — Publicação por Snapshot

**Status:** Aceita (derivada da RFC-E1) · **Data:** 2026-07-21

## Contexto

Na v1, todo dado existente está publicado por definição: os mocks são a
fonte e o site os serve diretamente. A v2 introduz dados reais com ciclo
editorial (rascunho, revisão, verificação, publicação) e obrigações de
LGPD (despublicação, retificação). O site público não pode observar
estados intermediários da edição.

## Problema

Se o site ler a "tabela viva", qualquer mutação editorial vaza
imediatamente para o público: meio-cadastro, verificação pendente,
correção pela metade. Também torna rollback de conteúdo impossível sem
restaurar banco, e acopla cache a linhas individuais.

## Alternativas consideradas

1. **Write-through (site lê a tabela viva)** — simples, porém expõe
   estados intermediários, sem rollback de conteúdo, invalidação de
   cache granular e frágil. Rejeitada.
2. **Flag `published` por linha** — melhor, mas publicações multi-linha
   não são atômicas (perfil publicado com formação pela metade) e não há
   versão histórica reativável. Rejeitada.
3. **Snapshot imutável de publicação** — conjunto congelado de versões;
   o site lê apenas o snapshot ativo; publicar = criar e ativar novo
   snapshot. **Escolhida.**

## Decisão

O caminho público de leitura serve exclusivamente o
`PublicationSnapshot` ativo. Toda publicação congela versões específicas
das entidades, grava auditoria (`SnapshotActivated`) e invalida o cache
por tag. Edição nunca é visível antes de uma ativação explícita.

## Consequências

- (+) Publicação atômica; público nunca vê estado intermediário.
- (+) Rollback de conteúdo = reativar snapshot anterior (operação, não
  restore de banco).
- (+) Cache trivial: uma tag por snapshot; sitemap/noindex derivam do
  snapshot (viabiliza a decisão nº 11 do Release Book).
- (−) Custo de armazenamento por versões congeladas e um passo editorial
  a mais (aceito: catálogo é pequeno e curadoria é deliberada).

## Rollback

Da decisão: se snapshots se provarem pesados, a degradação controlada é
a alternativa 2 (flag por linha) mantendo auditoria — o contrato do
provider não muda, apenas a consulta. Do conteúdo: reativação do
snapshot anterior, em segundos.

## Relação com ADRs anteriores

Constrói sobre `PERSISTENT_DATA_PROVIDER_RC.md` (fronteira única de
leitura) e `PROFESSIONAL_CATALOG_PROJECTION.md` (projeções permanecem;
muda a origem). Habilita a reindexação condicionada registrada no
commit `44077d9` (noindex do catálogo demonstrativo).
