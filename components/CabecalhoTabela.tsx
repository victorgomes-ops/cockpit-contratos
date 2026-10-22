export function CabecalhoTabela({
  titulo,
  projetos,
  valor,
  rotuloValor,
}: {
  titulo: string;
  projetos: number;
  valor: string;
  rotuloValor: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-t-md border border-pwr-dark-blue/10 bg-pwr-dark-blue/[0.04] px-3 py-2">
      <h2 className="text-[13px] font-semibold text-pwr-dark-blue">{titulo}</h2>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-pwr-blue/55">
          <strong className="font-semibold text-pwr-dark-blue">{projetos}</strong> projetos
        </span>
        <span className="h-3 w-px bg-pwr-dark-blue/15" />
        <span className="text-[11px] text-pwr-blue/55">
          {rotuloValor}{" "}
          <strong className="font-semibold text-pwr-orange">{valor}</strong>
        </span>
      </div>
    </div>
  );
}
