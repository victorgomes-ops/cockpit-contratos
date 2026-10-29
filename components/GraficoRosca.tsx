"use client";

import { useState } from "react";
import type { Fatia } from "@/lib/contratos-base";
import { useAlternarFiltro } from "@/lib/usar-filtro";

// Paleta validada para uso categórico (script validate_palette do dataviz):
// separação ΔE >= 23 inclusive em deuteranopia/protanopia/tritanopia.
const CORES = ["#FF5B00", "#2A4BA0", "#3F9BE6", "#7D8AA3", "#C2561F"];

const RAIO = 60;
const ESPESSURA = 20;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export function GraficoRosca({
  fatias,
  titulo,
  vazio,
  filtro,
  selecionado,
}: {
  fatias: Fatia[];
  titulo: string;
  vazio: string;
  /** Chave de query que o clique numa fatia liga/desliga. */
  filtro: string;
  selecionado: string;
}) {
  const [sobre, setSobre] = useState<string | null>(null);
  const alternar = useAlternarFiltro();

  const total = fatias.reduce((t, f) => t + f.quantidade, 0);
  const destaque = selecionado || sobre;
  const emFoco = fatias.find((f) => f.rotulo === destaque);

  let acumulado = 0;
  const arcos = fatias.map((f, i) => {
    const fracao = total > 0 ? f.quantidade / total : 0;
    const arco = {
      ...f,
      cor: CORES[i % CORES.length],
      dash: fracao * CIRCUNFERENCIA,
      offset: -acumulado * CIRCUNFERENCIA,
      pct: fracao * 100,
    };
    acumulado += fracao;
    return arco;
  });

  function opacidade(rotulo: string): number {
    if (selecionado) return rotulo === selecionado ? 1 : 0.25;
    if (sobre) return rotulo === sobre ? 1 : 0.4;
    return 1;
  }

  function dica(a: (typeof arcos)[number]): string {
    const base = `${a.rotulo}: ${a.quantidade} (${a.pct.toFixed(1).replace(".", ",")}%)`;
    if (a.agregada) return `${base} — soma de varias categorias, nao filtravel`;
    return `${base} — clique para ${selecionado === a.rotulo ? "limpar o filtro" : "filtrar"}`;
  }

  return (
    <div className="rounded-md border border-pwr-dark-blue/10 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[12px] font-semibold text-pwr-dark-blue">{titulo}</h3>
        <span className="text-[10px] text-pwr-blue/45">{total} projetos</span>
      </div>

      {total === 0 ? (
        <p className="py-10 text-center text-[11px] text-pwr-blue/40">{vazio}</p>
      ) : (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:flex-nowrap">
          <svg viewBox="0 0 160 160" className="h-[130px] w-[130px] shrink-0" role="img">
            <g transform="rotate(-90 80 80)">
              {arcos.map((a) => (
                <circle
                  key={a.rotulo}
                  cx="80"
                  cy="80"
                  r={RAIO}
                  fill="none"
                  stroke={a.cor}
                  strokeWidth={destaque === a.rotulo ? ESPESSURA + 4 : ESPESSURA}
                  strokeDasharray={`${a.dash} ${CIRCUNFERENCIA - a.dash}`}
                  strokeDashoffset={a.offset}
                  opacity={opacidade(a.rotulo)}
                  onClick={() => !a.agregada && alternar(filtro, a.rotulo)}
                  onMouseEnter={() => setSobre(a.rotulo)}
                  onMouseLeave={() => setSobre(null)}
                  className={`transition-[stroke-width,opacity] duration-150 ${
                    a.agregada ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <title>{dica(a)}</title>
                </circle>
              ))}
            </g>
            <text
              x="80"
              y="74"
              textAnchor="middle"
              className="fill-pwr-dark-blue text-[22px] font-semibold"
            >
              {emFoco ? emFoco.quantidade : total}
            </text>
            <text x="80" y="90" textAnchor="middle" className="fill-pwr-blue/50 text-[9px]">
              {emFoco ? emFoco.rotulo.slice(0, 14) : "encerrados"}
            </text>
          </svg>

          <ul className="flex min-w-0 flex-col gap-0.5">
            {arcos.map((a) => {
              const ativo = selecionado === a.rotulo;
              return (
                <li key={a.rotulo}>
                  <button
                    type="button"
                    disabled={a.agregada}
                    aria-pressed={ativo}
                    onClick={() => alternar(filtro, a.rotulo)}
                    onMouseEnter={() => setSobre(a.rotulo)}
                    onMouseLeave={() => setSobre(null)}
                    onFocus={() => setSobre(a.rotulo)}
                    onBlur={() => setSobre(null)}
                    title={dica(a)}
                    className={`flex w-full items-center gap-1.5 rounded px-1 py-[2px] text-[10.5px] transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-pwr-orange/60 enabled:cursor-pointer disabled:cursor-default ${
                      ativo ? "bg-pwr-orange/10" : "enabled:hover:bg-pwr-dark-blue/[0.04]"
                    }`}
                    style={{ opacity: opacidade(a.rotulo) }}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: a.cor }}
                    />
                    <span
                      className={`truncate ${ativo ? "font-semibold text-pwr-orange" : "text-pwr-blue/70"}`}
                    >
                      {a.rotulo}
                    </span>
                    <span className="ml-auto pl-1 font-semibold text-pwr-dark-blue tabular-nums">
                      {a.quantidade}
                    </span>
                    <span className="w-10 text-right text-pwr-blue/45 tabular-nums">
                      {a.pct.toFixed(1).replace(".", ",")}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
