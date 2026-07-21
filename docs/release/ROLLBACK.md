# Rollback — AliCIA v0.1.0-rc1

## Base conhecida segura

```text
cf76db5dc06ea68e5b4e7ffc88e9b01118d1c2fc
docs: preparar handoff do projeto
```

## Reverter branch `main` para a base (somente se autorizado)

```bash
git fetch origin
git checkout main
git reset --hard cf76db5dc06ea68e5b4e7ffc88e9b01118d1c2fc
```

> **Atenção:** `reset --hard` descarta commits posteriores localmente. Para o remoto,
> exige decisão explícita de equipe — não executar `push --force` sem autorização.

## Reverter apenas a tag RC

```bash
git push origin :refs/tags/v0.1.0-rc1
```

## Reverter apenas o ícone (sem reset completo)

Reverter o commit:

```text
fix: substituir icone Venus inexistente por Flower2
```

## Critérios para acionar rollback

- Falha bloqueante no CI de release (`RC Validation`).
- Regressão confirmada em smoke test manual.
- Erro de build em produção não reproduzível localmente após investigação.

## Pós-rollback

1. Registrar incidente e commit/tag afetados.
2. Repetir validação local (`npm test`, typecheck, lint, build).
3. Reemitir RC somente após correção documentada.
