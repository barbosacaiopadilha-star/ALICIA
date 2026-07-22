import type { Metadata } from "next";
import { CuradoriaWorkspace } from "@/components/alicia/CuradoriaWorkspace";

// Rota interna do curador (PRODUCT-WAVE-P1): fora do sitemap e marcada
// noindex — não é superfície pública nem participa do SEO.
export const metadata: Metadata = {
  title: "Curadoria — área interna",
  robots: { index: false, follow: false },
};

export default function CuradoriaPage() {
  return <CuradoriaWorkspace />;
}
