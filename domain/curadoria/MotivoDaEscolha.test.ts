import test from "node:test";
import assert from "node:assert/strict";
import {
  MotivoDaEscolha,
  deserializarMotivoDaEscolha,
} from "./MotivoDaEscolha.ts";

const T0 = new Date("2026-07-22T12:00:00.000Z");

const base = {
  casoId: "caso-001",
  professionalId: "med-001",
  texto: "Residência comprovada na especialidade exigida pelo caso.",
  evidenciaIds: ["ev-2", "ev-1", "ev-2"],
  autorId: "curador-001",
  registradoEm: T0,
};

test("cria motivo com autor, evidências normalizadas e data por cópia", () => {
  const motivo = MotivoDaEscolha.create(base);
  assert.equal(motivo.autorId, "curador-001");
  assert.deepEqual([...motivo.evidenciaIds], ["ev-1", "ev-2"]);
  motivo.registradoEm.setFullYear(1999);
  assert.equal(motivo.registradoEm.toISOString(), T0.toISOString());
});

test("nenhuma decisão existe sem autor", () => {
  assert.throws(
    () => MotivoDaEscolha.create({ ...base, autorId: "  " }),
    /exige autor/
  );
});

test("toda decisão aponta para evidências — lista vazia é rejeitada", () => {
  assert.throws(
    () => MotivoDaEscolha.create({ ...base, evidenciaIds: [] }),
    /ao menos uma evidência/
  );
});

test("gramática restrita: linguagem de ranking é rejeitada", () => {
  assert.throws(
    () =>
      MotivoDaEscolha.create({
        ...base,
        texto: "É o melhor médico disponível para o caso.",
      }),
    /gramática restrita/
  );
  // "Ortopedia" não dispara "top" (casamento por palavra inteira)
  const motivo = MotivoDaEscolha.create({
    ...base,
    texto: "Atuação em Ortopedia documentada em registro público.",
  });
  assert.ok(motivo);
});

test("round-trip determinístico e sem valores numéricos", () => {
  const motivo = MotivoDaEscolha.create(base);
  const json = motivo.serializar();
  assert.equal(deserializarMotivoDaEscolha(json).serializar(), json);
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(JSON.parse(json)));
});
