"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const abas = [
  { href: "/encerramentos", label: "Panorama" },
  { href: "/encerramentos/motivos", label: "Motivos de Encerramento" },
  { href: "/encerramentos/apresentacao", label: "Apresentação" },
];

export function SubAbas() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Os filtros seguem junto na troca de aba: ir de Motivos para Apresentacao
  // e para ver o mesmo recorte em slide, nao para recomecar a escolha.
  const query = searchParams.toString();

  return (
    <nav className="mt-2.5 flex gap-0.5 border-b border-pwr-dark-blue/10">
      {abas.map(({ href, label }) => {
        const ativo = pathname === href;
        return (
          <Link
            key={href}
            href={query ? `${href}?${query}` : href}
            aria-current={ativo ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-1.5 text-[12px] transition-colors ${
              ativo
                ? "border-pwr-orange font-semibold text-pwr-orange"
                : "border-transparent text-pwr-blue/55 hover:border-pwr-dark-blue/20 hover:text-pwr-dark-blue"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
