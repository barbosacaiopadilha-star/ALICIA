"use client";

import { useMemo, useState } from "react";
import { MedicoList } from "@/components/alicia/MedicoList";
import type { MedicoView } from "@/components/alicia/MedicoCard";

interface CatalogoBuscaProps {
  medicos: MedicoView[];
  especialidadeNome: string;
}

/**
 * Busca e filtro públicos sobre a lista de médicos já carregada pelo
 * servidor (uma única leitura). Filtragem em memória — mesma
 * semântica de matchesProfessionalCatalogSearchCriteria (nome,
 * instituição principal, cidade), adaptada aqui à view plana
 * (MedicoView) já usada pelos componentes de apresentação. Nenhum
 * debounce, cache, paginação ou indexação foi adicionado.
 */
export function CatalogoBusca({ medicos, especialidadeNome }: CatalogoBuscaProps) {
  const [texto, setTexto] = useState("");
  const [cidade, setCidade] = useState("");

  const cidadesDisponiveis = useMemo(() => {
    const unicas = new Set(
      medicos
        .map((medico) => medico.cidade)
        .filter((valor): valor is string => Boolean(valor))
    );
    return Array.from(unicas).sort((a, b) => a.localeCompare(b));
  }, [medicos]);

  const medicosFiltrados = useMemo(() => {
    const needle = texto.trim().toLowerCase();

    return medicos.filter((medico) => {
      if (cidade && medico.cidade !== cidade) {
        return false;
      }

      if (needle) {
        const campos = [medico.nome, medico.instituicaoPrincipal, medico.cidade].filter(
          (valor): valor is string => Boolean(valor)
        );
        const encontrado = campos.some((valor) => valor.toLowerCase().includes(needle));
        if (!encontrado) {
          return false;
        }
      }

      return true;
    });
  }, [medicos, texto, cidade]);

  const filtrosAtivos = texto.trim().length > 0 || cidade.length > 0;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Buscar por nome ou instituição"
          aria-label="Buscar por nome ou instituição"
          className="w-full border border-hairline bg-paper px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none sm:flex-1"
        />

        {cidadesDisponiveis.length > 1 && (
          <select
            value={cidade}
            onChange={(event) => setCidade(event.target.value)}
            aria-label="Filtrar por cidade"
            className="w-full border border-hairline bg-paper px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none sm:w-56"
          >
            <option value="">Todas as cidades</option>
            {cidadesDisponiveis.map((cidadeDisponivel) => (
              <option key={cidadeDisponivel} value={cidadeDisponivel}>
                {cidadeDisponivel}
              </option>
            ))}
          </select>
        )}
      </div>

      {medicosFiltrados.length === 0 ? (
        <div className="flex w-full flex-col items-center gap-3 border border-hairline bg-canvas px-6 py-12 text-center">
          <p className="text-base font-medium text-ink">Nenhum médico encontrado para esta busca.</p>
          <p className="text-sm text-ink-soft">Tente ajustar o texto ou a cidade selecionada.</p>
          {filtrosAtivos && (
            <button
              type="button"
              onClick={() => {
                setTexto("");
                setCidade("");
              }}
              className="mt-2 inline-flex items-center justify-center border border-gold px-6 py-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <MedicoList medicos={medicosFiltrados} especialidadeNome={especialidadeNome} />
      )}
    </div>
  );
}
