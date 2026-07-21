import test from "node:test";
import assert from "node:assert/strict";
import {
  validateRawProfessionalData,
  validateRawProfessionalDataList,
} from "./validateRawProfessionalData.ts";

function validRecord() {
  return {
    id: "med-001",
    slug: "ana-martins",
    nome: "Ana Martins",
    especialidadeId: "ortopedia",
    estadoSigla: "SP",
    cidade: "São Paulo",
    instituicaoPrincipal: "Hospital X",
    formacaoResumo: "Residência em Ortopedia e Traumatologia",
    verificado: true,
  };
}

test("registro válido passa sem alteração", () => {
  const record = validRecord();
  assert.deepEqual(validateRawProfessionalData(record), record);
});

test("coleção válida é preservada, mesma ordem", () => {
  const a = { ...validRecord(), id: "med-001" };
  const b = { ...validRecord(), id: "med-002", slug: "carlos-lima" };
  const result = validateRawProfessionalDataList([a, b]);
  assert.deepEqual(result, [a, b]);
});

test("campo obrigatório ausente (string vazia) lança erro", () => {
  const record = { ...validRecord(), nome: "" };
  assert.throws(() => validateRawProfessionalData(record), /nome/);
});

test("campo obrigatório ausente (undefined) lança erro", () => {
  const record: any = { ...validRecord() };
  delete record.cidade;
  assert.throws(() => validateRawProfessionalData(record), /cidade/);
});

test("tipo inválido (verificado não booleano) lança erro", () => {
  const record: any = { ...validRecord(), verificado: "sim" };
  assert.throws(() => validateRawProfessionalData(record), /verificado/);
});

test("mensagem de erro não expõe valores pessoais, apenas nomes de campo", () => {
  const record = { ...validRecord(), nome: "", cidade: "" };
  try {
    validateRawProfessionalData(record);
    assert.fail("deveria ter lançado");
  } catch (error) {
    const message = (error as Error).message;
    assert.ok(message.includes("nome"));
    assert.ok(message.includes("cidade"));
    // Nenhum outro valor do registro (ex.: id, slug, instituicaoPrincipal)
    // deve aparecer na mensagem além dos NOMES dos campos ausentes.
    assert.ok(!message.includes(record.id));
    assert.ok(!message.includes(record.instituicaoPrincipal));
  }
});

test("primeiro registro inválido de uma coleção interrompe a validação", () => {
  const a = { ...validRecord(), id: "med-001", nome: "" };
  const b = { ...validRecord(), id: "med-002" };
  assert.throws(() => validateRawProfessionalDataList([a, b]), /posição 0/);
});
