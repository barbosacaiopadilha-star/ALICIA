import { MetadataRoute } from "next";
import { getEstados } from "@/services/alicia/estados";
import { listRawProfessionals } from "@/infrastructure/alicia/professional/createProfessionalDataProvider";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const estados = await getEstados();
  const medicos = listRawProfessionals();

  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/alicia`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${siteUrl}/alicia/metodologia`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  for (const estado of estados) {
    if (estado.temMedicos) {
      entries.push({
        url: `${siteUrl}/alicia/${estado.sigla}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  const paresEstadoEspecialidade = new Set<string>();
  for (const medico of medicos) {
    paresEstadoEspecialidade.add(`${medico.estadoSigla}/${medico.especialidadeId}`);
  }
  for (const par of paresEstadoEspecialidade) {
    entries.push({
      url: `${siteUrl}/alicia/${par}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const medico of medicos) {
    entries.push({
      url: `${siteUrl}/alicia/${medico.estadoSigla}/${medico.especialidadeId}/${medico.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
