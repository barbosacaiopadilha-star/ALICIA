import test from "node:test";
import assert from "node:assert/strict";
import { resolveProfessionalDataSource } from "./resolveProfessionalDataSource.ts";

test("origem ausente resolve para mock", () => {
  assert.equal(resolveProfessionalDataSource(undefined), "mock");
});

test("origem vazia (string em branco) resolve para mock", () => {
  assert.equal(resolveProfessionalDataSource("   "), "mock");
});

test("origem 'mock' explícita resolve para mock", () => {
  assert.equal(resolveProfessionalDataSource("mock"), "mock");
});

test("origem 'persistent' resolve para persistent (sem fallback silencioso)", () => {
  assert.equal(resolveProfessionalDataSource("persistent"), "persistent");
});

test("origem inválida lança erro claro, não seleciona mock silenciosamente", () => {
  assert.throws(() => resolveProfessionalDataSource("banco-de-dados-fantasia"), (error: unknown) => {
    const message = (error as Error).message;
    return message.includes("banco-de-dados-fantasia") && message.includes("mock") && message.includes("persistent");
  });
});
