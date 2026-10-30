import { formatarMoeda } from "@/lib/contratos-base";

export type LinhaMotivo = {
  motivo: string;
  gerente?: string;
  contratos: number;
  receita: number;
  /** Linha que repete o motivo da anterior: a celula fica vazia para o
   *  agrupamento ser lido de relance, sem precisar de linha de cabecalho. */
  continuacao?: boolean;
};

function pct(parte: number, total: number): string {
  if (total <= 0) return "—";
  return `${((parte / total) * 100).toFixed(1).replace(".", ",")}%`;
}

export function TabelaMotivos({
  titulo,
  nota,
  linhas,
  totalContratos,
  totalReceita,
  colunaSub,
  vazio,
}: {
  titulo: string;
  nota?: string;
  linhas: LinhaMotivo[];
  totalContratos: number;
  totalReceita: number;
  /** Cabecalho da segunda coluna de rotulo; ausente deixa a tabela com um
   *  nivel so (motivo). */
  colunaSub?: string;
  vazio: string;
}) {
  const larguras = colunaSub
    ? ["w-[26%]", "w-[22%]", "w-[12%]", "w-[12%]", "w-[18%]", "w-[10%]"]
    : ["w-[34%]", "", "w-[14%]", "w-[14%]", "w-[22%]", "w-[16%]"];

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-t-md border border-pwr-dark-blue/10 bg-pwr-dark-blue/[0.04] px-3 py-2">
        <h2 className="text-[13px] font-semibold text-pwr-dark-blue">{titulo}</h2>
        {nota && <span className="text-[10.5px] text-pwr-blue/45">{nota}</span>}
      </div>

      {linhas.length === 0 ? (
        <p className="rounded-b-md border border-t-0 border-pwr-dark-blue/10 bg-white px-4 py-8 text-center text-xs text-pwr-blue/45">
          {vazio}
        </p>
      ) : (
        <div className="overflow-hidden rounded-b-md border border-t-0 border-pwr-dark-blue/10 bg-white">
          <table className="w-full table-fixed text-center text-[11.5px]">
            <thead className="bg-pwr-dark-blue text-white">
              <tr className="text-[9.5px] font-semibold tracking-wide uppercase">
                <th className={`${larguras[0]} px-1.5 py-1.5 text-white/75`}>Motivo</th>
                {colunaSub && (
                  <th className={`${larguras[1]} px-1.5 py-1.5 text-white/75`}>{colunaSub}</th>
                )}
                <th className={`${larguras[2]} px-1.5 py-1.5 text-white/75`}>Contratos</th>
                <th className={`${larguras[3]} px-1.5 py-1.5 text-white/75`}>% contr.</th>
                <th className={`${larguras[4]} px-1.5 py-1.5 text-white/75`}>Receita encerrada</th>
                <th className={`${larguras[5]} px-1.5 py-1.5 text-white/75`}>% receita</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => (
                <tr
                  key={`${l.motivo}-${l.gerente ?? ""}-${i}`}
                  className={`border-b border-pwr-dark-blue/[0.06] hover:bg-pwr-orange/[0.07] ${
                    i % 2 === 1 ? "bg-pwr-dark-blue/[0.02]" : ""
                  }`}
                >
                  <td
                    title={l.motivo}
                    className="truncate px-1.5 py-[3px] text-pwr-blue/75"
                  >
                    {l.continuacao ? "" : l.motivo}
                  </td>
                  {colunaSub && (
                    <td title={l.gerente} className="truncate px-1.5 py-[3px] text-pwr-blue/75">
                      {l.gerente || "—"}
                    </td>
                  )}
                  <td className="px-1.5 py-[3px] font-medium text-pwr-dark-blue tabular-nums">
                    {l.contratos}
                  </td>
                  <td className="px-1.5 py-[3px] text-pwr-blue/60 tabular-nums">
                    {pct(l.contratos, totalContratos)}
                  </td>
                  <td className="px-1.5 py-[3px] font-medium text-pwr-dark-blue tabular-nums">
                    {formatarMoeda(l.receita)}
                  </td>
                  <td className="px-1.5 py-[3px] text-pwr-blue/60 tabular-nums">
                    {pct(l.receita, totalReceita)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-pwr-orange/40 bg-pwr-dark-blue/[0.05] font-semibold text-pwr-dark-blue">
                <td className="px-1.5 py-[5px] text-left">Total</td>
                {colunaSub && <td />}
                <td className="px-1.5 py-[5px] tabular-nums">{totalContratos}</td>
                <td className="px-1.5 py-[5px] text-pwr-blue/55 tabular-nums">100,0%</td>
                <td className="px-1.5 py-[5px] tabular-nums">{formatarMoeda(totalReceita)}</td>
                <td className="px-1.5 py-[5px] text-pwr-blue/55 tabular-nums">100,0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
