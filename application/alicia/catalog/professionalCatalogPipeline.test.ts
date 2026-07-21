import test from "node:test";
import assert from "node:assert/strict";
import {
  validateRawProfessionalDataList,
} from "../../../infrastructure/alicia/professional/validateRawProfessionalData.ts";
import {
  matchesProfessionalCatalogSearchCriteria,
  sortProfessionalCatalogProjections,
} from "./ProfessionalCatalogQuery.ts";
import { agruparPorCidade } from "../../../components/alicia/agruparPorCidade.ts";

/**
 * Teste de integração leve: encadeia módulos puros reais (sem
 * duplicar lógica, sem banco, sem rede, sem browser) cobrindo o
 * trecho do pipeline que é executável sem node_modules:
 *
 *   validação de dados brutos → busca/filtro → ordenação → agrupamento
 *
 * LIMITAÇÃO HONESTA: o trecho "mapper → domínio → projection" (
 * LegacyProfessionalMapper.toDomain, BuildProfessionalCatalogProjection
 * e as classes de domínio como Identity/Professional/Specialty) não
 * pôde ser incluído neste teste executável, porque essas classes são
 * importadas via alias "@/" em seus próprios módulos (não apenas
 * neste arquivo de teste) — alias que o test runner nativo do Node
 * não resolve sem node_modules/bundler (confirmado por sondagem
 * prática, registrada em docs/architecture/TECHNICAL_HARDENING_RC.md).
 * Este teste, portanto, simula o formato de saída de
 * BuildProfessionalCatalogProjection com objetos literais
 * estruturalmente idênticos, não reimplementando a lógica de mapeamento
 * em si — apenas fornecendo dados de entrada no formato já validado
 * pela revisão estática exaustiva feita ao longo desta sessão.
 */

function rawRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "med-001",
    slug: "ana-martins",
    nome: "Ana Martins",
    especialidadeId: "ortopedia",
    estadoSigla: "SP",
    cidade: "São Paulo",
    instituicaoPrincipal: "Hospital Central",
    formacaoResumo: "Residência em Ortopedia e Traumatologia",
    verificado: true,
    ...overrides,
  };
}

// Formato estruturalmente idêntico ao produzido por
// BuildProfessionalCatalogProjection a partir de um RawProfessionalData
// já validado — não reimplementa o mapeamento, apenas assume seu
// contrato de saída já estabelecido e testado estaticamente.
function projectionFromRaw(raw: ReturnType<typeof rawRecord>): any {
  return {
    id: raw.id,
    slug: raw.slug,
    fullName: raw.nome,
    specialties: [{ id: raw.especialidadeId, name: "Ortopedia" }],
    education: [],
    primaryLocation: {
      id: `${raw.id}-practice-location`,
      name: raw.instituicaoPrincipal,
      city: raw.cidade,
      state: raw.estadoSigla,
    },
    languages: [],
  };
}

test("pipeline: mocks validados → filtrados por cidade/texto → ordenados → agrupados", () => {
  const rawRecords = [
    rawRecord({ id: "med-001", slug: "ana-martins", nome: "Ana Martins", cidade: "São Paulo" }),
    rawRecord({
      id: "med-002",
      slug: "carlos-lima",
      nome: "Carlos Lima",
      cidade: "Rio de Janeiro",
      estadoSigla: "RJ",
    }),
    rawRecord({ id: "med-003", slug: "beatriz-souza", nome: "Beatriz Souza", cidade: "São Paulo" }),
  ];

  // 1. Fronteira única de entrada: validação dos dados brutos.
  const validated = validateRawProfessionalDataList(rawRecords);
  assert.equal(validated.length, 3);

  // 2. Formato de projeção (contrato já validado estaticamente, ver
  // limitação documentada acima).
  const projections = validated.map((raw) => projectionFromRaw(raw));

  // 3. Busca/filtro: uma rota de estado+especialidade retorna os
  // profissionais esperados.
  const naRota = projections.filter((item) =>
    matchesProfessionalCatalogSearchCriteria(item, { estado: "SP", especialidade: "ortopedia" })
  );
  assert.equal(naRota.length, 2);
  assert.deepEqual(naRota.map((p) => p.id).sort(), ["med-001", "med-003"]);

  // 4. Texto e cidade combinados filtram corretamente.
  const filtrados = naRota.filter((item) =>
    matchesProfessionalCatalogSearchCriteria(item, { texto: "ana", cidade: "São Paulo" })
  );
  assert.deepEqual(filtrados.map((p) => p.id), ["med-001"]);

  // 5. Ordenação é aplicada depois do filtro, sobre o resultado já
  // filtrado por rota.
  const ordenados = sortProfessionalCatalogProjections(naRota, "name-asc");
  assert.deepEqual(ordenados.map((p) => p.fullName), ["Ana Martins", "Beatriz Souza"]);

  // 6. Agrupamento por cidade sobre o resultado final.
  const medicosView = ordenados.map((p) => ({
    id: p.id,
    slug: p.slug,
    nome: p.fullName,
    cidade: p.primaryLocation?.city,
    instituicaoPrincipal: p.primaryLocation?.name,
    estadoSigla: p.primaryLocation?.state ?? "",
    especialidadeId: p.specialties[0]?.id ?? "",
    verificado: false,
  }));
  const grupos = agruparPorCidade(medicosView);
  assert.equal(grupos.length, 1);
  assert.equal(grupos[0].cidade, "São Paulo");
  assert.equal(grupos[0].medicos.length, 2);
});
