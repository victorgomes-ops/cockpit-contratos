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
    <div className="rounded-xl border border-pwr-dark-blue/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-pwr-blue/70">{titulo}</p>
      <p className="mt-2 text-4xl font-semibold text-pwr-dark-blue">
        {taxa === null ? "—" : `${taxa.toFixed(1).replace(".", ",")}%`}
      </p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-pwr-dark-blue/10">
        <div
          className="h-full rounded-full bg-pwr-orange transition-all"
          style={{ width: `${preenchimento}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-pwr-blue/60">{detalhe}</p>
      {nota && <p className="mt-1 text-xs text-pwr-blue/40">{nota}</p>}
    </div>
  );
}
