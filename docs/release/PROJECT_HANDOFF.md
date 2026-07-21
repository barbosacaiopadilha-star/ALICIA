# Handoff do Projeto — AliCIA

## Estado atual

A AliCIA (MVP de curadoria médica dentro do repositório
`aliviar-landing`, rotas `/alicia/*`) está **arquiteturalmente
consolidada e tecnicamente validada dentro do possível neste
ambiente de desenvolvimento**. Domínio, catálogo público, perfil
público, descoberta (busca/filtro/ordenação/visualização por cidade),
governança editorial e Knowledge Core estão prontos e cobertos por 31
testes automatizados reais. O **único bloqueio remanescente é
externo**: este ambiente de execução não tem acesso de rede a
`registry.npmjs.org` nem a `github.com` (política de allowlist de
host, confirmada via `x-deny-reason: host_not_allowed`), e o
repositório não tem nenhum remoto Git configurado. Nenhuma dessas
pendências é uma dívida de código — todas dependem exclusivamente de
rodar este mesmo repositório em um ambiente com acesso normal à
internet.

## O que já está concluído

- **Domínio** (`domain/professional/`): `Professional` (aggregate),
  `Identity`, `Registration`, `Specialty`, `Education`, `Experience`,
  `PracticeLocation`, `Condition`, `Capability`, `Source`, `Evidence`,
  `Verification`, `EditorialStatus`. `domain/knowledge/` (`KnowledgeClaim`)
  e `domain/editorial/` (`ProfessionalPublicBiography`).
- **Catálogo público**: `ProfessionalCatalogProjection`,
  `ProfessionalCatalogSource`/`Query`, busca textual (case/accent-
  insensitive, substring), filtro de cidade, ordenação pública
  ("Ordem padrão"/"Nome A–Z"/"Nome Z–A"), visualização "Por cidade"
  (agrupamento geográfico sem coordenadas), persistência em URL
  (`q`/`city`/`sort`/`view`), estados vazios e ação de limpar filtros.
- **Perfil público**: `ProfessionalProfileProjection`,
  `GetProfessionalProfileBySlug`, página individual por slug.
- **Knowledge Core**: domínio, 4 repositórios em memória e 9 casos de
  uso prontos — arquiteturalmente completo, **sem consumidor real e
  sem dado real** (decisão consciente, não lacuna técnica).
- **Governança editorial**: `ProfessionalPublicBiography` + repositório
  + casos de uso (`CreateProfessionalPublicBiography`,
  `GetPublishedProfessionalBiography`) + composição
  (`createEditorialApplication`) — pronta, **sem bio real publicada**
  (aguarda revisão editorial humana).
- **Fronteira única de dados**: `RawProfessionalData` (contrato bruto),
  `ProfessionalDataProvider` (abstração), `MockProfessionalDataProvider`
  (única implementação funcional hoje), `FutureProfessionalDataProvider`
  (placeholder que falha explicitamente), seleção via
  `PROFESSIONAL_DATA_SOURCE` (`mock`/`persistent`, sem fallback
  silencioso).
- **Hardening técnico**: dois bugs reais encontrados e corrigidos
  (colisão de nome de arquivo case-insensitive; tipo `readonly` mal
  declarado); 31 testes automatizados reais e executáveis (test
  runner nativo do Node, sem dependências) cobrindo validação bruta,
  seleção de origem, busca, ordenação e agrupamento por cidade.
- **CI**: `.github/workflows/rc-validation.yml` — typecheck, lint,
  testes e build, com `workflow_dispatch` habilitado.
- **Documentação**: mais de 30 documentos de arquitetura em
  `docs/architecture/`, registrando cada decisão tomada ao longo do
  projeto (auditorias, escolhas de modelagem, motivos de rejeição de
  alternativas).

## O que depende apenas de infraestrutura

- Acesso de rede a `registry.npmjs.org` (para `npm install`/`npm ci`).
- Acesso de rede a `github.com` (para publicar o repositório e
  acionar o CI já existente).
- Um remoto Git configurado (`git remote add origin ...`).
- Execução real de `npm run typecheck`/`npm run lint`/`npm run build`
  com as ferramentas oficiais do projeto (não com substitutos
  globais, como foi necessário fazer nesta sessão).
- Navegação real da aplicação em um navegador, contra um servidor
  `next dev`/`next start` de verdade.

Nenhuma dessas pendências exige decisão de produto ou mudança de
código — apenas rodar o que já existe em um ambiente com rede.

## Como executar

```bash
git clone <URL_DO_REPOSITORIO>
cd aliviar-landing
npm install
npm run dev
```

Acessar `http://localhost:3000/alicia` (landing pública da Aliviar em
`/`, AliCIA em `/alicia/*`).

Para testar a origem de dados persistente (hoje sempre falha
explicitamente, por design — ver `docs/architecture/PERSISTENT_DATA_PROVIDER_RC.md`):

```bash
PROFESSIONAL_DATA_SOURCE=persistent npm run dev
```

## Como validar

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Ou via CI, assim que o repositório estiver publicado no GitHub:
acionar `.github/workflows/rc-validation.yml` manualmente
(`workflow_dispatch`) ou via push/PR para `master`/`main`.

Nenhuma dessas quatro etapas foi executada com sucesso pelas
ferramentas oficiais nesta sessão de desenvolvimento — apenas os 31
testes (via test runner nativo do Node, que não depende de
`node_modules`) puderam ser genuinamente executados e validados.
Ver `docs/architecture/TECHNICAL_HARDENING_RC.md`,
`docs/architecture/RELEASE_CANDIDATE_TECHNICAL_REVIEW.md` e
`docs/release/RC_VALIDATION_REPORT.md` para o histórico completo
dessas tentativas.

## Como publicar

Ver `docs/release/GO_LIVE_CHECKLIST.md` para o checklist objetivo
completo. Resumo: instalar dependências reais → rodar o pipeline
completo → validar a navegação manualmente (estado → especialidade →
busca → cidade → ordenação → por cidade → perfil, com e sem filtros)
→ validar `PROFESSIONAL_DATA_SOURCE=mock` e `=persistent` → só então
decidir o veredito de release.

## Pendências

### Bloqueantes (somente infraestrutura)

- Rede liberada para `registry.npmjs.org` e `github.com`.
- Remoto Git configurado.
- `npm install`/`npm ci` reais.
- `npm run typecheck`/`npm run lint`/`npm run build` reais.
- Navegação validada em navegador real.

### Não bloqueantes (evolução futura)

- Revisão editorial humana das 2 bios reais existentes.
- Decisão humana sobre "Trauma esportivo" (`Condition: injury` vs.
  `care-need`) e "Prevenção cardiovascular" (decomposição entre
  `Capability`/`Condition`).
- População real do Knowledge Core (claims/evidências/verificações
  verdadeiras) — desbloqueia o selo `verificado`/`verificacoes[]` e,
  usando `KnowledgeClaimType: "practice-location"` (já suportado),
  coordenadas geográficas verificadas.
- Evolução de `Education` para incluir `cidade`/`estado` por item de
  formação, se a divergência visual atual for considerada inaceitável.
- Escolha real de tecnologia de persistência (banco/API) — nenhuma
  evidência no repositório hoje justifica qualquer escolha específica.
- Mapa geográfico literal — só quando existirem coordenadas reais.
- Ranking por confiança real — só quando o Knowledge Core tiver dados
  publicados.

## Decisões arquiteturais

| Área | Decisão | Motivo | Alternativa rejeitada |
|---|---|---|---|
| Catálogo | `ProfessionalCatalogProjection` separada de `ProfessionalProfileProjection` | Permitir que os dois modelos de leitura evoluam de forma independente | Reutilizar uma única projection para os dois casos de uso |
| Provider | Contrato `RawProfessionalData` + abstração `ProfessionalDataProvider`, com mocks como uma implementação entre outras | Preparar a troca de origem de dados sem alterar domínio, aplicação ou UI | Manter `Medico` como o contrato permanente da aplicação |
| Knowledge Core | Modelo `Source`+`Evidence`+`Verification` construído e pronto, sem popular nenhum dado | Preparar a governança de confiança sem fabricar verificação inexistente | Popular dados fictícios de verificação para simular prontidão |
| Busca | Normalização (case/accent-insensitive) centralizada em uma única função pura, reutilizada pelo servidor | Evitar duplicar a regra de correspondência entre camadas | Implementar filtragem duplicada no client e no servidor |
| Ordenação | "Ordem padrão" (`relevance`) apenas preserva a ordem já filtrada; sem nenhuma métrica de qualidade | Nunca insinuar avaliação de mérito clínico sem dado real que a sustente | Introduzir algum score, popularidade ou heurística de qualidade |
| Visualização por cidade | Agrupamento por cidade/estado, sem coordenadas | Única granularidade geográfica real disponível nos dados atuais | Simular um mapa com coordenadas fictícias ou aproximadas |
| Dados geográficos | Reaproveitar o Knowledge Core (`KnowledgeClaimType: "practice-location"`) para futura verificação de coordenadas | Evitar um segundo sistema de governança de confiança paralelo ao já existente | Criar um novo modelo de status de coordenada dentro de `PracticeLocation` |

## Riscos

- **Selo `verificado`/`verificacoes[]` sem rastreabilidade real** —
  risco reputacional se a aplicação for publicada sem comunicar
  claramente essa limitação ao usuário final ou sem popular o
  Knowledge Core antes.
- **`bioCurta` ainda vem do legado** — a arquitetura editorial nova
  existe, mas nenhuma bio real foi revisada/publicada por um humano
  ainda; publicar sem essa revisão mantém o mesmo texto de hoje, sem
  regressão, mas sem o ganho de governança pretendido.
- **"Trauma esportivo"/"Prevenção cardiovascular"** continuam vindo
  do bridge legado — decisão editorial pendente, sem prazo definido.
- **Nenhuma execução real do pipeline oficial** (`npm run typecheck`/
  `lint`/`build`) ocorreu nesta sessão — todas as validações feitas
  usaram substitutos (ferramentas globais incompatíveis, revisão
  estática manual); um ambiente real pode revelar problemas ainda não
  visíveis com essas ferramentas.

## Próximas fases

```
Integração de dados reais
        ↓
Conteúdo (revisão editorial das bios, decisões sobre itens residuais)
        ↓
Publicação (pipeline real + navegação validada + veredito de release)
        ↓
Evoluções futuras (mapa geográfico real, ranking por confiança,
tecnologia de persistência real)
```
