import test from "node:test";
import assert from "node:assert/strict";
import {
  matchesProfessionalCatalogSearchCriteria,
  sortProfessionalCatalogProjections,
} from "./ProfessionalCatalogQuery.ts";

function projection(overrides: Partial<any> = {}): any {
  return {
    id: "med-001",
    slug: "joao-silva",
    fullName: "João Silva",
    specialties: [{ id: "ortopedia", name: "Ortopedia" }],
    education: [],
    primaryLocation: { id: "loc-1", name: "Hospital Central", city: "São Paulo", state: "SP" },
    languages: [],
    ...overrides,
  };
}

// --- Busca ---

test("busca é case-insensitive", () => {
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(projection(), { texto: "joão" }),
    true
  );
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(projection(), { texto: "JOÃO" }),
    true
  );
});

test("busca é accent-insensitive", () => {
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(projection(), { texto: "joao" }),
    true
  );
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(
      projection({ primaryLocation: { id: "l", name: "H", city: "São Paulo", state: "SP" } }),
      { texto: "sao paulo" }
    ),
    true
  );
});

test("busca tolera espaços extras", () => {
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(projection(), { texto: "  joão   silva  " }),
    true
  );
});

test("busca é por substring", () => {
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(projection(), { texto: "silva" }),
    true
  );
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(projection(), { texto: "maria" }),
    false
  );
});

test("combinação de texto e cidade — ambos precisam corresponder", () => {
  const item = projection();
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(item, { texto: "silva", cidade: "São Paulo" }),
    true
  );
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(item, { texto: "silva", cidade: "Rio de Janeiro" }),
    false
  );
});

test("cidade inválida (inexistente) não corresponde a nenhum item", () => {
  assert.equal(
    matchesProfessionalCatalogSearchCriteria(projection(), { cidade: "Cidade Inexistente" }),
    false
  );
});

test("filtros são opcionais — critério vazio corresponde a tudo", () => {
  assert.equal(matchesProfessionalCatalogSearchCriteria(projection(), {}), true);
});

// --- Ordenação ---

test("relevance preserva a ordem original", () => {
  const items = [projection({ id: "b", fullName: "Beatriz" }), projection({ id: "a", fullName: "Ana" })];
  const result = sortProfessionalCatalogProjections(items, "relevance");
  assert.deepEqual(result.map((i) => i.id), ["b", "a"]);
});

test("name-asc ordena alfabeticamente crescente", () => {
  const items = [projection({ id: "b", fullName: "Beatriz" }), projection({ id: "a", fullName: "Ana" })];
  const result = sortProfessionalCatalogProjections(items, "name-asc");
  assert.deepEqual(result.map((i) => i.id), ["a", "b"]);
});

test("name-desc ordena alfabeticamente decrescente", () => {
  const items = [projection({ id: "a", fullName: "Ana" }), projection({ id: "b", fullName: "Beatriz" })];
  const result = sortProfessionalCatalogProjections(items, "name-desc");
  assert.deepEqual(result.map((i) => i.id), ["b", "a"]);
});

test("ordenação ignora acentos na comparação", () => {
  const items = [projection({ id: "x", fullName: "Ângela" }), projection({ id: "y", fullName: "Ana" })];
  const result = sortProfessionalCatalogProjections(items, "name-asc");
  // "Ana" e "Ângela" têm a mesma base nas duas primeiras letras (a≈â, n=n);
  // a terceira letra decide: "a" < "g" → Ana vem primeiro.
  assert.deepEqual(result.map((i) => i.id), ["y", "x"]);
});

test("ordenação não muta o array de entrada", () => {
  const items = [projection({ id: "b", fullName: "Beatriz" }), projection({ id: "a", fullName: "Ana" })];
  const original = [...items];
  sortProfessionalCatalogProjections(items, "name-asc");
  assert.deepEqual(items, original);
});

test("sort padrão (sem argumento) equivale a relevance", () => {
  const items = [projection({ id: "b", fullName: "Beatriz" }), projection({ id: "a", fullName: "Ana" })];
  const result = sortProfessionalCatalogProjections(items);
  assert.deepEqual(result.map((i) => i.id), ["b", "a"]);
});
