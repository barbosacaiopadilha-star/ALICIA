import { Especialidade } from "@/types/alicia/especialidade";
import { EspecialidadeCard } from "@/components/alicia/EspecialidadeCard";

interface EspecialidadeGridProps {
  especialidades: Especialidade[];
  siglaEstado: string;
}

export function EspecialidadeGrid({ especialidades, siglaEstado }: EspecialidadeGridProps) {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {especialidades.map((especialidade) => (
        <EspecialidadeCard
          key={especialidade.id}
          especialidade={especialidade}
          siglaEstado={siglaEstado}
        />
      ))}
    </div>
  );
}
