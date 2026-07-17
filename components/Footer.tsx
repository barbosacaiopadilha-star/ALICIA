import Link from "next/link";

const links = [
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos", href: "/termos" },
];

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-8 border-t border-hairline px-6 py-16 text-center">
      <span className="font-display text-lg italic text-ink">Aliviar</span>
      <nav aria-label="Links institucionais">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-soft">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="transition-colors duration-300 hover:text-gold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="text-xs text-ink-faint">
        © {new Date().getFullYear()} Aliviar. Todos os direitos reservados.
      </p>
    </footer>
  );
}
