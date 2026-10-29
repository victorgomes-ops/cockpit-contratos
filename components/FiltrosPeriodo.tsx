"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MESES } from "@/lib/contratos-base";

const classe =
  "rounded-lg border border-pwr-dark-blue/15 px-3 py-2 text-sm outline-none focus:border-pwr-orange";

export function FiltrosPeriodo({
  ano,
  mes,
  interno,
  anosDisponiveis,
}: {
  ano: string;
  mes: string;
  interno: string;
  anosDisponiveis: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function atualizar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(chave, valor);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-pwr-blue/70">Ano</span>
        <select value={ano} onChange={(e) => atualizar("ano", e.target.value)} className={classe}>
          {anosDisponiveis.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-pwr-blue/70">Mês</span>
        <select value={mes} onChange={(e) => atualizar("mes", e.target.value)} className={classe}>
          <option value="todos">Ano inteiro</option>
          {MESES.map((nome, i) => (
            <option key={nome} value={String(i + 1).padStart(2, "0")}>
              {nome}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-pwr-blue/70">Projeto interno</span>
        <select
          value={interno}
          onChange={(e) => atualizar("interno", e.target.value)}
          className={classe}
        >
          <option value="todos">Todos</option>
          <option value="nao">Somente externos</option>
          <option value="sim">Somente internos</option>
        </select>
      </label>
    </div>
  );
}
