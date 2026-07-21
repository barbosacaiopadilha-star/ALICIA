"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MedicoList } from "@/components/alicia/MedicoList";
import type { MedicoView } from "@/components/alicia/MedicoCard";

interface CatalogoBuscaProps {
  medicos: MedicoView[];
  especialidadeNome: string;
  cidadesDisponiveis: string[];
}

/**
 * Controles públicos de busca (q) e filtro de cidade (city) sobre a
 * lista já filtrada e carregada pelo servidor (uma única leitura por
 * renderização da página — a filtragem em si acontece inteiramente em
 * app/alicia/[estado]/[especialidade]/page.tsx, reutilizando o
 * mesmo predicado matchesProfessionalCatalogSearchCriteria usado pela
 * Query). Este componente não filtra nada por conta própria — apenas
 * lê e escreve os parâmetros de URL, que são a única fonte de
 * verdade dos filtros interativos.
 */
export function CatalogoBusca({
  medicos,
  especialidadeNome,
  cidadesDisponiveis,
}: CatalogoBuscaProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const textoNaUrl = searchParams.get("q") ?? "";
  const cidadeNaUrl = searchParams.get("city") ?? "";

  // Input de texto controlado localmente (evita perder o foco/cursor a
  // cada tecla, já que reescrever a URL a cada letra remontaria um
  // input não controlado). Sincronizado com a URL sempre que ela mudar
  // por fora desta digitação (voltar, avançar, link compartilhado) —
  // a URL continua sendo a fonte de verdade.
  const [texto, setTexto] = useState(textoNaUrl);

  useEffect(() => {
    setTexto(textoNaUrl);
  }, [textoNaUrl]);

  const filtrosAtivos = textoNaUrl.length > 0 || cidadeNaUrl.length > 0;

  function atualizarParametro(chave: "q" | "city", valor: string, metodo: "push" | "replace") {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(chave, valor);
    } else {
      params.delete(chave);
    }
    const query = params.toString();
    const destino = query ? `${pathname}?${query}` : pathname;
    router[metodo](destino, { scroll: false });
  }

  function limparFiltros() {
    setTexto("");
    router.push(pathname, { scroll: false });
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="catalogo-busca-texto">
          Buscar por nome ou instituição
        </label>
        <input
          id="catalogo-busca-texto"
          type="search"
          value={texto}
          onChange={(event) => {
            setTexto(event.target.value);
            // Atualização a cada digitação (sem debounce, conforme
            // instruído); usa replace, não push, para não poluir o
            // histórico com um estado por tecla — mesmo padrão de
            // busca ao vivo já usado amplamente em produtos reais.
            atualizarParametro("q", event.target.value, "replace");
          }}
          placeholder="Buscar por nome ou instituição"
          className="w-full border border-hairline bg-paper px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none sm:flex-1"
        />

        {cidadesDisponiveis.length > 1 && (
          <>
            <label className="sr-only" htmlFor="catalogo-busca-cidade">
              Filtrar por cidade
            </label>
            <select
              id="catalogo-busca-cidade"
              value={cidadeNaUrl}
              onChange={(event) =>
                // push, não replace: selecionar uma cidade é uma ação
                // discreta e deliberada — vale um item de histórico,
                // para que o botão voltar restaure a cidade anterior.
                atualizarParametro("city", event.target.value, "push")
              }
              className="w-full border border-hairline bg-paper px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none sm:w-56"
            >
              <option value="">Todas as cidades</option>
              {cidadesDisponiveis.map((cidadeDisponivel) => (
                <option key={cidadeDisponivel} value={cidadeDisponivel}>
                  {cidadeDisponivel}
                </option>
              ))}
            </select>
          </>
        )}

        {filtrosAtivos && (
          <button
            type="button"
            onClick={limparFiltros}
            className="w-full border border-hairline px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-300 hover:border-gold hover:text-gold sm:w-auto"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <p aria-live="polite" className="text-xs text-ink-faint">
        {medicos.length === 1
          ? "1 profissional encontrado."
          : `${medicos.length} profissionais encontrados.`}
      </p>

      {medicos.length === 0 ? (
        <div className="flex w-full flex-col items-center gap-3 border border-hairline bg-canvas px-6 py-12 text-center">
          <p className="text-base font-medium text-ink">
            Nenhum profissional encontrado com esses filtros.
          </p>
          <p className="text-sm text-ink-soft">Tente ajustar o texto ou a cidade selecionada.</p>
          <button
            type="button"
            onClick={limparFiltros}
            className="mt-2 inline-flex items-center justify-center border border-gold px-6 py-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <MedicoList medicos={medicos} especialidadeNome={especialidadeNome} />
      )}
    </div>
  );
}
