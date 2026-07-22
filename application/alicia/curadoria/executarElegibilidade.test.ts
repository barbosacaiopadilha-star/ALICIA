import test from "node:test";
import assert from "node:assert/strict";
import { CasoDeCuradoria } from "../../../domain/curadoria/CasoDeCuradoria.ts";
import { CasoId } from "../../../domain/curadoria/CasoId.ts";
import { PacienteId } from "../../../domain/curadoria/PacienteId.ts";
import {
  CriterioExcludente,
  CriterioObrigatorio,
} from "../../../domain/curadoria/Criterio.ts";
import { SnapshotDePublicacao } from "../../../domain/curadoria/SnapshotDePublicacao.ts";
import { executarElegibilidade } from "./executarElegibilidade.ts";
import type { AvaliadorDeCriterio } from "./AvaliadorDeCriterio.ts";

const T0 = new Date("2026-07-22T00:00:00.000Z");

function casoEmAnalise(): CasoDeCuradoria {
  const caso = CasoDeCuradoria.criar({
    id: CasoId.create("caso-001"),
    pacienteId: PacienteId.create("pac-001"),
  });
  caso.adicionarCriterio(
    CriterioObrigatorio.create({ id: "obr-1", descricao: "Residência na especialidade", origem: "historia_do_paciente" })
  );
  caso.adicionarCriterio(
    CriterioExcludente.create({ id: "excl-1", descricao: "Fora da abrangência", origem: "historia_do_paciente" })
  );
  caso.registrarSnapshot("snap-001");
  caso.alterarStatus("em_analise");
  return caso;
}

const snapshot = SnapshotDePublicacao.create({
  id: "snap-001",
  criadoEm: T0,
  professionalIds: ["med-001", "med-002", "med-003"],
});

// med-001: obrigatório comprovado, sem excludente → elegível
// med-002: excludente atendido → excluído (excl-1)
// med-003: obrigatório indeterminado (sem avaliador) → excluído (obr-1)
const avaliadores: AvaliadorDeCriterio[] = [
  {
    criterioId: "obr-1",
    avaliar: (professionalId) =>
      professionalId === "med-001"
        ? { resultado: "atende", evidenciaIds: ["ev-1"] }
        : professionalId === "med-002"
          ? { resultado: "atende", evidenciaIds: ["ev-2"] }
          : { resultado: "indeterminado", evidenciaIds: [] },
  },
  {
    criterioId: "excl-1",
    avaliar: (professionalId) =>
      professionalId === "med-002"
        ? { resultado: "atende", evidenciaIds: [] }
        : { resultado: "nao_atende", evidenciaIds: [] },
  },
];

test("ponta a ponta: fichas para todos os membros e conjunto correto", () => {
  const resultado = executarElegibilidade({ caso: casoEmAnalise(), snapshot, avaliadores });
  assert.equal(resultado.fichas.length, 3);
  assert.deepEqual([...resultado.conjunto.elegiveis], ["med-001"]);
  assert.deepEqual(
    [...resultado.conjunto.exclusoes],
    [
      { professionalId: "med-002", criterioId: "excl-1" },
      { professionalId: "med-003", criterioId: "obr-1" },
    ]
  );
});

test("guardas de estado: status errado, sem snapshot, snapshot divergente", () => {
  const casoCriado = CasoDeCuradoria.criar({
    id: CasoId.create("caso-002"),
    pacienteId: PacienteId.create("pac-002"),
  });
  assert.throws(
    () => executarElegibilidade({ caso: casoCriado, snapshot, avaliadores }),
    /só roda em "em_analise"/
  );

  const casoSemSnapshot = CasoDeCuradoria.criar({
    id: CasoId.create("caso-003"),
    pacienteId: PacienteId.create("pac-003"),
  });
  casoSemSnapshot.alterarStatus("em_analise");
  assert.throws(
    () => executarElegibilidade({ caso: casoSemSnapshot, snapshot, avaliadores }),
    /sem snapshot registrado/
  );

  const casoOutroSnapshot = casoEmAnalise();
  const snapshotErrado = SnapshotDePublicacao.create({
    id: "snap-999",
    criadoEm: T0,
    professionalIds: [],
  });
  assert.throws(
    () => executarElegibilidade({ caso: casoOutroSnapshot, snapshot: snapshotErrado, avaliadores }),
    /não é o registrado/
  );
});

test("snapshot vazio produz conjunto vazio sem erro (nenhum elegível é legítimo)", () => {
  const caso = CasoDeCuradoria.criar({
    id: CasoId.create("caso-004"),
    pacienteId: PacienteId.create("pac-004"),
  });
  caso.registrarSnapshot("snap-vazio");
  caso.alterarStatus("em_analise");
  const vazio = SnapshotDePublicacao.create({ id: "snap-vazio", criadoEm: T0, professionalIds: [] });
  const resultado = executarElegibilidade({ caso, snapshot: vazio, avaliadores: [] });
  assert.deepEqual([...resultado.conjunto.elegiveis], []);
  assert.equal(resultado.fichas.length, 0);
});

test("resultado é determinístico e sem nenhum valor numérico (anti-agregado recursivo)", () => {
  const executar = () => executarElegibilidade({ caso: casoEmAnalise(), snapshot, avaliadores });
  const a = executar();
  const b = executar();
  assert.equal(a.conjunto.serializar(), b.conjunto.serializar());
  assert.deepEqual(
    a.fichas.map((f) => f.serializar()),
    b.fichas.map((f) => f.serializar())
  );
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  for (const serializado of [a.conjunto.serializar(), ...a.fichas.map((f) => f.serializar())]) {
    assert.ok(semNumeros(JSON.parse(serializado)));
  }
});

test("fichas expostas são congeladas", () => {
  const resultado = executarElegibilidade({ caso: casoEmAnalise(), snapshot, avaliadores });
  assert.throws(() => (resultado.fichas as unknown[]).push({}));
});
