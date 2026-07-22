import test from "node:test";
import assert from "node:assert/strict";
import {
  deserializarEvidenceReference,
  EvidenceReference,
  TIPOS_DE_EVIDENCIA,
} from "./EvidenceReference.ts";

const props = {
  id: "ev-001",
  tipo: "registro_conselho" as const,
  referencia: "CRM fictício 000000/SP",
  capturadaEm: new Date("2026-07-01T00:00:00.000Z"),
};

test("criação válida preserva campos e copia a data", () => {
  const original = new Date("2026-07-01T00:00:00.000Z");
  const ev = EvidenceReference.create({ ...props, capturadaEm: original });
  original.setFullYear(1999);
  assert.equal(ev.capturadaEm?.getUTCFullYear(), 2026);
  assert.equal(ev.tipo, "registro_conselho");
});

test("invariantes: id, tipo e referencia obrigatórios", () => {
  assert.throws(() => EvidenceReference.create({ ...props, id: " " }), /id/);
  assert.throws(() => EvidenceReference.create({ ...props, referencia: "" }), /referencia/);
  assert.throws(
    () => EvidenceReference.create({ ...props, tipo: "invalido" as never }),
    /tipo desconhecido/
  );
});

test("opinião nunca é tipo de evidência (lista fechada sem opinião/avaliação/reputação)", () => {
  for (const proibido of ["opiniao", "avaliacao_paciente", "reputacao", "indicacao"]) {
    assert.ok(
      !TIPOS_DE_EVIDENCIA.includes(proibido as never),
      `tipo proibido presente na lista: ${proibido}`
    );
    assert.throws(() => EvidenceReference.create({ ...props, tipo: proibido as never }));
  }
});

test("igualdade por identidade", () => {
  const a = EvidenceReference.create(props);
  const b = EvidenceReference.create({ ...props, referencia: "outra ref" });
  assert.ok(a.equals(b));
  assert.ok(!a.equals(EvidenceReference.create({ ...props, id: "ev-002" })));
});

test("serialização determinística com round-trip, inclusive sem data", () => {
  const comData = EvidenceReference.create(props);
  assert.equal(comData.serializar(), comData.serializar());
  assert.equal(
    deserializarEvidenceReference(comData.serializar()).serializar(),
    comData.serializar()
  );

  const semData = EvidenceReference.create({ ...props, capturadaEm: undefined });
  assert.equal(
    deserializarEvidenceReference(semData.serializar()).serializar(),
    semData.serializar()
  );
});
