import { EditorialSection } from "@/components/sections/EditorialSection";

export function HiddenStep() {
  return (
    <EditorialSection headline="Existe uma etapa da saúde que quase ninguém percebe.">
      <p>Antes dos exames.</p>
      <p>Antes da consulta.</p>
      <p>Antes do tratamento.</p>
      <p>
        Existe uma decisão que pode influenciar toda a sua jornada.
      </p>
      <p className="font-display text-xl italic text-ink sm:text-2xl">
        A escolha do médico.
      </p>
    </EditorialSection>
  );
}
