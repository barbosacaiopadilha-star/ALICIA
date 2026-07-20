# Classificação Determinística de Capability para "Angioplastia" (P2-044)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código foi alterado.
Escopo: o único item de `areasDeAtuacao` já classificado
preliminarmente como categoria B (Capability) na P2-039 —
"Angioplastia" — e a união `CapabilityType` real de
`domain/professional/Capability.ts` (`diagnostic | clinical-management
| procedure | surgery | rehabilitation | care-delivery | second-opinion
| other`). Confirmado por busca: nenhuma classificação de
`CapabilityType` já existe em lugar nenhum do projeto; `Capability`
nunca é referenciada fora do próprio arquivo e do barrel do domínio.

## 2. Item analisado

**"Angioplastia"** — 1 ocorrência real, no profissional med-006
(`areasDeAtuacao: ["Angioplastia", "Arritmias", "Prevenção
cardiovascular"]`). A única outra ocorrência da palavra
"Angioplastia" em todo o projeto é um comentário no
`LegacyProfessionalMapper.ts` (adicionado na P2-042, listando itens
ainda não aprovados) — não um mapeamento real. Conforme instruído,
"Trauma esportivo", "Ortopedia geral" e "Prevenção cardiovascular"
permanecem fora desta auditoria.

## 3. Compatibilidade com Capability

**SIM.** "Angioplastia" representa uma `Capability`. Justificativa:
é uma ação/procedimento clínico específico que um profissional
realiza — corresponde diretamente ao conceito de "capacidade
profissional" que `Capability` modela (uma ação/intervenção
executada), diferente de `Condition` (um estado/diagnóstico do
paciente, já usado para "Joelho"/"Arritmias") ou `Specialty` (área de
formação formal). O termo, isoladamente, já denota uma intervenção
terapêutica específica sobre vasos sanguíneos, sem exigir nenhum
dado externo ao próprio texto.

## 4. Tipos candidatos

**`procedure`** — Compatível, **forte**. "Angioplastia" é, por
definição médica padrão e amplamente aceita, um procedimento
terapêutico (intervenção percutânea/endovascular via cateter). Não
exige contexto adicional sobre o caso específico do paciente.

**`surgery`** — Compatível, mas **fraco/impreciso**. Possível em
linguagem leiga, mas a terminologia médica formal distingue
angioplastia (procedimento minimamente invasivo, percutâneo) de
cirurgia aberta tradicional — e o próprio domínio já reconhece essa
distinção ao manter `procedure` e `surgery` como valores separados na
união.

**`clinical-management`** — **Incompatível**. Descreve tipicamente
uma abordagem contínua de cuidado (ex.: manejo de condição crônica),
não uma intervenção pontual como angioplastia.

**`diagnostic`** — **Incompatível**. Angioplastia é claramente
terapêutica/interventiva, não diagnóstica — não serve para
diagnosticar, serve para tratar uma obstrução vascular já
identificada.

**`other`** — Tecnicamente sempre disponível como fallback genérico,
mas descartaria a informação semântica clara e correta já disponível
no próprio termo — não deve ser usado quando existe correspondência
mais específica e defensável.

## 5. Procedure versus surgery

**Angioplastia pode ser classificada como `procedure` sem
inferência? SIM.** O termo, isoladamente, já denota — por definição
médica padrão amplamente aceita — um procedimento terapêutico
específico (intervenção percutânea/endovascular). É correspondência
direta de vocabulário médico, análoga à classificação de "Joelho"
como `body-region` na P2-040.

**Pode ser classificada como `surgery`?** Tecnicamente possível em
linguagem leiga, mas o domínio já distingue os dois conceitos como
categorias separadas na própria união `CapabilityType`, sinalizando
que essa diferença é semanticamente relevante para o modelo.
Angioplastia, na terminologia técnica médica dominante, é
categorizada como procedimento intervencionista/percutâneo,
tipicamente distinto de "cirurgia" no sentido estrito (que
normalmente implica abordagem aberta/incisão maior). **Não existe
competição semântica real e relevante entre os dois tipos** no
vocabulário médico padrão — `procedure` é a leitura dominante e
praticamente única; `surgery` seria uma leitura leiga imprecisa, não
a terminologia técnica correta. Nenhum contexto clínico adicional
sobre o caso específico do paciente é necessário para decidir entre
os dois.

## 6. Critério objetivo

Um item de `areasDeAtuacao` pode ser classificado como `Capability`
de forma determinística quando:

1. O texto descreve uma ação/capacidade profissional específica (não
   um estado do paciente nem uma especialidade formal).
2. Corresponde diretamente a um único `CapabilityType` da união, sem
   necessidade de inventar uma categoria.
3. Não exige conhecimento do caso clínico específico do paciente.
4. Não existe competição semântica real entre dois tipos candidatos
   na terminologia médica padrão (mesmo que uma leitura leiga
   imprecisa sugira outro tipo).
5. Não depende do nome da especialidade do profissional para ser
   inferido — a classificação deve vir do próprio termo, não de
   contexto externo (ex.: "esse profissional é cardiologista, logo
   deve ser X").

Um item permanece bloqueado quando dois ou mais tipos competem de
forma genuinamente equivalente na terminologia padrão (como "Trauma
esportivo" na P2-040), ou quando o termo é genérico/qualificador em
vez de nomear diretamente uma ação clínica específica.

**Aplicação a "Angioplastia":** satisfaz todos os 5 critérios —
ação profissional específica (1); corresponde a `procedure`
diretamente (2); não depende do caso do paciente (3); sem competição
real entre `procedure`/`surgery` na terminologia padrão, detalhado na
seção 5 (4); a classificação não depende de saber que o profissional
é cardiologista — o termo já basta sozinho (5).

## 7. Estratégias

**A — Mapear para `procedure`:** fidelidade alta (correspondência
direta e correta com a terminologia médica padrão); determinismo
alto (vocabulário, sem inferência); risco baixo; perda semântica
nenhuma; dívida técnica mínima; impacto positivo na migração futura
(segue o mesmo padrão já aprovado para `Condition`).

**B — Mapear para `surgery`:** fidelidade baixa/imprecisa (contraria
a distinção que o próprio domínio já estabelece); determinismo baixo
(dependeria de leitura leiga, não da terminologia técnica); risco de
classificação tecnicamente incorreta; perda semântica real.

**C — Mapear para `other`:** fidelidade baixíssima — descartaria
informação semântica clara e correta já disponível; dívida técnica
alta.

**D — Manter bloqueado:** simplicidade máxima, mas descarta progresso
real e desnecessário para um item que tem, ao contrário de "Trauma
esportivo", classificação clara e defensável.

## 8. Decisão

**1. Angioplastia → procedure**

## 9. Próxima implementação

**SIM** — a próxima tarefa pode integrar `Capability[]` à
`Professional`, seguindo exatamente a mesma sequência já usada para
`Condition` (P2-041 a P2-043):

1. Integrar `Capability[]` à aggregate `Professional` (campo
   opcional, mesmo padrão de `specialties`/`education`/`experience`/
   `conditions`).
2. Mapear apenas "Angioplastia" (único item aprovado nesta auditoria)
   no `LegacyProfessionalMapper`, com tabela fechada e determinística,
   ID no formato `<professionalId>-capability-<slug>`.
3. Projetar `Capability` na `ProfessionalProfileProjection` (novo
   tipo `ProfessionalProfileCapability`, campos mínimos id/name/type).
4. Manter os demais itens ("Trauma esportivo", "Ortopedia geral",
   "Prevenção cardiovascular") no bridge legado, sem alteração.

## 10. Fora de escopo

Nenhum domínio, mapper, aggregate, aplicação, infraestrutura, UI,
mock, Profile Projection ou bridge legado foi criado ou alterado.
Esta tarefa é exclusivamente descritiva.
