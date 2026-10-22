"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconeContratos,
  IconeProjetos,
  IconeRecorrencia,
  IconeRenovacoes,
  IconeVisaoGeral,
} from "./Icones";

const secoes = [
  { href: "/", label: "Visão Geral", Icone: IconeVisaoGeral },
  { href: "/renovacoes", label: "Renovações", Icone: IconeRenovacoes },
  { href: "/recorrencia", label: "Recorrência Mensal", Icone: IconeRecorrencia },
  { href: "/projetos", label: "Controle de Projetos", Icone: IconeProjetos },
  { href: "/contratos", label: "Contratos", Icone: IconeContratos },
];

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <aside className="sticky top-0 flex h-dvh w-14 shrink-0 flex-col border-r border-pwr-dark-blue/10 bg-pwr-dark-blue lg:w-56">
      <div className="flex h-14 items-center gap-2 px-3 lg:px-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pwr-orange text-xs font-bold text-white">
          &gt;
        </span>
        <span className="hidden text-sm leading-none font-semibold lg:inline">
          <span className="text-white">pwr</span>{" "}
          <span className="text-white/50">GESTÃO</span>
        </span>
      </div>

      <nav className="flex-1 px-2 py-2">
        <ul className="flex flex-col gap-0.5">
          {secoes.map(({ href, label, Icone }) => {
            const ativo = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={label}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors lg:px-3 ${
                    ativo
                      ? "bg-pwr-orange/15 font-medium text-pwr-orange"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icone />
                  <span className="hidden truncate lg:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden border-t border-white/10 px-4 py-3 lg:block">
        <p className="text-[11px] text-white/40">PWR Gestão — Nunca Parar</p>
        <a
          href="https://pwrgestao.com"
          className="text-[11px] text-white/30 hover:text-pwr-orange"
        >
          pwrgestao.com
        </a>
      </div>
    </aside>
  );
}
