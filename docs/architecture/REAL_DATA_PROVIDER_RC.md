# RC — Provider de Dados Reais (MACROBLOCO-03)

## 1. Estado inicial

Branch: `master` · HEAD: `8c05138a2aab769a50e0bd2347697a17b1d9cea3` (conferido) · Working tree: limpo.

## 2. Arquitetura encontrada

Cadeia completa de dados antes desta tarefa:

```
mocks/alicia/medicos.ts (Medico[])
        ↓
professionalDataProvider.ts::listRawProfessionals(): ReadonlyArray<Medico>
        ↓                                  ↓
MockProfessionalCatalogSource        createMockProfessionalRepository
(constructor: ReadonlyArray<Medico>)  (LegacyProfessionalMapper.toDomain(Medico))
        ↓                                  ↓
LegacyProfessionalMapper.toDomain(input: Medico): Professional
        ↓
Professional (domínio)
        ↓
BuildProfessionalCatalogProjection / BuildProfessionalProfileProjection
        ↓
ProfessionalCatalogProjection / ProfessionalProfileProjection
        ↓
application (Query/UseCase) → UI
```

`Medico` era, na prática, o contrato permanente da aplicação: a
fronteira única do MACROBLOCO-02 já existia, mas seu tipo de retorno
e as assinaturas de `MockProfessionalCatalogSource`/
`LegacyProfessionalMapper` ainda eram literalmente `Medico`, não uma
abstração neutra.

## 3. Contrato bruto

Criado `infrastructure/alicia/professional/RawProfessionalData.ts` —
interface pura, sem comportamento, sem depender de
`domain/professional/` nem de `app/`/`components/` (só reutiliza os
sub-tipos legados `FormacaoAcademica`/`ExperienciaProfissional`/
`VerificacaoMedico` de `types/alicia/trajetoria-medica.ts`, que não
são domínio nem UI). Estruturalmente idêntico a `Medico` hoje — de
propósito: `Medico` continua sendo uma fonte que satisfaz o contrato,
mas deixou de ser o contrato em si. `LegacyProfessionalMapper.toDomain()`
e `MockProfessionalCatalogSource` agora declaram `RawProfessionalData`
em suas assinaturas, não mais `Medico`.

## 4. Providers

Criada a abstração `ProfessionalDataProvider` (`listRawProfessionals(): ReadonlyArray<RawProfessionalData>`)
em `infrastructure/alicia/professional/ProfessionalDataProvider.ts`.

- **`MockProfessionalDataProvider`** — implementação real, lê
  `mocks/alicia/medicos.ts` diretamente. É agora o **único** arquivo
  de todo o projeto (fora de `mocks/`) que importa esse mock —
  confirmado por busca exaustiva.
- **`FutureProfessionalDataProvider`** — placeholder não conectado a
  nenhuma composição pública; `listRawProfessionals()` lança
  `"FutureProfessionalDataProvider.listRawProfessionals not implemented."`.
  Existe apenas para comprovar que o contrato já comporta uma segunda
  implementação sem exigir nenhuma mudança em repositories, sources,
  domínio ou UI.

`professionalDataProvider.ts` (arquivo já existente desde o
MACROBLOCO-02) foi reescrito como o **único ponto de composição** do
provider ativo (`createProfessionalDataProvider()`, hoje sempre
retornando `MockProfessionalDataProvider`), mantendo
`listRawProfessionals()` como atalho de compatibilidade — nenhum dos
três consumidores existentes (`createMockProfessionalCatalogSource.ts`,
`createMockProfessionalRepository.ts`, `services/alicia/medicos.ts`)
precisou de qualquer alteração.

## 5. Repositories

- **`MockProfessionalCatalogSource`**: construtor alterado de
  `ReadonlyArray<Medico>` para `ReadonlyArray<RawProfessionalData>` —
  import de `Medico` removido por completo. Comportamento idêntico
  (mesma validação de slug, mesma chamada ao mapper).
- **`MockProfessionalRepository`**: **já não tinha nenhum
  acoplamento a `Medico`** (conhece apenas `Professional`) —
  confirmado por leitura, nenhuma alteração necessária.
- **`createMockProfessionalCatalogSource()`/`createMockProfessionalRepository()`**:
  já usavam `listRawProfessionals()` desde o MACROBLOCO-02 — agora
  esse retorno é tipado como `RawProfessionalData[]`, compatível
  estruturalmente sem nenhuma mudança de código nesses dois arquivos.

## 6. Compatibilidade

Confirmado via `git diff --stat`: domínio, aggregates,
`ProfessionalCatalogProjection`, `ProfessionalProfileProjection`,
componentes, páginas/rotas e mocks **não foram alterados**. Catálogo,
perfil, descoberta (busca/cidade/ordenação), ranking, mapa, bridges
residuais e Knowledge Core continuam funcionando exatamente como
antes — toda a mudança é de tipagem estrutural na camada de
infraestrutura, sem nenhum efeito em runtime ou visual.

## 7. Código morto

**Nenhum código morto encontrado.** O import de `Medico` foi removido
de `MockProfessionalCatalogSource.ts` e das assinaturas de
`LegacyProfessionalMapper.ts` porque deixou de ser necessário ali
(substituído por `RawProfessionalData`) — não porque algo ficou sem
uso; a lógica interna de ambos permanece idêntica.

## 8. Documento criado

`docs/architecture/REAL_DATA_PROVIDER_RC.md` (este documento).

## 9. Testes e verificações

Typecheck/lint/build: não executados — sem `node_modules` (mesmo
bloqueio já documentado em toda a sessão). Revisão estática completa:
leitura de todos os arquivos antes/depois; confirmação de que
`RawProfessionalData` e `Medico` têm exatamente os mesmos campos e
tipos (garantindo compatibilidade estrutural sem cast); busca
exaustiva confirmando que `MockProfessionalDataProvider.ts` é o único
importador real de `mocks/alicia/medicos.ts` fora da pasta de mocks;
`git diff --stat` confirmando ausência de mudança em domínio/
projections/UI/mocks; `git diff --check` limpo (exit 0); contagem de
chaves balanceada em todos os arquivos tocados.

## 10. Commits

Um commit único e coeso:

`architecture: consolidar contrato e provider de dados brutos`

Arquivos: `infrastructure/alicia/professional/RawProfessionalData.ts` (novo),
`infrastructure/alicia/professional/ProfessionalDataProvider.ts` (novo),
`infrastructure/alicia/professional/MockProfessionalDataProvider.ts` (novo),
`infrastructure/alicia/professional/FutureProfessionalDataProvider.ts` (novo),
`infrastructure/alicia/professional/professionalDataProvider.ts`,
`infrastructure/alicia/professional/LegacyProfessionalMapper.ts`,
`infrastructure/alicia/catalog/MockProfessionalCatalogSource.ts`,
`infrastructure/alicia/professional/index.ts`,
`docs/architecture/REAL_DATA_PROVIDER_RC.md`.

## 11. Pendências

Exclusivamente o que falta para conectar uma fonte real:

1. Implementar de fato `FutureProfessionalDataProvider` (ou uma nova
   classe análoga) lendo de um banco/API real, em vez de lançar erro.
2. Decidir se `ProfessionalDataProvider.listRawProfessionals()`
   precisa se tornar assíncrono (`Promise<...>`) — hoje é síncrono,
   coerente com mocks em memória; uma fonte real (banco/API) quase
   certamente exigirá I/O assíncrono, o que propagaria para
   `MockProfessionalCatalogSource`/`createMockProfessionalRepository`
   e potencialmente para `createProfessionalCatalogQuery`. Decisão
   propositalmente adiada para a fase de integração, para não
   introduzir uma mudança de assinatura em cascata sem necessidade
   real ainda.
3. Introduzir um mecanismo de seleção entre provider mock e real
   (variável de ambiente ou configuração) em
   `professionalDataProvider.ts` — hoje `createProfessionalDataProvider()`
   sempre retorna o mock.
4. As pendências já registradas no MACROBLOCO-02 (revisão editorial
   das bios, população real do Knowledge Core, decisão sobre os dois
   itens residuais de `areasDeAtuacao`) permanecem inalteradas.

## Resposta obrigatória

**A aplicação consegue trocar a origem dos dados sem alterar a UI?**

**SIM**, no sentido estrutural: existe hoje exatamente um contrato
(`RawProfessionalData`), uma abstração (`ProfessionalDataProvider`) e
um único ponto de composição (`professionalDataProvider.ts`) — trocar
`MockProfessionalDataProvider` por uma implementação real exigiria
alterar apenas esse ponto de composição (e implementar a nova classe),
sem tocar em `LegacyProfessionalMapper`, `MockProfessionalCatalogSource`,
`MockProfessionalRepository`, domínio, projections, aplicação ou UI —
confirmado nesta tarefa através de `FutureProfessionalDataProvider`,
que satisfaz o mesmo contrato sem exigir nenhuma mudança nos
consumidores. A ressalva honesta: isso vale para uma fonte real
**síncrona** ou já resolvida antes da composição; uma fonte
genuinamente assíncrona (banco/API real) ainda exigirá a evolução de
assinatura descrita na pendência 2 — não implementada aqui, pois
nenhuma integração real foi conectada nesta etapa.
