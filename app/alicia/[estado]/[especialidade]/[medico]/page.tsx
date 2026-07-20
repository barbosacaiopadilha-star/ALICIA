import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstadoPorSigla } from "@/services/alicia/estados";
import { getEspecialidadePorId } from "@/services/alicia/especialidades";
import { getMedicoPorSlug } from "@/services/alicia/medicos";
import { createGetProfessionalProfileBySlug } from "@/infrastructure/alicia/profile/createGetProfessionalProfileBySlug";
import { PerfilMedicoHeader } from "@/components/alicia/PerfilMedicoHeader";
import { TrajetoriaAcademica } from "@/components/alicia/TrajetoriaAcademica";
import { VerificacoesMedico } from "@/components/alicia/VerificacoesMedico";
import type { FormacaoView } from "@/components/alicia/FormacaoItem";

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

  // Temporary legacy bridge for profile blocks not yet supported by the new domain/read model.
  // See PROFESSIONAL_PROFILE_DATA_GAP_REVIEW.md.
  const legacyProfessional = await getMedicoPorSlug(estado.sigla, especialidade.id, params.medico);

  if (!legacyProfessional) {
    notFound();
  }

  const getProfessionalProfile = createGetProfessionalProfileBySlug();

  let professionalProfile;
  try {
    professionalProfile = await getProfessionalProfile.execute({ slug: params.medico });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "GetProfessionalProfileBySlug professional not found."
    ) {
      notFound();
    }
    throw error;
  }

  const legacyProfileBlocks = {
    verificado: legacyProfessional.verificado,
    bioCurta: legacyProfessional.bioCurta,
    experiencias: legacyProfessional.experiencias ?? [],
    areasDeAtuacao: legacyProfessional.areasDeAtuacao ?? [],
    verificacoes: legacyProfessional.verificacoes ?? [],
  };

  const legacyFormacaoPorId = new Map(
    (legacyProfessional.formacoes ?? []).map((formacao) => [formacao.id, formacao])
  );

  const formacoesView: FormacaoView[] = professionalProfile.education.map((education) => {
    const legacyFormacao = legacyFormacaoPorId.get(education.id);
    return {
      id: education.id,
      tipo: education.type,
      titulo: education.program,
      instituicao: education.institutionName,
      anoInicio: education.startYear,
      anoConclusao: education.endYear,
      cidade: legacyFormacao?.cidade,
      estado: legacyFormacao?.estado,
      verificado: legacyFormacao?.verificado ?? false,
    };
  });

  const especialidadeNome = professionalProfile.specialties[0]?.name ?? especialidade.nome;

  return (
    <section className="flex flex-col items-center gap-10 px-6 py-16 sm:px-10">
      <nav aria-label="Breadcrumb" className="w-full max-w-2xl text-xs text-ink-faint">
        <span>AliCIA</span> <span aria-hidden="true">/</span> <span>{estado.nome}</span>{" "}
        <span aria-hidden="true">/</span> <span>{especialidade.nome}</span>{" "}
        <span aria-hidden="true">/</span>{" "}
        <span className="text-ink-soft">{professionalProfile.fullName}</span>
      </nav>

      <div className="w-full max-w-2xl">
        <Link
          href={`/alicia/${estado.sigla}/${especialidade.id}`}
          className="text-sm font-medium text-ink-soft transition-colors duration-300 hover:text-gold"
        >
          ← Voltar para a lista
        </Link>
      </div>

      <PerfilMedicoHeader
        fullName={professionalProfile.fullName}
        especialidadeNome={especialidadeNome}
        cidade={professionalProfile.primaryLocation?.city}
        estadoSigla={professionalProfile.primaryLocation?.state}
        instituicaoPrincipal={professionalProfile.primaryLocation?.name}
        verificado={legacyProfileBlocks.verificado}
        bioCurta={legacyProfileBlocks.bioCurta}
      />

      <TrajetoriaAcademica
        formacoes={formacoesView}
        experiencias={legacyProfileBlocks.experiencias}
        areasDeAtuacao={legacyProfileBlocks.areasDeAtuacao}
      />

      <VerificacoesMedico verificacoes={legacyProfileBlocks.verificacoes} />

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
