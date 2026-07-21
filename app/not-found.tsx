import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Erro 404</p>
      <h1 className="font-display text-3xl font-normal text-ink sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="max-w-editorial text-base text-ink-soft">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link
        href="/alicia"
        className="mt-2 inline-flex items-center justify-center border border-gold px-8 py-4 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
      >
        Ir para a AliCIA
      </Link>
    </main>
  );
}
