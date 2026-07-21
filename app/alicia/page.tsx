import type { Metadata } from "next";
import { getEstados } from "@/services/alicia/estados";
import { EstadoGrid } from "@/components/alicia/EstadoGrid";

export const metadata: Metadata = {
  title: "AliCIA — Escolha seu estado",
  description: "Selecione onde você está para começar sua Curadoria Médica.",
  alternates: { canonical: "/alicia" },
};

export default async function AliciaPage() {
  const estados = await getEstados();

  return (
    <section className="flex flex-col items-center gap-10 px-6 py-16 sm:px-10">
      <div className="flex max-w-editorial flex-col items-center gap-3 text-center">
        <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">
          Escolha seu estado
        </h1>
        <p className="text-base text-ink-soft">
          Selecione onde você está para começar sua Curadoria Médica.
        </p>
      </div>
      <EstadoGrid estados={estados} />
    </section>
  );
}
