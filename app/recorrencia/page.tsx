import { FiltrosMes } from "@/components/FiltrosMes";
import { StatCard } from "@/components/StatCard";
import {
  filtrarPorMes,
  formatarMoeda,
  getBaseContratos,
  normalizarInterno,
  normalizarMes,
  normalizarStatus,
  resumoDoMes,
  rotuloMes,
  serieMensal,
  statusDisponiveis,
  valorNumerico,
} from "@/lib/contratos-base";

export default async function RecorrenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; interno?: string; status?: string }>;
}) {
  const params = await searchParams;
  const mes = normalizarMes(params.mes);
  const interno = normalizarInterno(params.interno);
  const status = normalizarStatus(params.status);

  const serie = serieMensal(mes, 12, interno, status);
  const atual = resumoDoMes(mes, interno, status);
  const base = getBaseContratos();

  const renovadosNoMes = filtrarPorMes("dataRenovacao", mes, interno, status);
  const recorrenciaAnual = renovadosNoMes.reduce(
    (t, c) => t + valorNumerico(c.receitaRecorrente),
    0
  );

  const maiorValor = Math.max(...serie.map((m) => m.valor), 1);

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <h1 className="text-lg font-semibold text-pwr-dark-blue">Recorrência Mensal</h1>
      <p className="mt-0.5 text-xs text-pwr-blue/50">
        Parcelas renovadas mês a mês — base de{" "}
        {new Date(base.gerado).toLocaleDateString("pt-BR")}.
      </p>

      <div className="mt-4">
        <FiltrosMes
          mes={mes}
          interno={interno}
          status={status}
          statusDisponiveis={statusDisponiveis()}
        />
      </div>

      <h2 className="mt-6 text-[11px] font-semibold tracking-wide text-pwr-blue/50 uppercase">
        Visão mensal — {rotuloMes(mes)}
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        <StatCard label="Renovações no mês" value={atual.renovacoes} hint="Contratos renovados" />
        <StatCard
          label="Parcelas renovadas"
          value={atual.parcelas}
          hint="Meses acrescentados pelas renovações"
        />
        <StatCard
          label="Valor renovado no mês"
          value={formatarMoeda(atual.valor)}
          hint="Parcelas renovadas × valor da parcela"
        />
      </div>

      <h2 className="mt-6 text-[11px] font-semibold tracking-wide text-pwr-blue/50 uppercase">
        Visão anual — contratos renovados em {rotuloMes(mes).toLowerCase()}
      </h2>
      <div className="mt-2 grid grid-cols-1 gap-2.5 lg:grid-cols-3">
        <StatCard
          label="Receita recorrente anual"
          value={formatarMoeda(recorrenciaAnual)}
          hint="Soma anualizada dos contratos renovados no mês — não é o valor renovado"
        />
      </div>

      <h2 className="mt-7 text-[11px] font-semibold tracking-wide text-pwr-blue/50 uppercase">
        Comparativo dos últimos 12 meses
      </h2>
      <div className="mt-2 overflow-x-auto rounded-lg border border-pwr-dark-blue/10 bg-white">
        <table className="min-w-full text-[12px]">
          <thead className="border-b border-pwr-dark-blue/10 bg-pwr-dark-blue/[0.03]">
            <tr className="text-[10px] font-semibold tracking-wide text-pwr-blue/55 uppercase">
              <th className="px-2.5 py-1.5 text-left">Mês</th>
              <th className="px-2.5 py-1.5 text-right">Renovações</th>
              <th className="px-2.5 py-1.5 text-right">Parcelas renovadas</th>
              <th className="px-2.5 py-1.5 text-right">Valor renovado</th>
              <th className="w-40 px-2.5 py-1.5 text-left">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pwr-dark-blue/5">
            {serie.map((m) => {
              const selecionado = m.mes === mes;
              return (
                <tr
                  key={m.mes}
                  className={selecionado ? "bg-pwr-orange/[0.07]" : "hover:bg-pwr-orange/[0.04]"}
                >
                  <td
                    className={`px-2.5 py-1.5 whitespace-nowrap ${
                      selecionado ? "font-semibold text-pwr-dark-blue" : "text-pwr-blue/75"
                    }`}
                  >
                    {rotuloMes(m.mes)}
                  </td>
                  <td className="px-2.5 py-1.5 text-right text-pwr-blue/75">{m.renovacoes}</td>
                  <td className="px-2.5 py-1.5 text-right text-pwr-blue/75">{m.parcelas}</td>
                  <td className="px-2.5 py-1.5 text-right font-medium text-pwr-dark-blue">
                    {formatarMoeda(m.valor)}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-pwr-dark-blue/[0.07]">
                      <div
                        className="h-full rounded-full bg-pwr-orange/70"
                        style={{ width: `${(m.valor / maiorValor) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-pwr-blue/45">
        <strong className="font-medium text-pwr-blue/60">Como é calculado:</strong> a planilha
        não guarda quantas parcelas cada renovação acrescentou — o campo Parcelas Vendidas é o
        acumulado da vida inteira do contrato. As parcelas renovadas aqui são derivadas da
        diferença em meses entre a Data de Renovação e o novo Término Vendido, e o valor usa o
        valor da parcela (Valor Total ÷ Duração Vendida). Em outubro/2026, somar o campo
        acumulado daria 434 parcelas contra 142 efetivamente renovadas.
      </p>
    </div>
  );
}
