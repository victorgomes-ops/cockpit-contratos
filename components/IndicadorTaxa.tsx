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
    <div className="rounded-lg border border-pwr-dark-blue/10 bg-white px-3.5 py-3">
      <p className="text-[11px] font-medium tracking-wide text-pwr-blue/55 uppercase">
        {titulo}
      </p>
      <p className="mt-1 text-xl font-semibold text-pwr-dark-blue">
        {taxa === null ? "—" : `${taxa.toFixed(1).replace(".", ",")}%`}
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-pwr-dark-blue/10">
        <div className="h-full rounded-full bg-pwr-orange" style={{ width: `${preenchimento}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-pwr-blue/45">{detalhe}</p>
      {nota && <p className="text-[11px] leading-snug text-pwr-blue/35">{nota}</p>}
    </div>
  );
}
