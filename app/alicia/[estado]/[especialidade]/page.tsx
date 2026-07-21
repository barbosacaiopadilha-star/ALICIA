import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstadoPorSigla } from "@/services/alicia/estados";
import { getEspecialidadePorId } from "@/services/alicia/especialidades";
import { getMedicosPorEstadoEEspecialidade } from "@/services/alicia/medicos";
import { createProfessionalCatalogQuery } from "@/infrastructure/alicia/catalog";
import {
  matchesProfessionalCatalogSearchCriteria,
  sortProfessionalCatalogProjections,
  VALID_PROFESSIONAL_CATALOG_SORTS,
  type ProfessionalCatalogSort,
} from "@/application/alicia/catalog";
import { CatalogoBusca } from "@/components/alicia/CatalogoBusca";
import type { MedicoView } from "@/components/alicia/MedicoCard";

interface PageProps {
  params: { estado: string; especialidade: string };
  searchParams: { q?: string; city?: string; sort?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const estado = await getEstadoPorSigla(params.estado);
  if (!estado || !estado.temMedicos) {
    return {};
  }
  const especialidade = await getEspecialidadePorId(estado.sigla, params.especialidade);
  if (!especialidade) {
    return {};
  }
  return {
    title: `${especialidade.nome} em ${estado.nome} — AliCIA`,
    description: `Médicos de ${especialidade.nome} em ${estado.nome}, com formação e trajetória acadêmica.`,
    alternates: { canonical: `/alicia/${estado.sigla}/${especialidade.id}` },
    // Catálogo demonstrativo (dados fictícios de médicos): fora do índice
    // público enquanto não houver dados reais.
    robots: { index: false, follow: true },
  };
}

export default async function EspecialidadePage({ params, searchParams }: PageProps) {
  const estado = await getEstadoPorSigla(params.estado);

  if (!estado || !estado.temMedicos) {
    notFound();
  }

  const especialidade = await getEspecialidadePorId(estado.sigla, params.especialidade);

  if (!especialidade) {
    notFound();
  }

  const catalogQuery = createProfessionalCatalogQuery();

  // Única leitura principal do catálogo por renderização. Os filtros
  // interativos (cidade/texto, vindos de ?city=/?q=) são aplicados em
  // memória sobre este mesmo resultado, reutilizando o predicado puro
  // matchesProfessionalCatalogSearchCriteria — a mesma regra já usada
  // pela própria Query para estado/especialidade, nunca uma segunda
  // regra nem uma segunda leitura.
  const professionalsNaRota = await catalogQuery.list({
    estado: estado.sigla,
    especialidade: especialidade.id,
  });

  const cidadesDisponiveis = Array.from(
    new Set(
      professionalsNaRota
        .map((item) => item.primaryLocation?.city)
        .filter((city): city is string => Boolean(city))
    )
  ).sort((a, b) => a.localeCompare(b));

  // Uma cidade inexistente em ?city= simplesmente não corresponde a
  // nenhum profissional — o predicado já trata isso naturalmente,
  // produzindo lista vazia (estado vazio da busca), sem quebrar a
  // página e sem validação adicional.
  const professionalsFiltrados = professionalsNaRota.filter((item) =>
    matchesProfessionalCatalogSearchCriteria(item, {
      cidade: searchParams.city,
      texto: searchParams.q,
    })
  );

  // sort inválido ou ausente cai em "relevance" (padrão) — nunca
  // quebra a página. Filtrar e ordenar comutam para as estratégias
  // suportadas (relevance/name-asc/name-desc): o resultado final é o
  // mesmo independentemente da ordem de aplicação.
  const sort: ProfessionalCatalogSort = VALID_PROFESSIONAL_CATALOG_SORTS.includes(
    searchParams.sort as ProfessionalCatalogSort
  )
    ? (searchParams.sort as ProfessionalCatalogSort)
    : "relevance";

  const professionals = sortProfessionalCatalogProjections(professionalsFiltrados, sort);

  // Temporary legacy bridge for the two fields not represented in
  // ProfessionalCatalogProjection (formacaoResumo, verificado). See
  // docs/architecture/CATALOG_MIGRATION_REVIEW.md. Permanece residual
  // e não foi ampliado nesta tarefa — ver
  // docs/architecture/CATALOG_DISCOVERY_V1_REVIEW.md.
  const legacyMedicos = await getMedicosPorEstadoEEspecialidade(estado.sigla, especialidade.id);
  const legacyById = new Map(legacyMedicos.map((medico) => [medico.id, medico]));

  const medicosView: MedicoView[] = professionals.map((professional) => {
    const legacy = legacyById.get(professional.id);
    return {
      id: professional.id,
      slug: professional.slug,
      nome: professional.fullName,
      cidade: professional.primaryLocation?.city,
      instituicaoPrincipal: professional.primaryLocation?.name,
      estadoSigla: professional.primaryLocation?.state ?? estado.sigla,
      especialidadeId: especialidade.id,
      formacaoResumo: legacy?.formacaoResumo,
      verificado: legacy?.verificado ?? false,
    };
  });

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

      {professionalsNaRota.length === 0 ? (
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
        <CatalogoBusca
          medicos={medicosView}
          especialidadeNome={especialidade.nome}
          cidadesDisponiveis={cidadesDisponiveis}
        />
      )}
    </section>
  );
}
