import test from "node:test";
import assert from "node:assert/strict";
import {
  deserializarJustificativaDeSelecao,
  JustificativaDeSelecao,
  violaGramaticaRestrita,
} from "./JustificativaDeSelecao.ts";

const base = {
  casoId: "caso-001",
  professionalId: "med-001",
  fatos: [
    {
      texto: "Residência em Ortopedia concluída em programa credenciado.",
      evidenciaId: "ev-001",
    },
    { texto: "Atua em cirurgia do joelho em São Paulo.", evidenciaId: "ev-002" },
  ],
};

test("criação válida preserva os fatos na ordem aprovada", () => {
  const justificativa = JustificativaDeSelecao.create(base);
  assert.equal(justificativa.fatos.length, 2);
  assert.equal(justificativa.fatos[0].evidenciaId, "ev-001");
});

test("todo fato exige evidência — fato sem lastro é rejeitado", () => {
  assert.throws(
    () =>
      JustificativaDeSelecao.create({
        ...base,
        fatos: [{ texto: "Formação sólida.", evidenciaId: " " }],
      }),
    /exige evidência/
  );
});

test("exige ao menos um fato; ids obrigatórios", () => {
  assert.throws(() => JustificativaDeSelecao.create({ ...base, fatos: [] }), /ao menos um fato/);
  assert.throws(() => JustificativaDeSelecao.create({ ...base, casoId: " " }), /casoId/);
  assert.throws(
    () => JustificativaDeSelecao.create({ ...base, professionalId: "" }),
    /professionalId/
  );
});

test("gramática restrita: comparativos, superlativos e ranking são rejeitados", () => {
  for (const texto of [
    "É o melhor ortopedista da cidade.",
    "Mais experiente que os demais.",
    "Profissional excelente.",
    "Referência nacional em joelho.",
    "Top 1 do ranking regional.",
    "Nota máxima em avaliações.",
    "Altamente recomendado.",
  ]) {
    assert.throws(
      () =>
        JustificativaDeSelecao.create({
          ...base,
          fatos: [{ texto, evidenciaId: "ev-001" }],
        }),
      /gramática restrita/,
      `deveria rejeitar: ${texto}`
    );
  }
});

test("detector de gramática ignora caixa e acentos", () => {
  assert.equal(violaGramaticaRestrita("MELHOR opção"), "melhor");
  assert.equal(violaGramaticaRestrita("referencia da área"), "referencia");
  assert.equal(violaGramaticaRestrita("Residência em ortopedia"), undefined);
});

test("nenhum campo de posição, destaque ou preferência existe", () => {
  const justificativa = JustificativaDeSelecao.create(base);
  for (const proibido of ["posicao", "ordem", "destaque", "preferencia", "rank"]) {
    assert.ok(!(proibido in justificativa), `campo proibido presente: ${proibido}`);
  }
});

test("imutabilidade e serialização determinística com round-trip", () => {
  const justificativa = JustificativaDeSelecao.create(base);
  assert.throws(() =>
    (justificativa.fatos as unknown[]).push({ texto: "x", evidenciaId: "y" })
  );
  assert.throws(() => {
    (justificativa.fatos[0] as { texto: string }).texto = "alterado";
  });
  assert.equal(justificativa.serializar(), justificativa.serializar());
  assert.equal(
    deserializarJustificativaDeSelecao(justificativa.serializar()).serializar(),
    justificativa.serializar()
  );
});
