import test from "node:test";
import assert from "node:assert/strict";
import { montarCasoControlado, ordenarPorNome } from "./montarCasoControlado.ts";
import { CASO_CONTROLADO } from "../../mocks/alicia/caso-controlado.ts";

test("monta o caso controlado no domínio real e executa a elegibilidade real", () => {
  const workspace = montarCasoControlado();
  assert.equal(workspace.caso.status, "em_analise");
  assert.equal(workspace.caso.snapshotId, "snap-0001");
  assert.equal(workspace.historia.length, CASO_CONTROLADO.historia.length);
  assert.equal(workspace.fichas.length, CASO_CONTROLADO.medicos.length);
  assert.deepEqual(
    [...workspace.conjunto.elegiveis],
    ["med-001", "med-002", "med-003", "med-006"]
  );
  assert.deepEqual(
    [...workspace.conjunto.exclusoes],
    [
      { professionalId: "med-004", criterioId: "crit-excl-1" },
      { professionalId: "med-005", criterioId: "crit-obr-1" },
    ]
  );
});

test("critérios chegam nos quatro grupos, nunca misturados", () => {
  const workspace = montarCasoControlado();
  const porCategoria = new Map<string, string[]>();
  for (const criterio of workspace.caso.criterios) {
    porCategoria.set(criterio.categoria, [
      ...(porCategoria.get(criterio.categoria) ?? []),
      criterio.id,
    ]);
  }
  assert.deepEqual(porCategoria.get("obrigatorio"), ["crit-obr-1", "crit-obr-2"]);
  assert.deepEqual(porCategoria.get("preferencial"), ["crit-pref-1", "crit-pref-2"]);
  assert.deepEqual(porCategoria.get("excludente"), ["crit-excl-1"]);
  assert.deepEqual(porCategoria.get("indeterminado"), ["crit-ind-1"]);
  // a categoria de cada critério do mock bate com a do domínio
  for (const spec of CASO_CONTROLADO.criterios) {
    const doCaso = workspace.caso.criterios.find((c) => c.id === spec.id);
    assert.equal(doCaso?.categoria, spec.grupo);
  }
});

test("elegíveis são apresentados em ordem alfabética de nome — e nada mais", () => {
  const workspace = montarCasoControlado();
  assert.deepEqual(
    workspace.elegiveisPorNome.map((medico) => medico.nome),
    ["Ana Martins", "Carlos Eduardo Lima", "Felipe Rocha", "Patrícia Nogueira"]
  );
  // ordenarPorNome não privilegia a ordem de entrada
  const invertidos = ordenarPorNome([...workspace.elegiveisPorNome].reverse());
  assert.deepEqual(invertidos, workspace.elegiveisPorNome);
});

test("determinístico: duas montagens produzem exatamente o mesmo material", () => {
  const a = montarCasoControlado();
  const b = montarCasoControlado();
  assert.equal(a.conjunto.serializar(), b.conjunto.serializar());
  assert.deepEqual(
    a.fichas.map((f) => f.serializar()),
    b.fichas.map((f) => f.serializar())
  );
});

test("ausência de ranking e de score: nada numérico, nada posicional", () => {
  const workspace = montarCasoControlado();
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  const semChavesDeMerito = (valor: unknown): boolean => {
    if (Array.isArray(valor)) return valor.every(semChavesDeMerito);
    if (valor !== null && typeof valor === "object") {
      return Object.entries(valor).every(
        ([chave, filho]) =>
          !/score|ranking|nota|peso|posicao|posição/i.test(chave) && semChavesDeMerito(filho)
      );
    }
    return true;
  };
  for (const serializado of [
    workspace.conjunto.serializar(),
    ...workspace.fichas.map((f) => f.serializar()),
  ]) {
    const parsed = JSON.parse(serializado);
    assert.ok(semNumeros(parsed));
    assert.ok(semChavesDeMerito(parsed));
  }
});
