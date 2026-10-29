"use client";

import { useAlternarFiltro, useLimparFiltros } from "@/lib/usar-filtro";

export type FiltroAtivo = { chave: string; rotuloCampo: string; valor: string };

// Sem isto o clique num grafico vira um filtro invisivel: a tabela encolhe e
// nao ha nada na tela dizendo por que.
export function FiltrosAtivos({ filtros }: { filtros: FiltroAtivo[] }) {
  const alternar = useAlternarFiltro();
  const limpar = useLimparFiltros(filtros.map((f) => f.chave));

  if (filtros.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-medium tracking-wide text-pwr-blue/45 uppercase">
        Filtrado por
      </span>

      {filtros.map((f) => (
        <button
          key={f.chave}
          type="button"
          onClick={() => alternar(f.chave, f.valor)}
          title={`Remover o filtro de ${f.rotuloCampo.toLowerCase()}`}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-pwr-orange/30 bg-pwr-orange/10 py-[3px] pr-1.5 pl-2.5 text-[11px] text-pwr-dark-blue transition-colors hover:bg-pwr-orange/20"
        >
          <span className="text-pwr-blue/50">{f.rotuloCampo}:</span>
          <span className="font-medium">{f.valor}</span>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-pwr-orange/25 text-[10px] leading-none text-pwr-dark-blue">
            ×
          </span>
        </button>
      ))}

      {filtros.length > 1 && (
        <button
          type="button"
          onClick={limpar}
          className="cursor-pointer px-1 text-[11px] text-pwr-blue/50 underline underline-offset-2 hover:text-pwr-orange"
        >
          limpar todos
        </button>
      )}
    </div>
  );
}
