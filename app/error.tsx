"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Erro inesperado</p>
      <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">
        Algo não saiu como esperado
      </h1>
      <p className="max-w-editorial text-base text-ink-soft">
        Ocorreu um erro ao carregar esta página. Você pode tentar novamente ou
        voltar para a AliCIA.
      </p>
      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center border border-gold px-8 py-4 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
        >
          Tentar novamente
        </button>
        <Link
          href="/alicia"
          className="inline-flex items-center justify-center border border-hairline px-8 py-4 text-sm font-medium tracking-wide text-ink-soft transition-colors duration-300 hover:border-gold hover:text-gold"
        >
          Ir para a AliCIA
        </Link>
      </div>
    </main>
  );
}
