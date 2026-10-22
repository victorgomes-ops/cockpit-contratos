import { CabecalhoTabela } from "@/components/CabecalhoTabela";
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
  somarParcelaFechada,
  statusDisponiveis,
} from "@/lib/contratos-base";

const colunasARenovar: ChaveColuna[] = [
  "nome",
  "cliente",
  "dataTerminoVendido",
  "status",
  "gerenteProjeto",
  "scrumMaster",
  "unidade",
  "parcelaFechada",
  "receitaRecorrente",
];

const colunasRenovados: ChaveColuna[] = [
  "nome",
  "cliente",
  "dataRenovacao",
  "dataTerminoVendido",
  "gerenteProjeto",
  "scrumMaster",
  "unidade",
  "parcelaFechada",
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
  const parcelaARenovar = somarParcelaFechada(aRenovar);
  const parcelaRenovada = somarParcelaFechada(renovados);
  const base = getBaseContratos();

  return (
    <div className="px-6 py-6">
      <h1 className="text-lg font-semibold text-pwr-dark-blue">Renovações</h1>
      <p className="mt-0.5 text-xs text-pwr-blue/50">
        {rotuloMes(mes)} — base de {new Date(base.gerado).toLocaleDateString("pt-BR")}.
      </p>

      <div className="mt-4">
        <FiltrosMes
          mes={mes}
          interno={interno}
          status={status}
          statusDisponiveis={statusDisponiveis()}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        <IndicadorTaxa
          titulo="Renovação (projetos)"
          taxa={ind.taxaQuantidade}
          detalhe={`${ind.renovados} de ${ind.potencial} no momento de renovar`}
          nota={`${ind.aRenovar} ainda a renovar`}
        />
        <IndicadorTaxa
          titulo="Renovação (receita)"
          taxa={ind.taxaReceita}
          detalhe={`${formatarMoeda(ind.receitaRenovada)} de ${formatarMoeda(ind.receitaPotencial)}`}
          nota={`${formatarMoeda(ind.receitaARenovar)} em risco`}
        />
        <StatCard
          label="Parcela fechada"
          value={formatarMoeda(parcelaARenovar + parcelaRenovada)}
          hint={`${formatarMoeda(parcelaARenovar)} a renovar · ${formatarMoeda(parcelaRenovada)} renovado`}
        />
        <StatCard label="A renovar no mês" value={ind.aRenovar} hint="Término vendido no mês" />
        <StatCard label="Renovados no mês" value={ind.renovados} hint="Renovação registrada no mês" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="min-w-0">
          <CabecalhoTabela
            titulo={`A renovar em ${rotuloMes(mes).toLowerCase()}`}
            projetos={aRenovar.length}
            valor={formatarMoeda(parcelaARenovar)}
            rotuloValor="parcela"
          />
          <TabelaOrdenavel
            contratos={aRenovar}
            colunas={colunasARenovar}
            ordemInicial="dataTerminoVendido"
            vazio="Nenhum projeto com término vendido neste mês."
          />
        </section>

        <section className="min-w-0">
          <CabecalhoTabela
            titulo={`Renovados em ${rotuloMes(mes).toLowerCase()}`}
            projetos={renovados.length}
            valor={formatarMoeda(parcelaRenovada)}
            rotuloValor="parcela"
          />
          <TabelaOrdenavel
            contratos={renovados}
            colunas={colunasRenovados}
            ordemInicial="dataRenovacao"
            vazio="Nenhuma renovação registrada neste mês."
          />
        </section>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-pwr-blue/45">
        Os dois grupos nunca se sobrepõem: ao renovar, o término vendido é empurrado para a
        frente e o projeto sai da lista de &quot;a renovar&quot;. Por isso o potencial do mês é a
        soma dos dois ({ind.aRenovar} + {ind.renovados} = {ind.potencial}).
      </p>
    </div>
  );
}
