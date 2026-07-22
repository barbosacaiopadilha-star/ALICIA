import test from "node:test";
import assert from "node:assert/strict";
import { CasoDeCuradoria } from "./CasoDeCuradoria.ts";
import { CasoId } from "./CasoId.ts";
import { PacienteId } from "./PacienteId.ts";
import { Observacao } from "./Observacao.ts";
import { CriterioDoCaso } from "./CriterioDoCaso.ts";
import {
  STATUS_DA_CURADORIA,
  statusTerminal,
  transicaoPermitida,
} from "./StatusDaCuradoria.ts";

const T0 = new Date("2026-07-21T10:00:00.000Z");
const T1 = new Date("2026-07-21T11:00:00.000Z");

function casoNovo(): CasoDeCuradoria {
  return CasoDeCuradoria.criar({
    id: CasoId.create("caso-001"),
    pacienteId: PacienteId.create("pac-001"),
    createdAt: T0,
  });
}

function criterio(id = "crit-001"): CriterioDoCaso {
  return CriterioDoCaso.create({
    id,
    grupo: "obrigatorio",
    descricao: "Residência na especialidade do caso",
  });
}

// ─── Criação ────────────────────────────────────────────────────────

test("criação válida: status inicial, coleções vazias e datas iguais", () => {
  const caso = casoNovo();
  assert.equal(caso.status, "criado");
  assert.deepEqual([...caso.criterios], []);
  assert.deepEqual([...caso.observacoes], []);
  assert.equal(caso.snapshotId, undefined);
  assert.equal(caso.createdAt.getTime(), T0.getTime());
  assert.equal(caso.updatedAt.getTime(), T0.getTime());
});

test("criação inválida: ids vazios falham nos value objects", () => {
  assert.throws(() => CasoId.create("  "), /CasoId/);
  assert.throws(() => PacienteId.create(""), /PacienteId/);
});

test("criação inválida: id e pacienteId obrigatórios no agregado", () => {
  assert.throws(
    () =>
      CasoDeCuradoria.criar({
        id: undefined as unknown as CasoId,
        pacienteId: PacienteId.create("pac-001"),
      }),
    /id é obrigatório/
  );
  assert.throws(
    () =>
      CasoDeCuradoria.criar({
        id: CasoId.create("caso-001"),
        pacienteId: undefined as unknown as PacienteId,
      }),
    /pacienteId é obrigatório/
  );
});

// ─── Transições de status ───────────────────────────────────────────

test("fluxo linear completo até encerrado é permitido", () => {
  const caso = casoNovo();
  caso.alterarStatus("em_analise", T1);
  caso.alterarStatus("aguardando_curador", T1);
  caso.alterarStatus("pronto_para_curadoria", T1);
  caso.alterarStatus("curadoria_concluida", T1);
  caso.alterarStatus("encerrado", T1);
  assert.equal(caso.status, "encerrado");
});

test("transição inválida falha explicitamente e não altera o estado", () => {
  const caso = casoNovo();
  assert.throws(() => caso.alterarStatus("curadoria_concluida"), /não é permitida/);
  assert.equal(caso.status, "criado");
});

test("estados terminais não transicionam (nem para cancelado)", () => {
  const caso = casoNovo();
  caso.alterarStatus("cancelado", T1);
  for (const destino of STATUS_DA_CURADORIA) {
    assert.throws(() => caso.alterarStatus(destino));
  }
});

test("mapa de transições: terminais são exatamente encerrado e cancelado", () => {
  const terminais = STATUS_DA_CURADORIA.filter(statusTerminal);
  assert.deepEqual(terminais, ["encerrado", "cancelado"]);
  assert.equal(transicaoPermitida("curadoria_concluida", "cancelado"), false);
});

// ─── Observações ────────────────────────────────────────────────────

test("observação válida é registrada e atualiza updatedAt", () => {
  const caso = casoNovo();
  caso.adicionarObservacao(Observacao.create("Paciente prefere manhã.", T1), T1);
  assert.equal(caso.observacoes.length, 1);
  assert.equal(caso.observacoes[0].texto, "Paciente prefere manhã.");
  assert.equal(caso.updatedAt.getTime(), T1.getTime());
});

test("observação com texto vazio é rejeitada pelo value object", () => {
  assert.throws(() => Observacao.create("   "), /não pode ser vazio/);
});

test("observação em caso terminal é rejeitada", () => {
  const caso = casoNovo();
  caso.alterarStatus("cancelado");
  assert.throws(
    () => caso.adicionarObservacao(Observacao.create("tarde demais")),
    /não é permitido em caso "cancelado"/
  );
});

// ─── Critérios ──────────────────────────────────────────────────────

test("adicionar e remover critério funcionam e nunca aceitam duplicata", () => {
  const caso = casoNovo();
  caso.adicionarCriterio(criterio(), T1);
  assert.equal(caso.criterios.length, 1);
  assert.throws(() => caso.adicionarCriterio(criterio()), /já existe/);
  caso.removerCriterio("crit-001", T1);
  assert.equal(caso.criterios.length, 0);
});

test("remover critério inexistente falha explicitamente", () => {
  const caso = casoNovo();
  assert.throws(() => caso.removerCriterio("nao-existe"), /não existe/);
});

test("critério exige grupo válido e descrição não vazia", () => {
  assert.throws(
    () =>
      CriterioDoCaso.create({
        id: "c",
        grupo: "ranking" as never,
        descricao: "x",
      }),
    /grupo desconhecido/
  );
  assert.throws(
    () => CriterioDoCaso.create({ id: "c", grupo: "obrigatorio", descricao: " " }),
    /descricao/
  );
});

// ─── Snapshot ───────────────────────────────────────────────────────

test("registrarSnapshot grava id e rejeita vazio", () => {
  const caso = casoNovo();
  caso.registrarSnapshot("snap-001", T1);
  assert.equal(caso.snapshotId, "snap-001");
  assert.throws(() => caso.registrarSnapshot("  "), /snapshotId/);
  assert.equal(caso.snapshotId, "snap-001");
});

test("registrarSnapshot em caso terminal é rejeitado", () => {
  const caso = casoNovo();
  caso.alterarStatus("cancelado");
  assert.throws(() => caso.registrarSnapshot("snap-002"));
});

// ─── Imutabilidade e invariantes ────────────────────────────────────

test("createdAt é imutável de fato: mutar a cópia exposta não afeta o agregado", () => {
  const caso = casoNovo();
  const exposta = caso.createdAt;
  exposta.setFullYear(1999);
  assert.equal(caso.createdAt.getUTCFullYear(), 2026);
});

test("coleções expostas são cópias congeladas: mutação externa não vaza", () => {
  const caso = casoNovo();
  caso.adicionarCriterio(criterio());
  const criterios = caso.criterios as CriterioDoCaso[];
  assert.throws(() => criterios.push(criterio("crit-002")));
  assert.equal(caso.criterios.length, 1);
});

test("updatedAt avança a cada mutação; createdAt permanece", () => {
  const caso = casoNovo();
  caso.alterarStatus("em_analise", T1);
  assert.equal(caso.createdAt.getTime(), T0.getTime());
  assert.equal(caso.updatedAt.getTime(), T1.getTime());
});

test("não há setters públicos no agregado", () => {
  const proto = Object.getPrototypeOf(casoNovo()) as object;
  for (const nome of Object.getOwnPropertyNames(proto)) {
    const descritor = Object.getOwnPropertyDescriptor(proto, nome);
    assert.equal(descritor?.set, undefined, `setter público encontrado: ${nome}`);
  }
});
