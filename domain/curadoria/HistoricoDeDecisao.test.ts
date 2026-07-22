import test from "node:test";
import assert from "node:assert/strict";
import {
  HistoricoDeDecisao,
  deserializarHistoricoDeDecisao,
} from "./HistoricoDeDecisao.ts";
import { MotivoDaEscolha } from "./MotivoDaEscolha.ts";
import { MotivoDaExclusao } from "./MotivoDaExclusao.ts";

const T0 = new Date("2026-07-22T12:00:00.000Z");

function escolha(professionalId: string): MotivoDaEscolha {
  return MotivoDaEscolha.create({
    casoId: "caso-001",
    professionalId,
    texto: "Residência comprovada na especialidade exigida.",
    evidenciaIds: ["ev-1"],
    autorId: "curador-001",
    registradoEm: T0,
  });
}

function exclusao(professionalId: string): MotivoDaExclusao {
  return MotivoDaExclusao.create({
    casoId: "caso-001",
    professionalId,
    texto: "Agenda indisponível no horizonte necessário.",
    evidenciaIds: ["ev-9"],
    autorId: "curador-001",
    registradoEm: T0,
  });
}

test("registra escolhas e exclusões na ordem cronológica", () => {
  const historico = HistoricoDeDecisao.vazio("caso-001")
    .registrarEscolha(escolha("med-001"))
    .registrarExclusao(exclusao("med-002"));
  assert.deepEqual(
    historico.decisoes.map((d) => [d.tipo, d.motivo.professionalId]),
    [
      ["escolha", "med-001"],
      ["exclusao", "med-002"],
    ]
  );
  assert.equal(historico.escolhas.length, 1);
  assert.equal(historico.exclusoes.length, 1);
});

test("nenhuma alteração apaga histórico: registrar preserva a instância anterior", () => {
  const antes = HistoricoDeDecisao.vazio("caso-001").registrarEscolha(escolha("med-001"));
  const depois = antes.registrarExclusao(exclusao("med-002"));
  assert.equal(antes.decisoes.length, 1);
  assert.equal(depois.decisoes.length, 2);
  assert.throws(() => (antes.decisoes as unknown[]).push({}));
});

test("decisões não são sobrescritas: segundo ato sobre o mesmo profissional é rejeitado", () => {
  const historico = HistoricoDeDecisao.vazio("caso-001").registrarEscolha(escolha("med-001"));
  assert.throws(() => historico.registrarEscolha(escolha("med-001")), /já tem escolha/);
  assert.throws(() => historico.registrarExclusao(exclusao("med-001")), /já tem escolha/);
});

test("motivo de outro caso é rejeitado", () => {
  const historico = HistoricoDeDecisao.vazio("caso-999");
  assert.throws(() => historico.registrarEscolha(escolha("med-001")), /pertence ao caso/);
});

test("round-trip por replay: reprodução determinística e sem valores numéricos", () => {
  const historico = HistoricoDeDecisao.vazio("caso-001")
    .registrarEscolha(escolha("med-001"))
    .registrarExclusao(exclusao("med-002"));
  const json = historico.serializar();
  assert.equal(deserializarHistoricoDeDecisao(json).serializar(), json);
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(JSON.parse(json)));
});
