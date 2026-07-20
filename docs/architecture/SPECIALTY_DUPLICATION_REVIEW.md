# Duplicidade entre "Ortopedia geral" e Specialty (P2-048)

## 1. Contexto

Auditoria exclusivamente de leitura. Nenhum código foi alterado.
Escopo: o item "Ortopedia geral" de `areasDeAtuacao`, classificado
preliminarmente como categoria A (Specialty) na P2-039, comparado com
`Professional.specialties` (já populada pelo mapper desde a P2-007/008).

## 2. Inventário

| professionalId | slug | specialty existente | valor em areasDeAtuacao |
|---|---|---|---|
| med-001 | ana-martins | "Ortopedia" | "Ortopedia geral" |
| med-002 | carlos-eduardo-lima | "Ortopedia" | "Ortopedia geral" |
| med-003 | patricia-nogueira | "Ortopedia" | (ausente) |
| med-004 | bruno-teixeira | "Cardiologia" | (ausente) |
| med-005 | juliana-castro | "Cardiologia" | (ausente) |
| med-006 | felipe-rocha | "Cardiologia" | (ausente) |
| med-007 | camila-duarte | "Cardiologia" | (ausente) |

Apenas med-001 e med-002 têm "Ortopedia geral" em `areasDeAtuacao`,
ambos com a `Specialty` "Ortopedia" (via `especialidadeId: "ortopedia"`).
Comparação textual exata (sem normalizar, sem remover acentos):
**"Ortopedia" ≠ "Ortopedia geral"** — não são strings idênticas.

## 3. Compatibilidade

**AMBÍGUO**, mais precisamente: representa o **mesmo conceito** de
uma `Specialty` já existente, não uma especialidade nova ou distinta.
"Ortopedia geral" não introduz um segundo fato de especialidade — o
sufixo "geral" qualifica/reforça o mesmo conceito ("atuação
abrangente na especialidade"), não denota uma subespecialidade
formal separada. Criar uma segunda instância de `Specialty` com esse
texto duplicaria a mesma especialidade já mapeada, com um nome
ligeiramente diferente, quebrando a suposição de que cada `Specialty`
representa uma entrada única do catálogo `especialidadesBase`.

## 4. Sobreposição

**Duplicidade parcial.** Não é uma duplicidade textual exata (os
textos diferem: "Ortopedia" vs. "Ortopedia geral"), mas é uma
sobreposição semântica real: para os 2 profissionais afetados, ambos
os registros descrevem a mesma área de prática médica, apenas com
fraseio diferente. Nenhuma informação nova substancial existe em
"Ortopedia geral" que não esteja já capturada por "Ortopedia" como
`Specialty`.

## 5. Impacto da remoção

**NÃO** (substancialmente). A especialidade "Ortopedia" já é exibida
via `specialties` na Profile Projection (e no catálogo, desde a
P2-007/008); remover "Ortopedia geral" de `areasDeAtuacao` não
elimina nenhum fato que não esteja já representado em outro lugar do
mesmo perfil. A única perda seria estilística (uma tag a menos no
bloco de "áreas de atuação"), não uma perda de informação factual.

## 6. Estratégias

**A — Migrar novamente para Specialty:** fidelidade baixa —
duplicaria o mesmo fato do domínio (texto quase idêntico ao já
existente) sem adicionar informação nova; redundância alta;
experiência pública ruim (mostraria "Ortopedia" e "Ortopedia geral"
como se fossem conceitos diferentes).

**B — Descartar por duplicidade:** fidelidade alta (nenhum fato
substancial perdido, já coberto por `Specialty`); redundância
eliminada; custo e dívida técnica baixos; experiência pública neutra
a positiva (remove repetição visual).

**C — Manter no bridge:** simplicidade máxima, mas perpetua
indefinidamente uma redundância já identificada, sem necessidade real.

**D — Criar conceito independente:** desproporcional — criaria uma
nova abstração de domínio só para capturar um qualificador textual
("geral") que não representa nenhum fato novo distinto do que
`Specialty` já expressa.

## 7. Critério reutilizável

Um item legado pode ser removido (não migrado) porque já está
representado por outra entidade do domínio quando:

1. **Equivalência semântica** — o item legado descreve o mesmo fato
   que uma entidade já populada representa, para o mesmo profissional.
2. **Ausência de perda de informação** — remover o item não elimina
   nenhum dado inacessível por outro caminho do mesmo perfil.
3. **Redundância de apresentação, não de fato** — a diferença entre
   os textos é apenas estilística/de fraseio (ex.: sufixo genérico
   como "geral"), não uma distinção factual real (subespecialidade,
   procedimento, condição diferentes).
4. **Ausência de necessidade de contexto adicional** — a equivalência
   é verificável diretamente comparando o texto do item legado com o
   nome da entidade já existente para o mesmo profissional.

## 8. Decisão

**2. Descartar por duplicidade**

Para os 2 profissionais afetados, "Ortopedia geral" não introduz
nenhum fato novo além do que `Specialty("Ortopedia")` já representa —
é redundância textual do mesmo conceito, não uma segunda especialidade
nem subespecialidade formal distinta. Migrá-la duplicaria o mesmo
fato; mantê-la indefinidamente no bridge perpetua uma redundância já
identificada sem necessidade.

## 9. Próxima implementação

**SIM.** `Professional.specialties` já está populada (desde a
P2-007/008) e já projetada em `ProfessionalProfileProjection.specialties`
(existente desde a criação da projeção). Falta apenas a página pública
passar a exibir as especialidades a partir da projeção, em vez de (ou
além de) mostrar "Ortopedia geral" como uma tag solta em "áreas de
atuação" vinda do legado. Quando isso ocorrer, remover "Ortopedia
geral" do bridge não causará nenhuma perda de informação, pois
"Ortopedia" já estará visível via `specialties`.

## 10. Fora de escopo

Nenhum domínio, mapper, aggregate, aplicação, infraestrutura, UI ou
bridge legado foi criado ou alterado. Esta tarefa é exclusivamente
descritiva.
