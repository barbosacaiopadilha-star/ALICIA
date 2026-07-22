import test from "node:test";
import assert from "node:assert/strict";
import { montarCasoControlado } from "./montarCasoControlado.ts";
import { confirmarCuradoria, type EscolhaDoCurador } from "./confirmarCuradoria.ts";

const T0 = new Date("2026-07-22T15:00:00.000Z");

const workspace = montarCasoControlado();

function escolha(professionalId: string, evidenciaIds: string[]): EscolhaDoCurador {
  return {
    professionalId,
    justificativa:
      "Residência e registro comprovados, com atuação documentada compatível com o caso.",
    evidenciaIds,
  };
}

const TRIO_VALIDO: EscolhaDoCurador[] = [
  escolha("med-001", ["ev-001-res", "ev-001-joelho"]),
  escolha("med-002", ["ev-002-res"]),
  escolha("med-006", ["ev-006-res"]),
];

function confirmar(escolhas: ReadonlyArray<EscolhaDoCurador>, autor = "curador-ana") {
  return confirmarCuradoria({
    caso: workspace.caso,
    conjunto: workspace.conjunto,
    escolhas,
    autor,
    em: T0,
  });
}

test("confirma a curadoria: decisão registrada, auditada e sessão encerrada", () => {
  const sessao = confirmar(TRIO_VALIDO);
  assert.equal(sessao.status, "concluida");
  assert.equal(sessao.encerradoPor, "curador-ana");
  const decisao = sessao.decisao;
  assert.ok(decisao);
  assert.equal(decisao.autor, "curador-ana");
  assert.equal(decisao.snapshotId, "snap-0001");
  assert.equal(decisao.timestamp.toISOString(), T0.toISOString());
  assert.deepEqual([...decisao.trioSelecionado], ["med-001", "med-002", "med-006"]);
  for (const professionalId of decisao.trioSelecionado) {
    const motivo = decisao.motivoPara(professionalId);
    assert.ok(motivo && motivo.evidenciaIds.length > 0);
  }
  const tipos = sessao.alteracoes.map((a) => a.tipo);
  assert.deepEqual(tipos, [
    "sessao_criada",
    "sessao_iniciada",
    "status_alterado",
    "decisao_registrada",
    "sessao_encerrada",
  ]);
});

test("exatamente três: um, dois ou quatro são bloqueados", () => {
  assert.throws(() => confirmar([TRIO_VALIDO[0]]), /exatamente três/);
  assert.throws(() => confirmar(TRIO_VALIDO.slice(0, 2)), /exatamente três/);
  assert.throws(
    () => confirmar([...TRIO_VALIDO, escolha("med-003", ["ev-003-res"])]),
    /exatamente três/
  );
});

test("motivo ausente e evidência ausente são bloqueados pelo domínio", () => {
  assert.throws(
    () =>
      confirmar([
        { ...TRIO_VALIDO[0], justificativa: "   " },
        TRIO_VALIDO[1],
        TRIO_VALIDO[2],
      ]),
    /texto do motivo não pode ser vazio/
  );
  assert.throws(
    () =>
      confirmar([{ ...TRIO_VALIDO[0], evidenciaIds: [] }, TRIO_VALIDO[1], TRIO_VALIDO[2]]),
    /ao menos uma evidência/
  );
});

test("só elegíveis, sem repetição, sem autor não existe decisão", () => {
  assert.throws(
    () => confirmar([TRIO_VALIDO[0], TRIO_VALIDO[1], escolha("med-004", ["ev-004-crm"])]),
    /não está no conjunto elegível/
  );
  assert.throws(
    () => confirmar([TRIO_VALIDO[0], TRIO_VALIDO[0], TRIO_VALIDO[1]]),
    /profissional repetido/
  );
  assert.throws(() => confirmar(TRIO_VALIDO, "  "), /exige autor/);
});

test("tentativa de segunda decisão é bloqueada; histórico preservado e somente leitura", () => {
  const sessao = confirmar(TRIO_VALIDO);
  assert.throws(
    () =>
      sessao.registrarDecisao({
        autor: "curador-ana",
        motivos: [],
      }),
    /uma sessão decide uma única vez/
  );
  assert.throws(() => (sessao.alteracoes as unknown[]).push({}));
  assert.throws(() => (sessao.decisao?.motivos as unknown[]).push({}));
  assert.throws(() => {
    (sessao.alteracoes[0] as { autor: string }).autor = "impostor";
  });
});

test("sem ranking e sem score: decisão integralmente categórica", () => {
  const sessao = confirmar(TRIO_VALIDO);
  const json = sessao.decisao?.serializar() ?? "";
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(JSON.parse(json)));
  for (const termo of ["score", "ranking", "nota", "peso", "posicao"]) {
    assert.ok(!json.includes(`"${termo}"`));
  }
});
