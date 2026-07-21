import test from "node:test";
import assert from "node:assert/strict";
import { agruparPorCidade } from "./agruparPorCidade.ts";

function medico(overrides: Partial<any> = {}): any {
  return {
    id: "med-001",
    slug: "joao-silva",
    nome: "João Silva",
    estadoSigla: "SP",
    especialidadeId: "ortopedia",
    cidade: "São Paulo",
    verificado: false,
    ...overrides,
  };
}

test("agrupa corretamente por cidade", () => {
  const medicos = [
    medico({ id: "1", cidade: "São Paulo" }),
    medico({ id: "2", cidade: "Rio de Janeiro" }),
  ];
  const grupos = agruparPorCidade(medicos);
  assert.equal(grupos.length, 2);
  assert.deepEqual(
    grupos.map((g) => g.cidade),
    ["Rio de Janeiro", "São Paulo"]
  );
});

test("cidades repetidas ficam no mesmo grupo, preservando quantidade", () => {
  const medicos = [
    medico({ id: "1", cidade: "São Paulo" }),
    medico({ id: "2", cidade: "São Paulo" }),
    medico({ id: "3", cidade: "Rio de Janeiro" }),
  ];
  const grupos = agruparPorCidade(medicos);
  const saoPaulo = grupos.find((g) => g.cidade === "São Paulo");
  assert.equal(saoPaulo?.medicos.length, 2);
});

test("ordenação dos grupos é determinística (alfabética)", () => {
  const medicos = [
    medico({ id: "1", cidade: "Vitória" }),
    medico({ id: "2", cidade: "Belo Horizonte" }),
    medico({ id: "3", cidade: "Aracaju" }),
  ];
  const grupos = agruparPorCidade(medicos);
  assert.deepEqual(
    grupos.map((g) => g.cidade),
    ["Aracaju", "Belo Horizonte", "Vitória"]
  );
});

test("coleção vazia retorna coleção de grupos vazia", () => {
  assert.deepEqual(agruparPorCidade([]), []);
});

test("médico sem cidade é agrupado sob rótulo explícito, sem quebrar", () => {
  const medicos = [medico({ id: "1", cidade: undefined })];
  const grupos = agruparPorCidade(medicos);
  assert.equal(grupos.length, 1);
  assert.equal(grupos[0].cidade, "Cidade não informada");
});
