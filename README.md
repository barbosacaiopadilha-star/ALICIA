# Aliviar / AliCIA — MVP

Repositório único contendo dois produtos:

1. **Landing pública da Aliviar** (`/`) — página institucional narrativa.
2. **AliCIA** (`/alicia/*`) — MVP de curadoria médica com dados
   inteiramente fictícios/demonstrativos.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
lucide-react

## Rodando localmente

```bash
npm install
npm run dev
```

Outros scripts disponíveis: `npm run build`, `npm run start`, `npm run lint`.

> Não existe script `typecheck` no `package.json`; para checar tipos
> manualmente, rode `npx tsc --noEmit` (garanta que está usando a versão
> de TypeScript do projeto, instalada em `node_modules`, e não uma
> instalação global — versões diferentes podem reportar avisos de
> configuração que não são erros reais do projeto).

## Rotas existentes

Landing:
- `/` — página institucional da Aliviar (única rota da landing)

AliCIA:
- `/alicia` — entrada + seleção de estado
- `/alicia/[estado]` — seleção de especialidade dentro do estado
- `/alicia/[estado]/[especialidade]` — lista de médicos (ou estado vazio,
  quando a combinação é válida mas ainda não há médicos cadastrados)
- `/alicia/[estado]/[especialidade]/[medico]` — perfil do médico:
  cabeçalho, trajetória acadêmica, experiência profissional, áreas de
  atuação e verificações
- `/alicia/metodologia` — metodologia pública de análise de formação
  (critérios, fontes, limites — sem ranking, score ou recomendação)

Estados e especialidades sem dados mockados exibem "Em breve" e não são
navegáveis pelos cards; combinações inválidas (estado, especialidade ou
médico inexistente, ou que não pertence à combinação da URL) retornam
`notFound()`.

## Estrutura do projeto

```
app/
  layout.tsx, page.tsx        landing pública (raiz)
  globals.css                 tokens Tailwind (@layer base/utilities)
  robots.ts, sitemap.ts       SEO da landing
  alicia/
    layout.tsx                 layout próprio da AliCIA (header com link
                                para /alicia e /alicia/metodologia)
    page.tsx                   seleção de estado
    [estado]/page.tsx          seleção de especialidade
    [estado]/[especialidade]/page.tsx        lista de médicos
    [estado]/[especialidade]/[medico]/page.tsx  perfil do médico
    metodologia/page.tsx       página de metodologia

components/
  sections/                   seções da landing (uma por arquivo)
  Reveal.tsx, ScrollIndicator.tsx, Footer.tsx   genéricos da landing
  alicia/                      componentes de UI da AliCIA (cards, grids,
                                cabeçalho de perfil, trajetória, etc.)

hooks/       useSectionProgress.ts (scroll "pinado" da landing)
lib/
  motion.ts                    variantes de animação da landing
  alicia/texto.ts              utilitários (iniciais, formatação de período)

types/alicia/    Estado, Especialidade, Medico, FormacaoAcademica,
                 ExperienciaProfissional, VerificacaoMedico, Metodologia*
mocks/alicia/    dados fictícios (estados, especialidades, medicos,
                 metodologia) — únicas fontes de dado do MVP
services/alicia/ camada consumida pelas páginas (page → service → mock);
                 nenhuma página importa mock diretamente
```

## Dados demonstrativos

Todos os dados da AliCIA (médicos, instituições, trajetórias, contagens
por especialidade) são **fictícios**, criados para este MVP. Nenhum nome,
CRM, instituição real ou dado de paciente é usado. As contagens de
médicos por especialidade (`mocks/alicia/especialidades.ts`) são
derivadas automaticamente da lista real de médicos em
`mocks/alicia/medicos.ts` — não são números digitados à parte.

## Limitações conhecidas do MVP

- Sem ranking, score, comparação, recomendação por IA ou compatibilidade
  com paciente — documentado explicitamente na página de metodologia.
- Sem busca, filtros, mapa, agendamento, login/autenticação, banco de
  dados ou API real — tudo roda sobre mocks em memória.
- Apenas 2 estados (SP, RJ) e 3 médicos (de 7 cadastrados) possuem perfil
  acadêmico completo; os demais têm dados básicos de listagem apenas.
- Seção 7 da landing (Manifesto) referencia `public/media/manifesto.mp4`
  e `public/media/manifesto-poster.jpg`, que ainda não existem no
  repositório — adicionar antes do deploy (ver aviso abaixo).
- Este ambiente de desenvolvimento não tem acesso ao registry do npm,
  então `node_modules` não pôde ser gerado nem `package-lock.json`
  regenerado aqui; instale localmente para validar lint/typecheck/build.

## Asset pendente — Seção 7 da landing (Manifesto)

O componente `components/sections/Manifesto.tsx` está preparado para vídeo
em background com fallback de fotografia editorial:

- `public/media/manifesto.mp4` — vídeo em loop, silencioso
- `public/media/manifesto-poster.jpg` — fotografia editorial (luz natural,
  pessoas em contexto real), usada como poster do vídeo e fallback

Nenhum dos dois arquivos existe no repositório ainda — adicione os ativos
finais nesse caminho antes do deploy. Evite bancos de imagem óbvios,
sorrisos para câmera e hospitais tradicionais, conforme o direcionamento
de marca.

## Notas de implementação (landing)

- Paleta: `paper` (fundo), `ink` (texto principal), `ink-soft` / `ink-faint`
  (texto secundário), `gold` (único acento, usado com moderação), `hairline`
  (divisores), `canvas` (fundo secundário). Definidos em `tailwind.config.ts`
  e reaproveitados integralmente pela AliCIA para manter consistência visual.
- Tipografia: Fraunces (display, itálico para os momentos mais emocionais) +
  Inter (texto corrido), carregadas via `next/font/google` em `app/layout.tsx`.
- Todas as animações respeitam `prefers-reduced-motion`.
- A Seção 2 da landing (`ChoicesReveal`) usa scroll "pinado" com
  `framer-motion` para revelar as frases uma a uma; com
  `prefers-reduced-motion` ativado, cai para uma lista estática.
