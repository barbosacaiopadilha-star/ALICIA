# Auditoria de Prontidão: Professional para o MVP Regional (P2-006)

## 1. Escopo

Auditoria exclusivamente de leitura sobre `domain/professional/` (as 11
entidades, o repositório e o barrel), `infrastructure/alicia/professional/`
(mapper e adapters), `domain/knowledge/KnowledgeClaim.ts` e os três casos
de uso do Knowledge Core que dependem de `professionalId`. Nenhuma
alteração de código foi feita.

## 2. Objetivo do MVP regional

Catálogo público qualificado de médicos no Espírito Santo, sem
cadastro/adesão do médico, sem contratação pela plataforma, sem
agendamento, sem prontuário, sem paciente — apenas mapa, lista,
filtros, perfil público e trajetória acadêmica, com dados atualizados
futuramente por processos assistidos por IA.

## 3. Aggregate Professional atual

```ts
export interface ProfessionalProps {
  id: string;
  identity: Identity;
  registrations?: Registration[];
}

export class Professional {
  readonly id: string;
  readonly identity: Identity;
  get registrations(): ReadonlyArray<Registration>;
  static create(props: ProfessionalProps): Professional;
}
```

A aggregate hoje só compõe **dois** conceitos: `Identity` (nome,
nome profissional, foto, idiomas — Value Object) e `Registration[]`
(registro profissional — coleção imutável, com verificação de
duplicidade por `council+number+state`). Nenhum outro conceito do
domínio profissional está referenciado dentro de `Professional.ts`.

## 4. Matriz de integração

| Conceito | Entidade existe | Integrado a Professional | Usado pelo mapper | Usado pelo repositório | Usado pelo Knowledge Core | Estado |
|---|---|---|---|---|---|---|
| Identity | Sim | Sim | Sim (parcial: só `fullName`/`photoUrl`) | Não diretamente | Não | INTEGRADO |
| Registration | Sim | Sim | Não (nunca criada — sem dado legado de CRM/UF) | Não | Não | INTEGRADO (vazio na prática) |
| Specialty | Sim | Não | Não | Não | Não (mas `KnowledgeClaimType` já tem `"specialty"`) | EXISTE MAS NÃO INTEGRADO |
| Credential | Sim | Não | Não | Não | Não (mas `KnowledgeClaimType` já tem `"credential"`) | EXISTE MAS NÃO INTEGRADO |
| Education | Sim | Não | Não | Não | Não (mas `KnowledgeClaimType` já tem `"education"`) | EXISTE MAS NÃO INTEGRADO |
| Experience | Sim | Não | Não | Não | Não (mas `KnowledgeClaimType` já tem `"experience"`) | EXISTE MAS NÃO INTEGRADO |
| Institution | Sim | Não | Não | Não | Não (mas `KnowledgeClaimType` já tem `"institution-affiliation"`) | EXISTE MAS NÃO INTEGRADO |
| PracticeLocation | Sim | Não | Não | Não | Não (mas `KnowledgeClaimType` já tem `"practice-location"`) | EXISTE MAS NÃO INTEGRADO |
| ConsultationMode | Sim | Não | Não | Não | Não | EXISTE MAS NÃO INTEGRADO |
| Language | Sim | Não | Não | Não | Não | EXISTE MAS NÃO INTEGRADO |
| Capability | Sim | Não | Não | Não | Não (mas `KnowledgeClaimType` já tem `"capability"`) | EXISTE MAS NÃO INTEGRADO |

Confirmado por busca textual: nenhuma dessas 9 classes (todas exceto
Identity/Registration) é referenciada em nenhum outro arquivo do
projeto além do seu próprio arquivo e do barrel `domain/professional/index.ts`.

## 5. Matriz do MVP regional

| Capacidade | Representação atual | Suficiente para MVP | Lacuna | Bloqueante |
|---|---|---|---|---|
| ID | `Professional.id` | Sim | — | — |
| Nome completo | `Identity.fullName` | Sim | — | — |
| Nome profissional | `Identity.professionalName` | Estruturalmente sim | Mapper nunca popula | Não |
| Foto | `Identity.photoUrl` | Estruturalmente sim | Nenhum mock tem `fotoUrl` preenchido | Não |
| Idiomas | `Identity.languages` | Estruturalmente sim | Mapper nunca popula | Não |
| CRM / UF / status / última verificação | `Registration` | Modelo pronto, dado ausente | Nenhuma Registration existe hoje | Sim, para elegibilidade |
| Especialidade principal/adicional | `Specialty` (isolada) | Não | Não integrada a Professional | Sim, para filtros |
| RQE | Não existe em nenhum lugar do código | — | Ausência total (não inventado) | Não é bloqueante — nunca foi solicitado |
| Formação (graduação/residência/fellowship/especialização) | `Education` (isolada) | Não | Não integrada; datas são `number` (ano), não `Date` | Sim, para perfil/trajetória |
| Títulos/certificações | `Credential` (isolada) | Não | Não integrada | Sim, para perfil |
| Fontes e evidências da formação | `Source`/`Evidence`/`Verification` + `KnowledgeClaim` | Sim, o Knowledge Core já suporta isso | Só falta ligar Education/Credential como conteúdo de claims | Não — já pronto |
| Estado/cidade | `PracticeLocation` (isolada) | Não | Não integrada; legado descarta `estadoSigla`/`cidade` | Sim, para mapa |
| Endereço/CEP | `PracticeLocation` (isolada) | Não | Nunca populado em nenhum lugar | Sim, para mapa |
| Latitude/longitude | `PracticeLocation` (isolada) | Não | Nenhuma instância criada em todo o projeto | Sim, para mapa |
| Presencial/telemedicina | `ConsultationMode` (isolada) | Não | Não associada a Professional/PracticeLocation | Não — evolução futura |
| Contato público (telefone/e-mail/WhatsApp) | Inexistente | Não | Nenhum campo em nenhuma entidade | Não — fora do escopo do MVP conforme descrito |
| Site | `Institution.websiteUrl`, `Source.url` | Parcial | Nenhum vinculado ao médico/local diretamente | Não |
| Elegibilidade para o mapa | Inexistente | Não | Nenhum conceito, campo ou caso de uso | Sim |
| Perfil/mapa/lista/filtros/trajetória (UI) | Servidos hoje por `types/alicia`/`mocks/alicia`/`services/alicia`, não pelo novo domínio | Parcial | A UI atual não consome `domain/professional` nem `domain/knowledge` | Sim, para qualquer exibição real do novo modelo |

## 6. Localização e mapa

`PracticeLocation` possui `state`, `city`, `addressLine`, `postalCode`,
`latitude`, `longitude` — todos validados (state/countryCode com 2
letras; latitude entre -90/90; longitude entre -180/180). Porém:

1. **Coordenadas já existem?** Estruturalmente sim (campos validados),
   mas **nenhuma instância de `PracticeLocation` é criada em qualquer
   lugar do código** — confirmado por busca: os únicos usos de
   `latitude`/`longitude`/`city`/`state` (neste contexto) estão dentro
   do próprio arquivo `PracticeLocation.ts`.
2. **Múltiplos locais por médico?** Não é possível avaliar — não há
   nenhuma relação (array, campo, repositório) entre `PracticeLocation`
   e `Professional` hoje.
3. **Local ligado à aggregate?** Não.
4. **Filtrar apenas Espírito Santo?** O campo `state` aceita qualquer
   string de 2 letras (ex.: "ES"), então o modelo comporta isso, mas
   sem integração e sem dados populados não há o que filtrar hoje.
5. **Determinar proximidade?** Não — sem coordenadas reais, nenhum
   cálculo de distância é possível.
6. **Geocodificação seria necessária no futuro?** Sim, para converter
   endereços em coordenadas quando dados de endereço público existirem
   (não implementada, nem deveria ser nesta tarefa).

## 7. Formação e trajetória acadêmica

`EducationType` já distingue `undergraduate`, `residency`,
`specialization`, `fellowship`, `masters`, `doctorate`,
`postdoctorate` e `other` — cobre exatamente as categorias citadas no
prompt (graduação, residência, fellowship, especialização), mais
mestrado/doutorado. Título de sociedade mapeia melhor para
`CredentialType` (`specialist-title`, `board-certification`,
`membership`), que também já existe isoladamente.

- `Education` possui tipo? Sim.
- Possui instituição? Sim, como `institutionName` (string solta —
  não referencia `Institution` por ID).
- Possui período? Sim, como `startYear`/`endYear` (`number`, não
  `Date`).
- Possui conclusão? Sim (`completed?: boolean`).
- Está integrada a Professional? **Não.**
- Permite futura pontuação? Estruturalmente sim (tipo, instituição,
  período e conclusão já são suficientes como insumo), mas nenhum
  score foi criado — corretamente, fora do escopo desta e de qualquer
  tarefa anterior.
- **A Knowledge Base já consegue sustentar evidências dessas
  informações?** **Sim.** `KnowledgeClaimType` já inclui `"education"`,
  `"credential"`, `"experience"` e `"institution-affiliation"` como
  categorias de afirmação rastreável, e `Source`/`Evidence`/
  `Verification` já existem prontos e testados (KB-001 a KB-013).
  A lacuna não é de rastreabilidade — é de **conexão**: falta ligar
  as entidades estruturadas (Education, Credential, etc.) como o
  *conteúdo* real dessas claims, hoje elas ficam soltas.

## 8. Elegibilidade

**Alternativa A — propriedade direta em Professional
(`eligibilityStatus`)**: simples de implementar, mas um booleano/enum
solto sem evidência anexada contradiz o princípio de rastreabilidade
já estabelecido pelo próprio Knowledge Core (`KNOWLEDGE_MODEL.md`:
"ausência de comprovação não pode ser apresentada como verificação
positiva"). Seria uma regressão em relação ao padrão já validado.

**Alternativa B — resultado calculado por caso de uso**: mais alinhado
ao padrão do projeto (casos de uso decidem, entidades não guardam
decisões de negócio prontas), mas hoje não há dados suficientes
(Registration vazia, Education não integrada) para calcular nada de
real — implementar o cálculo agora seria prematuro.

**Alternativa C — KnowledgeClaim publicada**: reaproveita a
infraestrutura já existente e testada; a elegibilidade se torna uma
afirmação auditável, com evidência e verificação obrigatórias para
`published` (regra que a própria entidade `KnowledgeClaim` já impõe).

**Alternativa D — entidade/decisão editorial separada**: redundante
com C, criaria um novo conceito quando `KnowledgeClaim` já cobre
exatamente esse padrão.

**Recomendação: Alternativa C.** É a única que evita um booleano sem
justificativa rastreável (exigência explícita desta auditoria) e não
exige nenhuma estrutura nova — apenas o uso do que já existe. Não deve
ser implementada nesta tarefa.

## 9. Contato público

Busca textual confirma: **nenhuma ocorrência** de `phone`, `email`
(fora de nomes de arquivo/URLs genéricas) ou `whatsapp` em todo o
projeto. `website` existe em `Institution.websiteUrl` (dado da
instituição) e `Source.url` (dado da fonte de conhecimento, não do
médico) — nenhum dos dois é "contato do médico" ou "contato do
consultório".

Fronteira recomendada (sem implementar): contato público, quando
existir, deveria pertencer a `PracticeLocation` (contato do local de
atendimento) e/ou a uma futura extensão de `Institution` (contato
institucional) — não a `Identity`, que é sobre nome/apresentação, para
preservar a separação já estabelecida entre "quem é" e "onde atende".

## 10. Mapper e mocks

`LegacyProfessionalMapper.toDomain()` hoje só mapeia:
`Medico.id → Professional.id`, `Medico.nome → Identity.fullName`,
`Medico.fotoUrl → Identity.photoUrl` (nunca preenchido em nenhum mock).

**Dados legados descartados pelo mapper:** `especialidadeId`,
`estadoSigla`, `cidade`, `instituicaoPrincipal`, `formacaoResumo`,
`bioCurta`, `formacoes[]`, `experiencias[]`, `verificacoes[]`,
`areasDeAtuacao`, `slug`, `verificado` — ou seja, praticamente todo o
conteúdo qualificado que já existe no mock legado é ignorado pela
ponte atual com o novo domínio.

**Nenhuma das 9 entidades auxiliares é populada** por nenhum dado
legado hoje.

O mapper é intencionalmente temporário e já documenta essa limitação
no próprio código-fonte (comentário: mocks atuais não têm
council/number/state/status). Ele não *bloqueia* a evolução da
aggregate — mas qualquer novo campo obrigatório introduzido na
aggregate quebraria sua compilação até ser atualizado; campos
opcionais não quebrariam.

**Os mocks atuais são suficientes para testar o MVP regional?**
Parcialmente. `cidade`/`estadoSigla`/`especialidadeId`/
`instituicaoPrincipal`/`formacoes`/`experiencias` já existem como
texto livre no mock legado — suficientes para uma listagem textual
básica — mas nada disso é estruturado nas novas entidades, e não há
coordenadas, contato ou dados de registro (CRM) em lugar nenhum. Não
bastam para mapa, elegibilidade real ou filtro estruturado por
`Specialty.normalizedName`.

## 11. Lacunas classificadas

1. Ausência de coordenadas reais em qualquer dado — **BLOQUEANTE PARA MAPA**
2. `PracticeLocation` não integrada a `Professional` — **BLOQUEANTE PARA MAPA**, **BLOQUEANTE PARA FILTROS**
3. Nenhuma `Registration` populada (CRM/UF/status) — **BLOQUEANTE PARA ELEGIBILIDADE**
4. `Specialty` não integrada a `Professional` — **BLOQUEANTE PARA FILTROS** (estruturados); **NÃO BLOQUEANTE PARA MVP** enquanto a UI usar o pipeline legado (`especialidadeId` em `Medico`)
5. `Education`/`Credential`/`Experience`/`Institution` não integradas — **BLOQUEANTE PARA PERFIL** (se migrar para o novo domínio); **NÃO BLOQUEANTE PARA MVP** enquanto o perfil continuar servido pelo pipeline legado
6. Nenhum dado de contato público em nenhuma entidade — **NÃO BLOQUEANTE PARA MVP** (não faz parte do objetivo descrito); **EVOLUÇÃO FUTURA**
7. Nenhuma política de elegibilidade — **BLOQUEANTE PARA ELEGIBILIDADE**
8. `ConsultationMode` isolada — **EVOLUÇÃO FUTURA**, **NÃO BLOQUEANTE PARA MVP**
9. `Language` isolada — **EVOLUÇÃO FUTURA**, **NÃO BLOQUEANTE PARA MVP**
10. RQE inexistente — **NÃO BLOQUEANTE PARA MVP** (nunca solicitado, não inventado); **EVOLUÇÃO FUTURA**
11. Novo domínio (`domain/professional`, `domain/knowledge`) totalmente desconectado da UI atual (`app/alicia/*` usa `types/alicia`/`mocks/alicia`/`services/alicia`) — **BLOQUEANTE PARA PERFIL**, **BLOQUEANTE PARA MAPA**, **BLOQUEANTE PARA FILTROS**

## 12. Decisão recomendada

**3. INTEGRAR PRIMEIRO AS ENTIDADES PROFISSIONAIS JÁ EXISTENTES**

Justificativa: `Education`, `Specialty`, `PracticeLocation`,
`Credential` e `Experience` já existem como classes validadas, testadas
e revisadas (DOM-003/DOM-004) — a lacuna não é falta de modelagem, é
falta de **conexão**. Expandir a aggregate criando campos novos do zero
(Alternativa 1) arrisca duplicar o que já existe ou criar uma "aggregate
gigante" sem necessidade. Criar um modelo de projeção para o catálogo
(Alternativa 2) ou uma política de elegibilidade (Alternativa 4) seriam
prematuros sem primeiro ter dados estruturados reais para projetar ou
decidir sobre. Integrar as entidades já existentes é a menor mudança
segura que desbloqueia diretamente trajetória acadêmica, perfil e a
base para filtros — sem tocar em mapa, elegibilidade ou UI ainda.

## 13. Próxima implementação mínima

Uma tarefa dedicada e isolada para adicionar coleções das entidades já
existentes (por exemplo, `education: Education[]`,
`specialties: Specialty[]`) a `Professional`, sem tocar no mapper, na
elegibilidade, no mapa ou na UI ainda — apenas a expansão mínima da
aggregate para que essas entidades já validadas passem a fazer parte
efetiva de um `Professional`.

## 14. Itens adiados

- Integração de `PracticeLocation` (mapa) — depende de dados de
  coordenadas reais, hoje inexistentes.
- Política de elegibilidade (Alternativa C recomendada, não
  implementada).
- Conexão da UI atual (`app/alicia/*`) com `domain/professional` e
  `domain/knowledge`.
- Qualquer modelagem de contato público.
- `ConsultationMode`, `Language`, RQE — evolução futura, sem urgência
  para o MVP.
- Atualização do `LegacyProfessionalMapper` para popular as novas
  coleções — só faz sentido depois que a aggregate for expandida.
