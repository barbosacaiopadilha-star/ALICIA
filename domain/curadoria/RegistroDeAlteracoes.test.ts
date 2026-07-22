import test from "node:test";
import assert from "node:assert/strict";
import {
  RegistroDeAlteracoes,
  deserializarRegistroDeAlteracoes,
} from "./RegistroDeAlteracoes.ts";

const T0 = new Date("2026-07-22T12:00:00.000Z");
const T1 = new Date("2026-07-22T12:05:00.000Z");

test("registra atos com tipo fechado, autor, instante e dados de strings", () => {
  const registro = RegistroDeAlteracoes.vazio("sessao-001")
    .registrar({ tipo: "sessao_aberta", autorId: "curador-001", em: T0, dados: { casoId: "caso-001" } })
    .registrar({
      tipo: "escolha_registrada",
      autorId: "curador-001",
      em: T1,
      dados: { professionalId: "med-001" },
    });
  assert.deepEqual(
    registro.alteracoes.map((a) => [a.id, a.tipo, a.autorId, a.em]),
    [
      ["alt-0001", "sessao_aberta", "curador-001", T0.toISOString()],
      ["alt-0002", "escolha_registrada", "curador-001", T1.toISOString()],
    ]
  );
});

test("nenhum ato existe sem autor; tipo fora da lista fechada é rejeitado", () => {
  const registro = RegistroDeAlteracoes.vazio("sessao-001");
  assert.throws(
    () => registro.registrar({ tipo: "sessao_aberta", autorId: " ", em: T0 }),
    /exige autor/
  );
  assert.throws(
    () =>
      registro.registrar({
        tipo: "algo_inventado" as never,
        autorId: "curador-001",
        em: T0,
      }),
    /tipo de alteração desconhecido/
  );
});

test("dados numéricos são rejeitados na origem (registro categórico)", () => {
  assert.throws(
    () =>
      RegistroDeAlteracoes.vazio("sessao-001").registrar({
        tipo: "sessao_aberta",
        autorId: "curador-001",
        em: T0,
        dados: { nota: 10 as unknown as string },
      }),
    /deve ser string/
  );
});

test("nenhuma alteração apaga histórico: instância anterior intacta e congelada", () => {
  const antes = RegistroDeAlteracoes.vazio("sessao-001").registrar({
    tipo: "sessao_aberta",
    autorId: "curador-001",
    em: T0,
  });
  const depois = antes.registrar({
    tipo: "sessao_concluida",
    autorId: "curador-001",
    em: T1,
  });
  assert.equal(antes.alteracoes.length, 1);
  assert.equal(depois.alteracoes.length, 2);
  assert.equal(depois.alteracoes[0], antes.alteracoes[0]);
  assert.throws(() => (antes.alteracoes as unknown[]).push({}));
});

test("round-trip por replay reproduz o histórico; id adulterado é detectado", () => {
  const registro = RegistroDeAlteracoes.vazio("sessao-001")
    .registrar({ tipo: "sessao_aberta", autorId: "curador-001", em: T0 })
    .registrar({ tipo: "sessao_concluida", autorId: "curador-001", em: T1 });
  const json = registro.serializar();
  assert.equal(deserializarRegistroDeAlteracoes(json).serializar(), json);
  const adulterado = json.replace("alt-0002", "alt-0009");
  assert.throws(() => deserializarRegistroDeAlteracoes(adulterado), /histórico inconsistente/);
  const semNumeros = (valor: unknown): boolean => {
    if (typeof valor === "number") return false;
    if (Array.isArray(valor)) return valor.every(semNumeros);
    if (valor !== null && typeof valor === "object") return Object.values(valor).every(semNumeros);
    return true;
  };
  assert.ok(semNumeros(JSON.parse(json)));
});
