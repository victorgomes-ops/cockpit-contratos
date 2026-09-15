"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Visão Geral" },
  { href: "/renovacoes", label: "Renovações" },
  { href: "/projetos", label: "Controle de Projetos" },
  { href: "/contratos", label: "Contratos" },
];

export function NavBar() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="bg-pwr-dark-blue">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo variant="light" />
        <ul className="flex gap-6 text-sm font-medium">
          {links.map((link) => {
            const ativo = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={ativo ? "text-pwr-orange" : "text-white/80 hover:text-white"}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
