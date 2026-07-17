import { Estado } from "@/types/alicia/estado";
import { estados } from "@/mocks/alicia/estados";

export async function getEstados(): Promise<Estado[]> {
  return estados;
}

export async function getEstadoPorSigla(sigla: string): Promise<Estado | null> {
  const encontrado = estados.find(
    (estado) => estado.sigla.toLowerCase() === sigla.toLowerCase()
  );
  return encontrado ?? null;
}
