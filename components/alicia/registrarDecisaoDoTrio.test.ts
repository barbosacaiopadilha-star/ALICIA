import test from "node:test";
import assert from "node:assert/strict";
import { montarCasoControlado } from "./montarCasoControlado.ts";
import { registrarDecisaoDoTrio, type EscolhaDoCurador } from "./registrarDecisaoDoTrio.ts";

const T0 = new Date("2026-07-22T15:00:00.000Z");

const workspace = montarCasoControlado();

function escolha(professionalId: string, evidenciaIds: string[] = ["ev-001-crm"]): EscolhaDoCurador {
  return {
    professionalId,
    texto: "Residência e registro comprovados, com atuação documentada compatível com o caso.",
    evidenciaIds,
  };
}

const TRIO_VALIDO: EscolhaDoCurador[] = [
  escolha("med-001", ["ev-001-res", "ev-001-joelho"]),
  escolha("med-002", ["ev-002-res"]),
  escolha("med-006", ["ev-006-res"]),
];

function registrar(escolhas: ReadonlyArray<EscolhaDoCurador>, autor = "curador-ana") {
  return registrarDecisaoDoTrio({
    casoId: workspace.caso.id.value,
    conjunto: workspace.conjunto,
    escolhas,
    autor,
    em: T0,
  });
}

test("registra o trio com autor, timestamp, motivos, evidências e histórico", () => {
  const { historico, registro } = registrar(TRIO_VALIDO);
  assert.equal(historico.escolhas.length, 3);
  for (const motivo of historico.escolhas) {
    assert.equal(motivo.autorId, "curador-ana");
    assert.equal(motivo.registradoEm.toISOString(), T0.toISOString());
    assert.ok(motivo.evidenciaIds.length > 0);
  }
  assert.deepEqual(
    registro.alteracoes.map((alteracao) => [alteracao.id, alteracao.tipo, alteracao.autorId]),
    [
      ["alt-0001", "escolha_registrada", "curador-ana"],
      ["alt-0002", "escolha_registrada", "curador-ana"],
      ["alt-0003", "escolha_registrada", "curador-ana"],
    ]
  );
});

test("bloqueia um, dois ou quatro médicos — o trio é exatamente três", () => {
  assert.throws(() => registrar([TRIO_VALIDO[0]]), /exatamente três/);
  assert.throws(() => registrar(TRIO_VALIDO.slice(0, 2)), /exatamente três/);
  assert.throws(
    () => registrar([...TRIO_VALIDO, escolha("med-003", ["ev-003-res"])]),
    /exatamente três/
  );
});

test("bloqueia médico fora do conjunto elegível e vaga duplicada", () => {
  assert.throws(
    () => registrar([TRIO_VALIDO[0], TRIO_VALIDO[1], escolha("med-004", ["ev-004-crm"])]),
    /não está no conjunto elegível/
  );
  assert.throws(
    () => registrar([TRIO_VALIDO[0], TRIO_VALIDO[0], TRIO_VALIDO[1]]),
    /duas vagas/
  );
});

test("o domínio barra decisão sem autor, sem evidência ou com linguagem de ranking", () => {
  assert.throws(() => registrar(TRIO_VALIDO, "  "), /exige autor/);
  assert.throws(
    () => registrar([{ ...TRIO_VALIDO[0], evidenciaIds: [] }, TRIO_VALIDO[1], TRIO_VALIDO[2]]),
    /ao menos uma evidência/
  );
  assert.throws(
    () =>
      registrar([
        { ...TRIO_VALIDO[0], texto: "É o melhor ortopedista da cidade." },
        TRIO_VALIDO[1],
        TRIO_VALIDO[2],
      ]),
    /gramática restrita/
  );
});

test("histórico preservado: coleções congeladas e decisões não sobrescritas", () => {
  const { historico, registro } = registrar(TRIO_VALIDO);
  assert.throws(() => (historico.decisoes as unknown[]).push({}));
  assert.throws(() => (registro.alteracoes as unknown[]).push({}));
  assert.throws(
    () => historico.registrarEscolha(historico.escolhas[0]),
    /já tem escolha/
  );
});

test("ausência de ranking e score no registro: nada numérico, ordem sem mérito", () => {
  const { historico, registro } = registrar(TRIO_VALIDO);
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(JSON.parse(historico.serializar())));
  assert.ok(semNumeros(JSON.parse(registro.serializar())));
  for (const termo of ["score", "ranking", "nota", "peso"]) {
    assert.ok(!historico.serializar().includes(`"${termo}"`));
    assert.ok(!registro.serializar().includes(`"${termo}"`));
  }
});
