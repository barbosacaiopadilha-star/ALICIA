import { formatarPeriodo } from "@/lib/alicia/texto";

export type FormacaoViewTipo =
  | "undergraduate"
  | "residency"
  | "fellowship"
  | "specialization"
  | "masters"
  | "doctorate"
  | "postdoctorate"
  | "other";

export interface FormacaoView {
  id: string;
  tipo: FormacaoViewTipo;
  titulo: string;
  instituicao: string;
  anoInicio?: number;
  anoConclusao?: number;
  cidade?: string;
  estado?: string;
  verificado: boolean;
}

const rotulosTipo: Record<FormacaoViewTipo, string> = {
  undergraduate: "Graduação",
  residency: "Residência médica",
  fellowship: "Fellowship",
  specialization: "Especialização",
  masters: "Mestrado",
  doctorate: "Doutorado",
  postdoctorate: "Pós-doutorado",
  // "curso" (legado) sempre correspondeu a "other" no mapeamento do
  // domínio (ver LegacyProfessionalMapper); mantém o mesmo rótulo
  // visual já usado hoje.
  other: "Curso complementar",
};

export function FormacaoItem({ formacao }: { formacao: FormacaoView }) {
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
