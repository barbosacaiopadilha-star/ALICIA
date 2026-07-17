import { notFound } from "next/navigation";
import Link from "next/link";
import { getEstadoPorSigla } from "@/services/alicia/estados";
import { getEspecialidadePorId } from "@/services/alicia/especialidades";

interface PageProps {
  params: { estado: string; especialidade: string };
}

export default async function EspecialidadePage({ params }: PageProps) {
  const estado = await getEstadoPorSigla(params.estado);

  if (!estado || !estado.temMedicos) {
    notFound();
  }

  const especialidade = await getEspecialidadePorId(estado.sigla, params.especialidade);

  if (!especialidade) {
    notFound();
  }

  return (
    <section className="flex flex-col items-center gap-6 px-6 py-16 text-center sm:px-10">
      <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">
        {especialidade.nome}
      </h1>
      <p className="text-sm uppercase tracking-wide text-gold">{estado.nome}</p>
      <p className="max-w-editorial text-base text-ink-soft">
        Na próxima etapa será exibida a lista de médicos.
      </p>
      <Link
        href={`/alicia/${estado.sigla}`}
        className="mt-4 inline-flex items-center justify-center border border-gold px-6 py-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
      >
        Voltar
      </Link>
    </section>
  );
}
