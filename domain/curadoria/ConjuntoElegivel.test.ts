import test from "node:test";
import assert from "node:assert/strict";
import {
  ConjuntoElegivel,
  deserializarConjuntoElegivel,
} from "./ConjuntoElegivel.ts";

const base = {
  casoId: "caso-001",
  snapshotId: "snap-001",
  elegiveis: ["med-002", "med-001"],
  exclusoes: [{ professionalId: "med-003", criterioId: "crit-excl-01" }],
};

test("criação normaliza o conjunto: dedup e ordem lexicográfica sem mérito", () => {
  const conjunto = ConjuntoElegivel.create({
    ...base,
    elegiveis: ["med-002", "med-001", "med-002"],
  });
  assert.deepEqual([...conjunto.elegiveis], ["med-001", "med-002"]);
  assert.ok(conjunto.contem("med-001"));
  assert.ok(!conjunto.contem("med-003"));
});

test("invariantes: casoId, snapshotId e ids válidos", () => {
  assert.throws(() => ConjuntoElegivel.create({ ...base, casoId: " " }), /casoId/);
  assert.throws(() => ConjuntoElegivel.create({ ...base, snapshotId: "" }), /snapshotId/);
  assert.throws(
    () => ConjuntoElegivel.create({ ...base, elegiveis: ["ok", " "] }),
    /professionalId vazio/
  );
});

test("toda exclusão exige o critério que a motivou", () => {
  assert.throws(
    () =>
      ConjuntoElegivel.create({
        ...base,
        exclusoes: [{ professionalId: "med-003", criterioId: " " }],
      }),
    /motivo registrado/
  );
});

test("um profissional não pode ser elegível e excluído ao mesmo tempo", () => {
  assert.throws(
    () =>
      ConjuntoElegivel.create({
        ...base,
        exclusoes: [{ professionalId: "med-001", criterioId: "crit-excl-01" }],
      }),
    /ao mesmo tempo/
  );
});

test("conjunto vazio é válido (caso especial 'nenhum elegível' do modelo)", () => {
  const conjunto = ConjuntoElegivel.create({ ...base, elegiveis: [], exclusoes: [] });
  assert.deepEqual([...conjunto.elegiveis], []);
});

test("imutabilidade: coleções congeladas, inclusive exclusões", () => {
  const conjunto = ConjuntoElegivel.create(base);
  assert.throws(() => (conjunto.elegiveis as string[]).push("med-x"));
  assert.throws(() => {
    (conjunto.exclusoes[0] as { criterioId: string }).criterioId = "outro";
  });
});

test("serialização determinística independe da ordem de entrada, com round-trip", () => {
  const a = ConjuntoElegivel.create(base);
  const b = ConjuntoElegivel.create({ ...base, elegiveis: ["med-001", "med-002"] });
  assert.equal(a.serializar(), b.serializar());
  assert.equal(deserializarConjuntoElegivel(a.serializar()).serializar(), a.serializar());
});
