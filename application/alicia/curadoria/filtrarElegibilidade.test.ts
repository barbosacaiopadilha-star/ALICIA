import test from "node:test";
import assert from "node:assert/strict";
import { CasoDeCuradoria } from "../../../domain/curadoria/CasoDeCuradoria.ts";
import { CasoId } from "../../../domain/curadoria/CasoId.ts";
import { PacienteId } from "../../../domain/curadoria/PacienteId.ts";
import {
  CriterioExcludente,
  CriterioIndeterminado,
  CriterioObrigatorio,
  CriterioPreferencial,
} from "../../../domain/curadoria/Criterio.ts";
import { FichaDeCompatibilidade } from "../../../domain/curadoria/FichaDeCompatibilidade.ts";
import { SnapshotDePublicacao } from "../../../domain/curadoria/SnapshotDePublicacao.ts";
import { filtrarElegibilidade } from "./filtrarElegibilidade.ts";

const T0 = new Date("2026-07-22T00:00:00.000Z");

function casoBase(): CasoDeCuradoria {
  const caso = CasoDeCuradoria.criar({
    id: CasoId.create("caso-001"),
    pacienteId: PacienteId.create("pac-001"),
  });
  caso.adicionarCriterio(
    CriterioObrigatorio.create({ id: "obr-1", descricao: "Residência na especialidade", origem: "historia_do_paciente" })
  );
  caso.adicionarCriterio(
    CriterioExcludente.create({ id: "excl-1", descricao: "Fora da abrangência geográfica", origem: "historia_do_paciente" })
  );
  caso.adicionarCriterio(
    CriterioPreferencial.create({ id: "pref-1", descricao: "Subespecialização", origem: "normalizacao" })
  );
  caso.adicionarCriterio(
    CriterioIndeterminado.create({ id: "ind-1", descricao: "Volume não documentado", origem: "curador" })
  );
  caso.registrarSnapshot("snap-001");
  return caso;
}

function snapshot(ids: string[]): SnapshotDePublicacao {
  return SnapshotDePublicacao.create({ id: "snap-001", criadoEm: T0, professionalIds: ids });
}

function ficha(
  professionalId: string,
  celulas: Array<{ criterioId: string; resultado: "atende" | "nao_atende" | "indeterminado"; evidenciaIds?: string[] }>
): FichaDeCompatibilidade {
  return FichaDeCompatibilidade.create({
    casoId: "caso-001",
    professionalId,
    celulas: celulas.map((c) => ({ ...c, evidenciaIds: c.evidenciaIds ?? [] })),
  });
}

const CELULAS_APROVADAS = [
  { criterioId: "obr-1", resultado: "atende" as const, evidenciaIds: ["ev-1"] },
  { criterioId: "excl-1", resultado: "nao_atende" as const },
  { criterioId: "pref-1", resultado: "nao_atende" as const },
  { criterioId: "ind-1", resultado: "indeterminado" as const },
];

test("profissional com obrigatório comprovado e sem excludente é elegível", () => {
  const conjunto = filtrarElegibilidade({
    caso: casoBase(),
    snapshot: snapshot(["med-001"]),
    fichas: [ficha("med-001", CELULAS_APROVADAS)],
  });
  assert.deepEqual([...conjunto.elegiveis], ["med-001"]);
  assert.equal(conjunto.exclusoes.length, 0);
});

test("excludente atendido exclui com o criterioId como motivo", () => {
  const conjunto = filtrarElegibilidade({
    caso: casoBase(),
    snapshot: snapshot(["med-001"]),
    fichas: [
      ficha("med-001", [
        ...CELULAS_APROVADAS.filter((c) => c.criterioId !== "excl-1"),
        { criterioId: "excl-1", resultado: "atende" },
      ]),
    ],
  });
  assert.deepEqual([...conjunto.elegiveis], []);
  assert.deepEqual([...conjunto.exclusoes], [{ professionalId: "med-001", criterioId: "excl-1" }]);
});

test("obrigatório sem evidência NÃO comprova — exclusão auditável (ADR-031)", () => {
  const conjunto = filtrarElegibilidade({
    caso: casoBase(),
    snapshot: snapshot(["med-001"]),
    fichas: [
      ficha("med-001", [
        ...CELULAS_APROVADAS.filter((c) => c.criterioId !== "obr-1"),
        { criterioId: "obr-1", resultado: "atende", evidenciaIds: [] },
      ]),
    ],
  });
  assert.deepEqual([...conjunto.exclusoes], [{ professionalId: "med-001", criterioId: "obr-1" }]);
});

test("obrigatório indeterminado não comprova; preferencial e indeterminado nunca eliminam", () => {
  const conjunto = filtrarElegibilidade({
    caso: casoBase(),
    snapshot: snapshot(["med-001", "med-002"]),
    fichas: [
      ficha("med-001", [
        ...CELULAS_APROVADAS.filter((c) => c.criterioId !== "obr-1"),
        { criterioId: "obr-1", resultado: "indeterminado" },
      ]),
      // med-002: preferencial nao_atende e indeterminado — segue elegível
      ficha("med-002", CELULAS_APROVADAS),
    ],
  });
  assert.deepEqual([...conjunto.elegiveis], ["med-002"]);
  assert.deepEqual([...conjunto.exclusoes], [{ professionalId: "med-001", criterioId: "obr-1" }]);
});

test("conjunto vazio é resultado legítimo (nenhum elegível)", () => {
  const conjunto = filtrarElegibilidade({
    caso: casoBase(),
    snapshot: snapshot([]),
    fichas: [],
  });
  assert.deepEqual([...conjunto.elegiveis], []);
});

test("guardas: snapshot divergente, ficha de outro caso, membro sem ficha, ficha estranha", () => {
  const caso = casoBase();
  assert.throws(
    () =>
      filtrarElegibilidade({
        caso,
        snapshot: SnapshotDePublicacao.create({ id: "snap-999", criadoEm: T0, professionalIds: [] }),
        fichas: [],
      }),
    /não é o registrado no caso/
  );
  assert.throws(
    () =>
      filtrarElegibilidade({
        caso,
        snapshot: snapshot(["med-001"]),
        fichas: [],
      }),
    /sem ficha/
  );
  assert.throws(
    () =>
      filtrarElegibilidade({
        caso,
        snapshot: snapshot(["med-001"]),
        fichas: [
          FichaDeCompatibilidade.create({ casoId: "outro-caso", professionalId: "med-001", celulas: [] }),
        ],
      }),
    /outro caso/
  );
  assert.throws(
    () =>
      filtrarElegibilidade({
        caso,
        snapshot: snapshot(["med-001"]),
        fichas: [ficha("med-999", CELULAS_APROVADAS), ficha("med-001", CELULAS_APROVADAS)],
      }),
    /não pertence ao snapshot/
  );
});

test("filtragem é determinística e sem qualquer valor numérico no resultado", () => {
  const executar = () =>
    filtrarElegibilidade({
      caso: casoBase(),
      snapshot: snapshot(["med-002", "med-001"]),
      fichas: [ficha("med-001", CELULAS_APROVADAS), ficha("med-002", CELULAS_APROVADAS)],
    });
  assert.equal(executar().serializar(), executar().serializar());
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(JSON.parse(executar().serializar())));
});
