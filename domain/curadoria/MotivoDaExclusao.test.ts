import test from "node:test";
import assert from "node:assert/strict";
import {
  MotivoDaExclusao,
  deserializarMotivoDaExclusao,
} from "./MotivoDaExclusao.ts";

const T0 = new Date("2026-07-22T12:00:00.000Z");

const base = {
  casoId: "caso-001",
  professionalId: "med-002",
  texto: "Agenda indisponível no horizonte necessário ao caso.",
  evidenciaIds: ["ev-9"],
  autorId: "curador-001",
  registradoEm: T0,
};

test("cria exclusão com autor e evidência; criterioId opcional vincula ao critério", () => {
  const semCriterio = MotivoDaExclusao.create(base);
  assert.equal(semCriterio.criterioId, undefined);
  const comCriterio = MotivoDaExclusao.create({ ...base, criterioId: "excl-1" });
  assert.equal(comCriterio.criterioId, "excl-1");
  assert.throws(
    () => MotivoDaExclusao.create({ ...base, criterioId: "  " }),
    /criterioId, quando informado/
  );
});

test("exige autor e ao menos uma evidência", () => {
  assert.throws(() => MotivoDaExclusao.create({ ...base, autorId: "" }), /exige autor/);
  assert.throws(
    () => MotivoDaExclusao.create({ ...base, evidenciaIds: [] }),
    /ao menos uma evidência/
  );
});

test("gramática restrita vale também para exclusões", () => {
  assert.throws(
    () =>
      MotivoDaExclusao.create({
        ...base,
        texto: "É o pior candidato entre os avaliados.",
      }),
    /gramática restrita/
  );
});

test("round-trip determinístico e sem valores numéricos", () => {
  const motivo = MotivoDaExclusao.create({ ...base, criterioId: "excl-1" });
  const json = motivo.serializar();
  assert.equal(deserializarMotivoDaExclusao(json).serializar(), json);
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(JSON.parse(json)));
});
