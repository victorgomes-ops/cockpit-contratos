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
      <p className="rounded-xl border border-dashed border-pwr-dark-blue/15 px-4 py-6 text-center text-sm text-pwr-blue/50">
        {vazio}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-pwr-dark-blue/10">
      <table className="min-w-full divide-y divide-pwr-dark-blue/10 text-sm">
        <thead className="bg-pwr-dark-blue text-white">
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.titulo}
                className="px-3 py-2 text-left text-xs font-semibold tracking-wide uppercase whitespace-nowrap"
              >
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-pwr-dark-blue/5">
          {contratos.map((contrato, i) => (
            <tr key={`${contrato.nome}-${i}`} className="hover:bg-pwr-orange/5">
              {colunas.map((coluna) => (
                <td key={coluna.titulo} className="px-3 py-2 text-pwr-blue/80">
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
