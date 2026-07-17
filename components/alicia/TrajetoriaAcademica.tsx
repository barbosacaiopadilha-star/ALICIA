import { ExperienciaProfissional, FormacaoAcademica } from "@/types/alicia/trajetoria-medica";
import { FormacaoItem } from "@/components/alicia/FormacaoItem";
import { formatarPeriodo } from "@/lib/alicia/texto";

interface TrajetoriaAcademicaProps {
  formacoes: FormacaoAcademica[];
  experiencias: ExperienciaProfissional[];
  areasDeAtuacao: string[];
}

export function TrajetoriaAcademica({
  formacoes,
  experiencias,
  areasDeAtuacao,
}: TrajetoriaAcademicaProps) {
  return (
    <section aria-labelledby="trajetoria-heading" className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 id="trajetoria-heading" className="font-display text-2xl font-normal text-ink">
          Trajetória acadêmica
        </h2>
        <p className="text-sm text-ink-soft">
          Conheça a formação, a residência e as experiências profissionais registradas neste perfil.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-ink-faint">
          Formação acadêmica
        </h3>
        {formacoes.length > 0 ? (
          <ol className="flex flex-col gap-4">
            {formacoes.map((formacao) => (
              <FormacaoItem key={formacao.id} formacao={formacao} />
            ))}
          </ol>
        ) : (
          <p className="text-sm text-ink-faint">Nenhuma formação cadastrada ainda para este perfil.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-ink-faint">
          Experiência profissional
        </h3>
        {experiencias.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {experiencias.map((experiencia) => {
              const periodo = formatarPeriodo(
                experiencia.anoInicio,
                experiencia.anoConclusao,
                experiencia.atual
              );
              return (
                <li key={experiencia.id} className="flex flex-col gap-1 border-l-2 border-hairline py-1 pl-4">
                  <h4 className="font-display text-lg font-normal text-ink">{experiencia.funcao}</h4>
                  <p className="text-sm text-ink-soft">{experiencia.instituicao}</p>
                  {experiencia.cidade && <p className="text-sm text-ink-faint">{experiencia.cidade}</p>}
                  <p className="text-sm text-ink-faint">
                    {periodo}
                    {experiencia.atual && " · Atual"}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink-faint">Nenhuma experiência profissional cadastrada ainda.</p>
        )}
      </div>

      {areasDeAtuacao.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-ink-faint">
            Áreas de atuação
          </h3>
          <ul className="flex flex-wrap gap-2">
            {areasDeAtuacao.map((area) => (
              <li
                key={area}
                className="border border-hairline bg-canvas px-3 py-1 text-sm text-ink-soft"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
