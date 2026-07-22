import test from "node:test";
import assert from "node:assert/strict";
import {
  Criterio,
  CriterioExcludente,
  CriterioIndeterminado,
  CriterioObrigatorio,
  CriterioPreferencial,
  deserializarCriterio,
} from "./Criterio.ts";

const props = {
  id: "crit-001",
  descricao: "Residência na especialidade do caso",
  origem: "historia_do_paciente" as const,
};

test("cada subclasse carrega sua categoria imutável", () => {
  assert.equal(CriterioObrigatorio.create(props).categoria, "obrigatorio");
  assert.equal(CriterioPreferencial.create(props).categoria, "preferencial");
  assert.equal(CriterioExcludente.create(props).categoria, "excludente");
  assert.equal(CriterioIndeterminado.create(props).categoria, "indeterminado");
});

test("invariantes: id, descricao e origem obrigatórios", () => {
  assert.throws(() => CriterioObrigatorio.create({ ...props, id: " " }), /id/);
  assert.throws(() => CriterioObrigatorio.create({ ...props, descricao: "" }), /descricao/);
  assert.throws(
    () => CriterioObrigatorio.create({ ...props, origem: "opiniao" as never }),
    /origem desconhecida/
  );
});

test("nenhum score, peso ou prioridade numérica existe no critério", () => {
  const criterio = CriterioObrigatorio.create(props);
  const serializado = JSON.parse(criterio.serializar()) as Record<string, unknown>;
  assert.deepEqual(Object.keys(serializado).sort(), [
    "categoria",
    "descricao",
    "id",
    "origem",
  ]);
  for (const valor of Object.values(serializado)) {
    assert.notEqual(typeof valor, "number");
  }
  for (const proibido of ["score", "peso", "prioridade", "nota"]) {
    assert.ok(!(proibido in criterio), `campo proibido presente: ${proibido}`);
  }
});

test("igualdade por identidade, inclusive entre categorias", () => {
  const a = CriterioObrigatorio.create(props);
  const b = CriterioPreferencial.create({ ...props, descricao: "outra" });
  assert.ok(a.equals(b));
  assert.ok(!a.equals(CriterioObrigatorio.create({ ...props, id: "crit-002" })));
});

test("serialização é determinística e faz round-trip preservando a categoria", () => {
  for (const criterio of [
    CriterioObrigatorio.create(props),
    CriterioPreferencial.create(props),
    CriterioExcludente.create(props),
    CriterioIndeterminado.create(props),
  ] satisfies Criterio[]) {
    assert.equal(criterio.serializar(), criterio.serializar());
    const roundTrip = deserializarCriterio(criterio.serializar());
    assert.equal(roundTrip.categoria, criterio.categoria);
    assert.equal(roundTrip.serializar(), criterio.serializar());
  }
});

test("deserialização de categoria desconhecida falha explicitamente", () => {
  assert.throws(
    () =>
      deserializarCriterio(
        JSON.stringify({ id: "x", categoria: "ranking", descricao: "d", origem: "curador" })
      ),
    /categoria desconhecida/
  );
});
