import { FormacaoAcademica } from "@/types/alicia/trajetoria-medica";
import { formatarPeriodo } from "@/lib/alicia/texto";

const rotulosTipo: Record<FormacaoAcademica["tipo"], string> = {
  graduacao: "Graduação",
  residencia: "Residência médica",
  fellowship: "Fellowship",
  especializacao: "Especialização",
  curso: "Curso complementar",
};

export function FormacaoItem({ formacao }: { formacao: FormacaoAcademica }) {
  const periodo = formatarPeriodo(formacao.anoInicio, formacao.anoConclusao);
  const local = [formacao.cidade, formacao.estado].filter(Boolean).join(", ");

  return (
    <li className="flex flex-col gap-1 border-l-2 border-hairline py-1 pl-4">
      <span className="text-xs font-medium uppercase tracking-wide text-gold">
        {rotulosTipo[formacao.tipo]}
      </span>
      <h4 className="font-display text-lg font-normal text-ink">{formacao.titulo}</h4>
      <p className="text-sm text-ink-soft">{formacao.instituicao}</p>
      {local && <p className="text-sm text-ink-faint">{local}</p>}
      {periodo && <p className="text-sm text-ink-faint">{periodo}</p>}
      <p className="text-xs text-ink-faint">
        {formacao.verificado ? "Informação verificada" : "Informação ainda não verificada"}
      </p>
    </li>
  );
}
