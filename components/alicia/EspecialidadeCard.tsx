import Link from "next/link";
import {
  Activity,
  Baby,
  Bone,
  Brain,
  BrainCircuit,
  Droplets,
  Eye,
  FlaskConical,
  HeartPulse,
  LucideIcon,
  Radiation,
  Sparkles,
  Venus,
} from "lucide-react";
import { Especialidade } from "@/types/alicia/especialidade";

const icones: Record<string, LucideIcon> = {
  bone: Bone,
  "heart-pulse": HeartPulse,
  sparkles: Sparkles,
  venus: Venus,
  baby: Baby,
  brain: Brain,
  "brain-circuit": BrainCircuit,
  eye: Eye,
  droplets: Droplets,
  radiation: Radiation,
  activity: Activity,
  "flask-conical": FlaskConical,
};

interface EspecialidadeCardProps {
  especialidade: Especialidade;
  siglaEstado: string;
}

export function EspecialidadeCard({ especialidade, siglaEstado }: EspecialidadeCardProps) {
  const Icone = icones[especialidade.icone] ?? Activity;
  const disponivel = especialidade.quantidadeMedicos > 0;

  const conteudo = (
    <>
      <Icone className="h-6 w-6 text-gold" strokeWidth={1.5} aria-hidden="true" />
      <span className="text-sm font-medium text-ink">{especialidade.nome}</span>
      <span className="text-xs text-ink-faint">
        {disponivel ? `${especialidade.quantidadeMedicos} médicos` : "Em breve"}
      </span>
    </>
  );

  if (!disponivel) {
    return (
      <div
        className="flex flex-col items-center gap-2 border border-hairline bg-canvas px-4 py-6 text-center opacity-60"
        aria-disabled="true"
      >
        {conteudo}
      </div>
    );
  }

  return (
    <Link
      href={`/alicia/${siglaEstado}/${especialidade.id}`}
      className="flex flex-col items-center gap-2 border border-hairline bg-paper px-4 py-6 text-center transition-colors duration-300 hover:border-gold hover:bg-canvas"
    >
      {conteudo}
    </Link>
  );
}
