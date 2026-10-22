import type { ContratoBase } from "@/lib/contratos-base";

export type Coluna = {
  titulo: string;
  valor: (c: ContratoBase) => string;
};

export function TabelaContratos({
  contratos,
  colunas,
  vazio,
}: {
  contratos: ContratoBase[];
  colunas: Coluna[];
  vazio: string;
}) {
  if (contratos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-pwr-dark-blue/15 px-4 py-8 text-center text-xs text-pwr-blue/45">
        {vazio}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-pwr-dark-blue/10 bg-white">
      <table className="min-w-full text-[12px]">
        <thead className="border-b border-pwr-dark-blue/10 bg-pwr-dark-blue/[0.03]">
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.titulo}
                className="px-2.5 py-1.5 text-left text-[10px] font-semibold tracking-wide text-pwr-blue/55 uppercase whitespace-nowrap"
              >
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-pwr-dark-blue/5">
          {contratos.map((contrato, i) => (
            <tr key={`${contrato.nome}-${i}`} className="hover:bg-pwr-orange/[0.04]">
              {colunas.map((coluna) => (
                <td key={coluna.titulo} className="px-2.5 py-1.5 whitespace-nowrap text-pwr-blue/75">
                  {coluna.valor(contrato) || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
