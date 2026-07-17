import { Estado } from "@/types/alicia/estado";
import { EstadoCard } from "@/components/alicia/EstadoCard";

export function EstadoGrid({ estados }: { estados: Estado[] }) {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {estados.map((estado) => (
        <EstadoCard key={estado.sigla} estado={estado} />
      ))}
    </div>
  );
}
