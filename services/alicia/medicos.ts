import { Medico } from "@/types/alicia/medico";
import { listRawProfessionals } from "@/infrastructure/alicia/professional/professionalDataProvider";

export async function getMedicosPorEstadoEEspecialidade(
  siglaEstado: string,
  idEspecialidade: string
): Promise<Medico[]> {
  const sigla = siglaEstado.toUpperCase();
  const especialidade = idEspecialidade.toLowerCase();

  return listRawProfessionals().filter(
    (medico) => medico.estadoSigla === sigla && medico.especialidadeId === especialidade
  );
}

export async function getMedicoPorSlug(
  siglaEstado: string,
  idEspecialidade: string,
  slugMedico: string
): Promise<Medico | null> {
  const sigla = siglaEstado.toUpperCase();
  const especialidade = idEspecialidade.toLowerCase();
  const slug = slugMedico.toLowerCase();

  const encontrado = listRawProfessionals().find(
    (medico) =>
      medico.estadoSigla === sigla &&
      medico.especialidadeId === especialidade &&
      medico.slug === slug
  );

  return encontrado ?? null;
}
