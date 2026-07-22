import test from "node:test";
import assert from "node:assert/strict";
import { SessaoDeCuradoria } from "./SessaoDeCuradoria.ts";
import { ConjuntoElegivel } from "./ConjuntoElegivel.ts";
import { Observacao } from "./Observacao.ts";

const T0 = new Date("2026-07-22T12:00:00.000Z");
const T1 = new Date("2026-07-22T12:05:00.000Z");

const conjunto = ConjuntoElegivel.create({
  casoId: "caso-001",
  snapshotId: "snap-001",
  elegiveis: ["med-001", "med-002"],
  exclusoes: [{ professionalId: "med-003", criterioId: "excl-1" }],
});

function sessao(): SessaoDeCuradoria {
  return SessaoDeCuradoria.criar({
    id: "sessao-001",
    casoId: "caso-001",
    snapshotId: "snap-001",
    conjuntoElegivel: conjunto,
    iniciadoPor: "curador-001",
    createdAt: T0,
  });
}

test("criação: nasce criada, com autor, e a criação já é auditada", () => {
  const nova = sessao();
  assert.equal(nova.status, "criada");
  assert.equal(nova.iniciadoPor, "curador-001");
  assert.equal(nova.encerradoPor, undefined);
  assert.equal(nova.alteracoes.length, 1);
  const registro = nova.alteracoes[0];
  assert.equal(registro.id, "alt-0001");
  assert.equal(registro.sessaoId, "sessao-001");
  assert.equal(registro.tipo, "sessao_criada");
  assert.equal(registro.autor, "curador-001");
  assert.equal(registro.timestamp, T0.toISOString());
  assert.deepEqual(registro.payload, { casoId: "caso-001", snapshotId: "snap-001" });
});

test("criação: snapshot e conjunto são obrigatórios; sem autor não existe sessão", () => {
  assert.throws(
    () =>
      SessaoDeCuradoria.criar({
        id: "s",
        casoId: "caso-001",
        snapshotId: " ",
        conjuntoElegivel: conjunto,
        iniciadoPor: "curador-001",
      }),
    /snapshot é obrigatório/
  );
  assert.throws(
    () =>
      SessaoDeCuradoria.criar({
        id: "s",
        casoId: "caso-001",
        snapshotId: "snap-001",
        conjuntoElegivel: undefined as unknown as ConjuntoElegivel,
        iniciadoPor: "curador-001",
      }),
    /conjunto elegível é obrigatório/
  );
  assert.throws(
    () =>
      SessaoDeCuradoria.criar({
        id: "s",
        casoId: "caso-001",
        snapshotId: "snap-001",
        conjuntoElegivel: conjunto,
        iniciadoPor: "",
      }),
    /exige autor/
  );
});

test("criação: conjunto precisa ser coerente com caso e snapshot da sessão", () => {
  assert.throws(
    () =>
      SessaoDeCuradoria.criar({
        id: "s",
        casoId: "caso-999",
        snapshotId: "snap-001",
        conjuntoElegivel: conjunto,
        iniciadoPor: "curador-001",
      }),
    /pertence ao caso/
  );
  assert.throws(
    () =>
      SessaoDeCuradoria.criar({
        id: "s",
        casoId: "caso-001",
        snapshotId: "snap-999",
        conjuntoElegivel: conjunto,
        iniciadoPor: "curador-001",
      }),
    /vem do snapshot/
  );
});

test("transições: fluxo completo criada → em_analise → aguardando_decisao → concluida", () => {
  const s = sessao();
  s.iniciar({ autor: "curador-001", em: T1 });
  assert.equal(s.status, "em_analise");
  s.alterarStatus("aguardando_decisao", { autor: "curador-001", em: T1 });
  assert.equal(s.status, "aguardando_decisao");
  s.encerrar({ autor: "curador-002", em: T1 });
  assert.equal(s.status, "concluida");
  assert.equal(s.encerradoPor, "curador-002");
});

test("transições inválidas são rejeitadas; terminais só por encerrar/cancelar", () => {
  const s = sessao();
  assert.throws(() => s.encerrar({ autor: "curador-001" }), /não é permitida/);
  assert.throws(
    () => s.alterarStatus("aguardando_decisao", { autor: "curador-001" }),
    /não é permitida/
  );
  assert.throws(
    () => s.alterarStatus("concluida", { autor: "curador-001" }),
    /use encerrar\(\) ou cancelar\(\)/
  );
  assert.throws(
    () => s.alterarStatus("cancelada", { autor: "curador-001" }),
    /use encerrar\(\) ou cancelar\(\)/
  );
});

test("estados terminais não aceitam mutações", () => {
  const cancelada = sessao();
  cancelada.cancelar({ autor: "curador-001", em: T1, motivo: "Caso retirado pelo paciente." });
  assert.equal(cancelada.status, "cancelada");
  assert.equal(cancelada.encerradoPor, "curador-001");
  assert.throws(() => cancelada.iniciar({ autor: "curador-001" }), /não é permitida/);
  assert.throws(
    () => cancelada.registrarObservacao(Observacao.create("x", T1), { autor: "curador-001" }),
    /não é permitido em sessão "cancelada"/
  );
  assert.throws(() => cancelada.cancelar({ autor: "curador-001" }), /não é permitida/);

  const concluida = sessao();
  concluida.iniciar({ autor: "curador-001", em: T1 });
  concluida.alterarStatus("aguardando_decisao", { autor: "curador-001", em: T1 });
  concluida.encerrar({ autor: "curador-001", em: T1 });
  assert.throws(
    () => concluida.registrarObservacao(Observacao.create("x", T1), { autor: "curador-001" }),
    /não é permitido em sessão "concluida"/
  );
});

test("observações: registradas com auditoria; lista exposta é congelada", () => {
  const s = sessao();
  s.registrarObservacao(Observacao.create("Paciente prefere teleconsulta.", T1), {
    autor: "curador-001",
    em: T1,
  });
  assert.equal(s.observacoes.length, 1);
  assert.equal(s.observacoes[0].texto, "Paciente prefere teleconsulta.");
  const ultimo = s.alteracoes[s.alteracoes.length - 1];
  assert.equal(ultimo.tipo, "observacao_registrada");
  assert.deepEqual(ultimo.payload, { texto: "Paciente prefere teleconsulta." });
  assert.throws(() => (s.observacoes as unknown[]).push({}));
});

test("auditoria: toda mudança gera registro sequencial com autor, tipo e payload", () => {
  const s = sessao();
  s.iniciar({ autor: "curador-001", em: T1 });
  s.registrarObservacao(Observacao.create("Nota.", T1), { autor: "curador-002", em: T1 });
  s.alterarStatus("aguardando_decisao", { autor: "curador-001", em: T1 });
  s.encerrar({ autor: "curador-001", em: T1 });
  assert.deepEqual(
    s.alteracoes.map((registro) => [registro.id, registro.tipo, registro.autor]),
    [
      ["alt-0001", "sessao_criada", "curador-001"],
      ["alt-0002", "sessao_iniciada", "curador-001"],
      ["alt-0003", "observacao_registrada", "curador-002"],
      ["alt-0004", "status_alterado", "curador-001"],
      ["alt-0005", "sessao_encerrada", "curador-001"],
    ]
  );
  assert.deepEqual(s.alteracoes[3].payload, { de: "em_analise", para: "aguardando_decisao" });
  // mudança sem autor não existe
  assert.throws(() => sessao().iniciar({ autor: " " }), /exige autor/);
});

test("imutabilidade: alterações congeladas, datas por cópia, conjunto intocável", () => {
  const s = sessao();
  assert.throws(() => (s.alteracoes as unknown[]).push({}));
  assert.throws(() => {
    (s.alteracoes[0] as { autor: string }).autor = "impostor";
  });
  s.createdAt.setFullYear(1999);
  assert.equal(s.createdAt.toISOString(), T0.toISOString());
  // conjunto nunca é mutado diretamente: exposição imutável
  assert.equal(s.conjuntoElegivel, conjunto);
  assert.throws(() => (s.conjuntoElegivel.elegiveis as unknown[]).push("med-999"));
  assert.throws(() => (s.conjuntoElegivel.exclusoes as unknown[]).push({}));
});

test("sessão organiza, não decide: nenhum método de seleção/aprovação/rejeição existe", () => {
  const s = sessao() as unknown as Record<string, unknown>;
  for (const proibido of [
    "selecionarMedico",
    "aprovarMedico",
    "rejeitarMedico",
    "selecionar",
    "aprovar",
    "rejeitar",
  ]) {
    assert.equal(s[proibido], undefined);
  }
});
