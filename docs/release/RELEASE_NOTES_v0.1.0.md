# Release Notes — AliCIA v0.1.0-rc1

## Resumo

Primeira release candidate controlada da AliCIA, reconstruída a partir do clone limpo
`ALICIA-clean` na base `cf76db5` (`docs: preparar handoff do projeto`).

## Incluído nesta RC

- Arquitetura consolidada (domínio, catálogo, perfil, descoberta, Knowledge Core).
- Código preparado para publicação controlada.
- **31/31** testes nativos (`npm test`) executados com sucesso no clone limpo.
- Correção de build: ícone `Venus` inexistente em `lucide-react` substituído por `Flower2`
  em `components/alicia/EspecialidadeCard.tsx` (chave de dados `venus` preservada).

## Pendente para liberação pública

- Pipeline oficial completo no GitHub Actions (typecheck, lint, build).
- Smoke test manual em navegador (`/alicia` e fluxos de descoberta).
- Validação de providers em runtime (`PROFESSIONAL_DATA_SOURCE=mock` / `persistent`).

## Base de rollback

Commit base documentado: `cf76db5dc06ea68e5b4e7ffc88e9b01118d1c2fc`

Ver [ROLLBACK.md](./ROLLBACK.md).

## Tag

`v0.1.0-rc1`
