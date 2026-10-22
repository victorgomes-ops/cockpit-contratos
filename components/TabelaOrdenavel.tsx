"use client";

import { useMemo, useState } from "react";
import type { ContratoBase } from "@/lib/contratos-base";
import { formatarMoeda, valorNumerico } from "@/lib/contratos-base";

export type ChaveColuna =
  | "nome"
  | "cliente"
  | "parcelaFechada"
  | "dataTerminoVendido"
  | "dataRenovacao"
  | "status"
  | "gerenteProjeto"
  | "scrumMaster"
  | "unidade"
  | "receitaRecorrente";

type Definicao = {
  titulo: string;
  tipo: "texto" | "data" | "dinheiro";
  valor: (c: ContratoBase) => string;
  largura: string;
  badge?: boolean;
};

const DEFINICOES: Record<ChaveColuna, Definicao> = {
  nome: { titulo: "Projeto", tipo: "texto", valor: (c) => c.nome, largura: "w-[14%]" },
  cliente: { titulo: "Cliente", tipo: "texto", valor: (c) => c.cliente, largura: "w-[12%]" },
  dataTerminoVendido: {
    titulo: "Término",
    tipo: "data",
    valor: (c) => c.dataTerminoVendido,
    largura: "w-[11%]",
  },
  dataRenovacao: {
    titulo: "Renovado",
    tipo: "data",
    valor: (c) => c.dataRenovacao,
    largura: "w-[11%]",
  },
  status: {
    titulo: "Status",
    tipo: "texto",
    valor: (c) => c.status,
    largura: "w-[10%]",
    badge: true,
  },
  gerenteProjeto: {
    titulo: "Gerente",
    tipo: "texto",
    valor: (c) => c.gerenteProjeto,
    largura: "w-[12%]",
  },
  scrumMaster: {
    titulo: "Scrum",
    tipo: "texto",
    valor: (c) => c.scrumMaster,
    largura: "w-[12%]",
  },
  unidade: { titulo: "Unidade", tipo: "texto", valor: (c) => c.unidade, largura: "w-[10%]" },
  parcelaFechada: {
    titulo: "Parcela",
    tipo: "dinheiro",
    valor: (c) => c.parcelaFechada,
    largura: "w-[10%]",
  },
  receitaRecorrente: {
    titulo: "Rec. Anual",
    tipo: "dinheiro",
    valor: (c) => c.receitaRecorrente,
    largura: "w-[11%]",
  },
};

const CORES_STATUS: Record<string, string> = {
  Ativo: "bg-pwr-light-blue/12 text-pwr-light-blue",
  Inativo: "bg-pwr-dark-blue/8 text-pwr-blue/55",
  "Stand By": "bg-pwr-blue/12 text-pwr-blue",
  Cancelado: "bg-pwr-orange/12 text-pwr-orange",
  Pendente: "bg-pwr-orange/12 text-pwr-orange",
};

function exibir(contrato: ContratoBase, coluna: ChaveColuna): string {
  const def = DEFINICOES[coluna];
  const bruto = def.valor(contrato);
  if (def.tipo === "dinheiro") {
    return bruto ? formatarMoeda(valorNumerico(bruto)) : "";
  }
  return bruto;
}

function chaveDeOrdenacao(contrato: ContratoBase, coluna: ChaveColuna): number | string {
  const def = DEFINICOES[coluna];
  const bruto = def.valor(contrato);

  if (def.tipo === "data") {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(bruto);
    return m ? Number(`${m[3]}${m[2]}${m[1]}`) : 0;
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
      const comparacao =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "pt-BR");
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
      <p className="rounded-b-md border border-t-0 border-pwr-dark-blue/10 bg-white px-4 py-8 text-center text-xs text-pwr-blue/45">
        {vazio}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-b-md border border-t-0 border-pwr-dark-blue/10 bg-white">
      <table className="w-full table-fixed text-center text-[11.5px]">
        <thead className="bg-pwr-dark-blue text-white">
          <tr>
            {colunas.map((coluna) => {
              const def = DEFINICOES[coluna];
              const ativa = coluna === ordenarPor;
              return (
                <th key={coluna} className={def.largura}>
                  <button
                    type="button"
                    onClick={() => alternar(coluna)}
                    className={`flex w-full items-center justify-center gap-0.5 px-1 py-1.5 text-[9.5px] font-semibold tracking-wide uppercase hover:text-pwr-orange ${
                      ativa ? "text-pwr-orange" : "text-white/75"
                    }`}
                  >
                    <span className="truncate">{def.titulo}</span>
                    <span className={ativa ? "" : "text-white/30"}>
                      {ativa ? (crescente ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ordenados.map((contrato, i) => (
            <tr
              key={`${contrato.nome}-${i}`}
              className={`border-b border-pwr-dark-blue/[0.06] last:border-0 hover:bg-pwr-orange/[0.07] ${
                i % 2 === 1 ? "bg-pwr-dark-blue/[0.02]" : ""
              }`}
            >
              {colunas.map((coluna) => {
                const def = DEFINICOES[coluna];
                const texto = exibir(contrato, coluna);

                if (def.badge) {
                  return (
                    <td key={coluna} className="px-1 py-[3px]">
                      <span
                        className={`inline-block max-w-full truncate rounded px-1.5 py-[1px] text-[10px] font-medium ${
                          CORES_STATUS[texto] ?? "bg-pwr-dark-blue/8 text-pwr-blue/55"
                        }`}
                      >
                        {texto || "—"}
                      </span>
                    </td>
                  );
                }

                return (
                  <td
                    key={coluna}
                    title={texto}
                    className={`truncate px-1.5 py-[3px] ${
                      def.tipo === "dinheiro"
                        ? "font-medium text-pwr-dark-blue tabular-nums"
                        : "text-pwr-blue/75"
                    }`}
                  >
                    {texto || "—"}
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
