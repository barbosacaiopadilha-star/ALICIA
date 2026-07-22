import type { Metadata } from "next";
import { DossieDoPaciente } from "@/components/alicia/DossieDoPaciente";

// Entrega do dossiê ao paciente (PRODUCT-WAVE-P3): fora do sitemap e
// noindex — a entrega é individual, não é superfície pública de busca.
export const metadata: Metadata = {
  title: "Seu Dossiê de Curadoria",
  robots: { index: false, follow: false },
};

export default function DossiePage() {
  return <DossieDoPaciente />;
}
