import test from "node:test";
import assert from "node:assert/strict";
import { montarCasoControlado } from "./montarCasoControlado.ts";
import { confirmarCuradoria } from "./confirmarCuradoria.ts";
import { gerarDossieDeCuradoria } from "./gerarDossieDeCuradoria.ts";
import { deserializarRegistroDeDecisao } from "../../domain/curadoria/RegistroDeDecisao.ts";

const T0 = new Date("2026-07-22T18:00:00.000Z");

const workspace = montarCasoControlado();

const sessao = confirmarCuradoria({
  caso: workspace.caso,
  conjunto: workspace.conjunto,
  escolhas: [
    {
      professionalId: "med-001",
      justificativa:
        "Residência em Ortopedia e atuação documentada em cirurgia do joelho, compatíveis com o caso.",
      evidenciaIds: ["ev-001-res", "ev-001-joelho"],
    },
    {
      professionalId: "med-002",
      justificativa: "Residência em Ortopedia e atendimento presencial em São Paulo, documentados.",
      evidenciaIds: ["ev-002-res"],
    },
    {
      professionalId: "med-006",
      justificativa: "Residência em Ortopedia e atuação documentada em trauma esportivo do joelho.",
      evidenciaIds: ["ev-006-res", "ev-006-joelho"],
    },
  ],
  autor: "curador-ana",
  em: T0,
});

const decisao = sessao.decisao!;
const dossie = gerarDossieDeCuradoria({ workspace, decisao });
const json = JSON.stringify(dossie);

test("estrutura fixa: cinco seções, exatamente três médicos, snapshot correto", () => {
  assert.deepEqual(Object.keys(dossie), ["resumoDoCaso", "medicos", "limitacoes", "referencias"]);
  assert.deepEqual(Object.keys(dossie.resumoDoCaso), [
    "contextoClinico",
    "criteriosUtilizados",
    "limitacoesConhecidas",
  ]);
  assert.equal(dossie.medicos.length, 3);
  assert.ok(dossie.limitacoes.length > 0);
  assert.equal(dossie.referencias.snapshot.id, "snap-0001");
  assert.equal(
    dossie.referencias.snapshot.criadoEm,
    workspace.snapshot.criadoEm.toISOString()
  );
  assert.ok(dossie.referencias.fontes.length > 0);
  assert.ok(dossie.referencias.verificacao.length > 0);
});

test("snapshot e caso divergentes são recusados na geração", () => {
  const decisaoAdulterada = deserializarRegistroDeDecisao(
    decisao.serializar().replace('"snapshotId":"snap-0001"', '"snapshotId":"snap-9999"')
  );
  assert.throws(
    () => gerarDossieDeCuradoria({ workspace, decisao: decisaoAdulterada }),
    /snapshot "snap-9999"/
  );
});

test("igual destaque: três médicos com a mesma estrutura, ordem alfabética, sem numeração", () => {
  assert.deepEqual(
    dossie.medicos.map((m) => m.nome),
    ["Ana Martins", "Carlos Eduardo Lima", "Felipe Rocha"]
  );
  const chaves = dossie.medicos.map((m) => Object.keys(m).join(","));
  assert.equal(new Set(chaves).size, 1);
  const chavesDeMerito = /destaque|posicao|posição|ordem|numero|número|rank|score|nota|peso/i;
  for (const medico of dossie.medicos) {
    for (const chave of Object.keys(medico)) {
      assert.ok(!chavesDeMerito.test(chave), `chave suspeita: ${chave}`);
    }
    assert.ok(medico.fatos.length > 0);
    assert.ok(medico.fatos.every((fato) => fato.evidencias.length > 0));
    assert.ok(medico.criteriosAtendidos.length > 0);
  }
});

test("ausência de ranking, score e comparativos em todo o conteúdo", () => {
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(dossie));
  const valoresDeTexto: string[] = [];
  const coletar = (valor: unknown): void => {
    if (typeof valor === "string") valoresDeTexto.push(valor);
    else if (Array.isArray(valor)) valor.forEach(coletar);
    else if (valor !== null && typeof valor === "object") Object.values(valor).forEach(coletar);
  };
  coletar(dossie);
  const comparativos = /\b(melhor|primeiro|mais indicado|top|ranking|score)\b/i;
  for (const texto of valoresDeTexto) {
    assert.ok(!comparativos.test(texto), `comparativo em: ${texto}`);
  }
});

test("vazamento zero: nenhum dado interno chega ao paciente", () => {
  // identificação do paciente e do curador
  assert.ok(!json.includes("pac-0001"));
  assert.ok(!json.includes("curador-ana"));
  // excluídos e mecânica de exclusão
  assert.ok(!json.includes("med-004"));
  assert.ok(!json.includes("med-005"));
  assert.ok(!json.toLowerCase().includes("exclus"));
  assert.ok(!json.includes("crit-excl"));
  // auditoria, sessão e estados internos
  assert.ok(!json.includes("alt-0"));
  assert.ok(!json.includes("sessao-"));
  assert.ok(!json.includes("aguardando_decisao"));
  assert.ok(!json.toLowerCase().includes("auditoria"));
  // nenhuma afirmação negativa sobre profissionais
  assert.ok(!json.includes("nao_atende"));
  // sem URLs (nenhum link quebrado porque nenhum link existe)
  assert.ok(!json.includes("http"));
});

test("dossiê é imutável e determinístico", () => {
  assert.throws(() => (dossie.medicos as unknown[]).push({}));
  assert.throws(() => {
    (dossie.referencias.snapshot as { id: string }).id = "outro";
  });
  const outro = gerarDossieDeCuradoria({ workspace: montarCasoControlado(), decisao });
  assert.equal(JSON.stringify(outro), json);
});
