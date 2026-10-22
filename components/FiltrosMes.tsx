"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FiltrosMes({
  mes,
  interno,
  status,
  statusDisponiveis,
}: {
  mes: string;
  interno: string;
  status?: string;
  statusDisponiveis?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function atualizar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(chave, valor);
    router.push(`${pathname}?${params.toString()}`);
  }

  const classe =
    "rounded-lg border border-pwr-dark-blue/15 px-3 py-2 text-sm outline-none focus:border-pwr-orange";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-pwr-blue/70">Mês</span>
        <input
          type="month"
          value={mes}
          onChange={(e) => atualizar("mes", e.target.value)}
          className={classe}
        />
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

      {statusDisponiveis && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-pwr-blue/70">Status do projeto</span>
          <select
            value={status ?? "todos"}
            onChange={(e) => atualizar("status", e.target.value)}
            className={classe}
          >
            <option value="todos">Todos</option>
            {statusDisponiveis.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
