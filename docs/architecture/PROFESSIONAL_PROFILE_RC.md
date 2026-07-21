# RC — Encerramento Técnico da Migração da Página Pública de Perfil

## 1. Contexto

Após os blocos P2 (P2-007 a P2-051) e as consolidações P2-BLOCO-A
(áreas de atuação) e P2-BLOCO-B (auditoria final dos bridges
restantes), esta tarefa formaliza o encerramento técnico da frente
de migração da página pública de perfil. Auditoria exclusivamente de
leitura — nenhum código foi alterado.

## 2. Estado da migração

Revisão integral confirmada: rota pública
(`app/alicia/[estado]/[especialidade]/[medico]/page.tsx`), os quatro
componentes consumidores (`PerfilMedicoHeader`, `TrajetoriaAcademica`,
`FormacaoItem`, `VerificacoesMedico`), `ProfessionalProfileProjection`,
`BuildProfessionalProfileProjection`, `LegacyProfessionalMapper` e o
domínio (`Professional`, `Specialty`, `Education`, `Experience`,
`PracticeLocation`, `Condition`, `Capability`). Nenhuma migração
técnica pendente foi encontrada além das já documentadas nos blocos
anteriores.

## 3. Funcionalidades migradas

| Funcionalidade | Estado | Fonte atual | Bridge? | Bloqueio |
|---|---|---|---|---|
| Identidade (nome/foto) | Migrado | `ProfessionalProfileProjection.fullName`/`photoUrl` | Não | — |
| Specialties | Migrado | `ProfessionalProfileProjection.specialties` | Não | — |
| Experience | Migrado | `ProfessionalProfileProjection.experience` | Não | — |
| PracticeLocations | Migrado | `ProfessionalProfileProjection.practiceLocations`/`primaryLocation` | Não | — |
| Conditions | Migrado | `ProfessionalProfileProjection.conditions` | Não | — |
| Capabilities | Migrado | `ProfessionalProfileProjection.capabilities` | Não | — |

## 4. Funcionalidades parcialmente migradas

| Funcionalidade | Estado | Fonte atual | Bridge? | Bloqueio |
|---|---|---|---|---|
| Education | Estruturado migrado; cidade/estado/verificado por item residuais | `ProfessionalProfileProjection.education` + bridge por ID | Sim (parcial) | Modelagem (`Education`) + Dados (Knowledge Core) |
| Áreas de atuação | 4 de 6 itens migrados; 2 residuais bloqueados | `conditions`/`capabilities` + legado filtrado | Sim (parcial) | Humano (P2-040/P2-049) |
| Bio | Arquitetura pronta, zero consumidor, zero dado publicado | `legacyProfileBlocks.bioCurta` | Sim | Humano (revisão editorial) |
| Selo verificado | Não migrado | `legacyProfileBlocks.verificado` | Sim | Dados (Knowledge Core) + Humano |
| Verificações | Não migrado | `legacyProfileBlocks.verificacoes` | Sim | Dados (Knowledge Core) + Humano |

## 5. Bloqueios humanos

- Revisão editorial das 2 bios reais (med-001, med-006) antes de
  qualquer publicação via `ProfessionalPublicBiography` (P2-031/P2-038).
- Decisão clínica/editorial sobre "Trauma esportivo" (ambíguo entre
  `Condition: injury` e `Condition: care-need` — P2-040).
- Decisão editorial sobre "Prevenção cardiovascular" (conceito
  composto entre `Capability` e `Condition`, exige decomposição
  editorial — P2-049).
- Decisão de produto sobre manter, migrar ou remover o selo
  `verificado` e `verificacoes[]` enquanto não houver comprovação
  real — decisão de risco reputacional, não técnica.

## 6. Bloqueios técnicos

**De dados:**
- Ausência de qualquer `KnowledgeClaim`/`Evidence`/`Source`/
  `Verification` real criada em qualquer fluxo (`app/`, `components/`,
  `mocks/`, `services/`) — confirmado por busca exaustiva.
- Ausência de qualquer biografia registrada em runtime no repositório
  editorial — `createEditorialApplication()` nunca é chamada por
  nenhum fluxo real.

**De modelagem:**
- `Education` não possui campos de `cidade`/`estado` por item de
  formação (confirmado na entidade real).
- `Education` não possui campo de verificação por item (mesma classe
  de bloqueio do selo geral, mas tecnicamente uma ausência de campo
  na entidade, não apenas ausência de dado externo).

## 7. Código morto

Busca completa realizada em `page.tsx` e nos quatro componentes
consumidores (imports, variáveis locais, tipos, comentários). **Nenhum
código morto encontrado.** Todos os imports, campos e tipos existentes
são efetivamente consumidos — confirmado item a item (inclusive
`FormacaoView`, verificado manualmente após um falso positivo de
busca automática).

## 8. Critérios para reabertura

Esta frente deve ser reaberta exclusivamente quando um dos seguintes
eventos ocorrer — nenhum outro motivo justifica reabertura:

1. População real do Knowledge Core com claims/evidências/verificações
   verdadeiras (reabre selo, verificações e, potencialmente,
   `formacao.verificado`).
2. Revisão editorial humana das bios existentes, com decisão de
   autoria/aprovação (reabre a integração de bio).
3. Decisão humana sobre "Trauma esportivo" (definição do
   `ConditionType`).
4. Decisão humana/editorial sobre "Prevenção cardiovascular"
   (decomposição ou nova modelagem).
5. Nova modelagem de `Education` incorporando cidade/estado por item
   (se a divergência visual atual for considerada inaceitável).

## 9. Conclusão

**2. Frente parcialmente encerrada**

Todo o trabalho tecnicamente executável sem dado real adicional ou
decisão humana/editorial já foi concluído: identidade, especialidade,
localização, experiência e quatro dos seis itens de áreas de atuação
já vêm exclusivamente da nova arquitetura, e nenhum código morto ou
migração técnica esquecida foi encontrado. A frente não pode ser
declarada integralmente encerrada porque itens reais permanecem sem
solução final (bio, selo, verificações, dois itens de áreas de
atuação, metadados residuais de formação) — mas nenhum deles depende
de mais trabalho técnico desta frente; todos dependem exclusivamente
dos eventos listados na seção 8.
