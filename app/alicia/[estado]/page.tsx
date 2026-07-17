import { notFound } from "next/navigation";
import { getEstadoPorSigla } from "@/services/alicia/estados";
import { getEspecialidadesPorEstado } from "@/services/alicia/especialidades";
import { EspecialidadeGrid } from "@/components/alicia/EspecialidadeGrid";

interface PageProps {
  params: { estado: string };
}

export default async function EstadoPage({ params }: PageProps) {
  const estado = await getEstadoPorSigla(params.estado);

  if (!estado || !estado.temMedicos) {
    notFound();
  }

  const especialidades = await getEspecialidadesPorEstado(estado.sigla);

  return (
    <section className="flex flex-col items-center gap-10 px-6 py-16 sm:px-10">
      <div className="flex max-w-editorial flex-col items-center gap-3 text-center">
        <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">
          Escolha a especialidade
        </h1>
        <p className="text-base text-ink-soft">Selecione a área médica desejada.</p>
      </div>
      <EspecialidadeGrid especialidades={especialidades} siglaEstado={estado.sigla} />
    </section>
  );
}
