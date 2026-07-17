# Aliviar — Landing Page V1

Experiência narrativa em scroll que muda a crença de que escolher um médico
é um detalhe, antes de apresentar a Curadoria Médica da Aliviar.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

```
app/                 rotas, layout raiz, metadata, globals.css
components/
  sections/          uma seção da landing por arquivo (Hero, Manifesto, etc.)
  Reveal.tsx          wrapper de animação de entrada reutilizado em toda a página
  ScrollIndicator.tsx indicador discreto de scroll no hero
  Footer.tsx
hooks/
  useSectionProgress.ts  progresso de scroll para seções "pinadas"
lib/
  motion.ts           variantes de animação compartilhadas (fade, blur, stagger)
types/
  index.ts
```

## Asset pendente — Seção 7 (Manifesto)

O componente `components/sections/Manifesto.tsx` está preparado para vídeo em
background com fallback de fotografia editorial:

- `public/media/manifesto.mp4` — vídeo em loop, silencioso
- `public/media/manifesto-poster.jpg` — fotografia editorial (luz natural,
  pessoas em contexto real), usada como poster do vídeo e fallback caso o
  vídeo não carregue

Nenhum dos dois arquivos existe no repositório ainda — adicione os ativos
finais nesse caminho antes do deploy. Evite bancos de imagem óbvios, sorrisos
para câmera e hospitais tradicionais, conforme o direcionamento de marca.

## Notas de implementação

- Paleta: `paper` (fundo), `ink` (texto principal), `ink-soft` / `ink-faint`
  (texto secundário), `gold` (único acento, usado com moderação), `hairline`
  (divisores). Definidos em `tailwind.config.ts`.
- Tipografia: Fraunces (display, itálico para os momentos mais emocionais) +
  Inter (texto corrido), carregadas via `next/font/google` em `app/layout.tsx`.
- Todas as animações respeitam `prefers-reduced-motion`.
- A Seção 2 (`ChoicesReveal`) usa scroll "pinado" com `framer-motion` para
  revelar as frases uma a uma; com `prefers-reduced-motion` ativado, cai para
  uma lista estática.
