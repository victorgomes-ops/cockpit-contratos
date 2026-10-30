import type { Paragrafo } from "@/lib/resumo-executivo";

export function ResumoExecutivo({
  paragrafos,
  periodo,
}: {
  paragrafos: Paragrafo[];
  periodo: string;
}) {
  return (
    <section className="rounded-md border border-pwr-dark-blue/10 border-l-2 border-l-pwr-orange bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-[13px] font-semibold text-pwr-dark-blue">
          Resumo Executivo do Mês
        </h2>
        <span className="text-[10.5px] text-pwr-blue/45">{periodo}</span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {paragrafos.map((p) => (
          <div key={p.titulo}>
            <h3 className="text-[10px] font-semibold tracking-wide text-pwr-orange uppercase">
              {p.titulo}
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-pwr-blue/80">{p.texto}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-pwr-dark-blue/[0.08] pt-2 text-[10px] leading-relaxed text-pwr-blue/40">
        Texto gerado a partir dos próprios números das tabelas acima e refeito a cada
        mudança de filtro. Descreve o que os dados mostram, sem classificar motivo como
        bom ou ruim — essa leitura depende de regra de negócio que ainda não está definida.
      </p>
    </section>
  );
}
