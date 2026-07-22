import test from "node:test";
import assert from "node:assert/strict";
import {
  deserializarSnapshotDePublicacao,
  SnapshotDePublicacao,
} from "./SnapshotDePublicacao.ts";

const T0 = new Date("2026-07-21T10:00:00.000Z");

test("criação normaliza: deduplica e ordena ids (sem significado de mérito)", () => {
  const snap = SnapshotDePublicacao.create({
    id: "snap-001",
    criadoEm: T0,
    professionalIds: ["med-002", "med-001", "med-002"],
  });
  assert.deepEqual([...snap.professionalIds], ["med-001", "med-002"]);
  assert.ok(snap.contem("med-001"));
  assert.ok(!snap.contem("med-999"));
});

test("invariantes: id, criadoEm e professionalIds válidos", () => {
  assert.throws(
    () => SnapshotDePublicacao.create({ id: " ", criadoEm: T0, professionalIds: [] }),
    /id/
  );
  assert.throws(
    () =>
      SnapshotDePublicacao.create({
        id: "s",
        criadoEm: undefined as unknown as Date,
        professionalIds: [],
      }),
    /criadoEm/
  );
  assert.throws(
    () =>
      SnapshotDePublicacao.create({ id: "s", criadoEm: T0, professionalIds: ["ok", " "] }),
    /professionalId vazio/
  );
});

test("snapshot é imutável: sem métodos de mutação, coleção congelada, data por cópia", () => {
  const snap = SnapshotDePublicacao.create({
    id: "snap-001",
    criadoEm: T0,
    professionalIds: ["med-001"],
  });
  assert.throws(() => (snap.professionalIds as string[]).push("med-x"));
  snap.criadoEm.setFullYear(1999);
  assert.equal(snap.criadoEm.getUTCFullYear(), 2026);
  const proto = Object.getPrototypeOf(snap) as object;
  const metodos = Object.getOwnPropertyNames(proto).filter(
    (nome) => nome !== "constructor"
  );
  assert.deepEqual(metodos.sort(), ["contem", "criadoEm", "equals", "professionalIds", "serializar"]);
});

test("serialização determinística independe da ordem de entrada", () => {
  const a = SnapshotDePublicacao.create({
    id: "snap-001",
    criadoEm: T0,
    professionalIds: ["med-002", "med-001"],
  });
  const b = SnapshotDePublicacao.create({
    id: "snap-001",
    criadoEm: T0,
    professionalIds: ["med-001", "med-002"],
  });
  assert.equal(a.serializar(), b.serializar());
  assert.equal(
    deserializarSnapshotDePublicacao(a.serializar()).serializar(),
    a.serializar()
  );
});
