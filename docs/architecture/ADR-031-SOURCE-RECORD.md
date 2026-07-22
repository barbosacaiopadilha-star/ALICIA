# ADR-031 — SourceRecord

**Status:** Aceita (derivada da RFC-E1) · **Data:** 2026-07-21

## Contexto

A credibilidade da AliCIA é "formação e trajetória verificáveis". Nos
mocks, verificação é um booleano (`verificado: true`) sem origem — uma
afirmação sem prova. A UI da v1 já distingue "Verificada" / "Ainda não
verificada" e a metodologia pública promete fontes.

## Problema

Com dados reais, "verificado por quê?" precisa de resposta material.
Sem entidade de fonte: impossível auditar como uma afirmação foi
confirmada, impossível revalidar quando uma fonte expira, impossível
atender contestação de titular (LGPD) com evidência.

## Alternativas consideradas

1. **Booleano por afirmação (status quo)** — não responde "por quê";
   auditoria vazia. Rejeitada.
2. **Campo texto livre "fonte"** — não estruturado, não revalidável,
   não relacionável a múltiplas afirmações. Rejeitada.
3. **Entidade `SourceRecord` de primeira classe** — tipo (registro
   profissional, diploma, instituição, declaração), referência, data de
   captura e avaliador; relação N—N com afirmações. **Escolhida.**

## Decisão

Toda afirmação verificável (formação, residência, experiência)
referencia zero ou mais `SourceRecord`s. O estado de verificação é
**derivado** da existência e avaliação de fontes — nunca editado
diretamente. Fonte é registrada com data de captura, permitindo
revalidação futura.

## Consequências

- (+) "Verificada" passa a ter lastro auditável; contestações têm
  evidência anexada.
- (+) Uma fonte (ex.: registro no conselho) pode sustentar várias
  afirmações sem duplicação.
- (−) Ingestão fica mais trabalhosa (anexar fonte é obrigatório para
  verificar) — custo aceito: é exatamente o produto.
- (−) Exige modelagem de tipos de fonte antes da Wave E1.2 (revisão
  conjunta com o processo editorial do Epic E2).

## Rollback

A entidade é aditiva: se o modelo de tipos se provar errado, afirmações
degradam para `pending` (nunca para `verified` sem fonte) enquanto o
modelo é corrigido — o site continua honesto por construção.

## Relação com ADRs anteriores

Materializa a promessa de `PROFESSIONAL_PROFILE_RC.md` e da metodologia
pública. Substitui, ao fim da migração (ADR-033), o campo-ponte
`verificado` do `LegacyProfessionalMapper`
(`PROFESSIONAL_PROFILE_DATA_GAP_REVIEW.md`). Base do ADR-032.
