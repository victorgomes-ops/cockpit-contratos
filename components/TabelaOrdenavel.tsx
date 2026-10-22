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
  // Colunas de texto livre truncam para caber; o valor completo fica no title.
  largura?: string;
  alinharDireita?: boolean;
};

const DEFINICOES: Record<ChaveColuna, Definicao> = {
  nome: { titulo: "Projeto", tipo: "texto", valor: (c) => c.nome, largura: "max-w-[170px]" },
  cliente: { titulo: "Cliente", tipo: "texto", valor: (c) => c.cliente, largura: "max-w-[130px]" },
  parcelasVendidas: {
    titulo: "Parc.",
    tipo: "numero",
    valor: (c) => c.parcelasVendidas.replace(/\.0$/, ""),
    alinharDireita: true,
  },
  dataTerminoVendido: {
    titulo: "Término",
    tipo: "data",
    valor: (c) => c.dataTerminoVendido,
  },
  dataRenovacao: { titulo: "Renovado", tipo: "data", valor: (c) => c.dataRenovacao },
  status: { titulo: "Status", tipo: "texto", valor: (c) => c.status },
  gerenteProjeto: {
    titulo: "Gerente",
    tipo: "texto",
    valor: (c) => c.gerenteProjeto,
    largura: "max-w-[110px]",
  },
  scrumMaster: {
    titulo: "Scrum",
    tipo: "texto",
    valor: (c) => c.scrumMaster,
    largura: "max-w-[110px]",
  },
  unidade: { titulo: "Unidade", tipo: "texto", valor: (c) => c.unidade },
  receitaRecorrente: {
    titulo: "Rec. Anual",
    tipo: "dinheiro",
    valor: (c) => c.receitaRecorrente,
    alinharDireita: true,
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
      <p className="rounded-lg border border-dashed border-pwr-dark-blue/15 px-4 py-8 text-center text-xs text-pwr-blue/45">
        {vazio}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-pwr-dark-blue/10 bg-white">
      <table className="min-w-full text-[12px]">
        <thead className="border-b border-pwr-dark-blue/10 bg-pwr-dark-blue/[0.03]">
          <tr>
            {colunas.map((coluna) => {
              const def = DEFINICOES[coluna];
              const ativa = coluna === ordenarPor;
              return (
                <th key={coluna} className="whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => alternar(coluna)}
                    className={`flex w-full items-center gap-1 px-2 py-1.5 text-[10px] font-semibold tracking-wide uppercase hover:text-pwr-orange ${
                      def.alinharDireita ? "justify-end" : "text-left"
                    } ${ativa ? "text-pwr-orange" : "text-pwr-blue/55"}`}
                  >
                    {def.titulo}
                    <span className={ativa ? "" : "text-pwr-blue/20"}>
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
            <tr key={`${contrato.nome}-${i}`} className="hover:bg-pwr-orange/[0.04]">
              {colunas.map((coluna) => {
                const def = DEFINICOES[coluna];
                const texto = def.valor(contrato) || "—";
                return (
                  <td
                    key={coluna}
                    title={texto}
                    className={`truncate px-2 py-1.5 text-pwr-blue/75 ${def.largura ?? "whitespace-nowrap"} ${
                      def.alinharDireita ? "text-right tabular-nums" : ""
                    }`}
                  >
                    {texto}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
