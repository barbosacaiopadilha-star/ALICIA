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
      <header className="flex items-center justify-center border-b border-hairline py-6">
        <Link href="/alicia" className="font-display text-lg italic text-ink">
          AliCIA
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
