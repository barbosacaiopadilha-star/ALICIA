import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// O catálogo demonstrativo (rotas de estado/especialidade/médico com dados
// fictícios) está marcado noindex nas próprias rotas; anunciá-lo aqui seria
// sinal contraditório aos buscadores e republicaria os dados fictícios em um
// arquivo público. Quando o catálogo tiver dados reais e voltar a ser
// indexável, restaurar aqui a enumeração de estados/especialidades/médicos.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/alicia`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${siteUrl}/alicia/metodologia`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
