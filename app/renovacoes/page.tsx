import { FiltrosMes } from "@/components/FiltrosMes";
import { IndicadorTaxa } from "@/components/IndicadorTaxa";
import { StatCard } from "@/components/StatCard";
import { TabelaOrdenavel, type ChaveColuna } from "@/components/TabelaOrdenavel";
import {
  calcularIndicadores,
  filtrarPorMes,
  formatarMoeda,
  getBaseContratos,
  normalizarInterno,
  normalizarMes,
  normalizarStatus,
  rotuloMes,
  statusDisponiveis,
} from "@/lib/contratos-base";

const colunasARenovar: ChaveColuna[] = [
  "nome",
  "cliente",
  "parcelasVendidas",
  "dataTerminoVendido",
  "status",
  "gerenteProjeto",
  "scrumMaster",
  "unidade",
  "receitaRecorrente",
];

const colunasRenovados: ChaveColuna[] = [
  "nome",
  "cliente",
  "parcelasVendidas",
  "dataRenovacao",
  "dataTerminoVendido",
  "gerenteProjeto",
  "scrumMaster",
  "unidade",
  "receitaRecorrente",
];

export default async function RenovacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; interno?: string; status?: string }>;
}) {
  const params = await searchParams;
  const mes = normalizarMes(params.mes);
  const interno = normalizarInterno(params.interno);
  const status = normalizarStatus(params.status);

  const aRenovar = filtrarPorMes("dataTerminoVendido", mes, interno, status);
  const renovados = filtrarPorMes("dataRenovacao", mes, interno, status);
  const ind = calcularIndicadores(aRenovar, renovados);
  const base = getBaseContratos();

  return (
    <div className="mx-auto max-w-[1700px] px-6 py-10">
      <h1 className="text-2xl font-semibold text-pwr-dark-blue">Renovações</h1>
      <p className="mt-1 text-sm text-pwr-blue/60">
        {rotuloMes(mes)} — base atualizada em{" "}
        {new Date(base.gerado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
      </p>

      <div className="mt-6">
        <FiltrosMes
          mes={mes}
          interno={interno}
          status={status}
          statusDisponiveis={statusDisponiveis()}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorTaxa
          titulo="Taxa de renovação (projetos)"
          taxa={ind.taxaQuantidade}
          detalhe={`${ind.renovados} renovados de ${ind.potencial} que chegaram ao momento de renovar`}
          nota={`${ind.aRenovar} ainda a renovar`}
        />
        <IndicadorTaxa
          titulo="Taxa de renovação (receita)"
          taxa={ind.taxaReceita}
          detalhe={`${formatarMoeda(ind.receitaRenovada)} de ${formatarMoeda(ind.receitaPotencial)}`}
          nota={`${formatarMoeda(ind.receitaARenovar)} em risco`}
        />
        <StatCard
          label="A renovar no mês"
          value={ind.aRenovar}
          hint="Término vendido dentro do mês e ainda sem renovação registrada"
        />
        <StatCard
          label="Renovados no mês"
          value={ind.renovados}
          hint="Data de Renovação registrada dentro do mês"
        />
      </div>

      <p className="mt-4 rounded-lg border border-pwr-dark-blue/10 bg-pwr-dark-blue/[0.03] px-4 py-3 text-xs text-pwr-blue/70">
        Os dois grupos nunca se sobrepõem: ao renovar, o término vendido é empurrado para a
        frente e o projeto sai da lista de &quot;a renovar&quot;. Por isso o potencial do mês é a
        soma dos dois ({ind.aRenovar} + {ind.renovados} = {ind.potencial}). A receita usada é a
        Receita Recorrente Anual, porque o Valor Total da planilha é acumulado desde a entrada
        do contrato e não isola o valor de cada renovação.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-pwr-dark-blue">
            A renovar em {rotuloMes(mes).toLowerCase()}
          </h2>
          <p className="mt-1 mb-3 text-xs text-pwr-blue/50">
            Término do período vendido dentro do mês. Clique no cabeçalho para ordenar.
          </p>
          <TabelaOrdenavel
            contratos={aRenovar}
            colunas={colunasARenovar}
            ordemInicial="dataTerminoVendido"
            vazio="Nenhum projeto com término vendido neste mês."
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-pwr-dark-blue">
            Renovados em {rotuloMes(mes).toLowerCase()}
          </h2>
          <p className="mt-1 mb-3 text-xs text-pwr-blue/50">
            Renovação efetivada dentro do mês, com o novo término já atualizado.
          </p>
          <TabelaOrdenavel
            contratos={renovados}
            colunas={colunasRenovados}
            ordemInicial="dataRenovacao"
            vazio="Nenhuma renovação registrada neste mês."
          />
        </section>
      </div>
    </div>
  );
}
