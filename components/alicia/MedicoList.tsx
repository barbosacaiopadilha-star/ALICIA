import { MedicoCard, type MedicoView } from "@/components/alicia/MedicoCard";

interface MedicoListProps {
  medicos: MedicoView[];
  especialidadeNome: string;
}

export function MedicoList({ medicos, especialidadeNome }: MedicoListProps) {
  return (
    <ul className="flex w-full max-w-2xl flex-col gap-4">
      {medicos.map((medico) => (
        <MedicoCard key={medico.id} medico={medico} especialidadeNome={especialidadeNome} />
      ))}
    </ul>
  );
}
