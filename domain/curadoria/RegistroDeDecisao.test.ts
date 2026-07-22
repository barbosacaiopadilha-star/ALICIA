import test from "node:test";
import assert from "node:assert/strict";
import {
  RegistroDeDecisao,
  deserializarRegistroDeDecisao,
} from "./RegistroDeDecisao.ts";
import { MotivoDaEscolha } from "./MotivoDaEscolha.ts";

const T0 = new Date("2026-07-22T15:00:00.000Z");

function motivo(professionalId: string, autorId = "curador-001"): MotivoDaEscolha {
  return MotivoDaEscolha.create({
    casoId: "caso-0001",
    professionalId,
    texto: "Residência e registro comprovados, compatíveis com o caso.",
    evidenciaIds: [`ev-${professionalId}`],
    autorId,
    registradoEm: T0,
  });
}

const base = {
  sessaoId: "sessao-0001",
  casoId: "caso-0001",
  snapshotId: "snap-0001",
  autor: "curador-001",
  motivos: [motivo("med-002"), motivo("med-001"), motivo("med-006")],
  timestamp: T0,
};

test("registra o trio com autor, snapshot, timestamp e um motivo por médico", () => {
  const decisao = RegistroDeDecisao.create(base);
  assert.equal(decisao.autor, "curador-001");
  assert.equal(decisao.snapshotId, "snap-0001");
  assert.equal(decisao.timestamp.toISOString(), T0.toISOString());
  // conjunto normalizado lexicograficamente — sem posição de mérito
  assert.deepEqual([...decisao.trioSelecionado], ["med-001", "med-002", "med-006"]);
  assert.equal(decisao.motivoPara("med-006")?.professionalId, "med-006");
  decisao.timestamp.setFullYear(1999);
  assert.equal(decisao.timestamp.toISOString(), T0.toISOString());
});

test("exatamente três: dois ou quatro motivos são rejeitados", () => {
  assert.throws(
    () => RegistroDeDecisao.create({ ...base, motivos: base.motivos.slice(0, 2) }),
    /exatamente três/
  );
  assert.throws(
    () =>
      RegistroDeDecisao.create({
        ...base,
        motivos: [...base.motivos, motivo("med-003")],
      }),
    /exatamente três/
  );
});

test("um motivo para cada médico: profissional repetido é rejeitado", () => {
  assert.throws(
    () =>
      RegistroDeDecisao.create({
        ...base,
        motivos: [motivo("med-001"), motivo("med-001"), motivo("med-002")],
      }),
    /profissional repetido/
  );
});

test("coerência: snapshot obrigatório, autor único, caso único", () => {
  assert.throws(
    () => RegistroDeDecisao.create({ ...base, snapshotId: " " }),
    /snapshot é obrigatório/
  );
  assert.throws(() => RegistroDeDecisao.create({ ...base, autor: "" }), /exige autor/);
  assert.throws(
    () =>
      RegistroDeDecisao.create({
        ...base,
        motivos: [motivo("med-001"), motivo("med-002"), motivo("med-006", "outro-curador")],
      }),
    /a decisão é de/
  );
  const motivoDeOutroCaso = MotivoDaEscolha.create({
    casoId: "caso-9999",
    professionalId: "med-006",
    texto: "Registro comprovado.",
    evidenciaIds: ["ev-x"],
    autorId: "curador-001",
    registradoEm: T0,
  });
  assert.throws(
    () =>
      RegistroDeDecisao.create({
        ...base,
        motivos: [motivo("med-001"), motivo("med-002"), motivoDeOutroCaso],
      }),
    /pertence ao caso/
  );
});

test("round-trip determinístico e sem valores numéricos", () => {
  const decisao = RegistroDeDecisao.create(base);
  const json = decisao.serializar();
  assert.equal(deserializarRegistroDeDecisao(json).serializar(), json);
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(JSON.parse(json)));
  assert.throws(() => (decisao.motivos as unknown[]).push({}));
  assert.throws(() => (decisao.trioSelecionado as unknown[]).push("med-999"));
});
