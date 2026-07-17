import Link from "next/link";
import { Estado } from "@/types/alicia/estado";

export function EstadoCard({ estado }: { estado: Estado }) {
  if (!estado.temMedicos) {
    return (
      <div
        className="flex flex-col items-center gap-1 border border-hairline bg-canvas px-4 py-5 text-center opacity-60"
        aria-disabled="true"
      >
        <span className="text-sm font-medium text-ink-soft">{estado.nome}</span>
        <span className="text-xs uppercase tracking-wide text-ink-faint">Em breve</span>
      </div>
    );
  }

  return (
    <Link
      href={`/alicia/${estado.sigla}`}
      className="flex flex-col items-center gap-1 border border-hairline bg-paper px-4 py-5 text-center transition-colors duration-300 hover:border-gold hover:bg-canvas"
    >
      <span className="text-sm font-medium text-ink">{estado.nome}</span>
      <span className="text-xs uppercase tracking-wide text-gold">{estado.sigla}</span>
    </Link>
  );
}
