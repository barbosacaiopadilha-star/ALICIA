import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstadoPorSigla } from "@/services/alicia/estados";
import { getEspecialidadePorId } from "@/services/alicia/especialidades";
import { getMedicoPorSlug } from "@/services/alicia/medicos";
import { PerfilMedicoHeader } from "@/components/alicia/PerfilMedicoHeader";
import { TrajetoriaAcademica } from "@/components/alicia/TrajetoriaAcademica";
import { VerificacoesMedico } from "@/components/alicia/VerificacoesMedico";

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
    <section className="flex flex-col items-center gap-10 px-6 py-16 sm:px-10">
      <nav aria-label="Breadcrumb" className="w-full max-w-2xl text-xs text-ink-faint">
        <span>AliCIA</span> <span aria-hidden="true">/</span> <span>{estado.nome}</span>{" "}
        <span aria-hidden="true">/</span> <span>{especialidade.nome}</span>{" "}
        <span aria-hidden="true">/</span> <span className="text-ink-soft">{medico.nome}</span>
      </nav>

      <div className="w-full max-w-2xl">
        <Link
          href={`/alicia/${estado.sigla}/${especialidade.id}`}
          className="text-sm font-medium text-ink-soft transition-colors duration-300 hover:text-gold"
        >
          ← Voltar para a lista
        </Link>
      </div>

      <PerfilMedicoHeader medico={medico} especialidadeNome={especialidade.nome} />

      <TrajetoriaAcademica
        formacoes={medico.formacoes ?? []}
        experiencias={medico.experiencias ?? []}
        areasDeAtuacao={medico.areasDeAtuacao ?? []}
      />

      <VerificacoesMedico verificacoes={medico.verificacoes ?? []} />

      <div className="w-full max-w-2xl border-t border-hairline pt-6 text-sm text-ink-faint">
        <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
          Sobre este perfil
        </h2>
        <p>
          As informações exibidas são demonstrativas nesta versão do MVP. A AliCIA ainda não
          apresenta ranking, recomendação ou avaliação comparativa entre médicos.
        </p>
        <Link
          href="/alicia/metodologia"
          className="mt-2 inline-block text-sm font-medium text-ink-soft underline decoration-hairline underline-offset-4 transition-colors duration-300 hover:text-gold hover:decoration-gold"
        >
          Entenda como a AliCIA analisa a formação
        </Link>
      </div>
    </section>
  );
}
