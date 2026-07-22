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
import { avaliarCompatibilidade } from "./avaliarCompatibilidade.ts";
import type { AvaliadorDeCriterio } from "./AvaliadorDeCriterio.ts";

function casoComCriterios(): CasoDeCuradoria {
  const caso = CasoDeCuradoria.criar({
    id: CasoId.create("caso-001"),
    pacienteId: PacienteId.create("pac-001"),
  });
  caso.adicionarCriterio(
    CriterioObrigatorio.create({
      id: "crit-obr",
      descricao: "Residência na especialidade",
      origem: "historia_do_paciente",
    })
  );
  caso.adicionarCriterio(
    CriterioPreferencial.create({
      id: "crit-pref",
      descricao: "Subespecialização no procedimento",
      origem: "normalizacao",
    })
  );
  caso.adicionarCriterio(
    CriterioIndeterminado.create({
      id: "crit-indet",
      descricao: "Volume de procedimentos não documentado",
      origem: "curador",
    })
  );
  return caso;
}

function avaliador(
  criterioId: string,
  resultado: "atende" | "nao_atende" | "indeterminado",
  evidenciaIds: string[] = []
): AvaliadorDeCriterio {
  return { criterioId, avaliar: () => ({ resultado, evidenciaIds }) };
}

test("ficha cobre todos os critérios do caso com resultados categóricos", () => {
  const ficha = avaliarCompatibilidade({
    caso: casoComCriterios(),
    professionalId: "med-001",
    avaliadores: [
      avaliador("crit-obr", "atende", ["ev-001"]),
      avaliador("crit-pref", "nao_atende"),
    ],
  });
  assert.equal(ficha.celulas.length, 3);
  assert.equal(ficha.resultadoPara("crit-obr"), "atende");
  assert.equal(ficha.resultadoPara("crit-pref"), "nao_atende");
  assert.deepEqual([...ficha.celulas.find((c) => c.criterioId === "crit-obr")!.evidenciaIds], [
    "ev-001",
  ]);
});

test("avaliador ausente resulta em indeterminado — nunca nao_atende (§2)", () => {
  const ficha = avaliarCompatibilidade({
    caso: casoComCriterios(),
    professionalId: "med-001",
    avaliadores: [],
  });
  assert.equal(ficha.resultadoPara("crit-obr"), "indeterminado");
  assert.equal(ficha.resultadoPara("crit-pref"), "indeterminado");
});

test("critério do grupo indeterminado nunca é avaliado, mesmo com avaliador presente", () => {
  const ficha = avaliarCompatibilidade({
    caso: casoComCriterios(),
    professionalId: "med-001",
    avaliadores: [avaliador("crit-indet", "atende", ["ev-x"])],
  });
  assert.equal(ficha.resultadoPara("crit-indet"), "indeterminado");
  assert.deepEqual(
    [...ficha.celulas.find((c) => c.criterioId === "crit-indet")!.evidenciaIds],
    []
  );
});

test("avaliador duplicado e professionalId vazio falham explicitamente", () => {
  assert.throws(
    () =>
      avaliarCompatibilidade({
        caso: casoComCriterios(),
        professionalId: "med-001",
        avaliadores: [avaliador("crit-obr", "atende"), avaliador("crit-obr", "nao_atende")],
      }),
    /duplicado/
  );
  assert.throws(
    () =>
      avaliarCompatibilidade({
        caso: casoComCriterios(),
        professionalId: "  ",
        avaliadores: [],
      }),
    /professionalId/
  );
});

test("avaliação é determinística e a ficha herda as proteções do domínio", () => {
  const executar = () =>
    avaliarCompatibilidade({
      caso: casoComCriterios(),
      professionalId: "med-001",
      avaliadores: [avaliador("crit-obr", "atende", ["ev-002", "ev-001"])],
    });
  assert.equal(executar().serializar(), executar().serializar());
  assert.throws(
    () =>
      avaliarCompatibilidade({
        caso: casoComCriterios(),
        professionalId: "med-001",
        avaliadores: [avaliador("crit-obr", "parcial" as never)],
      }),
    /resultado desconhecido/
  );
});

test("caso excludente: resultado atende registra a incompatibilidade na ficha", () => {
  const caso = CasoDeCuradoria.criar({
    id: CasoId.create("caso-002"),
    pacienteId: PacienteId.create("pac-002"),
  });
  caso.adicionarCriterio(
    CriterioExcludente.create({
      id: "crit-excl",
      descricao: "Fora da abrangência geográfica aceita",
      origem: "historia_do_paciente",
    })
  );
  const ficha = avaliarCompatibilidade({
    caso,
    professionalId: "med-002",
    avaliadores: [avaliador("crit-excl", "atende")],
  });
  assert.equal(ficha.resultadoPara("crit-excl"), "atende");
});
