# Auditoria da Experiência Pública de Descoberta (RC-CATÁLOGO-01)

## 1. Contexto

Auditoria exclusivamente de leitura, sucedendo o encerramento técnico
da página de perfil (RC-PERFIL-01). Escopo: toda a experiência
pública de descoberta — páginas de estado/especialidade/lista,
componentes de navegação, services legados e a arquitetura de
catálogo já construída (`application/alicia/catalog/`,
`infrastructure/alicia/catalog/`).

## 2. Arquitetura atual

Existem **dois fluxos paralelos e desconectados**:

**Fluxo real (em produção hoje, 100% legado):**
```
mocks/alicia/{estados,especialidades,medicos}.ts
        ↓
services/alicia/{estados,especialidades,medicos}.ts (filtros simples
em memória, sem camada de aplicação)
        ↓
app/alicia/page.tsx → EstadoGrid → EstadoCard
app/alicia/[estado]/page.tsx → EspecialidadeGrid → EspecialidadeCard
app/alicia/[estado]/[especialidade]/page.tsx → MedicoList → MedicoCard
(consome Medico legado diretamente, incluindo medico.verificado e
medico.formacaoResumo, um campo nunca auditado nas frentes anteriores)
```

**Fluxo do catálogo novo (construído, arquiteturalmente correto, mas
sem nenhum consumidor real):**
```
mocks/alicia/medicos.ts
        ↓
LegacyProfessionalMapper → Professional
        ↓
MockProfessionalCatalogSource (via createMockProfessionalCatalogSource)
        ↓
ListProfessionalCatalog / MockProfessionalCatalogQuery
(via BuildProfessionalCatalogProjection)
        ↓
ProfessionalCatalogProjection
        ↓
(nenhuma UI consome isso — confirmado por busca exaustiva)
```

**Achado crítico:** confirmado por busca em `app/`, `components/` e
`services/`: `ProfessionalCatalogQuery`, `ProfessionalCatalogSource`,
`ListProfessionalCatalog`, `createMockProfessionalCatalogSource` e
`MockProfessionalCatalogQuery` **não têm nenhuma ocorrência** fora de
seus próprios arquivos. Apenas a página de perfil individual
(`[medico]/page.tsx`) usa a nova arquitetura, e mesmo essa via um
caminho próprio (`GetProfessionalProfileBySlug`, que reaproveita
`ProfessionalCatalogSource.findBySlug()` internamente) — não via
`ProfessionalCatalogQuery`. A experiência de descoberta em si (estado
→ especialidade → lista) permanece inteiramente legada.

## 3. Fluxo

Confirmado conforme descrito na seção 2. Fronteiras atuais: a página
de perfil já respeita a fronteira correta (só consome a factory
pública e a projection); as páginas de descoberta (`page.tsx` de
estado/especialidade/lista) importam diretamente os services legados
e o tipo `Medico`, sem qualquer fronteira de aplicação.

## 4. Experiência pública

**Busca:** não existe busca textual em nenhuma camada (nem legada,
nem nova). Navegação é puramente hierárquica: estado → especialidade
→ lista.

**Descoberta:** por drill-down geográfico e por especialidade apenas
— nenhuma forma de descobrir por sintoma, condição, procedimento,
nome ou palavra-chave.

**Filtros:** nenhum filtro real dentro da lista (detalhado na seção 6).

**Navegação:** clara e previsível (breadcrumbs, links de retorno),
mas rígida — não permite refinar sem voltar etapas completas.

**Perfil:** já migrado tecnicamente (RC-PERFIL-01).

**Retorno ao catálogo:** existe, mas sempre retorna à mesma lista
completa (não há filtros para preservar).

**Avaliação:** clareza alta (fluxo simples e literal); escalabilidade
baixa (listagem via `.filter()`/`findAll()` sem paginação, sobre
array completo em memória); arquitetura fragmentada (dois fluxos
paralelos, um em uso e desatualizado, outro pronto e não usado);
separação de responsabilidades boa na nova arquitetura de catálogo,
ausente no fluxo legado real (tudo misturado em funções de service
simples).

## 5. Especialidades

12 especialidades cadastradas em `especialidadesBase` (Ortopedia,
Cardiologia, Dermatologia, Ginecologia, Pediatria, Neurologia,
Neurocirurgia, Oftalmologia, Urologia, Oncologia, Psiquiatria,
Endocrinologia), mas apenas 2 (Ortopedia, Cardiologia) têm médicos
reais — as demais aparecem desabilitadas ("Em breve") no
`EspecialidadeCard`, controlado dinamicamente por
`quantidadeMedicos > 0`.

O modelo já suporta expansão para outras especialidades **sem
alteração de código**, em ambos os lados: o legado já lista todas as
12 em `especialidadesBase`/`quantidadePorEstado`; o novo domínio já
popula `Specialty` dinamicamente a partir do mesmo catálogo via
`LegacyProfessionalMapper.mapSpecialties()`. Adicionar novos médicos
aos mocks com qualquer `especialidadeId` das 12 já ativaria a
navegação automaticamente — a limitação hoje é de **dado**, não de
arquitetura.

## 6. Filtros

**Implementados:** nenhum filtro interativo real — apenas a navegação
hierárquica obrigatória por estado e especialidade (via rota, não um
filtro selecionável dentro de uma tela).

**Parcialmente implementados:** nenhum.

**Inexistentes:** filtro por cidade dentro do estado; por convênio;
por gênero do profissional; por disponibilidade/agenda; por texto
livre (nome, condição, procedimento); por selo de verificação;
qualquer ordenação (nome, recência, relevância).

## 7. Ranking

**Não existe ranking arquitetural hoje.** Nem `getMedicosPorEstadoEEspecialidade`
(um `.filter()` simples que preserva a ordem de inserção do mock) nem
`ListProfessionalCatalog.execute()` (que mapeia na ordem de
`findAll()`) aplicam qualquer critério de ordenação, pontuação ou
priorização.

**Ponto correto para inserção futura:** a camada de aplicação do
catálogo (`ListProfessionalCatalog` ou um novo caso de uso dedicado,
ex.: `RankProfessionalCatalog`), operando **sobre** o resultado já
projetado (`ProfessionalCatalogProjection[]`) — nunca dentro da
aggregate `Professional` nem da projeção em si, que devem continuar
representando fatos, não pontuação. Isso preserva a mesma separação
fato/apresentação/avaliação já estabelecida ao longo de toda esta
frente. Um ranking real dependeria de sinais do Knowledge Core (claims
publicadas, verificação real) — hoje inexistentes.

## 8. Escalabilidade

**Milhares de profissionais:** tanto o fluxo legado quanto o novo
catálogo carregam **todos** os profissionais de uma combinação
estado+especialidade de uma vez, sem paginação — funcional para 7
médicos, não projetado para milhares.

**Múltiplos estados:** suportado estruturalmente (`Estado` com flag
`temMedicos`), mas hoje só 2 de 27 estados têm cobertura real.

**Múltiplas especialidades:** já suportado estruturalmente (seção 5).

**Paginação:** inexistente em qualquer camada.

**Cache:** inexistente — cada requisição relê os mocks em memória do
zero; nenhuma estratégia foi desenhada para uma fonte de dados
persistente futura.

**Performance:** aceitável hoje (volume mínimo, tudo em memória), mas
a ausência de paginação/cache é um risco real assim que uma fonte de
dados real e maior for introduzida.

## 9. Lacunas

**Técnicas:**
- Ausência total de paginação em `ListProfessionalCatalog`/
  `ProfessionalCatalogQuery`.
- `ProfessionalCatalogProjection` desatualizada frente a
  `ProfessionalProfileProjection` — não tem `conditions`/
  `capabilities`/`experience`, já presentes na projeção de perfil.
- Zero consumidor real da arquitetura de catálogo já construída.
- Ausência de qualquer filtro/busca na camada de aplicação.

**De produto:**
- Nenhuma forma de buscar por nome, condição, procedimento ou
  palavra-chave.
- Nenhum filtro por cidade dentro do estado.
- Nenhuma indicação de critério de ordenação para o usuário.

**De dados:**
- Apenas 2 de 27 estados e 2 de 12 especialidades com cobertura real
  (7 médicos no total).
- Nenhuma coordenada real em nenhum profissional (sem suporte a mapa).

**Editoriais:**
- Selo de verificação (`medico.verificado`) sem rastreabilidade real
  — mesmo problema já documentado em RC-PERFIL-01 — apareceria de
  forma inconsistente em qualquer listagem futura com ranking baseado
  em confiança.

## 10. Próximas frentes

1. **Conectar o catálogo já construído à UI de descoberta.** Antes de
   qualquer funcionalidade nova, a arquitetura pronta (Source/Query/
   Projection) precisa substituir os services legados; caso contrário,
   qualquer nova funcionalidade seria construída sobre a base errada
   e teria que ser refeita.
2. **Busca.** Maior ganho percebido de "descoberta" — responder
   diretamente "encontro o profissional certo?" em vez de navegar
   hierarquicamente.
3. **Filtros.** Refinamentos (cidade, convênio) que aumentam a
   relevância dos resultados — dependem da base de listagem já estar
   na arquitetura certa.
4. **Ranking.** Só faz sentido com sinais de confiança reais (Knowledge
   Core populado) — não pode ser exercido com dado fictício sem risco
   reputacional.
5. **Mapa.** Depende de coordenadas reais, hoje inexistentes.
6. **Performance/paginação.** Só se torna urgente quando o volume real
   de dados crescer — 7 médicos não justificam essa prioridade agora.
7. **Editorial/Knowledge.** Mesmo bloqueio humano/dado já documentado
   em RC-PERFIL-01; população de dados reais beneficiaria tanto o
   perfil quanto um futuro ranking.

**Justificativa da ordem:** primeiro consolidar a base técnica
(conectar o que já existe, evitando dívida duplicada), depois investir
no que mais aumenta a chance real de "encontrar o profissional certo"
(busca, depois filtros), e só então investir em recursos que dependem
de dado real ainda ausente (ranking, mapa, editorial) — a mesma lógica
de priorização (nunca inventar dado, nunca forçar recursos sem base
real) já usada em toda esta sessão.

## 11. Conclusão

**"O usuário consegue descobrir o melhor profissional?" — Hoje, não
plenamente.** O usuário consegue navegar até um profissional dentro de
uma combinação estado+especialidade específica, mas não existe
nenhum mecanismo de "melhor" — sem busca, sem filtros, sem ranking,
sem verificação real. A experiência atual é de **navegação**, não de
**descoberta assistida**. O domínio já reúne boa parte dos fatos
necessários (`Professional` com `specialties`/`conditions`/
`capabilities`), mas a camada de apresentação do catálogo está
desconectada da UI real e ainda não expõe os meios (busca, filtro,
ranking) que tornariam a descoberta do "melhor" profissional
tecnicamente possível — e o ranking em si permanece condicionado a
dados de confiança reais que ainda não existem.
