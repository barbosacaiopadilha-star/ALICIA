# Ownership de "Prevenção cardiovascular" (P2-049)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código foi alterado.
Escopo: o único item de `areasDeAtuacao` classificado preliminarmente
como categoria D (Misto) na P2-039 — "Prevenção cardiovascular" —
comparado com as uniões `CapabilityType` e `ConditionType` reais.

## 2. Item analisado

**1 ocorrência real**, no profissional med-006
(`areasDeAtuacao: ["Angioplastia", "Arritmias", "Prevenção
cardiovascular"]`). As demais menções encontradas no projeto são
comentários explicativos em `LegacyProfessionalMapper.ts` (listando
itens ainda não aprovados), não mapeamentos reais. Confirmado:
nenhuma classificação ou mapeamento anterior existe para este item.

## 3. Compatibilidade com Capability

**AMBÍGUO.**

- **`clinical-management`** — compatível, força **moderada**. "Prevenção"
  pode ser lida como uma abordagem de gestão clínica contínua
  (acompanhamento preventivo de risco cardiovascular), correspondendo
  razoavelmente a "gestão clínica". Exige algum contexto adicional —
  não é tão direta quanto "Angioplastia"→`procedure`. Risco de perda
  semântica moderado, pois "prevenção" também admite leitura como
  necessidade do paciente, não só ação do profissional.
- **`care-delivery`** — compatível, **fraco**. Descreve tipicamente
  modalidade de entrega de cuidado (ex.: telemedicina), não o
  conteúdo clínico da prevenção. Correspondência fraca.
- **`procedure`** — **incompatível**. "Prevenção" não é um
  procedimento pontual, é uma abordagem contínua.
- **`diagnostic`** — **incompatível**. Prevenção não é diagnóstico.
- **`other`** — sempre disponível como fallback genérico, mas
  descartaria a leitura mais específica (`clinical-management`).

## 4. Compatibilidade com Condition

**AMBÍGUO.**

- **`care-need`** — compatível, força **moderada**. "Prevenção
  cardiovascular" pode ser lida como uma necessidade de cuidado (o
  paciente precisa de acompanhamento preventivo). Mesma ambiguidade
  do lado Capability — exige contexto adicional para confirmar.
- **`disease`** — **incompatível**. Prevenção não é uma doença, é o
  oposto (evitar uma doença).
- **`symptom`** — **incompatível**. Não é um sintoma.
- **`body-region`** — **incompatível**. Não é uma região anatômica.
- **`other`** — sempre disponível como fallback genérico.

## 5. Capability versus Condition

1. **O texto descreve algo que o profissional faz?** Sim,
   parcialmente — pode ser lido como uma atividade que o profissional
   realiza (aconselhamento preventivo, acompanhamento de risco).
2. **O texto descreve algo que o paciente busca ou necessita?** Sim,
   parcialmente — também pode ser lido como o foco/necessidade de
   cuidado que caracteriza a população atendida.
3. **O texto permite distinguir essas leituras sem contexto
   adicional?** **Não** — ao contrário de "Angioplastia" (claramente
   uma ação) ou "Joelho" (claramente uma região), o texto isolado não
   decide sozinho entre "algo que eu faço" e "uma necessidade do
   paciente" — ambas as leituras são igualmente plausíveis e competem
   genuinamente.
4. **Existe leitura semanticamente dominante?** **Não** — diferente
   de "Arritmias" (dominantemente `disease`) ou "Angioplastia"
   (dominantemente `procedure`), este item é estruturalmente
   ambivalente entre ação e necessidade.
5. **Uma das entidades perderia parte essencial do significado?**
   **Sim** — escolher só `Capability` perderia a dimensão de
   necessidade do paciente; escolher só `Condition` perderia a
   dimensão de ação profissional ativa. Nenhuma das duas leituras
   cobre o conceito inteiro sozinha.

## 6. Natureza composta

**SIM.** Diferente de "Angioplastia" (puramente ação) ou "Joelho"/
"Arritmias" (puramente estado/região do paciente), "Prevenção
cardiovascular" combina simultaneamente uma dimensão de ação (o que o
profissional faz) e uma dimensão de necessidade/foco populacional (o
que o paciente busca). Se composto, o item poderia teoricamente gerar
ambas as entidades — mas isso exigiria uma decisão editorial adicional
sobre como reformular/nomear cada metade separadamente (ex.:
"Prevenção cardiovascular" como nome de uma `Capability` soa natural,
mas como nome de uma `Condition`/`care-need` talvez exigisse
reformulação, como "necessidade de acompanhamento cardiovascular
preventivo" — isso já seria reformulação editorial, não correspondência
textual exata). **Conclusão: nenhuma das duas entidades sem
decomposição editorial adicional** — gerar ambas exigiria inventar/
reformular texto, não apenas mapear.

## 7. Critério de ownership

Critério reutilizável para decidir entre `Capability` e `Condition`:

1. **Sujeito semântico** — o texto descreve primariamente uma ação do
   profissional (`Capability`) ou um estado/necessidade do paciente
   (`Condition`)?
2. Se o texto favorece claramente um sujeito sobre o outro (ex.:
   "Angioplastia" = ação clara; "Arritmias" = estado claro),
   classificar diretamente na entidade correspondente.
3. Buscar correspondência direta com um único tipo da união
   correspondente, sem necessidade de escolher entre duas ENTIDADES
   diferentes igualmente plausíveis.
4. Se o texto admite duas leituras igualmente fortes e competitivas
   entre `Capability` e `Condition` (não apenas entre dois subtipos
   da mesma entidade, como ocorreu com "Trauma esportivo" dentro de
   `Condition`), o item deve ser tratado como conceito composto, não
   forçado para uma única entidade.
5. Um conceito composto não deve ser dividido automaticamente em duas
   entidades sem decisão editorial explícita sobre como nomear/
   formular cada metade — evita tanto a perda semântica de escolher
   só uma quanto a fabricação de texto reformulado sem aprovação
   humana.
6. Nesses casos, o item permanece bloqueado no legado até decisão
   editorial humana (se necessário) ou nova modelagem aprovada.

## 8. Estratégias

**A — Mapear para `Capability: clinical-management`:** fidelidade
parcial (perde a dimensão de necessidade); determinismo baixo (leitura
não dominante); risco de perda semântica real; dívida técnica futura.

**B — Mapear para `Condition: care-need`:** simétrico ao A, na
direção oposta — perde a dimensão de ação profissional.

**C — Mapear para ambas:** exigiria criar dois registros a partir de
um único texto, com decisão editorial sobre formulação distinta —
decomposição editorial, não migração determinística; fora do escopo
autorizado nesta série de tarefas (correspondência textual exata,
sem reformulação); risco de fabricar conteúdo.

**D — Mapear para `other`:** descartaria, em ambas as entidades, toda
a informação semântica específica disponível — pior que manter o
texto original no legado.

**E — Manter bloqueado no legado:** simplicidade máxima; nenhuma
perda de informação (texto continua disponível via bridge); nenhum
risco de escolha semântica equivocada; dívida técnica explícita e
documentada (mesmo padrão já usado para "Trauma esportivo").

## 9. Decisão

**5. Prevenção cardiovascular permanece bloqueada**

O texto é genuinamente ambivalente entre `Capability`
(`clinical-management`) e `Condition` (`care-need`), sem leitura
dominante comprovável a partir do texto isolado — diferente de
"Angioplastia"→`procedure` ou "Arritmias"→`disease`, que tinham
leitura dominante clara. É um conceito composto que exigiria
decomposição editorial (reformulação/nomeação separada) para gerar
dois registros corretos — isso vai além de uma correspondência
textual determinística, o único tipo de mapeamento autorizado nesta
série de auditorias.

## 10. Impacto sobre o bridge

**NÃO.** Nenhuma entidade substituiria "Prevenção cardiovascular"
hoje — nem `Capability` nem `Condition` sozinhas capturam o conceito
inteiro. A informação **não** seria preservada se descartada agora
(perderia tanto a dimensão de ação quanto a de necessidade). Ainda
falta decisão humana sobre como, ou se, decompor o texto em dois
registros com nomes próprios. O risco de duplicidade permaneceria
alto se qualquer tentativa futura mapeasse automaticamente para ambas
sem uma decisão editorial explícita sobre os dois textos resultantes.

## 11. Próxima implementação

**D. Manter bridge e aguardar decisão humana**

As demais alternativas não se aplicam: (A) não há nova entidade a
integrar — ambas já existem; (B) mapear para uma entidade já integrada
não é recomendado dado o bloqueio de ambiguidade genuína (seção 9);
(C) nada foi mapeado, então não há o que projetar; (E) uma nova
auditoria de decomposição é uma possibilidade condicional de longo
prazo, não a próxima ação imediata — só faria sentido se alguém
decidir, como decisão de produto/editorial, que vale a pena decompor
este item em dois conceitos nomeados separadamente.

## 12. Fora de escopo

Nenhum domínio, mapper, aggregate, aplicação, infraestrutura, UI,
mock, Profile Projection, bridge legado ou documentação anterior foi
criado ou alterado. Esta tarefa é exclusivamente descritiva.
