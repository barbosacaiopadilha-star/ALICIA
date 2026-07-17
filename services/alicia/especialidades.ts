import { Especialidade } from "@/types/alicia/especialidade";
import { especialidadesBase, quantidadePorEstado } from "@/mocks/alicia/especialidades";

export async function getEspecialidadesPorEstado(
  siglaEstado: string
): Promise<Especialidade[]> {
  const contagem = quantidadePorEstado[siglaEstado.toUpperCase()] ?? {};

  return especialidadesBase.map((especialidade) => ({
    ...especialidade,
    quantidadeMedicos: contagem[especialidade.id] ?? 0,
  }));
}

export async function getEspecialidadePorId(
  siglaEstado: string,
  idEspecialidade: string
): Promise<Especialidade | null> {
  const todas = await getEspecialidadesPorEstado(siglaEstado);
  return todas.find((especialidade) => especialidade.id === idEspecialidade) ?? null;
}
