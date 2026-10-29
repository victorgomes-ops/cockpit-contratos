import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  delta,
  grafico,
  acento,
}: {
  label: string;
  value: string | number;
  hint?: string;
  /** Comparacao com o periodo anterior. Apresentada sem cor de juizo: mais
   *  encerramentos nao e automaticamente ruim (projeto pontual que terminou
   *  conta igual a cliente perdido), entao quem interpreta e o leitor. */
  delta?: { diferenca: number; rotulo: string; texto?: string };
  grafico?: ReactNode;
  acento?: boolean;
}) {
  return (
    <div
      className={`rounded-md border border-pwr-dark-blue/10 bg-white px-2.5 py-2 ${
        acento ? "border-l-2 border-l-pwr-orange" : ""
      }`}
    >
      <p className="truncate text-[10px] font-medium tracking-wide text-pwr-blue/50 uppercase">
        {label}
      </p>
      <p
        className={`mt-0.5 leading-tight font-semibold text-pwr-dark-blue ${
          acento ? "text-xl" : "text-base"
        }`}
      >
        {value}
      </p>

      {delta && (
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1 text-[10px] leading-snug">
          <span className="font-medium whitespace-nowrap text-pwr-dark-blue/70 tabular-nums">
            {delta.diferenca === 0
              ? "sem variação"
              : `${delta.diferenca > 0 ? "▲" : "▼"} ${delta.texto ?? Math.abs(delta.diferenca)}`}
          </span>
          <span className="whitespace-nowrap text-pwr-blue/40">{delta.rotulo}</span>
        </p>
      )}

      {hint && <p className="mt-0.5 text-[10px] leading-snug text-pwr-blue/40">{hint}</p>}
      {grafico}
    </div>
  );
}
