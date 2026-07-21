# Go-Live Checklist — AliCIA

Marcar cada item somente após execução real, com evidência (saída de
comando, print ou log) — não marcar por suposição.

## Ambiente

- [ ] Acesso ao registry oficial do npm confirmado (`npm ping` com sucesso)
- [ ] Repositório clonado em ambiente com acesso à internet
- [ ] Remoto Git configurado (se for publicar/usar CI)

## Instalação

- [ ] `npm install` executado com sucesso
- [ ] `package-lock.json` gerado e revisado (sem URLs privadas, sem credenciais)
- [ ] `npm ci` executado com sucesso a partir do lockfile gerado (prova de reprodutibilidade)

## Pipeline oficial

- [ ] `npm run typecheck` — sem erros
- [ ] `npm run lint` — sem erros bloqueantes
- [ ] `npm test` — todos aprovados (31 testes conhecidos nesta versão)
- [ ] `npm run build` — build de produção concluído com sucesso

## Preview e navegação manual

- [ ] `npm run dev` (ou `npm run start` após build) inicia sem erros
- [ ] Home da AliCIA (`/alicia`) carrega
- [ ] Fluxo estado → especialidade → lista funciona sem filtros
- [ ] Busca textual funciona com acento (ex.: "joão")
- [ ] Busca textual funciona sem acento (ex.: "joao")
- [ ] Filtro de cidade funciona
- [ ] Cidade inexistente na URL não quebra a página (estado vazio correto)
- [ ] Ordenação "Nome (A–Z)"/"Nome (Z–A)" funciona
- [ ] Visualização "Por cidade" agrupa corretamente
- [ ] Limpar filtros restaura a lista completa
- [ ] Refresh preserva os filtros da URL
- [ ] Botão voltar/avançar do navegador restaura o estado esperado
- [ ] Link com `?q=`/`&city=`/`&sort=`/`&view=` abre já filtrado
- [ ] Perfil individual por slug carrega corretamente
- [ ] Nenhum console error/warning inesperado no navegador
- [ ] Nenhum hydration warning no console

## Providers

- [ ] `PROFESSIONAL_DATA_SOURCE=mock` (ou variável ausente): catálogo, perfil, busca e ordenação funcionam normalmente
- [ ] `PROFESSIONAL_DATA_SOURCE=persistent`: falha explicitamente, sem fallback silencioso, sem exibir dado mock como se fosse real
- [ ] `PROFESSIONAL_DATA_SOURCE=<valor inválido>`: erro claro e imediato

## Segurança

- [ ] Nenhuma credencial/segredo commitado (buscar `SECRET`, `TOKEN`, `PASSWORD`, `API_KEY`, `DATABASE_URL`)
- [ ] `.env.example` (se versionado) contém apenas placeholders
- [ ] `process.env` não chega ao bundle client (verificar no bundle gerado pelo build)
- [ ] `npm audit` executado e revisado

## Decisão final

- [ ] Veredito de release registrado (`LIBERAR` / `LIBERAR COM RESSALVAS` / `NÃO LIBERAR`) com justificativa
- [ ] Pendências não bloqueantes (ver `PROJECT_HANDOFF.md`) comunicadas ao time de produto
