# Fundação para Dados Geográficos Reais (BLOCO-GEO-V1)

## 1. Situação atual

O BLOCO-MAPA-V1 confirmou que a interface já suporta uma
visualização por cidade (agrupamento sem coordenadas), que a
arquitetura já possui campos opcionais para latitude/longitude, mas
que nenhum dado geográfico real existe — nem nos mocks, nem produzido
pelo mapper. Esta tarefa é exclusivamente de preparação arquitetural:
nenhum mapa, geocodificação, API externa ou coordenada foi
implementado ou inventado.

## 2. Dados disponíveis

Confirmado por leitura direta de `domain/professional/PracticeLocation.ts`,
`application/alicia/catalog/ProfessionalCatalogProjection.ts` e
`application/alicia/profile/ProfessionalProfileProjection.ts`:

- `city` (obrigatório)
- `state` (obrigatório, validado como 2 letras)
- `addressLine?` (opcional, validado como não-vazio quando informado — nunca populado hoje)
- `postalCode?` (opcional, mesma validação — nunca populado)
- `countryCode?` (opcional, validado como 2 letras — nunca populado)
- `latitude?` (opcional, validado como finito e entre -90 e 90 — nunca populado)
- `longitude?` (opcional, validado como finito e entre -180 e 180 — nunca populado)

Todos os campos de coordenada já têm validação de domínio real e já
são propagados até `ProfessionalCatalogProjection.primaryLocation` e
`ProfessionalProfileProjection.primaryLocation` (confirmado em
`BuildProfessionalCatalogProjection.ts`/`BuildProfessionalProfileProjection.ts`)
— a fundação de armazenamento e validação básica já existe.

**Precedente arquitetural relevante:** o Knowledge Core já possui um
modelo de governança de fatos completo — `Source` (`SourceType`:
`official-registry`, `institutional-website`, `document`, etc.) e
`Verification` (`VerificationResult`: `verified`/`partially-verified`/
`not-verified`/`inconclusive`; `VerificationMethod`:
`manual-review`, `official-source-check`, `automated-check`, etc.;
`verifiedAt`; `verifierId?`) — usado hoje para verificar outros fatos
profissionais.

## 3. Dados ausentes

Não existem em nenhuma camada: precisão/exatidão da coordenada
(exata vs. aproximada por cidade), origem da coordenada (manual,
geocodificação, verificação humana), data de verificação específica
da coordenada, status de validação da coordenada (informada vs.
verificada), qualquer vínculo entre uma coordenada e uma
`Source`/`Verification` do Knowledge Core.

## 4. Modelo proposto

**Recomendação central: reutilizar o Knowledge Core já existente
(`Source` + `Evidence` + `Verification`) como camada de governança
geográfica, em vez de criar um sistema de status paralelo dentro de
`PracticeLocation`.** Isso evita duplicar um modelo de confiança que
já existe e já é usado para outros fatos profissionais — consistente
com o princípio de não criar arquitetura nova quando uma já aprovada
resolve o mesmo problema.

Os três estados exigidos por esta tarefa mapeiam diretamente para o
que já existe, sem exigir novos campos em `PracticeLocation` hoje:

1. **Sem coordenadas** — `PracticeLocation.latitude`/`longitude` são
   `undefined` (estado real de 100% dos dados atuais).
2. **Coordenadas informadas** — `latitude`/`longitude` preenchidos,
   mas sem nenhuma `Verification` associada que os confirme — a
   coordenada existe, mas ainda não foi checada por ninguém.
3. **Coordenadas verificadas** — `latitude`/`longitude` preenchidos
   **e** existe uma `Verification` com `result: "verified"`,
   associada a uma `Evidence`/`Source` que comprova especificamente
   essas coordenadas (ex.: `Source.type: "official-registry"` ou
   `"document"`, com `Verification.method: "manual-review"` ou
   `"official-source-check"`).

## 5. Estratégia de validação

A validação estrutural (latitude entre -90/90, longitude entre
-180/180, ambos finitos) **já existe** em `PracticeLocation.create()`
e não precisa de nenhuma alteração — continua sendo a única validação
de FORMATO necessária. A validação de CONFIANÇA (a coordenada está
correta?) não é uma responsabilidade de `PracticeLocation`: pertence
ao Knowledge Core, exatamente como já ocorre para outros fatos
profissionais (uma `Registration`, uma `Specialty`, etc. têm seu
formato validado no domínio, mas sua veracidade é atestada
separadamente por `Verification`). Isso preserva a separação já
estabelecida entre "o dado é bem formado" (domínio) e "o dado é
verdadeiro" (Knowledge Core).

## 6. Estratégia de evolução

Quando dados geográficos reais existirem, a evolução recomendada
(não implementada nesta tarefa) seria, em ordem:
1. Popular `latitude`/`longitude` reais em `PracticeLocation` via
   entrada manual confiável (não geocodificação automática de
   início) — via mapper ou uma fonte de dados real futura.
2. Registrar uma `Source` (ex.: `official-registry` do CRM/CFM, ou
   documento institucional) que comprove o endereço/coordenada.
3. Registrar uma `Evidence` vinculando a `Source` ao fato geográfico.
4. Registrar uma `Verification` (`result: "verified"`) confirmando a
   `Evidence`, com `verifiedAt` e `verifierId` reais.
5. Somente então a UI poderia exibir um selo de "localização
   verificada" — nunca antes, para não repetir o mesmo problema já
   documentado do selo `verificado` sem rastreabilidade
   (RC-PERFIL-01).

Um vínculo formal entre `Verification`/`Evidence` e um fato
geográfico específico (hoje o Knowledge Core não distingue
claramente "verificar uma coordenada" de "verificar uma
especialidade") é uma lacuna real de modelagem — registrada
explicitamente na seção 8, não resolvida aqui.

## 7. Limitações

Nenhum código foi alterado nesta tarefa — o modelo desta seção é uma
proposta documentada, não uma implementação. Não foi criado nenhum
campo novo em `PracticeLocation`, nenhuma migração de mocks, nenhum
mapa, geocodificação ou integração externa. A lacuna sobre como
vincular precisamente uma `Verification` a "as coordenadas desta
`PracticeLocation`" (em vez de a um fato profissional genérico)
permanece em aberto — resolvê-la exigiria uma decisão de modelagem
futura, fora do escopo desta preparação.

## 8. Próximas etapas

1. Decidir formalmente como uma `Verification`/`Evidence` referencia
   um fato geográfico específico (nova tarefa de modelagem, não
   implementada aqui).
2. Somente depois disso, avaliar a primeira fonte real de coordenadas
   (ex.: endereço institucional já conhecido, confirmado
   manualmente) — nunca geocodificação automática como primeira
   fonte de verdade.
3. Somente com coordenadas reais e verificadas, revisitar o
   BLOCO-MAPA-V1 para avaliar uma representação geográfica literal.

## Resposta obrigatória

**A arquitetura está pronta para receber coordenadas reais?**

**SIM**, com uma ressalva importante: a fundação básica (armazenamento
validado de `latitude`/`longitude` em `PracticeLocation`, já
propagado até as duas projections públicas) **já existe** e não
precisa de nenhuma alteração para aceitar coordenadas reais amanhã.
O que ainda **não existe** é a camada de governança de confiança
(distinguir "informada" de "verificada") — esta tarefa **propõe**
reutilizar o Knowledge Core já existente (`Source`/`Evidence`/
`Verification`) para isso, em vez de implementar algo agora. Os dados
reais em si continuam inexistentes, e a lacuna de modelagem sobre como
vincular precisamente uma verificação a um fato geográfico específico
permanece aberta para uma tarefa futura.
