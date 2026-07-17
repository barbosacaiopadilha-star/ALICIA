import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstadoPorSigla } from "@/services/alicia/estados";
import { getEspecialidadePorId } from "@/services/alicia/especialidades";
import { getMedicosPorEstadoEEspecialidade } from "@/services/alicia/medicos";
import { MedicoList } from "@/components/alicia/MedicoList";

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

  const medicos = await getMedicosPorEstadoEEspecialidade(estado.sigla, especialidade.id);

  return (
    <section className="flex flex-col items-center gap-8 px-6 py-16 sm:px-10">
      <nav aria-label="Breadcrumb" className="w-full max-w-2xl text-xs text-ink-faint">
        <span>AliCIA</span> <span aria-hidden="true">/</span> <span>{estado.nome}</span>{" "}
        <span aria-hidden="true">/</span> <span className="text-ink-soft">{especialidade.nome}</span>
      </nav>

      <div className="flex w-full max-w-2xl flex-col items-start gap-2 text-left">
        <Link
          href={`/alicia/${estado.sigla}`}
          className="text-sm font-medium text-ink-soft transition-colors duration-300 hover:text-gold"
        >
          ← Alterar especialidade
        </Link>

        <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">
          Médicos de {especialidade.nome}
        </h1>
        <p className="text-sm uppercase tracking-wide text-gold">{estado.nome}</p>
        <p className="max-w-editorial text-base text-ink-soft">
          Profissionais encontrados com base em sua formação e trajetória acadêmica.
        </p>
      </div>

      {medicos.length === 0 ? (
        <div className="flex w-full max-w-2xl flex-col items-center gap-3 border border-hairline bg-canvas px-6 py-12 text-center">
          <p className="text-base font-medium text-ink">
            Nenhum médico disponível nesta especialidade por enquanto.
          </p>
          <p className="text-sm text-ink-soft">Estamos ampliando a cobertura da AliCIA.</p>
          <Link
            href={`/alicia/${estado.sigla}`}
            className="mt-2 inline-flex items-center justify-center border border-gold px-6 py-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
          >
            Escolher outra especialidade
          </Link>
        </div>
      ) : (
        <MedicoList medicos={medicos} especialidadeNome={especialidade.nome} />
      )}
    </section>
  );
}
