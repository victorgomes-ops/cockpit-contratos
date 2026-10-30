"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MESES, ROTULO_BASE_VALOR } from "@/lib/contratos-base";

const classe =
  "rounded-lg border border-pwr-dark-blue/15 px-3 py-2 text-sm outline-none focus:border-pwr-orange";

export function FiltrosMotivos({
  ano,
  mes,
  ate,
  interno,
  valor,
  anosDisponiveis,
}: {
  ano: string;
  mes: number;
  ate: number;
  interno: string;
  valor: string;
  anosDisponiveis: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function atualizar(chave: string, novo: string) {
    // Mes de referencia e fim do acumulado sao independentes de proposito:
    // comparar outubro contra o acumulado jan-set e um recorte valido.
    const params = new URLSearchParams(searchParams.toString());
    params.set(chave, novo);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const doisDigitos = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mt-4 flex flex-wrap gap-3 sm:items-end">
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
        <span className="text-xs font-medium text-pwr-blue/70">Mês de referência</span>
        <select
          value={doisDigitos(mes)}
          onChange={(e) => atualizar("mes", e.target.value)}
          className={classe}
        >
          {MESES.map((nome, i) => (
            <option key={nome} value={doisDigitos(i + 1)}>
              {nome}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-pwr-blue/70">Acumulado de janeiro até</span>
        <select
          value={doisDigitos(ate)}
          onChange={(e) => atualizar("ate", e.target.value)}
          className={classe}
        >
          {MESES.map((nome, i) => (
            <option key={nome} value={doisDigitos(i + 1)}>
              {nome}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-pwr-blue/70">Receita encerrada</span>
        <select
          value={valor}
          onChange={(e) => atualizar("valor", e.target.value)}
          className={classe}
        >
          <option value="parcela">{ROTULO_BASE_VALOR.parcela}</option>
          <option value="recorrente">{ROTULO_BASE_VALOR.recorrente}</option>
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
