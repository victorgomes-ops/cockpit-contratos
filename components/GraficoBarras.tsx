"use client";

import { useState } from "react";
import type { Fatia } from "@/lib/contratos-base";

const LARANJA = "#FF5B00";

export function GraficoBarras({
  fatias,
  titulo,
  vazio,
}: {
  fatias: Fatia[];
  titulo: string;
  vazio: string;
}) {
  const [ativo, setAtivo] = useState<string | null>(null);

  const total = fatias.reduce((t, f) => t + f.quantidade, 0);
  const maior = Math.max(...fatias.map((f) => f.quantidade), 1);

  return (
    <div className="rounded-md border border-pwr-dark-blue/10 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[12px] font-semibold text-pwr-dark-blue">{titulo}</h3>
        <span className="text-[10px] text-pwr-blue/45">{total} projetos</span>
      </div>

      {fatias.length === 0 ? (
        <p className="py-8 text-center text-[11px] text-pwr-blue/40">{vazio}</p>
      ) : (
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {fatias.map((f) => {
            const pct = (f.quantidade / maior) * 100;
            const destacado = ativo === f.rotulo;
            return (
              <li
                key={f.rotulo}
                onMouseEnter={() => setAtivo(f.rotulo)}
                onMouseLeave={() => setAtivo(null)}
                className="grid grid-cols-[minmax(0,7.5rem)_1fr_1.75rem] items-center gap-2"
                title={`${f.rotulo}: ${f.quantidade} de ${total} (${((f.quantidade / total) * 100).toFixed(1).replace(".", ",")}%)`}
              >
                <span className="truncate text-right text-[10.5px] text-pwr-blue/70">
                  {f.rotulo}
                </span>
                <span className="h-3 w-full overflow-hidden rounded-sm bg-pwr-dark-blue/[0.05]">
                  <span
                    className="block h-full rounded-sm transition-[width,opacity] duration-200"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: LARANJA,
                      opacity: ativo && !destacado ? 0.45 : 1,
                    }}
                  />
                </span>
                <span className="text-right text-[10.5px] font-semibold text-pwr-dark-blue tabular-nums">
                  {f.quantidade}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
