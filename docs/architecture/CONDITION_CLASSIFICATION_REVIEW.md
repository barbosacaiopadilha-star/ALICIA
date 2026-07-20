# Classificação Determinística de Condition para areasDeAtuacao (P2-040)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código foi alterado.
Escopo: os três itens de `areasDeAtuacao` já classificados como
categoria C (Condition) na P2-039 — "Joelho", "Trauma esportivo",
"Arritmias" — e a união `ConditionType` real de
`domain/professional/Condition.ts` (`disease | syndrome | symptom |
injury | body-region | care-need | other`). Confirmado por busca:
nenhuma classificação de `ConditionType` já existe em lugar nenhum do
projeto — este é o primeiro julgamento sobre o assunto.

## 2. Itens analisados

Apenas os três autorizados pela ETAPA 2: "Joelho" (med-001, med-002),
"Trauma esportivo" (med-001), "Arritmias" (med-006). "Ortopedia
geral", "Angioplastia" e "Prevenção cardiovascular" permanecem fora
desta auditoria, conforme instruído.

## 3. Compatibilidade

| Item | Condition? | ConditionType possível | Nº alternativas plausíveis | Julgamento humano necessário? | Classificável deterministicamente? |
|---|---|---|---|---|---|
| Joelho | Sim | `body-region` | 1 forte (+ `other` genérico) | Mínimo | **Sim** |
| Trauma esportivo | Sim | `injury` ou `care-need` | 2 concorrentes (+ `other`) | Sim | **Não** |
| Arritmias | Sim | `disease` (leitura predominante); `syndrome` (leitura minoritária) | 1 dominante, 1 residual | Baixo | **Sim** (com ressalva) |

## 4. Ambiguidades

**Joelho:** sustentado exclusivamente pelo texto → **`body-region`**.
Nenhum outro tipo (`symptom`, `other`) tem vantagem textual — "Joelho"
é, isoladamente, o nome de uma região anatômica, correspondência de
vocabulário, não inferência clínica.

**Trauma esportivo:** **não existe decisão inteiramente objetiva** —
depende de interpretação. "Trauma" isolado indicaria `injury`
(lesão), mas "esportivo" introduz uma leitura alternativa de "linha
de atendimento/serviço" que sustentaria `care-need`. Nenhuma das duas
leituras predomina de forma inequívoca a partir do texto isolado.

**Arritmias:** existe uma leitura padrão predominante (`disease`),
amplamente aceita na terminologia médica geral para descrever
alterações do ritmo cardíaco. Uma leitura minoritária ("síndromes
arrítmicas") existe em nichos clínicos, mas não compete na prática
comum — a classificação como `disease` é a leitura direta e
dominante, sem exigir contexto clínico específico do paciente.

## 5. Critério de decisão

Um texto pode receber um `ConditionType` sem inferência quando:

1. **Igualdade semântica direta** — a palavra corresponde
   literalmente ao nome canônico da categoria (vocabulário, não
   julgamento clínico).
2. **Significado médico inequívoco e dominante** — o termo tem uma
   leitura padrão amplamente aceita, sem outra leitura concorrente na
   prática comum (mesmo que leituras minoritárias existam em nichos).

Critérios que **não** autorizam classificação determinística:

3. **Necessidade de contexto adicional** — quando o texto isolado
   admite duas leituras plausíveis e competitivas, sem uma predominar.
4. **Necessidade de julgamento clínico** — quando decidir a categoria
   exigiria conhecimento especializado sobre o caso específico do
   paciente, não apenas o significado geral do termo.

Aplicação: "Joelho" satisfaz o critério 1. "Arritmias" satisfaz o
critério 2. "Trauma esportivo" viola o critério 3 — duas leituras
concorrentes sem uma dominar.

## 6. Estratégias

**A — Classificar tudo automaticamente:** fidelidade alta para
Joelho/Arritmias, mas forçaria uma escolha arbitrária para "Trauma
esportivo" entre duas leituras concorrentes — inferência disfarçada
de determinismo.

**B — Classificar somente itens inequívocos:** fidelidade alta para
os que avançam (2 de 3); simplicidade moderada; risco baixo (nada é
forçado); dívida técnica mínima e explícita (1 item pendente,
registrado).

**C — Migrar tudo para `other`:** fidelidade baixíssima — descartaria
a informação semântica real já disponível para Joelho/Arritmias, que
claramente não são "other".

**D — Bloquear toda a migração:** simplicidade máxima, mas descarta
progresso real e desnecessário para 2 dos 3 itens que têm leitura
defensável.

## 7. Decisão

**2. Classificar apenas inequívocos**

"Joelho" e "Arritmias" satisfazem o critério objetivo da seção 5;
"Trauma esportivo" genuinamente admite duas leituras concorrentes sem
uma predominar — forçar uma classificação aqui seria inferência
disfarçada, exatamente o que a política de "nenhuma invenção de
dados" já estabelecida nesta sessão proíbe. Bloquear tudo descartaria
progresso desnecessário; migrar tudo para "other" desperdiçaria
informação já disponível; classificar tudo automaticamente forçaria
uma decisão arbitrária para o item ambíguo.

## 8. Resultado

```
Joelho
→ body-region (classificação determinística aprovada)

Trauma esportivo
→ BLOQUEADO (ambíguo entre injury/care-need — permanece sem
  classificação até decisão humana adicional ou mais contexto)

Arritmias
→ disease (classificação determinística aprovada, leitura padrão
  predominante)
```

## 9. Próxima implementação

**NÃO** — a integração de `Condition` ao mapper ainda não deve ser
feita integralmente.

Justificativa: mesmo com 2 dos 3 itens candidatos aptos, integrar
`Condition` ao mapper agora exigiria decidir o que fazer com "Trauma
esportivo" — omiti-lo silenciosamente seria descarte de dado sem
decisão explícita; incluí-lo forçadamente contrariaria esta própria
auditoria. Além disso, esta auditoria cobriu apenas 3 dos 6 valores
reais de `areasDeAtuacao` — os demais ("Ortopedia geral",
"Angioplastia", "Prevenção cardiovascular", classificados na P2-039
como Specialty/Capability/Misto) ainda não têm auditoria de
mapeamento determinístico equivalente. Antes de integrar `Condition`
ao mapper, é necessário: (a) decidir explicitamente o tratamento de
"Trauma esportivo" (aguardar mais contexto, ou mantê-lo
permanentemente no legado); (b) realizar auditorias equivalentes para
os itens ainda não analisados. Uma vez completas essas decisões,
integrar `Condition` ao mapper somente para os itens aprovados
(Joelho, Arritmias) seria viável — mas isso é uma tarefa futura, não
esta.

## 10. Fora de escopo

Nenhum domínio, mapper, aggregate, infraestrutura, aplicação, UI ou
mock foi criado ou alterado. Esta tarefa é exclusivamente descritiva.
