"use client";

import { useEffect, useState } from "react";
import { montarCasoControlado } from "@/components/alicia/montarCasoControlado";
import {
  CHAVE_DECISAO_DA_CURADORIA,
  gerarDossieDeCuradoria,
  type DossieDeCuradoria,
} from "@/components/alicia/gerarDossieDeCuradoria";
import { deserializarRegistroDeDecisao } from "@/domain/curadoria";
import { DossieView } from "@/components/alicia/DossieView";

// Tela do paciente (PRODUCT-WAVE-P3): mostra SOMENTE o dossiê.
// Nenhum dado interno, nenhuma auditoria, nenhuma exclusão, nenhum
// histórico — o que não está no DossieDeCuradoria não existe aqui.
//
// A decisão confirmada no workspace do curador é lida do armazenamento
// local do navegador (operação manual e dados controlados desta fase;
// sem banco definitivo).

export function DossieDoPaciente() {
  const [dossie, setDossie] = useState<DossieDeCuradoria | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CHAVE_DECISAO_DA_CURADORIA);
      if (guardado) {
        const decisao = deserializarRegistroDeDecisao(guardado);
        setDossie(gerarDossieDeCuradoria({ workspace: montarCasoControlado(), decisao }));
      }
    } catch {
      setDossie(null);
    } finally {
      setCarregado(true);
    }
  }, []);

  if (!carregado) {
    return null;
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-1 border-b border-hairline pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Curadoria Médica · Aliviar
        </p>
        <h1 className="font-display text-2xl text-ink">Seu Dossiê de Curadoria</h1>
      </header>
      {dossie ? (
        <DossieView dossie={dossie} />
      ) : (
        <p className="text-sm text-ink-soft">
          Seu dossiê ainda está sendo preparado pela curadoria. Volte em breve.
        </p>
      )}
    </main>
  );
}
