import test from "node:test";
import assert from "node:assert/strict";
import {
  deserializarFichaDeCompatibilidade,
  FichaDeCompatibilidade,
} from "./FichaDeCompatibilidade.ts";

const base = {
  casoId: "caso-001",
  professionalId: "med-001",
  celulas: [
    { criterioId: "crit-002", resultado: "indeterminado" as const, evidenciaIds: [] },
    { criterioId: "crit-001", resultado: "atende" as const, evidenciaIds: ["ev-002", "ev-001"] },
  ],
};

test("criação válida: células normalizadas por critério, evidências ordenadas", () => {
  const ficha = FichaDeCompatibilidade.create(base);
  assert.deepEqual(
    ficha.celulas.map((c) => c.criterioId),
    ["crit-001", "crit-002"]
  );
  assert.deepEqual([...ficha.celulas[0].evidenciaIds], ["ev-001", "ev-002"]);
  assert.equal(ficha.resultadoPara("crit-001"), "atende");
  assert.equal(ficha.resultadoPara("crit-002"), "indeterminado");
  assert.equal(ficha.resultadoPara("nao-existe"), undefined);
});

test("invariantes: ids obrigatórios, resultado válido, sem célula duplicada", () => {
  assert.throws(() => FichaDeCompatibilidade.create({ ...base, casoId: " " }), /casoId/);
  assert.throws(
    () => FichaDeCompatibilidade.create({ ...base, professionalId: "" }),
    /professionalId/
  );
  assert.throws(
    () =>
      FichaDeCompatibilidade.create({
        ...base,
        celulas: [
          { criterioId: "c1", resultado: "atende", evidenciaIds: [] },
          { criterioId: "c1", resultado: "nao_atende", evidenciaIds: [] },
        ],
      }),
    /duplicada/
  );
  assert.throws(
    () =>
      FichaDeCompatibilidade.create({
        ...base,
        celulas: [{ criterioId: "c1", resultado: "parcial" as never, evidenciaIds: [] }],
      }),
    /resultado desconhecido/
  );
});

test("anti-agregado: nenhuma nota, soma ou número em nenhuma camada da ficha", () => {
  const ficha = FichaDeCompatibilidade.create(base);
  for (const proibido of ["score", "total", "nota", "peso", "somar", "pontuacao"]) {
    assert.ok(!(proibido in ficha), `membro proibido presente: ${proibido}`);
  }
  const serializado = JSON.parse(ficha.serializar());
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") {
      return Object.values(valor).every(semNumeros);
    }
    return true;
  };
  assert.ok(semNumeros(serializado), "serialização contém valor numérico");
});

test("célula indeterminada é estado legítimo — nunca colapsa para nao_atende", () => {
  const ficha = FichaDeCompatibilidade.create(base);
  assert.equal(ficha.resultadoPara("crit-002"), "indeterminado");
  assert.notEqual(ficha.resultadoPara("crit-002"), "nao_atende");
});

test("imutabilidade: células e listas de evidência congeladas", () => {
  const ficha = FichaDeCompatibilidade.create(base);
  assert.throws(() =>
    (ficha.celulas as unknown[]).push({ criterioId: "x", resultado: "atende", evidenciaIds: [] })
  );
  assert.throws(() => {
    (ficha.celulas[0] as { resultado: string }).resultado = "nao_atende";
  });
  assert.throws(() => (ficha.celulas[0].evidenciaIds as string[]).push("ev-x"));
});

test("serialização determinística independe da ordem de entrada, com round-trip", () => {
  const a = FichaDeCompatibilidade.create(base);
  const b = FichaDeCompatibilidade.create({
    ...base,
    celulas: [base.celulas[1], base.celulas[0]],
  });
  assert.equal(a.serializar(), b.serializar());
  assert.equal(
    deserializarFichaDeCompatibilidade(a.serializar()).serializar(),
    a.serializar()
  );
});
