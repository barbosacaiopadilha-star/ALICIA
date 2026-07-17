import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s · AliCIA",
    default: "AliCIA · Aliviar",
  },
};

export default function AliciaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-6 sm:px-10">
        <Link href="/alicia" className="font-display text-lg italic text-ink">
          AliCIA
        </Link>
        <Link
          href="/alicia/metodologia"
          className="text-sm font-medium text-ink-soft transition-colors duration-300 hover:text-gold"
        >
          Metodologia
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
