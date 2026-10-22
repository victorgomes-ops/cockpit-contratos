export function IndicadorTaxa({
  titulo,
  taxa,
  detalhe,
  nota,
}: {
  titulo: string;
  taxa: number | null;
  detalhe: string;
  nota?: string;
}) {
  const preenchimento = taxa === null ? 0 : Math.min(Math.max(taxa, 0), 100);

  return (
    <div className="rounded-md border border-pwr-dark-blue/10 bg-white px-2.5 py-2">
      <p className="truncate text-[10px] font-medium tracking-wide text-pwr-blue/50 uppercase">
        {titulo}
      </p>
      <p className="mt-0.5 text-base leading-tight font-semibold text-pwr-dark-blue">
        {taxa === null ? "—" : `${taxa.toFixed(1).replace(".", ",")}%`}
      </p>
      <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-pwr-dark-blue/10">
        <div className="h-full rounded-full bg-pwr-orange" style={{ width: `${preenchimento}%` }} />
      </div>
      <p className="mt-1 text-[10px] leading-snug text-pwr-blue/40">{detalhe}</p>
      {nota && <p className="text-[10px] leading-snug text-pwr-blue/30">{nota}</p>}
    </div>
  );
}
