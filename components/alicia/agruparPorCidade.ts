import type { MedicoView } from "@/components/alicia/MedicoCard";

/**
 * Agrupamento puramente de apresentação por cidade — não é uma regra
 * de domínio nem de aplicação, apenas uma forma de organizar os
 * mesmos MedicoCard já usados na lista. Não inventa coordenadas: o
 * "mapa" desta versão é uma representação geográfica hierárquica
 * (cidade/estado), a única granularidade real disponível hoje (ver
 * docs/architecture/CATALOG_MAP_V1_REVIEW.md).
 *
 * Extraída para um módulo próprio (sem "use client" nem imports de
 * React) para ser testável isoladamente com o test runner nativo do
 * Node, sem exigir nenhuma dependência instalada.
 */
export function agruparPorCidade(
  medicos: ReadonlyArray<MedicoView>
): Array<{ cidade: string; medicos: MedicoView[] }> {
  const grupos = new Map<string, MedicoView[]>();
  for (const medico of medicos) {
    const chave = medico.cidade ?? "Cidade não informada";
    const grupo = grupos.get(chave) ?? [];
    grupo.push(medico);
    grupos.set(chave, grupo);
  }
  return Array.from(grupos.entries())
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
    .map(([cidade, medicosDaCidade]) => ({ cidade, medicos: medicosDaCidade }));
}
