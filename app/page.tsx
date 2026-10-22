import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { contarPor, getContratosResumo } from "@/lib/queries/contratos";
import {
  calcularIndicadores,
  filtrarPorMes,
  formatarMoeda,
  mesAtual,
  resumoDoMes,
  rotuloMes,
} from "@/lib/contratos-base";

export default async function OverviewPage() {
  const { contratos, total, atualizadoEm } = await getContratosResumo();

  const porStatus = contarPor(contratos, (c) => c.status);
  const porUnidade = contarPor(contratos, (c) => c.unidade);

  const mes = mesAtual();
  const ind = calcularIndicadores(
    filtrarPorMes("dataTerminoVendido", mes, "todos"),
    filtrarPorMes("dataRenovacao", mes, "todos")
  );
  const resumo = resumoDoMes(mes);

  return (
    <div className="px-6 py-6">
      <h1 className="text-lg font-semibold text-pwr-dark-blue">Visão Geral</h1>
      <p className="mt-0.5 text-xs text-pwr-blue/50">
        Contratos sincronizados em {formatarData(atualizadoEm)}.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total de Contratos" value={total} />
        {Object.entries(porStatus).map(([status, qtd]) => (
          <StatCard key={status} label={status} value={qtd} />
        ))}
      </div>

      <h2 className="mt-6 text-[11px] font-semibold tracking-wide text-pwr-blue/50 uppercase">
        Por Unidade
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Object.entries(porUnidade).map(([unidade, qtd]) => (
          <StatCard key={unidade} label={unidade} value={qtd} />
        ))}
      </div>

      <h2 className="mt-6 text-[11px] font-semibold tracking-wide text-pwr-blue/50 uppercase">
        Renovações em {rotuloMes(mes).toLowerCase()}
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard label="A renovar" value={ind.aRenovar} hint="Término vendido no mês" />
        <StatCard label="Renovados" value={ind.renovados} hint="Renovação registrada no mês" />
        <StatCard
          label="Taxa de renovação"
          value={ind.taxaQuantidade === null ? "—" : `${ind.taxaQuantidade.toFixed(1).replace(".", ",")}%`}
          hint={`${ind.renovados} de ${ind.potencial}`}
        />
        <StatCard
          label="Valor renovado no mês"
          value={formatarMoeda(resumo.valor)}
          hint={`${resumo.parcelas} parcelas renovadas`}
        />
      </div>
      <Link
        href="/renovacoes"
        className="mt-2 inline-block text-[11px] text-pwr-light-blue hover:text-pwr-orange"
      >
        Ver detalhamento das renovações →
      </Link>

      <h2 className="mt-6 text-[11px] font-semibold tracking-wide text-pwr-blue/50 uppercase">
        Acompanhamento
      </h2>
      <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:max-w-3xl">
        <ComingSoonCard
          title="Clientes"
          note="A base de Clientes ainda não foi carregada. Entra na próxima etapa de ingestão, junto com as regras de negócio do cockpit."
        />
      </div>
    </div>
  );
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
