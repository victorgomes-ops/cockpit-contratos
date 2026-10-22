"use client";

import { useMemo, useState } from "react";
import type { ContratoResumo } from "@/lib/queries/contratos";

export function ContratosTable({ contratos }: { contratos: ContratoResumo[] }) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("Todos");

  const statusDisponiveis = useMemo(() => {
    const unicos = new Set(contratos.map((c) => c.status || "Sem status"));
    return ["Todos", ...Array.from(unicos).sort()];
  }, [contratos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return contratos.filter((c) => {
      const bateStatus = status === "Todos" || (c.status || "Sem status") === status;
      const bateBusca =
        !termo ||
        c.nome?.toLowerCase().includes(termo) ||
        c.cliente?.toLowerCase().includes(termo);
      return bateStatus && bateBusca;
    });
  }, [contratos, busca, status]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Buscar por contrato ou cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-lg border border-pwr-dark-blue/15 px-3 py-2 text-sm outline-none focus:border-pwr-orange sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-pwr-dark-blue/15 px-3 py-2 text-sm outline-none focus:border-pwr-orange"
        >
          {statusDisponiveis.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-xs text-pwr-blue/50">
          {filtrados.length} de {contratos.length}
        </span>
      </div>

      <div className="mt-3 max-h-[75vh] overflow-auto rounded-md border border-pwr-dark-blue/10 bg-white">
        <table className="min-w-full text-center text-[11.5px]">
          <thead className="sticky top-0 border-b border-pwr-dark-blue/10 bg-[#eef0f4]">
            <tr>
              <Th>Contrato</Th>
              <Th>Cliente</Th>
              <Th>Status</Th>
              <Th>Unidade</Th>
              <Th>Gerente de Projeto</Th>
              <Th>Término Vendido</Th>
              <Th>Interno</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pwr-dark-blue/5">
            {filtrados.map((c, i) => (
              <tr key={`${c.nome}-${i}`} className="hover:bg-pwr-orange/5">
                <Td>{c.nome}</Td>
                <Td>{c.cliente}</Td>
                <Td>{c.status}</Td>
                <Td>{c.unidade}</Td>
                <Td>{c.gerenteProjeto}</Td>
                <Td>{c.terminoVendido}</Td>
                <Td>{c.interno ? "Sim" : "Não"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-1.5 py-1 text-[9.5px] font-semibold tracking-wide text-pwr-blue/55 uppercase whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-1.5 py-[3px] whitespace-nowrap text-pwr-blue/75">{children}</td>;
}
