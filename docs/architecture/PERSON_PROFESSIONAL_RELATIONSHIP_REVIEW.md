# Auditoria: Relação entre Person e Professional (P2-005)

## 1. Escopo

Esta auditoria cobre exclusivamente:

- `domain/person/` (Person, PersonRepository)
- `domain/professional/` (Professional, Identity, Registration e seu repositório)
- `infrastructure/alicia/person/` e `infrastructure/alicia/professional/`
- `application/alicia/person/` e os casos de uso de `application/alicia/knowledge/`
  que dependem de `professionalId`

Nenhuma alteração de código foi feita. Esta é uma análise puramente
arquitetural, baseada na leitura integral do código real listado acima
e em buscas textuais por `Person`, `Professional`, `Identity`,
`professionalId`, `personId`, `fullName`, `preferredName` e `birthDate`
em `domain/`, `application/`, `infrastructure/`, `mocks/` e `services/`.

## 2. Estado atual

**Person** (`domain/person/Person.ts`): entidade com `id`, `fullName`
obrigatórios; `createdAt`/`updatedAt` obrigatórios e validados
(`updatedAt >= createdAt`); `preferredName` e `birthDate` opcionais.
Repositório com apenas `findById`/`save`. Um caso de uso de criação
(`CreatePerson`) e um de leitura (`GetPersonById`). Um adapter em
memória (`InMemoryPersonRepository`, usando `Map`).

**Busca de referências reais**: `Person` (o tipo/classe) **não é
importado ou referenciado em nenhum arquivo fora de
`domain/person/`, `application/alicia/person/` e
`infrastructure/alicia/person/`**. Nenhuma ocorrência de `personId` foi
encontrada em todo o projeto. Ou seja: **Person não tem nenhum
consumidor real hoje** — nenhum caso de uso do Knowledge Core, nenhum
mapper, nenhum mock, nenhum service o referencia.

**Professional** (`domain/professional/Professional.ts`): aggregate
root com `id`, `identity: Identity` (obrigatória) e
`registrations: Registration[]` (imutável, com verificação de
duplicidade por `council+number+state`). `professionalId` aparece em
9 arquivos (KnowledgeClaim, seu repositório, 5 casos de uso do
Knowledge Core e o adapter em memória de claims) — é o identificador
usado em todo o Knowledge Core.

**Identity** (`domain/professional/Identity.ts`): Value Object sem
`id` próprio, sem timestamps, sempre criado junto com um Professional
(nunca isoladamente) — campos: `fullName` (obrigatório),
`professionalName?`, `photoUrl?`, `languages: string[]` (deduplicado,
imutável). É instanciada em exatamente um lugar do projeto:
`LegacyProfessionalMapper.toDomain()`.

**Mapper e adapter de Professional**: `LegacyProfessionalMapper`
converte o tipo legado `Medico` em `Professional`, criando uma
`Identity` a partir de `nome`/`fotoUrl` e **nunca criando nenhuma
`Registration`**, porque os mocks atuais não têm dados de registro
profissional. `MockProfessionalRepository` é um array em memória
padrão. `createMockProfessionalRepository()` é o único ponto de
composição, lendo diretamente `mocks/alicia/medicos.ts`.

## 3. Matriz de responsabilidades

| Campo/responsabilidade | Person | Identity | Professional | Sobreposição | Observação |
|---|---|---|---|---|---|
| ID | `id: string` | — (VO sem id) | `id: string` | POTENCIAL | Nenhum campo no código liga `Person.id` a `Professional.id` — a sobreposição é apenas conceitual (ambos identificam "alguém") |
| Nome completo | `fullName` (obrigatório) | `fullName` (obrigatório) | via `identity.fullName` | REAL | Mesma regra de validação (trim + rejeição de vazio) implementada duas vezes, em dois arquivos distintos |
| Nome preferido | `preferredName?` | `professionalName?` | via `identity.professionalName` | POTENCIAL | Semanticamente próximos, mas não idênticos: um é preferência pessoal informal, o outro é nome de apresentação profissional pública |
| Data de nascimento | `birthDate?` | — | — | NENHUMA | Exclusivo de Person |
| Foto / idiomas | — | `photoUrl?`, `languages` | via `identity` | NENHUMA | Exclusivo de Identity |
| Registro profissional | — | — | `registrations: Registration[]` | NENHUMA | Exclusivo de Professional |
| Especialidade, credencial, formação, experiência, instituição, local de atuação | — | — | Classes isoladas existem em `domain/professional/` (Specialty, Credential, Education, Experience, Institution, PracticeLocation), mas **nenhuma está integrada a Professional** | NENHUMA | Fora do escopo desta auditoria; mencionado apenas para registrar que a composição completa de Professional ainda não existe |
| Dados de contato (e-mail, telefone, endereço) | — | — | — | NENHUMA | Não existem em nenhum dos três |
| Criação/atualização (`createdAt`/`updatedAt`) | Obrigatórios, validados | — | — | NENHUMA | Só Person rastreia essas datas |
| Sujeito das KnowledgeClaims | Nunca referenciado | — | `professionalId` aponta sempre para `Professional.id` | NENHUMA (hoje) | Confirmado via leitura de `CreateKnowledgeClaim`, `GetPublishedKnowledgeClaimsByProfessional` e `GetPublishedKnowledgeTraceByProfessional`: todos resolvem `professionalId` contra `ProfessionalRepository.findById()` |

## 4. Sobreposições encontradas

1. **`fullName` (Person vs. Identity) — REAL.** Mesma responsabilidade
   semântica (nome completo de uma pessoa), mesma regra de validação,
   implementada de forma independente em dois arquivos.
2. **`preferredName` vs. `professionalName` — POTENCIAL.** Aparentam
   servir propósitos próximos, mas não são a mesma coisa: um é
   preferência pessoal, o outro é apresentação profissional pública.
   Não há evidência de que um deveria substituir o outro.
3. **`id` (Person.id vs. Professional.id) — POTENCIAL.** Sobreposição
   puramente conceitual; nenhuma relação estrutural existe no código.

Nenhuma outra sobreposição foi encontrada — os demais campos e
responsabilidades de Professional (registro, e futuramente
especialidade/credencial/formação/experiência) não têm equivalente em
Person, e vice-versa (data de nascimento não tem equivalente em
Professional/Identity).

## 5. Análise semântica

**Person** representa, hoje, uma **identidade civil mínima ainda sem
uso concreto**. O conjunto de campos (nome, data de nascimento,
timestamps) é compatível com "pessoa física genérica", mas a ausência
total de consumidores confirma que ela foi construída como fundação
para papéis futuros (conforme o próprio objetivo declarado na P2-001:
"raiz de identidade para todos os demais domínios"), não como algo já
em uso.

**Identity** representa o **nome e a apresentação pública do
profissional** — é um Value Object de Professional, não uma entidade
independente e não um substituto parcial de Person. Ela não tem ciclo
de vida próprio (sem id, sem timestamps) e só existe encapsulada
dentro de um Professional.

**Professional** representa, hoje, **uma pessoa com atributos
profissionais tratada como aggregate root independente**, compondo
identidade (via Identity) e o início de uma carreira (via
Registration), sem nenhuma decomposição entre "a pessoa" e "o papel
profissional".

## 6. Alternativas avaliadas

**Alternativa A — Professional referencia Person (`personId`)**
Benefício: normalizaria identidade civil vs. papel profissional,
preparando o terreno para outros papéis (paciente, curador)
compartilharem a mesma pessoa. Custo: quebraria a assinatura pública
atual de `Professional.create()` (campo novo obrigatório);
`LegacyProfessionalMapper` deixaria de ser um método estático puro e
passaria a depender de um `PersonRepository` para criar/buscar a
Person correspondente a cada `Medico` — mudança arquitetural não
trivial. Impacto no Knowledge Core: nenhum imediato (`professionalId`
continuaria existindo). Risco de migração: médio-alto para um
benefício hoje hipotético. Necessidade atual: baixa — não existe
nenhum segundo papel implementado que precise compartilhar identidade.

**Alternativa B — Professional contém Identity e permanece
independente (status quo)**
Por que manter ambos: Person fica disponível para futuros papéis
(Paciente, Curador, Organização) sem forçar uma migração prematura de
Professional. Risco de duplicação: existe apenas na forma
(`fullName` duplicado conceitualmente), não no dado real — hoje nenhum
valor é sincronizado entre os dois, porque nenhuma Person real chega a
ser criada a partir de um Professional. Custo de sincronização futura:
adiável até existir um segundo consumidor real de Person.

**Alternativa C — Identity passa a referenciar ou derivar de Person**
Semanticamente questionável: Identity é um Value Object deliberadamente
isolado (sem id, sem ciclo de vida próprio); fazê-lo depender de uma
entidade com id e persistência própria (Person) misturaria os dois
padrões de design já estabelecidos no domínio (VOs não referenciam
entidades por ID neste projeto). Criaria acoplamento desnecessário e
exigiria que uma Person existisse antes de qualquer Identity poder ser
criada — hoje não é assim. Mesmo custo de mapper da Alternativa A, sem
o benefício de Professional ganhar uma referência direta e explícita.

**Alternativa D — Remover ou suspender Person**
Person foi criada sem consumidor real hoje (confirmado pela busca),
mas isso não indica que foi criada por engano — foi construída
deliberadamente como fundação para papéis futuros ainda não
implementados (Paciente, Curador, etc. — explicitamente citados como
fora de escopo da P2-001). O custo de manter 8 arquivos pequenos,
coesos e sem acoplamento a mais nada é próximo de zero. Removê-la
agora seria prematuro e descartaria trabalho já revisado (P2-001 a
P2-004) sem nenhum ganho real, já que ela não interfere em nada do
Knowledge Core ou de Professional. A opção correta dentro desta
alternativa é "preservar sem evolução até existir um caso concreto",
não remover.

## 7. Impacto no Knowledge Core

Nenhuma das quatro alternativas, se adotada agora, exigiria alterar
`KnowledgeClaim`, seus repositórios ou os casos de uso de consulta
publicada — nenhum deles referencia `Person` hoje, e `professionalId`
já é resolvido inteiramente contra `ProfessionalRepository`.
Confirmado por leitura: `CreateKnowledgeClaim`,
`GetPublishedKnowledgeClaimsByProfessional` e
`GetPublishedKnowledgeTraceByProfessional` chamam sempre
`professionalRepository.findById(professionalId)` — ou seja,
`professionalId` identifica inequivocamente a aggregate **Professional**
por seu `id`, não uma "pessoa humana" em abstrato nem um "perfil
público" separado. Uma futura integração (Alternativa A) só afetaria
o Knowledge Core se uma tarefa posterior decidisse explicitamente
adicionar rastreamento por `personId` às claims — o que não está
sendo proposto aqui.

## 8. Decisão recomendada

**2. MANTER SEPARADOS COM FRONTEIRA EXPLÍCITA**

Justificativa: não existe hoje nenhum segundo consumidor real de
Person que justifique integração agora (Alternativa A ou C seriam
engenharia especulativa); Person não está com problema algum que
justifique suspensão ou remoção (Alternativa D seria descartar
trabalho válido sem motivo técnico); e o princípio de menor mudança
aplicado ao estágio atual do projeto (foco em médicos e trajetória
acadêmica via Professional/Knowledge Core) favorece manter as duas
fundações desacopladas até que um caso de uso concreto (ex.: um
domínio Paciente real) precise compartilhar identidade civil com
Professional.

Fronteira explícita proposta: Person é a raiz de identidade civil
reservada para papéis ainda não implementados (Paciente, Curador,
Organização-como-pessoa, etc.); Professional permanece independente e
autocontido (com sua própria Identity como Value Object) até que um
segundo consumidor real de Person exista — momento em que uma tarefa
de integração dedicada deverá reavaliar concretamente a Alternativa A.

## 9. Consequências

**O que muda:** nada no código. Esta tarefa é somente diagnóstica.

**O que não muda:** Person, Professional, Identity, Registration,
ProfessionalRepository, PersonRepository, o Knowledge Core e todos os
casos de uso existentes permanecem exatamente como estão.

**O que fica adiado:** qualquer decisão de vincular Person a
Professional (ou a qualquer outro domínio) até que exista um segundo
domínio real (por exemplo, Paciente) que precise compartilhar
identidade civil. Também fica adiada qualquer tentativa de unificar
`preferredName`/`professionalName` ou de decompor Professional em
identidade civil + papel profissional.

## 10. Próxima tarefa recomendada

Não implementar Person/Professional juntos ainda. A próxima tarefa
recomendada é iniciar um domínio consumidor real de Person (por
exemplo, a fundação do domínio Patient/Paciente), o que fornecerá o
primeiro caso concreto para validar se Person, como está modelada
hoje, atende a um segundo papel sem necessidade de mudança — só então
uma decisão de integração com Professional deixaria de ser
especulativa.
