"use client";

import { useMemo, useState } from "react";
import type { ContratoBase } from "@/lib/contratos-base";
import { valorNumerico } from "@/lib/contratos-base";

export type ChaveColuna =
  | "nome"
  | "cliente"
  | "parcelasVendidas"
  | "dataTerminoVendido"
  | "dataRenovacao"
  | "status"
  | "gerenteProjeto"
  | "scrumMaster"
  | "unidade"
  | "receitaRecorrente";

type Definicao = {
  titulo: string;
  tipo: "texto" | "data" | "numero" | "dinheiro";
  valor: (c: ContratoBase) => string;
};

const DEFINICOES: Record<ChaveColuna, Definicao> = {
  nome: { titulo: "Projeto", tipo: "texto", valor: (c) => c.nome },
  cliente: { titulo: "Cliente", tipo: "texto", valor: (c) => c.cliente },
  parcelasVendidas: {
    titulo: "Parcelas",
    tipo: "numero",
    valor: (c) => c.parcelasVendidas.replace(/\.0$/, ""),
  },
  dataTerminoVendido: {
    titulo: "Término Vendido",
    tipo: "data",
    valor: (c) => c.dataTerminoVendido,
  },
  dataRenovacao: { titulo: "Renovado em", tipo: "data", valor: (c) => c.dataRenovacao },
  status: { titulo: "Status", tipo: "texto", valor: (c) => c.status },
  gerenteProjeto: { titulo: "Gerente", tipo: "texto", valor: (c) => c.gerenteProjeto },
  scrumMaster: { titulo: "Scrum", tipo: "texto", valor: (c) => c.scrumMaster },
  unidade: { titulo: "Unidade", tipo: "texto", valor: (c) => c.unidade },
  receitaRecorrente: {
    titulo: "Receita Recorrente",
    tipo: "dinheiro",
    valor: (c) => c.receitaRecorrente,
  },
};

function chaveDeOrdenacao(contrato: ContratoBase, coluna: ChaveColuna): number | string {
  const def = DEFINICOES[coluna];
  const bruto = def.valor(contrato);

  if (def.tipo === "data") {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(bruto);
    return m ? Number(`${m[3]}${m[2]}${m[1]}`) : 0;
  }
  if (def.tipo === "numero") {
    const n = Number(bruto);
    return Number.isFinite(n) ? n : 0;
  }
  if (def.tipo === "dinheiro") {
    return valorNumerico(bruto);
  }
  return bruto.toLocaleLowerCase("pt-BR");
}

export function TabelaOrdenavel({
  contratos,
  colunas,
  ordemInicial,
  vazio,
}: {
  contratos: ContratoBase[];
  colunas: ChaveColuna[];
  ordemInicial: ChaveColuna;
  vazio: string;
}) {
  const [ordenarPor, setOrdenarPor] = useState<ChaveColuna>(ordemInicial);
  const [crescente, setCrescente] = useState(true);

  const ordenados = useMemo(() => {
    return [...contratos].sort((a, b) => {
      const va = chaveDeOrdenacao(a, ordenarPor);
      const vb = chaveDeOrdenacao(b, ordenarPor);
      let comparacao: number;
      if (typeof va === "number" && typeof vb === "number") {
        comparacao = va - vb;
      } else {
        comparacao = String(va).localeCompare(String(vb), "pt-BR");
      }
      return crescente ? comparacao : -comparacao;
    });
  }, [contratos, ordenarPor, crescente]);

  function alternar(coluna: ChaveColuna) {
    if (coluna === ordenarPor) {
      setCrescente((v) => !v);
    } else {
      setOrdenarPor(coluna);
      setCrescente(true);
    }
  }

  if (contratos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-pwr-dark-blue/15 px-4 py-10 text-center text-sm text-pwr-blue/50">
        {vazio}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-pwr-dark-blue/10">
      <table className="min-w-full divide-y divide-pwr-dark-blue/10 text-sm">
        <thead className="bg-pwr-dark-blue text-white">
          <tr>
            {colunas.map((coluna) => {
              const ativa = coluna === ordenarPor;
              return (
                <th key={coluna} className="whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => alternar(coluna)}
                    className="flex w-full items-center gap-1 px-3 py-2 text-left text-xs font-semibold tracking-wide uppercase hover:text-pwr-orange"
                  >
                    {DEFINICOES[coluna].titulo}
                    <span className={ativa ? "text-pwr-orange" : "text-white/30"}>
                      {ativa ? (crescente ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-pwr-dark-blue/5">
          {ordenados.map((contrato, i) => (
            <tr key={`${contrato.nome}-${i}`} className="hover:bg-pwr-orange/5">
              {colunas.map((coluna) => (
                <td key={coluna} className="px-3 py-2 whitespace-nowrap text-pwr-blue/80">
                  {DEFINICOES[coluna].valor(contrato) || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
