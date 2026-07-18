# Modelo de Conhecimento da AliCIA (KB-001)

## 1. Propósito

A Base de Conhecimento da AliCIA organiza **afirmações rastreáveis** sobre
profissionais de saúde. Ela não armazena apenas dados soltos sobre um
médico — ela precisa conseguir explicar, para cada informação exibida, de
onde ela veio, o que a sustenta, se foi verificada e qual é o seu estado
editorial dentro da plataforma.

Este documento não descreve uma implementação de banco de dados, IA,
scraping, painel administrativo ou integração com a interface. Ele
descreve o **modelo conceitual** que qualquer implementação futura desses
mecanismos deverá respeitar.

## 2. Unidade básica de conhecimento

A unidade básica da Base de Conhecimento é uma **afirmação sobre um
sujeito** (neste momento, sempre um `Professional`).

Exemplo conceitual:

```
Sujeito:        Professional med-001
Predicado:      education
Objeto/conteúdo: "Residência em Ortopedia na Instituição X"
Fonte:          Página oficial da instituição
Evidência:      Trecho ou documento que sustenta a afirmação
Verificação:    Resultado e método da revisão
Estado editorial: draft / under-review / published / rejected / archived / outdated
```

Esta tarefa **não** adota RDF, grafo semântico ou ontologia formal. O
modelo é deliberadamente simples: uma afirmação é um registro plano com
referências por identificador, não um nó de grafo com predicados
dinâmicos.

## 3. Separação conceitual

| Conceito | Definição |
|---|---|
| **Entidade** | Conceito do mundo real, como `Professional` ou `Institution`. Já modelada em `domain/professional/`. |
| **Afirmação** (`KnowledgeClaim`) | Informação declarada sobre uma entidade — o que este documento introduz. |
| **Fonte** (`Source`) | Origem consultada (site oficial, currículo, publicação, etc.). Já existe em `domain/professional/Source.ts`. |
| **Evidência** (`Evidence`) | Elemento que sustenta a afirmação e aponta para uma fonte por ID. Já existe em `domain/professional/Evidence.ts`. |
| **Verificação** (`Verification`) | Processo que avaliou uma evidência. Já existe em `domain/professional/Verification.ts`. |
| **Estado editorial** (`EditorialStatus`) | Situação da afirmação dentro da AliCIA. Já existe em `domain/professional/EditorialStatus.ts`. |

`Source`, `Evidence`, `Verification` e `EditorialStatus` já foram
implementadas isoladamente na Fundação do Domínio (DOM-006), mas nunca
foram conectadas a nada — elas existiam sem um conceito que as unisse a
um profissional e a um tipo de informação. `KnowledgeClaim` é esse elo.

## 4. Categorias iniciais de afirmação

```ts
export type KnowledgeClaimType =
  | "identity"
  | "registration"
  | "specialty"
  | "credential"
  | "education"
  | "experience"
  | "institution-affiliation"
  | "practice-location"
  | "capability"
  | "other";
```

Esta união fechada cobre integralmente os dados encontrados na auditoria
(seção 7 abaixo): identidade, especialidade, formação, experiência,
instituição e áreas de atuação. Nenhuma categoria adicional foi
necessária — a auditoria não revelou dado algum que não coubesse em uma
destas dez categorias (incluindo `"other"` como escape).

## 5. Ciclo editorial inicial

Fluxo principal (documentado, **não implementado como máquina de
estados** nesta tarefa):

```
draft → under-review → published
```

Estados excepcionais, alcançáveis a partir de qualquer ponto do fluxo
principal:

- `rejected` — a afirmação foi avaliada e recusada.
- `archived` — a afirmação deixou de ser relevante, sem ter sido refutada.
- `outdated` — a afirmação foi substituída por informação mais recente.

Nenhuma transição automática, permissão editorial ou workflow de
aprovação é definida aqui. `EditorialStatus.create()` já permite criar
qualquer um desses seis valores diretamente, sem validar a transição a
partir de qual estado anterior — isso é proposital nesta etapa.

## 6. Rastreabilidade

Uma afirmação (`KnowledgeClaim`) aponta para outras peças **somente por
identificador**, nunca por instância direta:

- `professionalId: string` — para qual profissional a afirmação se refere.
- `evidenceIds?: readonly string[]` — quais evidências a sustentam (zero
  ou mais).
- `verificationId?: string` — qual verificação avaliou essa afirmação
  (no máximo uma, nesta versão do modelo).
- `editorialStatus: EditorialStatus` — este é o único caso em que a
  afirmação recebe uma **instância** (não um ID), porque o estado
  editorial pertence semanticamente à própria afirmação, e não é uma
  entidade independente referenciável por outras afirmações.

Nenhuma validação de que esses IDs realmente existem é feita pelo
domínio — isso é responsabilidade de uma futura camada de aplicação ou
repositório, assim como já ocorre com `Evidence.sourceId` e
`Verification.evidenceId`.

## 7. Dados atuais versus modelo futuro

Auditoria de `types/alicia/medico.ts`, `types/alicia/trajetoria-medica.ts`,
`mocks/alicia/medicos.ts` e `services/alicia/medicos.ts`:

| Campo atual (`Medico` e tipos relacionados) | Conceito do domínio | Tipo de afirmação | Fonte disponível? | Evidência disponível? | Lacuna |
|---|---|---|---|---|---|
| `nome`, `fotoUrl` | `Identity` | `identity` | Não | Não | Nenhum campo aponta para de onde veio o nome ou a foto |
| `especialidadeId` | `Specialty` (ainda como string solta) | `specialty` | Não | Não | `especialidadeId` não é uma instância de `Specialty`; é uma string livre usada como chave de busca |
| `formacoes[]` (`FormacaoAcademica`) | `Education` | `education` | Não | Não | `verificado` é um booleano solto por item, sem `Source`/`Evidence`/`Verification` reais por trás |
| `experiencias[]` (`ExperienciaProfissional`) | `Experience` | `experience` | Não | Não | Datas são `anoInicio`/`anoConclusao` (number), incompatíveis com `Experience.startDate`/`endDate` (Date) |
| `instituicaoPrincipal`, `formacoes[].instituicao`, `experiencias[].instituicao` | `Institution` (ainda como string solta) | `institution-affiliation` | Não | Não | Nomes de instituição são texto livre, nunca uma instância de `Institution` |
| `areasDeAtuacao[]` | `Capability` (ainda como string solta) | `capability` | Não | Não | Strings livres, sem tipo, nível ou normalização |
| `verificado` (booleano geral em `Medico`) | `EditorialStatus` (aproximação) | qualquer tipo | Não | Não | Um único booleano não distingue "nunca verificado" de "verificado e depois desatualizado"; não há data nem motivo |
| `verificacoes[]` (`VerificacaoMedico`) | `Verification` (aproximação textual) | qualquer tipo | Não | Não | `descricao` é texto livre explicando o status; não referencia nenhuma `Evidence` ou `Source` real |
| `formacaoResumo`, `bioCurta` | Nenhum (texto de apresentação) | `other` (se necessário) | Não | Não | Texto de resumo/marketing, não uma afirmação estruturada individual |
| `estadoSigla`, `cidade` | `PracticeLocation` (parcial) | `practice-location` | Não | Não | Sem endereço, coordenadas ou nome de local — apenas estado/cidade soltos |
| `MetodologiaAliCIA` (mock/service separado) | Nenhum — é conteúdo institucional estático, não uma afirmação sobre um profissional específico | — | — | — | Fora do escopo de `KnowledgeClaim`; não descreve nenhum `professionalId` |

**Conclusão da auditoria:** nenhum dado atual possui fonte, evidência ou
verificação estruturada e rastreável por ID. Todos os "sinais de
confiança" hoje são booleanos soltos (`verificado`) ou texto livre
(`descricao`). Isso não impede a implementação do modelo — pelo
contrário, é exatamente a lacuna que `KnowledgeClaim` (combinado com
`Source`, `Evidence`, `Verification`, já existentes) foi desenhado para
preencher no futuro. Nenhuma migração de dado real é feita nesta tarefa.

## 8. Invariantes iniciais

As invariantes abaixo são **documentadas** aqui; a coluna "Implementada"
indica quais delas já são impostas por `KnowledgeClaim.create()` nesta
mesma tarefa.

| Invariante | Implementada nesta tarefa? |
|---|---|
| Toda afirmação possui ID | Sim |
| Toda afirmação possui `professionalId` | Sim |
| Toda afirmação possui tipo (`KnowledgeClaimType`) | Sim |
| Toda afirmação possui conteúdo não vazio | Sim |
| Uma afirmação publicada deve possuir ao menos uma evidência | Sim |
| IDs de evidência não podem se repetir | Sim |
| Datas não podem ser inválidas | Sim |
| Datas não podem estar no futuro | Sim |
| `updatedAt` não pode anteceder `createdAt` | Sim |
| Criação e atualização devem ser rastreáveis (`createdAt`/`updatedAt`) | Sim (campos presentes e validados) |
| Ausência de comprovação não pode ser apresentada como verificação positiva | Documentada, não codificável como regra única — decorre da combinação de `evidenceIds` vazio + `editorialStatus` diferente de `published` já ser suficiente nesta versão; nenhuma lógica adicional de "confiança calculada" foi criada |
| Existência real dos IDs referenciados (`professionalId`, `evidenceIds`, `verificationId`) | Não — documentada como responsabilidade de uma futura camada de aplicação/repositório, não do domínio |
| Compatibilidade entre `type` e `content` | Não — fora do escopo desta tarefa |

## 9. Fora do escopo

Explicitamente não tratados neste documento nem na implementação
associada:

- banco de dados;
- grafo ou modelo de grafo;
- RDF;
- ontologia médica;
- IA;
- scraping;
- recomendação;
- ranking;
- confiança calculada;
- painel administrativo;
- autenticação;
- workflow automatizado ou máquina de estados editorial.
