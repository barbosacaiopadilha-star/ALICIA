import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEstadoPorSigla } from "@/services/alicia/estados";
import { getEspecialidadesPorEstado } from "@/services/alicia/especialidades";
import { EspecialidadeGrid } from "@/components/alicia/EspecialidadeGrid";

interface PageProps {
  params: { estado: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const estado = await getEstadoPorSigla(params.estado);
  if (!estado || !estado.temMedicos) {
    return {};
  }
  return {
    title: `AliCIA — Médicos em ${estado.nome}`,
    description: `Escolha a especialidade para conhecer médicos em ${estado.nome}.`,
    alternates: { canonical: `/alicia/${estado.sigla}` },
    // Catálogo demonstrativo (dados fictícios de médicos): fora do índice
    // público enquanto não houver dados reais.
    robots: { index: false, follow: true },
  };
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
