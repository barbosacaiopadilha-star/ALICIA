# Release Candidate Técnico — Auditoria Final (MACROBLOCO-06)

## 1. Contexto

Última auditoria técnica antes do Release Candidate. Nenhuma
funcionalidade nova foi criada — este documento prova, com evidência
executável e revisão estática exaustiva, que tudo o que foi construído
ao longo desta sessão continua consistente.

## 2. Auditoria arquitetural

**Fronteira única de dados:** confirmada — `MockProfessionalDataProvider.ts`
é o único arquivo do projeto (fora de `mocks/`) que importa
`mocks/alicia/medicos.ts` diretamente. `LegacyProfessionalMapper.ts`
lê `mocks/alicia/especialidades.ts` (catálogo de especialidades, uma
taxonomia diferente, não os registros de profissionais — leitura
legítima e pré-existente, fora do escopo desta fronteira).
`services/alicia/especialidades.ts`/`estados.ts`/`metodologia.ts`
leem seus próprios mocks de taxonomia/conteúdo, sem sobreposição.

**Composições:** cada classe concreta (`MockProfessionalCatalogSource`,
`MockProfessionalRepository`, `MockProfessionalDataProvider`,
`FutureProfessionalDataProvider`) é instanciada em exatamente um
lugar — nenhuma composição duplicada.

**Dependências entre camadas:** `domain/` não importa `application/`
nem `infrastructure/` (confirmado por busca, zero ocorrências).
`application/` não importa `infrastructure/` (zero ocorrências,
inversão de dependência respeitada — application define contratos,
infrastructure implementa). As únicas importações de `@/infrastructure`
em `app/`/`components/` são as duas factories de composição
(`createGetProfessionalProfileBySlug`, `createProfessionalCatalogQuery`),
usadas pelas próprias páginas Server Component — o padrão correto e
intencional de composition root do Next.js App Router, não uma
violação.

**Nenhuma exceção real encontrada.**

## 3. Bridges

| Bridge | Status | Consumidores | Bloqueio | Removível agora? | Risco |
|---|---|---|---|---|---|
| `formacaoResumo` | Ativo | `page.tsx` (listagem), `MedicoCard.tsx`, `RawProfessionalData` | Sem equivalente em nenhuma entidade de domínio | Não | Baixo — dado real, só exibido, sem inferência |
| `verificado` (selo + por formação) | Ativo | `page.tsx` (perfil e listagem), `MedicoCard.tsx`, `FormacaoItem.tsx` | Depende de `KnowledgeClaim`/`Verification` reais publicados | Não | Médio — selo sem rastreabilidade real, já documentado desde RC-PERFIL-01 |
| `verificacoes[]` | Ativo | `page.tsx` (perfil), `VerificacoesMedico.tsx` | Mesma razão | Não | Médio — mesma natureza do selo |
| `bioCurta` | Ativo | `page.tsx` (perfil), `PerfilMedicoHeader.tsx` | Depende de revisão editorial humana das 2 bios reais | Não | Baixo — arquitetura editorial pronta, aguardando decisão humana, não dado técnico |
| `listRawProfessionals` | Ativo (atalho) | `createMockProfessionalCatalogSource`, `createMockProfessionalRepository`, `services/alicia/medicos.ts` | Nenhum — funcional, respeita a origem selecionada | N/A — é infraestrutura, não um bridge a eliminar | Baixo |
| `Medico` | Ativo | `services/alicia/medicos.ts`, `mocks/alicia/medicos.ts` | Contrato legado do bridge — `RawProfessionalData` já é o contrato permanente da aplicação | Não — ainda é a única fonte real de dados | Baixo |

Nenhum bridge ficou sem justificativa.

## 4. Fluxos públicos

Revalidados via 31 testes automatizados reais (`npm test`, 31/31
aprovados) e revisão estática: **catálogo** (listagem por estado/
especialidade, via `createProfessionalCatalogQuery`) — consistente;
**perfil** (via `createGetProfessionalProfileBySlug`) — consistente;
**busca** (`q`, case/accent-insensitive, substring) — consistente,
testada; **cidade** (`city`, filtro exato) — consistente, testada;
**ordenação** (`sort=relevance|name-asc|name-desc`, agora rotulada
publicamente como "Ordem padrão"/"Nome A–Z"/"Nome Z–A") — consistente,
testada, sem mutação do array de entrada; **visualização por cidade**
(`view=map`, rotulada publicamente como "Por cidade") — consistente,
testada (agrupamento determinístico); **URL** — `q`/`city`/`sort`/
`view` persistem corretamente, valores padrão omitidos, sem fallback
silencioso.

## 5. Knowledge Core

**Existe consumidor real?** Não — confirmado por busca exaustiva,
zero ocorrências em `app/`/`components/`/`services/`/`mocks/`.
**Existe composição?** Não — decisão consciente de não criar,
registrada desde o MACROBLOCO-04 (criar uma factory sem consumidor
seria implementar antes da necessidade). **Permanece pronto?** Sim —
domínio (`KnowledgeClaim`, `Source`, `Evidence`, `Verification`),
repositórios em memória e 9 casos de uso continuam íntegros e
inalterados nesta sessão. **Permanece bloqueado apenas por dados?**
Sim — nenhuma lacuna arquitetural nova foi encontrada; o único
bloqueio é a ausência de claims/evidências/verificações reais.
Nenhum consumidor artificial foi criado.

## 6. Dados reais

`RawProfessionalData`: contrato bruto pronto, estável, sem
dependência de domínio/UI. `ProfessionalDataProvider`: abstração
pronta, com seleção de origem funcional e testada
(`PROFESSIONAL_DATA_SOURCE`). `MockProfessionalDataProvider`:
único provider realmente funcional hoje (dados estáticos). `FutureProfessionalDataProvider`:
placeholder estrutural, falha explicitamente, **não é uma fonte real**.

**O que falta exatamente:**
- **Depende de infraestrutura:** escolha real de tecnologia
  persistente (banco/API) — nenhuma evidência no repositório
  justifica qualquer escolha específica (confirmado exaustivamente no
  MACROBLOCO-04); decisão e propagação de assincronicidade quando essa
  tecnologia for escolhida.
- **Depende de produto:** revisão editorial humana das bios; decisão
  sobre "Trauma esportivo" e "Prevenção cardiovascular".
- **Depende de dados:** população real do Knowledge Core (claims/
  evidências/verificações verdadeiras) para desbloquear `verificado`/
  `verificacoes`; dados reais de profissionais para substituir os
  mocks.

Nenhuma dessas pendências é uma dívida de código — todas dependem de
decisões externas a esta frente de engenharia.

## 7. Testes

**31 testes executados, 31 aprovados, 0 falhas**, ~0.7–1.3s de
execução (via `npm test`, test runner nativo do Node com
`--experimental-strip-types`, sem dependências instaladas).
**Nenhuma regressão** em relação ao MACROBLOCO-05 — mesma contagem,
mesmo resultado, reexecutado do zero nesta tarefa.

## 8. Build

`npm run build` (`next build`): falha com `sh: 1: next: not found` —
confirmado, idêntico ao MACROBLOCO-05. `npm install`: falha com
`403 Forbidden` em `registry.npmjs.org` — bloqueio de rede reconfirmado
nesta tarefa, erro exato registrado, não mascarado. Typecheck parcial
(via `tsc` global 6.0.3, não a versão do projeto): 551 diagnósticos,
todos confirmados como artefatos da ausência de `node_modules` —
nenhum erro de código novo, nenhuma regressão em relação ao
MACROBLOCO-05 (mesma contagem exata por código de erro).

## 9. Segurança

Buscas por `SECRET`, `TOKEN`, `PASSWORD`, `DATABASE_URL`, `API_KEY`,
`PRIVATE_KEY`, `SUPABASE` em todo o código da AliCIA: **zero
ocorrências**. `process.env` lido em exatamente um módulo
(`createProfessionalDataProvider.ts`), nunca em componente client.
Nenhum fallback silencioso de origem persistente para mock. Nenhuma
dependência nova instalada desde o MACROBLOCO-05.

## 10. Código morto

Nova busca por imports/helpers/exports mortos, comentários obsoletos
e TODOs esquecidos em todos os módulos da AliCIA: **nenhum encontrado.**
Todos os símbolos introduzidos nos últimos macroblocos
(`createProfessionalDataProvider`, `resolveProfessionalDataSource`,
`validateRawProfessionalData(List)`, `agruparPorCidade`,
`matchesProfessionalCatalogSearchCriteria`,
`sortProfessionalCatalogProjections`) têm consumidores reais
confirmados. Nenhum `TODO`/`FIXME` esquecido.

## 11. Respostas obrigatórias

**Arquitetura: está consistente?** SIM — fronteira única íntegra,
composições não duplicadas, camadas corretamente isoladas, nenhuma
inversão de dependência.

**Catálogo: está consistente?** SIM — busca, cidade, ordenação,
visualização por cidade e URL validados por teste e revisão estática,
sem regressão.

**Perfil: está consistente?** SIM — fluxo inalterado desde
RC-PERFIL-01, bridges residuais permanecem exatamente os mesmos,
justificados.

**Knowledge Core: está pronto?** SIM, arquiteturalmente — sem
consumidor real e sem dados reais, por decisão consciente, não por
lacuna técnica.

**Dados reais: o que falta exatamente?** Decisão externa de
tecnologia persistente; decisão de produto sobre bios e itens
residuais de área de atuação; população real do Knowledge Core —
nenhuma pendência de código.

**Build: está validado?** NÃO — bloqueado exclusivamente por ausência
de rede para `npm install` neste ambiente; nenhum erro de código
identificado nas partes que puderam ser inspecionadas.

**Testes: estão validados?** SIM — 31/31 reais e executáveis, sem
regressão.

## 12. Release Candidate

**PARCIALMENTE.**

A arquitetura, os bridges, a separação de camadas, a segurança e a
cobertura de testes dos módulos puros críticos estão genuinamente
consolidados e comprovados nesta auditoria — não há dívida de
código identificável com as ferramentas disponíveis. O único bloqueio
remanescente para uma resposta "SIM" integral é ambiental: a
ausência de acesso à rede para instalar `node_modules` impede a
execução real e completa de `npm run typecheck`, `npm run lint` e
`npm run build` com as ferramentas oficiais do projeto (não com
substitutos globais/manuais). Assim que esse acesso existir em um
ambiente de integração real, recomenda-se reexecutar essas três
verificações integralmente antes de qualquer release.
