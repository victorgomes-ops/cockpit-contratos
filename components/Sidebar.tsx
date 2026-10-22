"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const [aberta, setAberta] = useState(true);

  if (pathname === "/login") return null;

  return (
    <aside
      className={`sticky top-0 flex h-dvh shrink-0 flex-col bg-pwr-dark-blue transition-[width] duration-200 ${
        aberta ? "w-52" : "w-[52px]"
      }`}
    >
      <div className="flex h-12 items-center gap-2 px-2.5">
        <button
          type="button"
          onClick={() => setAberta((v) => !v)}
          title={aberta ? "Recolher menu" : "Expandir menu"}
          aria-label={aberta ? "Recolher menu" : "Expandir menu"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {aberta && (
          <span className="truncate text-[13px] leading-none font-semibold">
            <span className="text-white">pwr</span>{" "}
            <span className="text-white/50">GESTÃO</span>
          </span>
        )}
      </div>

      <nav className="flex-1 px-1.5 py-1.5">
        <ul className="flex flex-col gap-0.5">
          {secoes.map(({ href, label, Icone }) => {
            const ativo = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={label}
                  className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[12.5px] transition-colors ${
                    ativo
                      ? "bg-pwr-orange/15 font-medium text-pwr-orange"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex w-5 shrink-0 justify-center">
                    <Icone />
                  </span>
                  {aberta && <span className="truncate">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {aberta && (
        <div className="px-3 py-2.5">
          <p className="text-[10px] text-white/35">PWR Gestão — Nunca Parar</p>
          <a
            href="https://pwrgestao.com"
            className="text-[10px] text-white/25 hover:text-pwr-orange"
          >
            pwrgestao.com
          </a>
        </div>
      )}
    </aside>
  );
}
