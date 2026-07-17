import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstadoPorSigla } from "@/services/alicia/estados";
import { getEspecialidadePorId } from "@/services/alicia/especialidades";
import { getMedicoPorSlug } from "@/services/alicia/medicos";

interface PageProps {
  params: { estado: string; especialidade: string; medico: string };
}

export default async function MedicoPage({ params }: PageProps) {
  const estado = await getEstadoPorSigla(params.estado);

  if (!estado || !estado.temMedicos) {
    notFound();
  }

  const especialidade = await getEspecialidadePorId(estado.sigla, params.especialidade);

  if (!especialidade) {
    notFound();
  }

  const medico = await getMedicoPorSlug(estado.sigla, especialidade.id, params.medico);

  if (!medico) {
    notFound();
  }

  return (
    <section className="flex flex-col items-center gap-6 px-6 py-16 text-center sm:px-10">
      <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">{medico.nome}</h1>
      <p className="text-sm uppercase tracking-wide text-gold">
        {especialidade.nome} · {medico.cidade}
      </p>
      <p className="max-w-editorial text-base text-ink-soft">
        O perfil completo e a trajetória acadêmica serão apresentados na próxima etapa.
      </p>
      <Link
        href={`/alicia/${estado.sigla}/${especialidade.id}`}
        className="mt-4 inline-flex items-center justify-center border border-gold px-6 py-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
      >
        Voltar para a lista
      </Link>
    </section>
  );
}
