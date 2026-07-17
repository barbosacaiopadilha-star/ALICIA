export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${primeira}${ultima}`.toUpperCase();
}

export function formatarPeriodo(anoInicio?: number, anoConclusao?: number, atual?: boolean): string | null {
  if (!anoInicio && !anoConclusao) return null;
  if (atual) return `${anoInicio ?? ""}–atual`;
  if (anoInicio && anoConclusao) return `${anoInicio}–${anoConclusao}`;
  return `${anoInicio ?? anoConclusao}`;
}
