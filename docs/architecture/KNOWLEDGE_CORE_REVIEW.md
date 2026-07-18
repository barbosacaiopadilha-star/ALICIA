# Auditoria do Núcleo da Base de Conhecimento (KB-014)

## 1. Escopo auditado

KB-001 — Modelo inicial e KnowledgeClaim
KB-002 — Contratos de repositório
KB-003 — Repositórios em memória
KB-004 — Criar KnowledgeClaim
KB-005 — Adicionar Evidence à claim
KB-006 — Associar Verification à claim
KB-007 — Alterar estado editorial
KB-008 — Consultar rastreabilidade de uma claim
KB-009 — Criar Source
KB-010 — Criar Evidence
KB-011 — Criar Verification
KB-012 — Consultar claims publicadas de um profissional
KB-013 — Consultar rastreabilidade publicada de um profissional

## 2. Arquitetura final

```
domain/
├── professional/            (Fundação do Domínio — anterior à KB-001)
│   ├── Source.ts, Evidence.ts, Verification.ts, EditorialStatus.ts
│   ├── Professional.ts, Identity.ts, Registration.ts, ...
│   └── repositories/ProfessionalRepository.ts
└── knowledge/                (Base de Conhecimento)
    ├── KnowledgeClaim.ts
    ├── index.ts
    └── repositories/
        ├── KnowledgeClaimRepository.ts
        ├── SourceRepository.ts
        ├── EvidenceRepository.ts
        ├── VerificationRepository.ts
        └── index.ts

infrastructure/alicia/knowledge/
├── InMemoryKnowledgeClaimRepository.ts
├── InMemorySourceRepository.ts
├── InMemoryEvidenceRepository.ts
├── InMemoryVerificationRepository.ts
└── index.ts

application/alicia/knowledge/
├── CreateKnowledgeClaim.ts
├── AddEvidenceToKnowledgeClaim.ts
├── AttachVerificationToKnowledgeClaim.ts
├── ChangeKnowledgeClaimEditorialStatus.ts
├── GetKnowledgeClaimTrace.ts
├── CreateSource.ts
├── CreateEvidence.ts
├── CreateVerification.ts
├── GetPublishedKnowledgeClaimsByProfessional.ts
├── GetPublishedKnowledgeTraceByProfessional.ts
└── index.ts
```

Dependências permitidas e confirmadas na auditoria:

```
application  →  domain (contratos + entidades)
infrastructure →  domain (contratos + entidades)
domain       →  nenhuma camada externa
```

Nenhuma violação foi encontrada: `application/` nunca importa
`infrastructure/`; `infrastructure/` nunca importa `application/`;
`domain/` nunca importa `application/` ou `infrastructure/`; nenhum
arquivo do núcleo importa React, Next.js, mocks legados, services
legados, componentes, páginas, banco de dados ou APIs.

## 3. Capacidades disponíveis

O núcleo atual permite:

- criar Source (`CreateSource`);
- criar Evidence associada a uma Source existente (`CreateEvidence`);
- criar Verification associada a uma Evidence existente (`CreateVerification`);
- criar KnowledgeClaim associada a um Professional existente (`CreateKnowledgeClaim`);
- associar uma Evidence existente a uma KnowledgeClaim (`AddEvidenceToKnowledgeClaim`);
- associar uma Verification existente a uma KnowledgeClaim, validando que
  sua evidência já pertence à claim (`AttachVerificationToKnowledgeClaim`);
- alterar o estado editorial de uma KnowledgeClaim, com regra mínima de
  evidência + verificação para publicação (`ChangeKnowledgeClaimEditorialStatus`);
- consultar a rastreabilidade completa de uma claim isolada (`GetKnowledgeClaimTrace`);
- consultar apenas as claims publicadas de um profissional (`GetPublishedKnowledgeClaimsByProfessional`);
- consultar a rastreabilidade completa de todas as claims publicadas de
  um profissional (`GetPublishedKnowledgeTraceByProfessional`).

## 4. Invariantes protegidas

**KnowledgeClaim**: id/professionalId/type/content/editorialStatus
obrigatórios; type restrito a união fechada de 10 valores; evidenceIds
com trim, rejeição de vazio (lança erro), deduplicação por primeira
ocorrência, exposição como `ReadonlyArray` congelada; verificationId
opcional não vazio; createdAt/updatedAt validados (data real, não
futura), com cópia defensiva na entrada e no getter; updatedAt não pode
anteceder createdAt; claim com `editorialStatus.value === "published"`
exige ao menos um evidenceId.

**Source**: id/type/title obrigatórios; type em união fechada de 8
valores; publisher não vazio quando informado; url validada via `URL`
nativa (somente http/https), normalizada com `toString()`; accessedAt
validada e não futura, com cópia defensiva.

**Evidence**: id/sourceId/type/claim obrigatórios (sourceId como string
solta, sem acoplamento a Source); type em união fechada de 6 valores;
excerpt não vazio quando informado; observedAt validada e não futura,
com cópia defensiva.

**Verification**: id/evidenceId/result/method/verifiedAt obrigatórios
(evidenceId como string solta, sem acoplamento a Evidence); result e
method em uniões fechadas; verifiedAt validada e não futura, com cópia
defensiva mesmo sendo campo obrigatório; verifierId/notes não vazios
quando informados.

**EditorialStatus**: value em união fechada de 6 valores, sem default
implícito; changedAt validada e não futura, com cópia defensiva; reason
não vazia quando informada; nenhuma máquina de estados — qualquer valor
válido pode ser criado diretamente.

## 5. Limitações conhecidas

- Nenhuma persistência real — todos os repositórios são em memória e
  perdem o estado ao final do processo.
- Nenhuma transação ou unidade de trabalho — cada `save()` é uma
  operação isolada.
- Apenas um `verificationId` direto por KnowledgeClaim nesta versão do
  modelo (não há coleção de verificações por claim).
- Nenhuma máquina de estados editorial — qualquer transição é permitida
  desde que passe pelas regras mínimas de publicação; não há tabela de
  transições nem histórico de mudanças de estado.
- Nenhuma autenticação, autorização ou noção de curador/usuário.
- As entidades e casos de uso não validam a existência real de IDs
  referenciados fora do próprio agregado consultado (por exemplo,
  `Evidence.sourceId` e `Verification.evidenceId` não são verificados
  contra a existência real da Source/Evidence pelas próprias entidades
  — essa validação vive nos casos de uso de criação, como
  `CreateEvidence` e `CreateVerification`, e não dentro das entidades).
- Ausência total de testes executáveis (nenhuma infraestrutura de teste
  existe no projeto).
- Ausência de validação real de typecheck/lint/build neste ambiente —
  `node_modules` nunca pôde ser instalado (bloqueio de rede do sandbox,
  documentado desde a Etapa RC-02).

## 6. Pendências não bloqueantes (ideias futuras, não implementadas)

- Casos de uso de leitura dedicados para Source e Evidence isoladas
  (hoje só existem via `findById`/`findAll` diretos do repositório, sem
  caso de uso de aplicação próprio).
- Suporte a múltiplas verificações por KnowledgeClaim.
- Máquina de estados editorial explícita com tabela de transições e
  histórico.
- Repositórios reais (banco de dados) implementando os mesmos contratos.
- Validação cruzada de integridade referencial em uma camada de
  aplicação dedicada (hoje distribuída entre os próprios casos de uso).

## 7. Veredito

**APROVADO ARQUITETURALMENTE**

Nenhum defeito de tipagem, assinatura, importação ou comportamento foi
encontrado na auditoria integrada de KB-001 a KB-013. A aprovação é
arquitetural, baseada em revisão estática completa do código real —
não há execução real de typecheck, lint, build ou testes que sustente
uma aprovação "por execução", devido ao bloqueio de ambiente já
documentado.
